import { useCallback, useState } from 'react';
import { api } from '@/lib/api';
import { UseCartRecoveryReturn } from './useCartRecovery';

interface Cart {
    id: string;
    cart_token: string;
    items: any[];
    subtotal: number;
    tax: number;
    total: number;
}

interface UseCartActionsReturn {
    addItem: (productSlugOrId: string, quantity?: number, isSlug?: boolean) => Promise<void>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => void;
    isLoading: boolean;
}

/**
 * Custom hook for cart CRUD operations
 * Handles cart item management with automatic recovery on errors
 */
export function useCartActions(
    cart: Cart | null,
    setCart: React.Dispatch<React.SetStateAction<Cart | null>>,
    recoverCart: UseCartRecoveryReturn['recoverCart']
): UseCartActionsReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingCart, setIsCreatingCart] = useState(false);

    const addItem = useCallback(async (
        productSlugOrId: string,
        quantity = 1,
        isSlug = true
    ) => {
        setIsLoading(true);
        try {
            let currentCartToken = cart?.cart_token || localStorage.getItem('cartToken');

            // Create cart if doesn't exist
            if (!currentCartToken) {
                if (isCreatingCart) return; // Prevent double-creation
                setIsCreatingCart(true);
                try {
                    const sessionId = Math.random().toString(36).substring(7);
                    const response: any = await api.createCart({ sessionId });
                    currentCartToken = response.data.cart_token;
                    localStorage.setItem('cartToken', currentCartToken!);
                    setCart(response.data);
                } finally {
                    setIsCreatingCart(false);
                }
            }

            // Add item
            try {
                const requestData = isSlug
                    ? { productSlug: productSlugOrId, quantity }
                    : { productId: productSlugOrId, quantity };

                const response: any = await api.addToCart(currentCartToken!, requestData);
                setCart(response.data);
            } catch (err: any) {
                // Try recovery if cart not found
                await recoverCart(err, async () => {
                    const newToken = localStorage.getItem('cartToken');
                    const requestData = isSlug
                        ? { productSlug: productSlugOrId, quantity }
                        : { productId: productSlugOrId, quantity };
                    return api.addToCart(newToken!, requestData);
                });
            }
        } catch (error) {
            console.error('Add to cart failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [cart?.cart_token, isCreatingCart, setCart, recoverCart]);

    const updateItemQuantity = useCallback(async (itemId: string, quantity: number) => {
        if (!cart?.cart_token) return;

        setIsLoading(true);
        try {
            const response: any = await api.updateCartItem(cart.cart_token, itemId, { quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Update quantity failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [cart?.cart_token, setCart]);

    const removeItem = useCallback(async (itemId: string) => {
        if (!cart?.cart_token) return;

        setIsLoading(true);
        try {
            const response: any = await api.removeFromCart(cart.cart_token, itemId);
            setCart(response.data);
        } catch (error) {
            console.error('Remove from cart failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [cart?.cart_token, setCart]);

    const clearCart = useCallback(() => {
        setCart(null);
        localStorage.removeItem('cartToken');
    }, [setCart]);

    return {
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        isLoading
    };
}
