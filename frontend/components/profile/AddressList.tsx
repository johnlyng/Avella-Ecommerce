'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, MapPin, Loader2 } from 'lucide-react'
import { AddressCard } from './AddressCard'
import { AddressDialog } from './AddressDialog'
import { api } from '@/lib/api'
import { SavedAddress } from '@/types/api'

export function AddressList() {
    const { token } = useAuth()
    const [addresses, setAddresses] = useState<SavedAddress[]>([])
    const [loading, setLoading] = useState(true)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)

    const fetchAddresses = async () => {
        if (!token) return
        try {
            setLoading(true)
            const response = await api.getAddresses(token)
            setAddresses(response.data || [])
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [token])

    const handleAddClick = () => {
        setEditingAddress(null)
        setDialogOpen(true)
    }

    const handleEditClick = (address: SavedAddress) => {
        setEditingAddress(address)
        setDialogOpen(true)
    }

    const handleSubmit = async (data: any) => {
        if (!token) return
        try {
            if (editingAddress) {
                await api.updateAddress(token, editingAddress.id, data)
            } else {
                await api.createAddress(token, data)
            }
            fetchAddresses()
        } catch (error) {
            console.error('Failed to save address:', error)
            throw error
        }
    }

    const handleDelete = async (id: number) => {
        if (!token || !confirm('Are you sure you want to delete this address?')) return
        try {
            await api.deleteAddress(token, id)
            fetchAddresses()
        } catch (error) {
            console.error('Failed to delete address:', error)
        }
    }

    const handleSetDefault = async (id: number) => {
        if (!token) return
        try {
            await api.setDefaultAddress(token, id)
            fetchAddresses()
        } catch (error) {
            console.error('Failed to set default address:', error)
        }
    }

    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                <CardTitle className="text-2xl font-bold">Your Addresses</CardTitle>
                <Button onClick={handleAddClick} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add New
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Loading addresses...</p>
                    </div>
                ) : addresses.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {addresses.map((address) => (
                            <AddressCard
                                key={address.id}
                                address={address}
                                onEdit={handleEditClick}
                                onDelete={handleDelete}
                                onSetDefault={handleSetDefault}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-gray-100 bg-gray-50/50">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                            <MapPin className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No addresses found</h3>
                        <p className="text-gray-500 mb-6 text-center max-w-xs">
                            Add a shipping address to speed up your checkout process.
                        </p>
                        <Button variant="outline" onClick={handleAddClick}>
                            Add your first address
                        </Button>
                    </div>
                )}
            </CardContent>

            <AddressDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                address={editingAddress}
                onSubmit={handleSubmit}
            />
        </Card>
    )
}
