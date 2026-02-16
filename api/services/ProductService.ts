import { eq, and, sql, desc, ilike, gte, lte, count } from 'drizzle-orm';
import { db } from '../db';
import { products, categories, type Product, type NewProduct } from '../db/schema';

export class ProductService {
    async getProducts(params: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        limit?: number;
        offset?: number;
        sortBy?: 'price_asc' | 'price_desc' | 'newest';
    }) {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            limit = 20,
            offset = 0,
            sortBy = 'newest'
        } = params;

        // Base conditions
        const conditions = [eq(products.isActive, true)];

        // Joins are handled by Drizzle's query builder or explicit joins
        // Since we want category info, we'll use a left join logic or query builder query
        let query = db
            .select({
                product: products,
                categoryName: categories.name,
                categorySlug: categories.slug,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .$dynamic(); // Enable dynamic query building

        if (category) {
            conditions.push(eq(categories.slug, category));
        }

        if (minPrice !== undefined) {
            conditions.push(gte(products.price, minPrice.toString()));
        }

        if (maxPrice !== undefined) {
            conditions.push(lte(products.price, maxPrice.toString()));
        }

        if (search) {
            const searchPattern = `%${search}%`;
            conditions.push(
                sql`(${products.name} ILIKE ${searchPattern} OR ${products.description} ILIKE ${searchPattern} OR ${products.sku} ILIKE ${searchPattern})`
            );
        }

        // Apply filters
        query = query.where(and(...conditions));

        // Apply sorting
        if (sortBy === 'price_asc') {
            query = query.orderBy(products.price);
        } else if (sortBy === 'price_desc') {
            query = query.orderBy(desc(products.price));
        } else {
            query = query.orderBy(desc(products.createdAt));
        }

        // Apply pagination
        const data = await query.limit(limit).offset(offset);

        // Get total count (simplified, ideally strictly separate query for performance)
        // Re-using conditions for count query
        const countQuery = db
            .select({ count: count() })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(...conditions));

        const [totalResult] = await countQuery;
        const total = totalResult ? totalResult.count : 0;

        return {
            data: data.map(row => {
                // Map first image to imageUrl for backward compatibility
                const images = (row.product.images as string[]) || [];
                const imageUrl = images.length > 0 ? images[0] : null;

                return {
                    ...row.product,
                    imageUrl,
                    category_name: row.categoryName,
                    category_slug: row.categorySlug,
                };
            }),
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + data.length < total
            }
        };
    }

    async getProductBySlug(slug: string) {
        const result = await db
            .select({
                product: products,
                categoryName: categories.name,
                categorySlug: categories.slug,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(eq(products.slug, slug), eq(products.isActive, true)))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        const images = (row.product.images as string[]) || [];
        const imageUrl = images.length > 0 ? images[0] : null;

        return {
            ...row.product,
            imageUrl,
            category_name: row.categoryName,
            category_slug: row.categorySlug,
        };
    }

    async updateStock(productId: number, quantity: number) {
        // ... (existing code)
    }

    async createProduct(data: NewProduct) {
        const [newProduct] = await db
            .insert(products)
            .values(data)
            .returning();
        return newProduct;
    }

    async updateProduct(id: number, data: Partial<NewProduct>) {
        const [updatedProduct] = await db
            .update(products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();

        if (!updatedProduct) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return updatedProduct;
    }

    async deleteProduct(id: number) {
        const [deletedProduct] = await db
            .update(products)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(products.id, id))
            .returning();

        if (!deletedProduct) {
            throw new Error(`Product with ID ${id} not found`);
        }
        return deletedProduct;
    }
}

export default new ProductService();
