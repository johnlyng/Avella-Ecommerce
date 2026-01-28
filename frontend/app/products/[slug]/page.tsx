// Product Detail Page
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import { ShoppingCart, Check, X } from 'lucide-react'
import { AddToCartButton } from '@/components/AddToCartButton'

interface ProductPageProps {
    params: {
        slug: string
    }
}

export const revalidate = 60

async function getProduct(slug: string) {
    try {
        const response = await api.getProduct(slug)
        return response.data
    } catch (error) {
        return null
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const product = await getProduct(params.slug)

    if (!product) {
        notFound()
    }

    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
    const discountPercent = hasDiscount
        ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
        : 0

    const specifications = typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications

    return (
        <div className="container py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-4">
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-50">
                        {product.images && product.images.length > 0 ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-contain"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                            </div>
                        )}

                        {hasDiscount && (
                            <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-md font-semibold text-lg">
                                -{discountPercent}% OFF
                            </div>
                        )}
                    </div>

                    {/* Additional Images */}
                    {product.images && product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.slice(1, 5).map((image: string, index: number) => (
                                <div key={index} className="aspect-square relative overflow-hidden rounded-lg bg-gray-50 cursor-pointer hover:opacity-75 transition-opacity">
                                    <Image
                                        src={image}
                                        alt={`${product.name} ${index + 2}`}
                                        fill
                                        sizes="(max-width: 1024px) 25vw, 12vw"
                                        className="object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-primary font-semibold mb-2">
                            {product.category_name}
                        </p>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-4xl font-bold text-gray-900">
                                {formatCurrency(product.price)}
                            </span>
                            {hasDiscount && (
                                <span className="text-2xl text-gray-500 line-through">
                                    {formatCurrency(product.compare_at_price)}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-2 mb-6">
                            {product.stock_quantity > 0 ? (
                                <>
                                    <Check className="h-5 w-5 text-green-600" />
                                    <span className="text-green-600 font-semibold">
                                        In Stock ({product.stock_quantity} available)
                                    </span>
                                </>
                            ) : (
                                <>
                                    <X className="h-5 w-5 text-red-600" />
                                    <span className="text-red-600 font-semibold">
                                        Out of Stock
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="prose prose-gray">
                        <p className="text-gray-600 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    {/* Specifications */}
                    {specifications && Object.keys(specifications).length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                                <dl className="grid grid-cols-1 gap-3">
                                    {Object.entries(specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                            <dt className="text-gray-600 font-medium capitalize">
                                                {key.replace('_', ' ')}
                                            </dt>
                                            <dd className="text-gray-900 font-semibold">
                                                {String(value)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    )}

                    {/* Add to Cart */}
                    <div className="space-y-4">
                        <AddToCartButton
                            productId={product.id}
                            stockQuantity={product.stock_quantity}
                        />

                        {product.sku && (
                            <p className="text-sm text-gray-500 text-center">
                                SKU: {product.sku}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
