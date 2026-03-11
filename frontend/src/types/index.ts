export type RaffleTemplate = 'token_airdrop' | 'nft_giveaway' | 'whitelist_spot' | 'random_prize';
export type RaffleStatus = 'active' | 'ended';
export type ParticipantStatus = 'active' | 'ended' | 'won' | 'lost';

export interface User {
    id: string;
    walletAddress: string;
    twitter?: string;
    discord?: string;
    createdAt: string;
}

export interface Raffle {
    id: string;
    title: string;
    description: string;
    prize: string;
    template: RaffleTemplate;
    winnersCount: number;
    endDate: string;
    createdBy: string;
    participantsCount: number;
    status: RaffleStatus;
    image?: string;
    projectName?: string;
    projectIcon?: string;
}

export interface Participant {
    id: string;
    userId: string;
    raffleId: string;
    joinedAt: string;
}

export interface Winner {
    id: string;
    raffleId: string;
    userId: string;
    walletAddress: string;
}

export const RAFFLE_TEMPLATES: Record<RaffleTemplate, { name: string; description: string; icon: string; color: string }> = {
    token_airdrop: { name: 'Token Airdrop', description: 'Distribute tokens to winners', icon: '🪙', color: 'bg-orange-100 text-orange-600' },
    nft_giveaway: { name: 'NFT Giveaway', description: 'Give away NFTs to lucky winners', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
    whitelist_spot: { name: 'Whitelist Spot', description: 'Grant whitelist access', icon: '📋', color: 'bg-green-100 text-green-600' },
    random_prize: { name: 'Random Prize Pool', description: 'Random prizes from a pool', icon: '🎁', color: 'bg-blue-100 text-blue-600' },
};
