import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { generateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/login — wallet signature login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { walletAddress, signature, message } = req.body;

        if (!walletAddress || !signature) {
            res.status(400).json({ error: 'walletAddress and signature required' });
            return;
        }

        // In production: verify signature against message using bitcoin crypto
        // For MVP: trust the wallet address

        let user = await prisma.user.findUnique({ where: { walletAddress } });
        if (!user) {
            user = await prisma.user.create({ data: { walletAddress } });
        }

        const token = generateToken(user.id, user.walletAddress);
        res.json({ token, user });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
