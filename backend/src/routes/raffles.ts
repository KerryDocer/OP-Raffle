import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/raffles — list all raffles
router.get('/', async (_req: Request, res: Response) => {
    try {
        const raffles = await prisma.raffle.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(raffles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch raffles' });
    }
});

// GET /api/raffles/:id — get single raffle
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const raffle = await prisma.raffle.findUnique({ where: { id: req.params.id } });
        if (!raffle) { res.status(404).json({ error: 'Raffle not found' }); return; }
        res.json(raffle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch raffle' });
    }
});

// POST /api/raffles — create raffle (auth required)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, prize, template, winnersCount, endDate, projectName, projectIcon, image } = req.body;
        const raffle = await prisma.raffle.create({
            data: {
                title, description, prize,
                template: template || 'token_airdrop',
                winnersCount: winnersCount || 1,
                endDate: new Date(endDate),
                createdBy: req.userId!,
                projectName, projectIcon, image,
            },
        });
        res.json(raffle);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create raffle' });
    }
});

// POST /api/raffles/:id/join — join raffle
router.post('/:id/join', async (req: Request, res: Response) => {
    try {
        const { walletAddress, signature } = req.body;
        if (!walletAddress) { res.status(400).json({ error: 'walletAddress required' }); return; }

        const raffle = await prisma.raffle.findUnique({ where: { id: req.params.id } });
        if (!raffle) { res.status(404).json({ error: 'Raffle not found' }); return; }
        if (raffle.status !== 'active') { res.status(400).json({ error: 'Raffle is not active' }); return; }

        let user = await prisma.user.findUnique({ where: { walletAddress } });
        if (!user) { user = await prisma.user.create({ data: { walletAddress } }); }

        // Check if already joined
        const existing = await prisma.participant.findUnique({
            where: { userId_raffleId: { userId: user.id, raffleId: raffle.id } },
        });
        if (existing) { res.status(400).json({ error: 'Already joined' }); return; }

        await prisma.participant.create({
            data: { userId: user.id, raffleId: raffle.id },
        });

        await prisma.raffle.update({
            where: { id: raffle.id },
            data: { participantsCount: { increment: 1 } },
        });

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to join raffle' });
    }
});

// GET /api/raffles/:id/winners — get winners
router.get('/:id/winners', async (req: Request, res: Response) => {
    try {
        const winners = await prisma.winner.findMany({
            where: { raffleId: req.params.id },
            include: { user: { select: { walletAddress: true } } },
        });
        res.json(winners.map(w => ({
            id: w.id,
            raffleId: w.raffleId,
            userId: w.userId,
            walletAddress: w.user.walletAddress,
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch winners' });
    }
});

// POST /api/raffles/:id/draw — draw winners (admin)
router.post('/:id/draw', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const raffle = await prisma.raffle.findUnique({
            where: { id: req.params.id },
            include: { participants: true },
        });
        if (!raffle) { res.status(404).json({ error: 'Raffle not found' }); return; }

        // Random selection
        const shuffled = raffle.participants.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, raffle.winnersCount);

        for (const p of selected) {
            await prisma.winner.create({
                data: { raffleId: raffle.id, userId: p.userId },
            });
        }

        await prisma.raffle.update({
            where: { id: raffle.id },
            data: { status: 'ended' },
        });

        res.json({ winners: selected.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to draw winners' });
    }
});

export default router;
