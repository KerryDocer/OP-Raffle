import type { Raffle, User, Winner } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// --- Mock Data (used when backend is not running) ---

const MOCK_RAFFLES: Raffle[] = [
    {
        id: '1', title: 'Bitcoin Pizza Day Airdrop', description: 'Celebrate Bitcoin Pizza Day with a massive token airdrop! 10,000 PIZZA tokens distributed to lucky winners.',
        prize: '10,000 PIZZA Tokens', template: 'token_airdrop', winnersCount: 50, endDate: new Date(Date.now() + 3 * 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 342, status: 'active', projectName: 'Pizza Artifacts', projectIcon: '🍕',
        image: 'linear-gradient(135deg, #f97316, #facc15)',
    },
    {
        id: '2', title: 'OP_NET Genesis NFT', description: 'Win one of 10 exclusive OP_NET Genesis NFTs. First-ever NFT collection on Bitcoin L1.',
        prize: '1 Genesis NFT', template: 'nft_giveaway', winnersCount: 10, endDate: new Date(Date.now() + 7 * 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 1205, status: 'active', projectName: 'OP_NET', projectIcon: '🔶',
        image: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    },
    {
        id: '3', title: 'DeFi Protocol WL Spots', description: 'Get early access to the upcoming DeFi protocol launch on Bitcoin. Whitelist spots available.',
        prize: 'Whitelist Spot', template: 'whitelist_spot', winnersCount: 100, endDate: new Date(Date.now() + 18 * 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 567, status: 'active', projectName: 'BTC DeFi', projectIcon: '💎',
        image: 'linear-gradient(135deg, #10b981, #059669)',
    },
    {
        id: '4', title: 'Mystery Box Raffle', description: 'Open a mystery box with random prizes including tokens, NFTs, and more!',
        prize: 'Mystery Box', template: 'random_prize', winnersCount: 25, endDate: new Date(Date.now() + 48 * 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 891, status: 'active', projectName: 'CryptoBox', projectIcon: '🎁',
        image: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    },
    {
        id: '5', title: 'Runes Token Drop', description: 'Runes protocol token distribution for early supporters. Connect wallet and join!',
        prize: '5,000 RUNE Tokens', template: 'token_airdrop', winnersCount: 30, endDate: new Date(Date.now() + 1 * 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 2100, status: 'active', projectName: 'Runes Protocol', projectIcon: 'R',
        image: 'linear-gradient(135deg, #f59e0b, #d97706)',
    },
    {
        id: '6', title: 'Ordinals Collection WL', description: 'Whitelist spots for an upcoming Ordinals collection on Bitcoin.',
        prize: 'WL Spot + Free Mint', template: 'whitelist_spot', winnersCount: 200, endDate: new Date(Date.now() - 3600000).toISOString(),
        createdBy: 'admin', participantsCount: 4500, status: 'ended', projectName: 'OrdinalArt', projectIcon: '🖼️',
        image: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    },
];

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
    try {
        const res = await fetch(`${API_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return await res.json();
    } catch {
        // Fallback to mock data
        throw new Error('API unavailable');
    }
}

export async function getRaffles(): Promise<Raffle[]> {
    try {
        return await fetchAPI<Raffle[]>('/raffles');
    } catch {
        return MOCK_RAFFLES;
    }
}

export async function getRaffle(id: string): Promise<Raffle | null> {
    try {
        return await fetchAPI<Raffle>(`/raffles/${id}`);
    } catch {
        return MOCK_RAFFLES.find(r => r.id === id) || null;
    }
}

export async function joinRaffle(raffleId: string, walletAddress: string, signature: string): Promise<boolean> {
    try {
        await fetchAPI(`/raffles/${raffleId}/join`, {
            method: 'POST',
            body: JSON.stringify({ walletAddress, signature }),
        });
        return true;
    } catch {
        // Mock: always succeed
        return true;
    }
}

export async function createRaffle(data: Partial<Raffle>): Promise<Raffle> {
    try {
        return await fetchAPI<Raffle>('/raffles', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    } catch {
        // Mock: return with generated id
        return { ...data, id: String(Date.now()), participantsCount: 0, status: 'active', createdBy: 'admin' } as Raffle;
    }
}

export async function getRaffleWinners(raffleId: string): Promise<Winner[]> {
    try {
        return await fetchAPI<Winner[]>(`/raffles/${raffleId}/winners`);
    } catch {
        return [];
    }
}

export async function getUserProfile(walletAddress: string): Promise<User | null> {
    try {
        return await fetchAPI<User>(`/users/${walletAddress}`);
    } catch {
        return { id: '1', walletAddress, createdAt: new Date().toISOString() };
    }
}
