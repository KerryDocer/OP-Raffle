'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/components/providers/WalletProvider';

const NAV_ITEMS = [
    { href: '/', label: 'Raffles', icon: '🎰' },
    { href: '/create', label: 'Create', icon: '✨' },
    { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
    const pathname = usePathname();
    const { walletAddress, balance, connect, disconnect, connecting } = useWallet();
    const short = walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : '';
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center">
                        <span className="text-white text-sm font-black">OP</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                        Raffle<span className="text-[#f7931a]">.</span>
                    </span>
                </Link>

                {/* Nav links (desktop) */}
                <div className="hidden md:flex items-center gap-1">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                pathname === item.href
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <span className="mr-1.5">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Right section */}
                <div className="flex items-center gap-3">
                    {walletAddress ? (
                        <>
                            <span className="hidden sm:block text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                                {(balance / 1e8).toFixed(4)} BTC
                            </span>
                            <button
                                onClick={disconnect}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full border border-gray-200 transition-colors"
                            >
                                {short}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={connect}
                            disabled={connecting}
                            className="px-5 py-2.5 text-sm font-bold bg-[#f7931a] hover:bg-[#e07800] text-white rounded-full transition-colors disabled:opacity-50 shadow-sm shadow-orange-200"
                        >
                            {connecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    )}

                    {/* Mobile menu */}
                    <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(!menuOpen)}>
                        <span className="text-lg">{menuOpen ? '✕' : '☰'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile nav */}
            {menuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-1">
                    {NAV_ITEMS.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMenuOpen(false)}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                                pathname === item.href ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <span className="mr-2">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
