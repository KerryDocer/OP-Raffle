'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@/components/providers/WalletProvider';
import { getRaffles } from '@/lib/api';
import type { Raffle } from '@/types';
import Link from 'next/link';

export default function ProfilePage() {
    const { walletAddress, balance, connect } = useWallet();
    const [raffles, setRaffles] = useState<Raffle[]>([]);
    const [tab, setTab] = useState<'joined' | 'created'>('joined');
    const [twitter, setTwitter] = useState('');
    const [discord, setDiscord] = useState('');

    useEffect(() => {
        getRaffles().then(setRaffles);
    }, []);

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-4xl">👤</div>
                <h2 className="text-2xl font-bold text-gray-900">Connect Your Wallet</h2>
                <p className="text-gray-400 text-center max-w-md">Connect your OP Wallet to view your profile, joined raffles, and manage your account.</p>
                <button onClick={connect} className="btn-primary px-8 py-3 text-sm">Connect Wallet</button>
            </div>
        );
    }

    const short = `${walletAddress.slice(0, 10)}...${walletAddress.slice(-8)}`;
    // Mock: pretend user joined first 3 raffles
    const joinedRaffles = raffles.slice(0, 3);
    const createdRaffles: Raffle[] = [];

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Profile Header */}
            <div className="card p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f7931a] to-[#ffaa40] flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-200">
                    {walletAddress.slice(2, 4).toUpperCase()}
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Your Profile</h1>
                    <p className="font-mono text-sm text-gray-400">{short}</p>
                    <div className="flex gap-4 mt-3">
                        <span className="text-xs text-gray-400">Balance: <span className="font-bold text-gray-900">{(balance / 1e8).toFixed(4)} BTC</span></span>
                        <span className="text-xs text-gray-400">Joined: <span className="font-bold text-gray-900">{joinedRaffles.length} raffles</span></span>
                    </div>
                </div>
            </div>

            {/* Social Connections */}
            <div className="card p-6 flex flex-col gap-4">
                <h3 className="font-bold text-gray-900">Social Connections</h3>
                <p className="text-xs text-gray-400">Connect your social accounts to increase your chances in raffles.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm font-bold">𝕏</div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="@username"
                                value={twitter}
                                onChange={e => setTwitter(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#f7931a] focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white text-sm font-bold">D</div>
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="username#0000"
                                value={discord}
                                onChange={e => setDiscord(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#f7931a] focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
                <button className="btn-primary self-start px-6 py-2 text-sm mt-2">Save</button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-full w-fit">
                <button onClick={() => setTab('joined')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'joined' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                    Joined Raffles ({joinedRaffles.length})
                </button>
                <button onClick={() => setTab('created')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'created' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                    Created ({createdRaffles.length})
                </button>
            </div>

            {/* Raffle list */}
            {tab === 'joined' ? (
                joinedRaffles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-3xl mb-3">🎰</div>
                        <p className="text-gray-400">You haven&apos;t joined any raffles yet.</p>
                        <Link href="/" className="btn-primary inline-block px-6 py-2 text-sm mt-4">Browse Raffles</Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {joinedRaffles.map(r => (
                            <Link key={r.id} href={`/raffle/${r.id}`}>
                                <div className="card card-hover p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: r.image || 'linear-gradient(135deg, #f7931a, #ffaa40)' }} />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 text-sm truncate">{r.title}</h4>
                                        <p className="text-xs text-gray-400">{r.projectName} · {r.prize}</p>
                                    </div>
                                    <span className={`badge ${r.status === 'active' ? 'badge-active' : 'badge-ended'}`}>
                                        {r.status === 'active' ? 'Active' : 'Ended'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                <div className="text-center py-16">
                    <div className="text-3xl mb-3">✨</div>
                    <p className="text-gray-400">You haven&apos;t created any raffles yet.</p>
                    <Link href="/create" className="btn-primary inline-block px-6 py-2 text-sm mt-4">Create Raffle</Link>
                </div>
            )}
        </div>
    );
}
