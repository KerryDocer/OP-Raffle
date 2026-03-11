'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';
import { createRaffle } from '@/lib/api';
import { RAFFLE_TEMPLATES } from '@/types';
import type { RaffleTemplate } from '@/types';

const TEMPLATES = Object.entries(RAFFLE_TEMPLATES) as [RaffleTemplate, typeof RAFFLE_TEMPLATES[RaffleTemplate]][];

export default function CreateRafflePage() {
    const router = useRouter();
    const { walletAddress, connect } = useWallet();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [prize, setPrize] = useState('');
    const [template, setTemplate] = useState<RaffleTemplate>('token_airdrop');
    const [winnersCount, setWinnersCount] = useState(10);
    const [endDays, setEndDays] = useState(7);
    const [creating, setCreating] = useState(false);

    if (!walletAddress) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="text-5xl">✨</div>
                <h2 className="text-2xl font-bold text-gray-900">Create a Raffle</h2>
                <p className="text-gray-400 text-center max-w-md">Connect your wallet to create and manage raffles on Bitcoin L1.</p>
                <button onClick={connect} className="btn-primary px-8 py-3 text-sm">Connect Wallet</button>
            </div>
        );
    }

    const handleSubmit = async () => {
        if (!title || !description || !prize) { alert('Fill in all fields'); return; }
        setCreating(true);
        try {
            const endDate = new Date(Date.now() + endDays * 86400000).toISOString();
            const raffle = await createRaffle({ title, description, prize, template, winnersCount, endDate });
            alert('Raffle created!');
            router.push(`/raffle/${raffle.id}`);
        } catch (e: any) {
            alert(e?.message || 'Failed to create raffle');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Create Raffle</h1>
                <p className="text-gray-400 mt-2">Set up a new raffle for your project. Winners will be selected transparently via blockchain.</p>
            </div>

            {/* Template Selection */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-gray-900">Template</label>
                <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map(([key, tmpl]) => (
                        <button
                            key={key}
                            onClick={() => setTemplate(key)}
                            className={`card p-4 text-left transition-all ${
                                template === key ? 'ring-2 ring-[#f7931a] border-transparent' : ''
                            }`}
                        >
                            <span className="text-2xl">{tmpl.icon}</span>
                            <h4 className="font-bold text-sm text-gray-900 mt-2">{tmpl.name}</h4>
                            <p className="text-xs text-gray-400 mt-1">{tmpl.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Form Fields */}
            <div className="card p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-900">Title</label>
                    <input
                        type="text"
                        placeholder="e.g. Bitcoin Pizza Day Airdrop"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7931a] focus:outline-none text-sm"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-900">Description</label>
                    <textarea
                        placeholder="Describe your raffle, prizes, and requirements..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7931a] focus:outline-none text-sm resize-none"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-gray-900">Prize</label>
                    <input
                        type="text"
                        placeholder="e.g. 10,000 PIZZA Tokens"
                        value={prize}
                        onChange={e => setPrize(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7931a] focus:outline-none text-sm"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900">Number of Winners</label>
                        <input
                            type="number"
                            min={1}
                            value={winnersCount}
                            onChange={e => setWinnersCount(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7931a] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-900">Duration (days)</label>
                        <input
                            type="number"
                            min={1}
                            value={endDays}
                            onChange={e => setEndDays(Number(e.target.value))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#f7931a] focus:outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="card p-6 bg-gray-50 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-gray-900">Preview</h3>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{RAFFLE_TEMPLATES[template].icon}</span>
                    <div>
                        <div className="font-bold text-gray-900">{title || 'Raffle Title'}</div>
                        <div className="text-xs text-gray-400">{RAFFLE_TEMPLATES[template].name} · {winnersCount} winners · {endDays} days</div>
                    </div>
                </div>
                <div className="text-sm text-gray-500">{prize || 'Prize info'}</div>
            </div>

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={creating || !title || !description || !prize}
                className="btn-primary w-full py-3.5 text-sm disabled:opacity-50"
            >
                {creating ? 'Creating...' : 'Create Raffle'}
            </button>
        </div>
    );
}
