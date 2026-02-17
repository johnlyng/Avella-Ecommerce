import { eq, sql, count } from 'drizzle-orm';
import { db } from '../db';
import { categories, products } from '../db/schema';

export class CategoryService {
    async getCategories() {
        // Fetch categories with product counts
        const result = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
                description: categories.description,
                parentId: categories.parentId,
                imageUrl: categories.imageUrl,
                createdAt: categories.createdAt,
                productCount: count(products.id)
            })
            .from(categories)
            .leftJoin(products, eq(products.categoryId, categories.id))
            .where(sql`${products.isActive} IS TRUE OR ${products.isActive} IS NULL`)
            .groupBy(categories.id)
            .orderBy(categories.name);

        return result.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            parent_id: cat.parentId,
            image_url: cat.imageUrl,
            created_at: cat.createdAt,
            product_count: Number(cat.productCount)
        }));
    }

    async getCategoryBySlug(slug: string) {
        const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.slug, slug))
            .limit(1);

        if (!category) return null;

        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            parent_id: category.parentId,
            image_url: category.imageUrl,
            created_at: category.createdAt
        };
    }
}

export default new CategoryService();
