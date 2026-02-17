// Product Card Component
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
    product: {
        id: string
        slug: string
        name: string
        price: number
        compare_at_price?: number
        images: string[]
        stock_quantity: number
    }
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart()
    const [isLoading, setIsLoading] = React.useState(false)
    const [isAdded, setIsAdded] = React.useState(false)

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
    const discountPercent = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isLoading) return

        setIsLoading(true)
        try {
            await addToCart(product.slug)
            setIsAdded(true)
            setTimeout(() => setIsAdded(false), 2000)
        } catch (error) {
            console.error('Failed to add to cart:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Link href={`/products/${product.slug}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full bg-white">
                <CardContent className="p-4">
                    {/* Product Image */}
                    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-50">
                        {product.images && product.images.length > 0 ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 250px"
                                className="object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}

                        {/* Discount Badge */}
                        {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-md text-xs font-semibold">
                                -{discountPercent}%
                            </div>
                        )}

                        {/* Out of Stock Badge */}
                        {product.stock_quantity === 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="bg-white text-black px-4 py-2 rounded-md font-semibold">
                                    Out of Stock
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                            {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(product.price)}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                    {formatCurrency(product.compare_at_price!)}
                                </span>
                            )}
                        </div>

                        <Button
                            className="w-full transition-all duration-300"
                            variant={product.stock_quantity === 0 ? 'outline' : isAdded ? 'secondary' : 'default'}
                            disabled={product.stock_quantity === 0 || isLoading}
                            onClick={handleAddToCart}
                        >
                            {product.stock_quantity === 0
                                ? 'Out of Stock'
                                : isLoading
                                    ? 'Adding...'
                                    : isAdded
                                        ? 'Added!'
                                        : 'Add to Cart'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
