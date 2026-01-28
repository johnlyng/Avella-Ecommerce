'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Trash2, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, loading } = useCart()

    if (loading) {
        return (
            <div className="container py-12 flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const items = cart?.items || []
    const subtotal = cart?.subtotal || 0
    const tax = cart?.tax || 0
    const total = cart?.total || 0

    return (
        <div className="container py-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Shopping Cart
            </h1>

            {items.length === 0 ? (
                <Card className="p-12 text-center">
                    <p className="text-xl text-gray-500 mb-6">Your cart is empty</p>
                    <Button asChild>
                        <Link href="/products">
                            Continue Shopping
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id} className="p-4">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                                        {/* Placeholder or Image */}
                                        <div className="text-xs text-gray-400">No Image</div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{item.product_name}</h3>
                                        {/* SKU optional */}
                                        {item.product_sku && <p className="text-xs text-gray-500 mb-1">SKU: {item.product_sku}</p>}
                                        <p className="text-sm font-medium text-gray-600">{formatCurrency(item.price)}</p>

                                        <div className="flex items-center gap-2 mt-4">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-between">
                                        <p className="font-bold text-lg">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 self-end"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span className="font-semibold">{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-green-600">Free</span>
                                </div>
                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between text-xl">
                                        <span className="font-bold">Total</span>
                                        <span className="font-bold text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full mt-8" size="lg" asChild>
                                <Link href="/checkout">
                                    Proceed to Checkout
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    )
}
