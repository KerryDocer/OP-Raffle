'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface WalletContextType {
    walletAddress: string | null;
    publicKey: string | null;
    balance: number;
    connecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    signMessage: (msg: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function useWallet(): WalletContextType {
    const ctx = useContext(WalletContext);
    if (!ctx) throw new Error('useWallet must be used within WalletProvider');
    return ctx;
}

export default function WalletProvider({ children }: { children: React.ReactNode }) {
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [balance, setBalance] = useState(0);
    const [connecting, setConnecting] = useState(false);

    const getWallet = useCallback(async () => await import('@/services/wallet'), []);

    useEffect(() => {
        const check = async () => {
            try {
                const w = await getWallet();
                if (!w.isWalletAvailable()) return;
                const accounts = await w.getWalletProvider()?.getAccounts();
                if (accounts && accounts.length > 0) {
                    setWalletAddress(accounts[0]);
                    setPublicKey(await w.getPublicKey());
                    setBalance(await w.getBalance());
                }
            } catch {}
        };
        check();
    }, [getWallet]);

    const connect = useCallback(async () => {
        setConnecting(true);
        try {
            const w = await getWallet();
            const { address, publicKey: pk } = await w.connectWallet();
            setWalletAddress(address);
            setPublicKey(pk);
            setBalance(await w.getBalance());
        } catch (e: any) {
            alert(e?.message || 'Failed to connect');
        } finally {
            setConnecting(false);
        }
    }, [getWallet]);

    const disconnect = useCallback(() => {
        setWalletAddress(null);
        setPublicKey(null);
        setBalance(0);
    }, []);

    const signMsg = useCallback(async (msg: string): Promise<string> => {
        const w = await getWallet();
        return await w.signMessage(msg);
    }, [getWallet]);

    return (
        <WalletContext.Provider value={{ walletAddress, publicKey, balance, connecting, connect, disconnect, signMessage: signMsg }}>
            {children}
        </WalletContext.Provider>
    );
}
