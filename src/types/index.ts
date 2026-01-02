// ZenithFlow Type Definitions

export interface WalletState {
    smartWalletPubkey: string | null;
    isConnected: boolean;
    isLoading: boolean;
    error: Error | null;
}

export interface Transaction {
    id: string;
    signature: string;
    amount: number;
    recipient: string;
    timestamp: number;
    status: 'pending' | 'confirmed' | 'failed';
}

export interface PaymentFormData {
    recipient: string;
    amount: number;
    memo?: string;
}