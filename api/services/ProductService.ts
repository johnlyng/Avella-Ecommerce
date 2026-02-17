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

        let query = db
            .select({
                product: products,
                categoryName: categories.name,
                categorySlug: categories.slug,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .$dynamic();

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

        const countQuery = db
            .select({ count: count() })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .where(and(...conditions));

        const [totalResult] = await countQuery;
        const total = totalResult ? Number(totalResult.count) : 0;

        return {
            data: data.map(row => this._mapProduct(row.product, row.categoryName || undefined, row.categorySlug || undefined)),
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
        return this._mapProduct(row.product, row.categoryName || undefined, row.categorySlug || undefined);
    }

    async updateStock(productId: number, quantity: number) {
        const [updatedProduct] = await db
            .update(products)
            .set({
                stockQuantity: quantity,
                updatedAt: new Date()
            })
            .where(eq(products.id, productId))
            .returning();

        if (!updatedProduct) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        // Return mapped to snake_case
        return this._mapProduct(updatedProduct);
    }

    private _mapProduct(product: Product, categoryName?: string, categorySlug?: string) {
        const images = (product.images as string[]) || [];
        const imageUrl = images.length > 0 ? images[0] : null;

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            compare_at_price: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stock_quantity: product.stockQuantity,
            sku: product.sku,
            category_id: product.categoryId,
            images: product.images,
            imageUrl,
            specifications: product.specifications,
            is_active: product.isActive,
            created_at: product.createdAt,
            updated_at: product.updatedAt,
            category_name: categoryName,
            category_slug: categorySlug,
        };
    }

    async createProduct(data: NewProduct) {
        const [newProduct] = await db
            .insert(products)
            .values(data)
            .returning();
        return this._mapProduct(newProduct);
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
        return this._mapProduct(updatedProduct);
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
        return this._mapProduct(deletedProduct);
    }
}

export default new ProductService();
