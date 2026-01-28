import { ProductCard } from '@/components/ProductCard'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ProductFilters } from '@/components/ProductFilters'

interface ProductsPageProps {
    searchParams: {
        category?: string
        search?: string
        page?: string
    }
}

export const revalidate = 60

async function getProducts(searchParams: ProductsPageProps['searchParams']) {
    const page = parseInt(searchParams.page || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const response = await api.getProducts({
        category: searchParams.category,
        search: searchParams.search,
        limit,
        offset,
    })

    return {
        products: response.data,
        pagination: response.pagination,
        currentPage: page,
    }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const { products, pagination, currentPage } = await getProducts(searchParams)

    const categoryLabel = searchParams.category
        ? searchParams.category.charAt(0).toUpperCase() + searchParams.category.slice(1)
        : 'All Products'

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 shrink-0">
                        <ProductFilters />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {categoryLabel}
                            </h1>
                            <p className="text-gray-600">
                                {searchParams.search
                                    ? `Search results for "${searchParams.search}"`
                                    : `Showing ${pagination.total} products`
                                }
                            </p>
                        </div>

                        {/* Products Grid */}
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                {products.map((product: any) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-lg">
                                <p className="text-xl text-gray-500">No products found</p>
                                <Button variant="link" asChild className="mt-2">
                                    <a href="/products">Clear filters</a>
                                </Button>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.total > 20 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {currentPage > 1 && (
                                    <Button variant="outline" asChild>
                                        <a href={`/products?${new URLSearchParams({
                                            ...searchParams,
                                            page: (currentPage - 1).toString()
                                        })}`}>
                                            Previous
                                        </a>
                                    </Button>
                                )}

                                <span className="flex items-center px-4 text-sm font-medium">
                                    Page {currentPage} of {Math.ceil(pagination.total / 20)}
                                </span>

                                {pagination.hasMore && (
                                    <Button variant="outline" asChild>
                                        <a href={`/products?${new URLSearchParams({
                                            ...searchParams,
                                            page: (currentPage + 1).toString()
                                        })}`}>
                                            Next
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
