'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Package, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Order {
    id: string
    order_number: string
    created_at: string
    status: string
    total: number
    items?: any[]
}

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuth()
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
            return
        }

        async function fetchOrders() {
            if (!user?.id) return

            try {
                const response = await api.getUserOrders(user.id)
                setOrders(response.data)
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [isAuthenticated, router, user?.id])

    if (!isAuthenticated) return null

    if (loading) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
                        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                        <Button asChild>
                            <Link href="/products">Start Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <Card key={order.id}>
                            <CardHeader className="bg-gray-50/50">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                                        <CardDescription>
                                            Placed on {new Date(order.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold">
                                            {formatCurrency(order.total)}
                                        </span>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                            ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-gray-100 text-gray-700'}`}>
                                            {order.status}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {order.status === 'pending' ? (
                                        <>
                                            <Clock className="h-4 w-4" />
                                            <span>Processing</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Completed</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
