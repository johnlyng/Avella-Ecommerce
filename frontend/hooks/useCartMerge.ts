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

interface UseCartMergeReturn {
    mergeGuestCart: (userId: string) => Promise<void>;
    isMerging: boolean;
}

/**
 * Custom hook for merging guest cart into user cart on login
 * Handles the transition from anonymous to authenticated cart
 */
export function useCartMerge(
    setCart: React.Dispatch<React.SetStateAction<Cart | null>>
): UseCartMergeReturn {
    const [isMerging, setIsMerging] = useState(false);

    const mergeGuestCart = useCallback(async (userId: string) => {
        const guestCartToken = localStorage.getItem('cartToken');
        if (!guestCartToken) {
            console.info('No guest cart to merge');
            return;
        }

        setIsMerging(true);
        try {
            const response: any = await api.mergeCart(guestCartToken, userId);
            setCart(response.data);
            localStorage.setItem('cartToken', response.data.cart_token);
            console.info('Guest cart merged successfully.');
        } catch (error) {
            console.error('Cart merge failed:', error);
            // If merge fails (e.g. guest cart expired), just clear the token
            // The user will start with their existing cart or empty cart
            localStorage.removeItem('cartToken');
        } finally {
            setIsMerging(false);
        }
    }, [setCart]);

    return { mergeGuestCart, isMerging };
}
