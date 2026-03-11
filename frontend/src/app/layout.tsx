import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import WalletProvider from '@/components/providers/WalletProvider';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'OP Raffle — Decentralized Raffle Platform on Bitcoin',
    description: 'Join raffles and win prizes on Bitcoin L1 powered by OP_NET. Token airdrops, NFT giveaways, whitelist spots and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.className}>
            <body className="min-h-screen">
                <WalletProvider>
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                        {children}
                    </main>
                </WalletProvider>
            </body>
        </html>
    );
}
