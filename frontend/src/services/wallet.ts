'use client';

import { UnisatSigner } from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';
import { JSONRpcProvider } from 'opnet';

export class OPNetSigner extends UnisatSigner {
    get unisat(): any {
        if (typeof window === 'undefined') throw new Error('Window not found');
        const module = (window as any).opnet || (window as any).unisat;
        if (!module) throw new Error('OP Wallet extension not found.');
        return module;
    }
}

export function getWalletProvider(): any | null {
    if (typeof window === 'undefined') return null;
    return (window as any).opnet || (window as any).unisat || null;
}

export function isWalletAvailable(): boolean {
    return !!getWalletProvider();
}

export async function getPublicKey(): Promise<string | null> {
    const w = getWalletProvider();
    if (!w) return null;
    try { return await w.getPublicKey(); } catch { return null; }
}

export async function connectWallet(): Promise<{ address: string; publicKey: string }> {
    const w = getWalletProvider();
    if (!w) throw new Error('OP Wallet not found. Install it from the Chrome Web Store.');
    const result = await w.requestAccounts();
    if (!result || result.length === 0) throw new Error('User rejected connection.');
    const address = result[0];
    const publicKey = await w.getPublicKey();
    return { address, publicKey };
}

export async function signMessage(message: string): Promise<string> {
    const w = getWalletProvider();
    if (!w) throw new Error('OP Wallet not found.');
    return await w.signMessage(message);
}

export async function getBalance(): Promise<number> {
    const w = getWalletProvider();
    if (!w) return 0;
    try { const b = await w.getBalance(); return b?.total || 0; } catch { return 0; }
}

export function createProvider(): JSONRpcProvider {
    const url = process.env.NEXT_PUBLIC_OPNET_RPC_URL || 'https://testnet.opnet.org';
    return new JSONRpcProvider({ url, network: networks.testnet } as any);
}

export async function createSigner(): Promise<OPNetSigner> {
    const signer = new OPNetSigner();
    await signer.init();
    return signer;
}

export function getBitcoinNetwork(): any {
    return networks.testnet;
}
