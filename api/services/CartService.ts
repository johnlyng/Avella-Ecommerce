// Cart Service Layer with Drizzle ORM
// Handles all cart-related business logic

import { eq, and } from 'drizzle-orm';
import { db, carts, cartItems, products, type Cart, type CartItem } from '../db';
import { calculateCartTotals } from './cartCalculator';

class CartService {
    /**
     * Create a new cart
     */
    async createCart(userId: number | null = null, sessionId: string | null = null) {
        const [cart] = await db
            .insert(carts)
            .values({ userId, sessionId })
            .returning();

        return await this.getCartById(cart.id);
    }

    /**
     * Get cart by token
     */
    async getCartByToken(token: string) {
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.cartToken, token))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        return await this.getCartById(cart.id);
    }

    /**
     * Get cart by ID with all items
     */
    async getCartById(cartId: number) {
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.id, cartId))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        // Get cart items with product details
        const items = await db
            .select({
                id: cartItems.id,
                quantity: cartItems.quantity,
                price: cartItems.price,
                product_id: products.id,
                name: products.name,
                slug: products.slug,
                description: products.description,
                category_id: products.categoryId,
                current_price: products.price,
                stock_quantity: products.stockQuantity
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(eq(cartItems.cartId, cartId));

        // Calculate totals
        const totals = await calculateCartTotals(cartId);

        return {
            ...cart,
            cart_token: cart.cartToken,
            user_id: cart.userId,
            session_id: cart.sessionId,
            created_at: cart.createdAt,
            updated_at: cart.updatedAt,
            items,
            ...totals
        };
    }

    /**
     * Add item to cart
     */
    async addItemToCart(token: string, { productSlug, productId, quantity = 1 }: {
        productSlug?: string;
        productId?: number;
        quantity?: number;
    }) {
        // Get cart ID from token
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.cartToken, token))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        const cartId = cart.id;

        // Get product by slug or id
        let product;
        if (productSlug) {
            [product] = await db
                .select()
                .from(products)
                .where(and(
                    eq(products.slug, productSlug),
                    eq(products.isActive, true)
                ))
                .limit(1);
        } else if (productId) {
            [product] = await db
                .select()
                .from(products)
                .where(and(
                    eq(products.id, productId),
                    eq(products.isActive, true)
                ))
                .limit(1);
        } else {
            const error = new Error('productSlug or productId is required');
            (error as any).statusCode = 400;
            throw error;
        }

        if (!product) {
            const error = new Error('Product not found');
            (error as any).statusCode = 404;
            throw error;
        }

        // Check stock availability
        if (product.stockQuantity < quantity) {
            const error = new Error(`Only ${product.stockQuantity} items available`);
            (error as any).statusCode = 400;
            throw error;
        }

        // Check if item already in cart
        const [existing] = await db
            .select()
            .from(cartItems)
            .where(and(
                eq(cartItems.cartId, cartId),
                eq(cartItems.productId, product.id)
            ))
            .limit(1);

        if (existing) {
            // Update quantity
            const newQuantity = existing.quantity + quantity;
            await db
                .update(cartItems)
                .set({ quantity: newQuantity })
                .where(and(
                    eq(cartItems.cartId, cartId),
                    eq(cartItems.productId, product.id)
                ));
        } else {
            // Insert new item
            await db
                .insert(cartItems)
                .values({
                    cartId,
                    productId: product.id,
                    quantity,
                    price: product.price
                });
        }

        return await this.getCartById(cartId);
    }

    /**
     * Update cart item quantity
     */
    async updateCartItem(token: string, itemId: number, quantity: number) {
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.cartToken, token))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        const cartId = cart.id;

        // Verify item belongs to cart and get stock quantity
        const [item] = await db
            .select({
                id: cartItems.id,
                cartId: cartItems.cartId,
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                price: cartItems.price,
                stock_quantity: products.stockQuantity
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(and(
                eq(cartItems.id, itemId),
                eq(cartItems.cartId, cartId)
            ))
            .limit(1);

        if (!item) {
            const error = new Error('Cart item not found');
            (error as any).statusCode = 404;
            throw error;
        }

        // Check stock availability
        if (item.stock_quantity < quantity) {
            const error = new Error(`Only ${item.stock_quantity} items available`);
            (error as any).statusCode = 400;
            throw error;
        }

        // Update quantity
        await db
            .update(cartItems)
            .set({ quantity })
            .where(eq(cartItems.id, itemId));

        return await this.getCartById(cartId);
    }

    /**
     * Remove item from cart
     */
    async removeCartItem(token: string, itemId: number) {
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.cartToken, token))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        const cartId = cart.id;

        // Delete item (verify it belongs to this cart)
        const deleted = await db
            .delete(cartItems)
            .where(and(
                eq(cartItems.id, itemId),
                eq(cartItems.cartId, cartId)
            ))
            .returning();

        if (deleted.length === 0) {
            const error = new Error('Cart item not found');
            (error as any).statusCode = 404;
            throw error;
        }

        return await this.getCartById(cartId);
    }

    /**
     * Clear all items from cart
     */
    async clearCart(token: string) {
        const [cart] = await db
            .select()
            .from(carts)
            .where(eq(carts.cartToken, token))
            .limit(1);

        if (!cart) {
            const error = new Error('Cart not found');
            (error as any).statusCode = 404;
            throw error;
        }

        const cartId = cart.id;

        await db
            .delete(cartItems)
            .where(eq(cartItems.cartId, cartId));

        return await this.getCartById(cartId);
    }

    /**
     * Merge guest cart into user cart
     */
    async mergeCarts(guestCartToken: string, userCartToken: string) {
        // Get both carts
        const guestCart = await this.getCartByToken(guestCartToken);
        const userCart = await this.getCartByToken(userCartToken);

        // Move all items from guest cart to user cart
        for (const item of guestCart.items) {
            const [existing] = await db
                .select()
                .from(cartItems)
                .where(and(
                    eq(cartItems.cartId, userCart.id),
                    eq(cartItems.productId, item.product_id)
                ))
                .limit(1);

            if (existing) {
                // Update quantity (add to existing)
                const newQuantity = existing.quantity + item.quantity;
                await db
                    .update(cartItems)
                    .set({ quantity: newQuantity })
                    .where(and(
                        eq(cartItems.cartId, userCart.id),
                        eq(cartItems.productId, item.product_id)
                    ));
            } else {
                // Insert new item
                await db
                    .insert(cartItems)
                    .values({
                        cartId: userCart.id,
                        productId: item.product_id,
                        quantity: item.quantity,
                        price: item.price
                    });
            }
        }

        // Delete guest cart
        await db
            .delete(carts)
            .where(eq(carts.cartToken, guestCartToken));

        return await this.getCartById(userCart.id);
    }
}

export default new CartService();
