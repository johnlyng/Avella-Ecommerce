'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

interface AddToCartButtonProps {
    productSlug: string
    stockQuantity: number
}

export function AddToCartButton({ productSlug, stockQuantity }: AddToCartButtonProps) {
    const { addToCart } = useCart()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isAdded, setIsAdded] = React.useState(false)

    const handleAddToCart = async () => {
        if (isLoading) return
        setIsLoading(true)
        try {
            await addToCart(productSlug, 1, true) // true = isSlug
            setIsAdded(true)
            setTimeout(() => setIsAdded(false), 2000)
        } catch (error) {
            console.error('Failed to add to cart:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            size="lg"
            className="w-full text-lg transition-all duration-300"
            variant={stockQuantity === 0 ? 'outline' : isAdded ? 'secondary' : 'default'}
            disabled={stockQuantity === 0 || isLoading}
            onClick={handleAddToCart}
        >
            {isLoading ? (
                <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                </span>
            ) : isAdded ? (
                <span className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Added!
                </span>
            ) : (
                <span className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </span>
            )}
        </Button>
    )
}
