// Homepage
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/ProductCard'
import { api } from '@/lib/api'
import { ArrowRight } from 'lucide-react'

export const revalidate = 60 // Revalidate every 60 seconds

async function getHomeData() {
    const [categoriesRes, productsRes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ limit: 8 }),
    ])

    return {
        categories: categoriesRes.data,
        featuredProducts: productsRes.data,
    }
}

export default async function HomePage() {
    const { categories, featuredProducts } = await getHomeData()

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                {/* Geometric Blue Background Element */}
                <div className="absolute left-0 top-0 w-1/3 h-full geometric-blue opacity-10"></div>

                <div className="container relative z-10 py-20 md:py-32">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                            Premium Electronics for
                            <span className="block text-primary">Modern Living</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Discover cutting-edge technology that enhances your digital lifestyle.
                            Quality products, exceptional service.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="text-base px-8">
                                <Link href="/products">
                                    Shop Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild className="text-base px-8">
                                <Link href="/products?category=laptops">Browse Laptops</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-16 bg-white">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Shop by Category
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Explore our curated collection of premium electronics
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category: any) => (
                            <Link
                                key={category.id}
                                href={`/products?category=${category.slug}`}
                                className="group"
                            >
                                <div className="bg-gray-50 rounded-lg p-6 text-center hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer">
                                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                                        {category.image_url && (
                                            <Image
                                                src={category.image_url}
                                                alt={category.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 16vw, 150px"
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-sm">{category.name}</h3>
                                    <p className="text-xs mt-1 opacity-70">{category.product_count} products</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-50">
                <div className="container">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Featured Products
                            </h2>
                            <p className="text-lg text-gray-600">
                                Handpicked favorites from our collection
                            </p>
                        </div>
                        <Button variant="outline" asChild className="hidden md:flex">
                            <Link href="/products">
                                View All
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" asChild>
                            <Link href="/products">
                                View All Products
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="bg-primary text-white py-16">
                <div className="container">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Stay Updated
                        </h2>
                        <p className="text-lg mb-8 opacity-90">
                            Subscribe to get special offers, free giveaways, and updates on the latest products.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                            />
                            <Button
                                type="submit"
                                variant="secondary"
                                size="lg"
                                className="bg-white text-primary hover:bg-gray-100"
                            >
                                Subscribe
                            </Button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}
