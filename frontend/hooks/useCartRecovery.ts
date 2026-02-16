import { useCallback, useState } from 'react';
import { api } from '@/lib/api';

interface Cart {
    id: string;
    cart_token: string;
    items: any[];
    subtotal: number;
    tax: number;
    total: number;
}

export interface UseCartRecoveryReturn {
    recoverCart: (error: any, retryFn: () => Promise<any>) => Promise<void>;
    isRecovering: boolean;
}

/**
 * Custom hook for handling cart recovery from 404 errors
 * When a cart token is invalid or expired, this hook:
 * 1. Creates a new cart
 * 2. Updates localStorage
 * 3. Retries the original operation
 */
export function useCartRecovery(
    setCart: React.Dispatch<React.SetStateAction<Cart | null>>
): UseCartRecoveryReturn {
    const [isRecovering, setIsRecovering] = useState(false);

    const recoverCart = useCallback(async (error: any, retryFn: () => Promise<any>) => {
        // Only recover from 404 errors (cart not found)
        if (error.status !== 404) {
            throw error;
        }

        setIsRecovering(true);
        try {
            console.warn('Stale cart session detected (404). Creating new session...');

            // Clear old token
            localStorage.removeItem('cartToken');

            // Create new cart
            const sessionId = Math.random().toString(36).substring(7);
            const createRes: any = await api.createCart({ sessionId });
            const newCartToken = createRes.data.cart_token;

            // Save new token
            localStorage.setItem('cartToken', newCartToken);
            setCart(createRes.data);

            // Retry original operation
            try {
                const retryRes = await retryFn();
                if (retryRes?.data) {
                    setCart(retryRes.data);
                }
                console.info('Cart session recovered successfully.');
            } catch (retryErr) {
                console.error('Operation failed after cart recovery:', retryErr);
                throw retryErr;
            }
        } finally {
            setIsRecovering(false);
        }
    }, [setCart]);

    return { recoverCart, isRecovering };
}
