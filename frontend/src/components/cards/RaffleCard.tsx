'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Raffle } from '@/types';
import { RAFFLE_TEMPLATES } from '@/types';

function useCountdown(endDate: string) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, ended: false });

    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate).getTime() - Date.now();
            if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, ended: true };
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            return { hours, minutes, seconds, ended: false };
        };
        setTimeLeft(calc());
        const interval = setInterval(() => setTimeLeft(calc()), 1000);
        return () => clearInterval(interval);
    }, [endDate]);

    return timeLeft;
}

export default function RaffleCard({ raffle }: { raffle: Raffle }) {
    const { hours, minutes, seconds, ended } = useCountdown(raffle.endDate);
    const template = RAFFLE_TEMPLATES[raffle.template];
    const isActive = raffle.status === 'active' && !ended;

    return (
        <Link href={`/raffle/${raffle.id}`}>
            <div className="card card-hover overflow-hidden cursor-pointer group">
                {/* Banner */}
                <div
                    className="h-40 relative flex items-end p-4"
                    style={{ background: raffle.image || 'linear-gradient(135deg, #f7931a, #ffaa40)' }}
                >
                    {/* Participants badge */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>👥</span> {raffle.participantsCount.toLocaleString()}
                    </div>

                    {/* Winners count */}
                    <div className="absolute bottom-3 right-3 bg-[#f7931a] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        🏆 {raffle.winnersCount}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-3">
                    {/* Project tag + template */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs">
                                {raffle.projectIcon || '🔷'}
                            </span>
                            <span className="text-xs font-semibold text-gray-500">{raffle.projectName || 'Project'}</span>
                        </div>
                        <span className={`badge ${template.color}`}>
                            {template.icon} {template.name}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-gray-900 group-hover:text-[#f7931a] transition-colors line-clamp-1">
                        {raffle.title}
                    </h3>

                    {/* Prize */}
                    <div className="text-sm text-gray-500">
                        Prize: <span className="font-semibold text-gray-900">{raffle.prize}</span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                        {isActive ? (
                            <span className="text-xs text-gray-400">
                                Ends in <span className="font-bold text-gray-900">{hours}h {minutes}m {seconds}s</span>
                            </span>
                        ) : (
                            <span className="badge badge-ended">Ended</span>
                        )}
                        {isActive && (
                            <span className="text-xs font-bold text-[#f7931a] opacity-0 group-hover:opacity-100 transition-opacity">
                                Join →
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
