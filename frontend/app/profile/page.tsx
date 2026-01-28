'use client'

import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-lg font-medium">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Email Address</label>
                            <p className="text-lg font-medium">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Account Type</label>
                            <p className="text-lg font-medium capitalize">{user.role}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Account Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={logout}>
                            Log Out
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
