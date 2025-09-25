'use client';

// Minimal wrapper for signing a settlement message via MetaMask (Nitrolite-style)

export const NITROLITE_MESSAGE = 'Thank you for settling your due with Tomo-Labs';

export async function nitroliteSignSettleMessage(walletAddress: string): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Wallet provider not available');
  }

  const provider = (window as any).ethereum;

  // Ensure the requested account is selected
  const accounts: string[] = await provider.request({ method: 'eth_requestAccounts' });
  const active = accounts && accounts[0] ? accounts[0].toLowerCase() : '';
  if (active !== walletAddress.toLowerCase()) {
    // Not strictly necessary, but helps the user pick the right account
    // Some wallets auto-switch, some don't
  }

  // personal_sign expects params [message, address]
  const signature: string = await provider.request({
    method: 'personal_sign',
    params: [NITROLITE_MESSAGE, walletAddress],
  });

  return signature;
}


