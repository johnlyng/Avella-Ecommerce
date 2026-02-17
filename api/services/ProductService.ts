import { eq, and, sql, desc, ilike, gte, lte, count } from 'drizzle-orm';
import { db } from '../db';
import { products, categories, inventoryLevels, type Product, type NewProduct } from '../db/schema';

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
                stockQuantity: inventoryLevels.quantity,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
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
            data: data.map(row => this._mapProduct(row.product, row.stockQuantity, row.categoryName || undefined, row.categorySlug || undefined)),
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
                stockQuantity: inventoryLevels.quantity,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
            .where(and(eq(products.slug, slug), eq(products.isActive, true)))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];
        return this._mapProduct(row.product, row.stockQuantity, row.categoryName || undefined, row.categorySlug || undefined);
    }

    async updateStock(productId: number, quantity: number) {
        // Update inventory_levels
        const [updatedInventory] = await db
            .update(inventoryLevels)
            .set({
                quantity: quantity,
                updatedAt: new Date()
            })
            .where(eq(inventoryLevels.productId, productId))
            .returning();

        if (!updatedInventory) {
            // If no inventory record exists (edge case), create one
            const [newInventory] = await db.insert(inventoryLevels).values({
                productId,
                quantity,
                locationId: 'default'
            }).returning();

            if (!newInventory) throw new Error(`Could not update stock for product ${productId}`);
        }

        // Fetch product to return mapped object
        // Recursion risk if we call getProductById? calling getProductBySlug needs slug.
        // Let's just fetch the product directly.
        return this.getProductById(productId);
    }

    async getProductById(id: number) {
        const result = await db
            .select({
                product: products,
                categoryName: categories.name,
                categorySlug: categories.slug,
                stockQuantity: inventoryLevels.quantity,
            })
            .from(products)
            .leftJoin(categories, eq(products.categoryId, categories.id))
            .leftJoin(inventoryLevels, eq(products.id, inventoryLevels.productId))
            .where(eq(products.id, id))
            .limit(1);

        if (result.length === 0) return null;
        const row = result[0];
        return this._mapProduct(row.product, row.stockQuantity, row.categoryName || undefined, row.categorySlug || undefined);
    }

    private _mapProduct(product: Product, stockQuantity: number | null, categoryName?: string, categorySlug?: string) {
        const images = (product.images as string[]) || [];
        const imageUrl = images.length > 0 ? images[0] : null;

        return {
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: Number(product.price),
            compare_at_price: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stock_quantity: stockQuantity ?? 0,
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
        // Transaction to create product AND inventory
        return await db.transaction(async (tx) => {
            const [newProduct] = await tx
                .insert(products)
                .values(data)
                .returning();

            // Create default inventory
            await tx.insert(inventoryLevels).values({
                productId: newProduct.id,
                quantity: 0, // Default 0
                locationId: 'default'
            });

            return this._mapProduct(newProduct, 0);
        });
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

        // Fetch fresh quantity
        const [inv] = await db.select().from(inventoryLevels).where(eq(inventoryLevels.productId, id));

        return this._mapProduct(updatedProduct, inv?.quantity ?? 0);
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
        // Fetch last known quantity (though product is logically deleted)
        const [inv] = await db.select().from(inventoryLevels).where(eq(inventoryLevels.productId, id));
        return this._mapProduct(deletedProduct, inv?.quantity ?? 0);
    }
}

export default new ProductService();
