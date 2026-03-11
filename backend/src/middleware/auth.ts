import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthRequest extends Request {
    userId?: string;
    walletAddress?: string;
}

export function generateToken(userId: string, walletAddress: string): string {
    return jwt.sign({ userId, walletAddress }, JWT_SECRET, { expiresIn: '7d' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
    }

    try {
        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; walletAddress: string };
        req.userId = decoded.userId;
        req.walletAddress = decoded.walletAddress;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
