'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'

interface CartItem {
    id: string
    product_id: string
    product_name: string
    product_sku: string
    price: number
    quantity: number
    image?: string
}

interface Cart {
    id: string
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
}

interface CartContextType {
    cart: Cart | null
    itemCount: number
    addToCart: (productId: string, quantity?: number) => Promise<void>
    removeFromCart: (itemId: string) => Promise<void>
    updateQuantity: (itemId: string, quantity: number) => Promise<void>
    mergeCart: (userId: string) => Promise<void>
    clearCart: () => void
    loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth()
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)
    const prevAuthRef = useRef(isAuthenticated)

    // Sync cart state on logout
    useEffect(() => {
        if (prevAuthRef.current && !isAuthenticated) {
            console.info('User logged out, clearing cart state.')
            setCart(null)
            localStorage.removeItem('cartId')
        }
        prevAuthRef.current = isAuthenticated
    }, [isAuthenticated])

    // Load cart on mount
    useEffect(() => {
        const initializeCart = async () => {
            // COMMENTED OUT FOR CLEAN START: Load cart on mount
            /*
            const cartId = localStorage.getItem('cartId')
            if (cartId) {
                try {
                    const response: any = await api.getCart(cartId)
                    setCart(response.data)
                } catch (error) {
                    console.error('Failed to load cart:', error)
                    // If cart not found (e.g. expired), clear ID
                    localStorage.removeItem('cartId')
                }
            }
            */
            setLoading(false)
        }

        initializeCart()
    }, [])

    const [isCreatingCart, setIsCreatingCart] = useState(false)

    const addToCart = useCallback(async (productId: string, quantity = 1) => {
        try {
            let currentCartId = cart?.id || localStorage.getItem('cartId')

            // Create cart if doesn't exist
            if (!currentCartId) {
                if (isCreatingCart) return // Prevent double-creation
                setIsCreatingCart(true)
                try {
                    const sessionId = Math.random().toString(36).substring(7)
                    const response: any = await api.createCart({ sessionId })
                    currentCartId = response.data.id
                    localStorage.setItem('cartId', currentCartId!)
                    setCart(response.data)
                } finally {
                    setIsCreatingCart(false)
                }
            }

            // Add item
            try {
                const response: any = await api.addToCart(currentCartId!, {
                    productId,
                    quantity
                })
                setCart(response.data)
            } catch (err: any) {
                // If the cart doesn't exist (e.g. invalid ID from local storage or DB reset), 
                // the API now returns 404. We then try to create a new session and retry.
                if (err.status === 404) {
                    console.warn('Stale cart session detected (404). Attempting to create new session...')
                    localStorage.removeItem('cartId')

                    const sessionId = Math.random().toString(36).substring(7)
                    const createRes: any = await api.createCart({ sessionId })
                    const newCartId = createRes.data.id

                    localStorage.setItem('cartId', newCartId)
                    setCart(createRes.data)

                    // Retry add with new cart
                    try {
                        const retryRes: any = await api.addToCart(newCartId, {
                            productId,
                            quantity
                        })
                        setCart(retryRes.data)
                        console.info('Cart session recovered successfully. Item added.')
                    } catch (retryErr) {
                        console.error('Add to cart failed after recovery:', retryErr)
                        throw retryErr
                    }
                } else {
                    // It's a genuine error (500, etc), throw it
                    console.error('Add to cart failed with non-recovery error:', err)
                    throw err
                }
            }
        } catch (error) {
            console.error('Add to cart failed:', error)
            throw error
        }
    }, [cart?.id, isCreatingCart])

    const removeFromCart = useCallback(async (itemId: string) => {
        if (!cart?.id) return

        try {
            const response: any = await api.removeFromCart(cart.id, itemId)
            setCart(response.data)
        } catch (error) {
            console.error('Remove from cart failed:', error)
            throw error
        }
    }, [cart?.id])

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        if (!cart?.id) return

        try {
            const response: any = await api.updateCartItem(cart.id, itemId, { quantity })
            setCart(response.data)
        } catch (error) {
            console.error('Update quantity failed:', error)
            throw error
        }
    }, [cart?.id])

    const mergeCart = useCallback(async (userId: string) => {
        const guestCartId = localStorage.getItem('cartId')
        if (!guestCartId) return

        try {
            const response: any = await api.mergeCart(guestCartId, userId)
            setCart(response.data)
            localStorage.setItem('cartId', response.data.id)
            console.info('Guest cart merged successfully.')
        } catch (error) {
            console.error('Cart merge failed:', error)
            // If merge fails (e.g. guest cart expired), just load the user's cart
            localStorage.removeItem('cartId')
        }
    }, [])

    const clearCart = useCallback(() => {
        setCart(null)
        localStorage.removeItem('cartId')
    }, [])

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    const value = React.useMemo(() => ({
        cart,
        itemCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        mergeCart,
        clearCart,
        loading
    }), [cart, itemCount, addToCart, removeFromCart, updateQuantity, mergeCart, clearCart, loading])

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
