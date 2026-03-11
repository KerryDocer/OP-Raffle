import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/users/:address — get user by wallet address
router.get('/:address', async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { walletAddress: req.params.address },
            include: {
                participations: { include: { raffle: true } },
                wins: { include: { raffle: true } },
            },
        });
        if (!user) { res.status(404).json({ error: 'User not found' }); return; }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// PATCH /api/users/:address — update social connections
router.patch('/:address', async (req: Request, res: Response) => {
    try {
        const { twitter, discord } = req.body;
        const user = await prisma.user.update({
            where: { walletAddress: req.params.address },
            data: { twitter, discord },
        });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

export default router;
