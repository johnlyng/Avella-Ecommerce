'use client'

import { components } from '@/types/api'

type SavedAddress = components['schemas']['SavedAddress']
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Edit2, Trash2, CheckCircle2 } from 'lucide-react'

interface AddressCardProps {
    address: SavedAddress
    onEdit: (address: SavedAddress) => void
    onDelete: (id: number) => void
    onSetDefault: (id: number) => void
}

export function AddressCard({ address, onEdit, onDelete, onSetDefault }: AddressCardProps) {
    return (
        <Card className={`relative overflow-hidden border-2 transition-all ${address.isDefault ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-200'}`}>
            {address.isDefault && (
                <div className="absolute top-0 right-0 p-2">
                    <Badge variant="default" className="bg-primary text-white flex gap-1 items-center">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                    </Badge>
                </div>
            )}

            <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-lg capitalize">{address.type || 'Home'}</h4>
                        <p className="text-gray-600">
                            {address.firstName} {address.lastName}
                        </p>
                    </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600 mb-6">
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 && <p>{address.addressLine2}</p>}
                    <p>{address.city}, {address.state} {address.postalCode}</p>
                    <p>{address.country}</p>
                    {address.phoneNumber && (
                        <div className="flex items-center gap-2 mt-2 text-gray-500">
                            <Phone className="w-3 h-3" />
                            <span>{address.phoneNumber}</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => onEdit(address)}
                    >
                        <Edit2 className="w-3 h-3" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(address.id)}
                    >
                        <Trash2 className="w-3 h-3" />
                        Delete
                    </Button>
                    {!address.isDefault && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-2 text-primary hover:text-primary hover:bg-primary/5"
                            onClick={() => onSetDefault(address.id)}
                        >
                            Set as Default
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
