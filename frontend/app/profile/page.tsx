'use client'

import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AddressList } from '@/components/profile/AddressList'

export default function ProfilePage() {
    const { user, isAuthenticated, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    if (!user) {
        return null
    }

    return (
        <div className="container py-12 max-w-6xl">
            <h1 className="text-4xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Full Name</label>
                                <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Account Type</label>
                                <p className="text-lg font-semibold capitalize">{user.role}</p>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                            <p className="text-lg font-semibold">{user.email}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" className="w-full" onClick={logout}>
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <AddressList />
        </div>
    )
}
