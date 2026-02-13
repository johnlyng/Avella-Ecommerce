'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, Package, Truck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Order {
    id: string
    order_number: string
    created_at: string
    status: string
    total: number
    subtotal: number
    tax: number
    shipping: number
    items: any[]
}

export default function OrderConfirmationPage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)

    const orderNumber = params.orderNumber as string

    useEffect(() => {
        if (!orderNumber) return

        async function fetchOrder() {
            try {
                const response = await api.getOrder(orderNumber) as any
                setOrder(response.data)
            } catch (error) {
                console.error('Failed to fetch order:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [orderNumber])

    if (loading) {
        return (
            <div className="container py-12 text-center">
                <div className="h-40 bg-gray-100 animate-pulse rounded-lg" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
                <p className="text-gray-500 mb-8">We couldn't find order #{orderNumber}.</p>
                <Button asChild>
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="container py-12 max-w-3xl">
            <div className="text-center mb-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-xl text-gray-600">
                    Thank you for your purchase. Your order number is <span className="font-bold text-black">#{order.order_number}</span>.
                </p>
            </div>

            <div className="grid gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                        <CardDescription>
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0 border-gray-100">
                                    <div className="flex-1">
                                        <p className="font-semibold">{item.product_name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x {formatCurrency(item.price)}</p>
                                    </div>
                                    <span className="font-medium">{formatCurrency(item.quantity * item.price)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (10%)</span>
                                <span>{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Shipping</span>
                                <span>{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold mt-4">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Truck className="h-5 w-5 text-blue-500" />
                            <CardTitle className="text-base">Order Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="font-medium capitalize">{order.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                We'll notify you when your order has been shipped.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center gap-2">
                            <Package className="h-5 w-5 text-orange-500" />
                            <CardTitle className="text-base">Need Help?</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">
                                If you have any questions about your order, please contact our support team.
                            </p>
                            <Button variant="outline" size="sm" className="w-full">
                                Contact Support
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center mt-8 space-x-4">
                    <Button asChild variant="outline">
                        <Link href="/orders">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            View All Orders
                        </Link>
                    </Button>
                    <Button asChild>
                        <Link href="/products">
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
