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
    cart_token: string
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
}

interface CartContextType {
    cart: Cart | null
    itemCount: number
    addToCart: (productSlugOrId: string, quantity?: number, isSlug?: boolean) => Promise<void>
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
            localStorage.removeItem('cartToken')
        }
        prevAuthRef.current = isAuthenticated
    }, [isAuthenticated])

    // Load cart on mount
    useEffect(() => {
        const initializeCart = async () => {
            const cartToken = localStorage.getItem('cartToken')
            if (cartToken) {
                try {
                    const response: any = await api.getCart(cartToken)
                    setCart(response.data)
                } catch (error) {
                    console.error('Failed to load cart:', error)
                    // If cart not found (e.g. expired), clear token
                    localStorage.removeItem('cartToken')
                }
            }

            setLoading(false)
        }

        initializeCart()
    }, [])

    const [isCreatingCart, setIsCreatingCart] = useState(false)

    const addToCart = useCallback(async (productSlugOrId: string, quantity = 1, isSlug = true) => {
        try {
            let currentCartToken = cart?.cart_token || localStorage.getItem('cartToken')

            // Create cart if doesn't exist
            if (!currentCartToken) {
                if (isCreatingCart) return // Prevent double-creation
                setIsCreatingCart(true)
                try {
                    const sessionId = Math.random().toString(36).substring(7)
                    const response: any = await api.createCart({ sessionId })
                    currentCartToken = response.data.cart_token
                    localStorage.setItem('cartToken', currentCartToken!)
                    setCart(response.data)
                } finally {
                    setIsCreatingCart(false)
                }
            }

            // Add item
            try {
                const requestData = isSlug
                    ? { productSlug: productSlugOrId, quantity }
                    : { productId: productSlugOrId, quantity }

                const response: any = await api.addToCart(currentCartToken!, requestData)
                setCart(response.data)
            } catch (err: any) {
                // If the cart doesn't exist (e.g. invalid token from local storage or DB reset), 
                // the API now returns 404. We then try to create a new session and retry.
                if (err.status === 404) {
                    console.warn('Stale cart session detected (404). Attempting to create new session...')
                    localStorage.removeItem('cartToken')

                    const sessionId = Math.random().toString(36).substring(7)
                    const createRes: any = await api.createCart({ sessionId })
                    const newCartToken = createRes.data.cart_token

                    localStorage.setItem('cartToken', newCartToken)
                    setCart(createRes.data)

                    // Retry add with new cart
                    try {
                        const requestData = isSlug
                            ? { productSlug: productSlugOrId, quantity }
                            : { productId: productSlugOrId, quantity }

                        const retryRes: any = await api.addToCart(newCartToken, requestData)
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
    }, [cart?.cart_token, isCreatingCart])

    const removeFromCart = useCallback(async (itemId: string) => {
        if (!cart?.cart_token) return

        try {
            const response: any = await api.removeFromCart(cart.cart_token, itemId)
            setCart(response.data)
        } catch (error) {
            console.error('Remove from cart failed:', error)
            throw error
        }
    }, [cart?.cart_token])

    const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
        if (!cart?.cart_token) return

        try {
            const response: any = await api.updateCartItem(cart.cart_token, itemId, { quantity })
            setCart(response.data)
        } catch (error) {
            console.error('Update quantity failed:', error)
            throw error
        }
    }, [cart?.cart_token])

    const mergeCart = useCallback(async (userId: string) => {
        const guestCartToken = localStorage.getItem('cartToken')
        if (!guestCartToken) return

        try {
            const response: any = await api.mergeCart(guestCartToken, userId)
            setCart(response.data)
            localStorage.setItem('cartToken', response.data.cart_token)
            console.info('Guest cart merged successfully.')
        } catch (error) {
            console.error('Cart merge failed:', error)
            // If merge fails (e.g. guest cart expired), just load the user's cart
            localStorage.removeItem('cartToken')
        }
    }, [])

    const clearCart = useCallback(() => {
        setCart(null)
        localStorage.removeItem('cartToken')
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
