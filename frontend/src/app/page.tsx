'use client';

import React, { useEffect, useState } from 'react';
import RaffleCard from '@/components/cards/RaffleCard';
import { getRaffles } from '@/lib/api';
import type { Raffle, RaffleTemplate } from '@/types';

const FILTERS: { label: string; value: string }[] = [
    { label: 'All', value: 'all' },
    { label: 'Token Airdrop', value: 'token_airdrop' },
    { label: 'NFT Giveaway', value: 'nft_giveaway' },
    { label: 'Whitelist', value: 'whitelist_spot' },
    { label: 'Prize Pool', value: 'random_prize' },
];

export default function HomePage() {
    const [raffles, setRaffles] = useState<Raffle[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showActive, setShowActive] = useState(true);

    useEffect(() => {
        getRaffles().then(data => {
            setRaffles(data);
            setLoading(false);
        });
    }, []);

    const filtered = raffles.filter(r => {
        if (showActive && r.status !== 'active') return false;
        if (!showActive && r.status !== 'ended') return false;
        if (filter !== 'all' && r.template !== filter) return false;
        if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-12">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 20% 50%, #f7931a 0%, transparent 50%), radial-gradient(circle at 80% 50%, #f7931a 0%, transparent 50%)',
                }} />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Win Prizes on <span className="text-[#f7931a]">Bitcoin</span>
                    </h1>
                    <p className="text-gray-300 text-lg max-w-xl mb-6">
                        Join decentralized raffles powered by OP_NET. Token airdrops, NFT giveaways, whitelist spots and more.
                    </p>
                    <div className="flex gap-3">
                        <span className="badge bg-white/10 text-white backdrop-blur-sm">🔥 {raffles.filter(r => r.status === 'active').length} Active Raffles</span>
                        <span className="badge bg-white/10 text-white backdrop-blur-sm">👥 {raffles.reduce((s, r) => s + r.participantsCount, 0).toLocaleString()} Total Entries</span>
                    </div>
                </div>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by raffle or project name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input w-full"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowActive(true)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${showActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setShowActive(false)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${!showActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                        Ended
                    </button>
                </div>
            </div>

            {/* Template filters */}
            <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            filter === f.value
                                ? 'bg-[#f7931a] text-white shadow-sm shadow-orange-200'
                                : 'bg-white text-gray-500 border border-gray-200 hover:border-[#f7931a] hover:text-[#f7931a]'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Raffle Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="card overflow-hidden">
                            <div className="skeleton h-40" />
                            <div className="p-4 flex flex-col gap-3">
                                <div className="skeleton h-4 w-24" />
                                <div className="skeleton h-5 w-full" />
                                <div className="skeleton h-4 w-32" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-4xl mb-4">🎰</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No raffles found</h3>
                    <p className="text-gray-400">Try changing your search or filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(raffle => (
                        <RaffleCard key={raffle.id} raffle={raffle} />
                    ))}
                </div>
            )}
        </div>
    );
}
