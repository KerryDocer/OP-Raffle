'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { getRaffle, joinRaffle, getRaffleWinners } from '@/lib/api';
import { RAFFLE_TEMPLATES } from '@/types';
import type { Raffle, Winner } from '@/types';

function useCountdown(endDate: string) {
    const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, ended: false });
    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate).getTime() - Date.now();
            if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, ended: true };
            return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), ended: false };
        };
        setT(calc());
        const i = setInterval(() => setT(calc()), 1000);
        return () => clearInterval(i);
    }, [endDate]);
    return t;
}

export default function RaffleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const raffleId = params.id as string;
    const { walletAddress, signMessage, connect } = useWallet();

    const [raffle, setRaffle] = useState<Raffle | null>(null);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [joined, setJoined] = useState(false);
    const [tab, setTab] = useState<'details' | 'winners'>('details');

    useEffect(() => {
        Promise.all([getRaffle(raffleId), getRaffleWinners(raffleId)]).then(([r, w]) => {
            setRaffle(r);
            setWinners(w);
            setLoading(false);
        });
    }, [raffleId]);

    const countdown = useCountdown(raffle?.endDate || new Date().toISOString());
    const isActive = raffle?.status === 'active' && !countdown.ended;

    const handleJoin = useCallback(async () => {
        if (!walletAddress) { connect(); return; }
        setJoining(true);
        try {
            const message = `Join raffle ${raffleId} at ${Date.now()}`;
            const signature = await signMessage(message);
            await joinRaffle(raffleId, walletAddress, signature);
            setJoined(true);
        } catch (e: any) {
            alert(e?.message || 'Failed to join');
        } finally {
            setJoining(false);
        }
    }, [walletAddress, raffleId, signMessage, connect]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-[#f7931a] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!raffle) {
        return (
            <div className="text-center py-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Raffle not found</h2>
                <button onClick={() => router.push('/')} className="btn-primary px-6 py-2.5 text-sm">Back to Raffles</button>
            </div>
        );
    }

    const template = RAFFLE_TEMPLATES[raffle.template];
    const fillPercent = Math.min((raffle.participantsCount / (raffle.winnersCount * 20)) * 100, 100);

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-8">
            {/* Back */}
            <button onClick={() => router.push('/')} className="self-start text-sm text-gray-400 hover:text-gray-900 transition-colors flex items-center gap-1">
                ← Back to raffles
            </button>

            {/* Banner */}
            <div className="rounded-2xl h-48 md:h-64 relative overflow-hidden" style={{ background: raffle.image || 'linear-gradient(135deg, #f7931a, #ffaa40)' }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <span className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                        {raffle.projectIcon || '🔷'}
                    </span>
                    <div>
                        <span className="text-white/70 text-sm font-medium">{raffle.projectName || 'Project'}</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">{raffle.title}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left — Details */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    {/* Tabs */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-full w-fit">
                        <button onClick={() => setTab('details')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'details' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                            Details
                        </button>
                        <button onClick={() => setTab('winners')} className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'winners' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                            Winners ({winners.length})
                        </button>
                    </div>

                    {tab === 'details' ? (
                        <div className="card p-6 flex flex-col gap-4">
                            <h3 className="font-bold text-gray-900">About this raffle</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{raffle.description}</p>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Template</span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span>{template.icon}</span>
                                        <span className="text-sm font-semibold text-gray-900">{template.name}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Prize</span>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{raffle.prize}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Winners</span>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{raffle.winnersCount}</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <span className="text-xs text-gray-400 uppercase font-bold">Participants</span>
                                    <div className="mt-1 text-sm font-semibold text-gray-900">{raffle.participantsCount.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Progress */}
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-400 mb-2">
                                    <span>Entries</span>
                                    <span>{raffle.participantsCount.toLocaleString()} joined</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="fill" style={{ width: `${fillPercent}%` }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card p-6">
                            {winners.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="text-3xl mb-3">🏆</div>
                                    <p className="text-gray-400">{isActive ? 'Winners will be selected when the raffle ends.' : 'No winners selected yet.'}</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {winners.map((w, i) => (
                                        <div key={w.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                                            <span className="w-8 h-8 rounded-full bg-[#f7931a] text-white flex items-center justify-center text-xs font-bold">#{i + 1}</span>
                                            <span className="font-mono text-sm text-gray-900">{w.walletAddress.slice(0, 10)}...{w.walletAddress.slice(-6)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right — Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Countdown */}
                    <div className="card p-6 flex flex-col items-center gap-4">
                        <span className={`badge ${isActive ? 'badge-active' : 'badge-ended'}`}>
                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" />}
                            {isActive ? 'Active' : 'Ended'}
                        </span>

                        {isActive && (
                            <div className="flex gap-2">
                                {[{ v: countdown.d, l: 'Days' }, { v: countdown.h, l: 'Hours' }, { v: countdown.m, l: 'Min' }, { v: countdown.s, l: 'Sec' }].map(({ v, l }) => (
                                    <div key={l} className="countdown-box">
                                        <div className="value">{String(v).padStart(2, '0')}</div>
                                        <div className="label">{l}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isActive && (
                            <button
                                onClick={handleJoin}
                                disabled={joining || joined}
                                className={`w-full py-3 text-sm font-bold rounded-full transition-all ${
                                    joined ? 'bg-green-500 text-white' : 'btn-primary'
                                }`}
                            >
                                {joining ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Joining...
                                    </span>
                                ) : joined ? (
                                    '✓ Joined!'
                                ) : walletAddress ? (
                                    'Join Raffle'
                                ) : (
                                    'Connect Wallet to Join'
                                )}
                            </button>
                        )}
                    </div>

                    {/* Requirements */}
                    <div className="card p-6 flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-gray-900">Requirements</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="w-5 h-5 rounded-full bg-green-100 text-green-500 flex items-center justify-center text-xs">✓</span>
                            Connect OP Wallet
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-xs">○</span>
                            Sign transaction
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
