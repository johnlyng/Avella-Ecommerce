'use client'

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react'
import { api } from '@/lib/api'
import { useAuth } from './AuthContext'
import { useCartRecovery } from '@/hooks/useCartRecovery'
import { useCartActions } from '@/hooks/useCartActions'
import { useCartMerge } from '@/hooks/useCartMerge'

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
    const { isAuthenticated } = useAuth()
    const [cart, setCart] = useState<Cart | null>(null)
    const [loading, setLoading] = useState(true)
    const prevAuthRef = useRef(isAuthenticated)

    // Initialize custom hooks
    const { recoverCart } = useCartRecovery(setCart)
    const { addItem, updateItemQuantity, removeItem, clearCart } = useCartActions(cart, setCart, recoverCart)
    const { mergeGuestCart } = useCartMerge(setCart)

    // Clear cart on logout
    useEffect(() => {
        if (prevAuthRef.current && !isAuthenticated) {
            console.info('User logged out, clearing cart state.')
            clearCart()
        }
        prevAuthRef.current = isAuthenticated
    }, [isAuthenticated, clearCart])

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
                    localStorage.removeItem('cartToken')
                }
            }
            setLoading(false)
        }

        initializeCart()
    }, [])

    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

    const value = useMemo(() => ({
        cart,
        itemCount,
        addToCart: addItem,
        removeFromCart: removeItem,
        updateQuantity: updateItemQuantity,
        mergeCart: mergeGuestCart,
        clearCart,
        loading
    }), [cart, itemCount, addItem, removeItem, updateItemQuantity, mergeGuestCart, clearCart, loading])

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
