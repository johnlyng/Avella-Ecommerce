import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../db';
import {
    orders,
    orderItems,
    users,
    carts,
    cartItems,
    products,
    type NewOrder,
    type NewOrderItem
} from '../db/schema';

export interface CreateExternalOrderParams {
    customerId: number;
    externalId?: string;
    items: Array<{
        productSlug: string;
        quantity: number;
        priceOverride?: number;
    }>;
    shippingAddress: any;
    billingAddress?: any;
}

export class OrderService {
    async createExternalOrder(params: CreateExternalOrderParams) {
        const { customerId, externalId, items, shippingAddress, billingAddress } = params;

        return await db.transaction(async (tx) => {
            // 1. Verify Customer
            const [user] = await tx
                .select()
                .from(users)
                .where(eq(users.id, customerId))
                .limit(1);

            if (!user) {
                throw new Error(`Customer with ID ${customerId} not found`);
            }

            // 2. Process Items & Validate Stock
            let subtotal = 0;
            const orderItemsData: NewOrderItem[] = [];

            for (const item of items) {
                const [product] = await tx
                    .select()
                    .from(products)
                    .where(eq(products.slug, item.productSlug))
                    .limit(1);

                if (!product) {
                    throw new Error(`Product with slug '${item.productSlug}' not found`);
                }

                if (product.stockQuantity < item.quantity) {
                    throw new Error(`${product.name} has insufficient stock`);
                }

                const price = item.priceOverride ?? Number(product.price);
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;

                orderItemsData.push({
                    orderId: 0,
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku || 'UNKNOWN',
                    quantity: item.quantity,
                    price: price.toString(),
                    total: itemTotal.toString()
                });
            }

            const tax = subtotal * 0.1;
            const shipping = subtotal >= 100 ? 0 : 10;
            const total = subtotal + tax + shipping;

            const orderNumber = externalId || `EXT-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            // 3. Create Order
            const [newOrder] = await tx
                .insert(orders)
                .values({
                    userId: customerId,
                    orderNumber: orderNumber,
                    status: 'pending',
                    subtotal: subtotal.toString(),
                    tax: tax.toString(),
                    shippingCost: shipping.toString(),
                    total: total.toString(),
                    shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
                    billingAddress: billingAddress ? (typeof billingAddress === 'object' ? JSON.stringify(billingAddress) : billingAddress) : null,
                } as NewOrder)
                .returning();

            // 4. Create Order Items & Update Stock
            for (const item of orderItemsData) {
                item.orderId = newOrder.id;
                await tx.insert(orderItems).values(item);

                await tx
                    .update(products)
                    .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
                    .where(eq(products.id, item.productId));
            }

            return newOrder;
        });
    }

    async updateOrderStatus(orderId: number, status: string, trackingNumber?: string) {
        const updateData: any = { status };

        // If we had a column for tracking number, we'd update it here.
        // The schema doesn't have it yet, so we'll just update status.
        // Note: No email notification as per user request.

        const [updatedOrder] = await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId))
            .returning();

        if (!updatedOrder) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        return updatedOrder;
    }
    async createOrder(params: {
        userId?: number | null;
        cartToken: string;
        shippingAddress: any;
        billingAddress?: any;
    }) {
        const { userId, cartToken, shippingAddress, billingAddress } = params;

        return await db.transaction(async (tx) => {
            // 1. Get Cart
            const [cart] = await tx
                .select()
                .from(carts)
                .where(eq(carts.cartToken, cartToken))
                .limit(1);

            if (!cart) {
                throw new Error('Cart not found');
            }

            // 2. Get Cart Items with Product details
            const items = await tx
                .select({
                    cartItem: cartItems,
                    product: products
                })
                .from(cartItems)
                .innerJoin(products, eq(cartItems.productId, products.id))
                .where(eq(cartItems.cartId, cart.id));

            if (items.length === 0) {
                throw new Error('Cart is empty');
            }

            // 3. Validate Stock & Calculate Totals
            let subtotal = 0;
            const orderItemsData: NewOrderItem[] = [];

            for (const { cartItem, product } of items) {
                if (product.stockQuantity < cartItem.quantity) {
                    throw new Error(`${product.name} has insufficient stock`);
                }

                const itemTotal = Number(product.price) * cartItem.quantity;
                subtotal += itemTotal;

                orderItemsData.push({
                    orderId: 0, // Placeholder
                    productId: product.id,
                    productName: product.name,
                    productSku: product.sku || 'UNKNOWN',
                    quantity: cartItem.quantity,
                    price: product.price,
                    total: itemTotal.toString()
                });
            }

            const tax = subtotal * 0.1; // 10% tax
            const shipping = subtotal >= 100 ? 0 : 10;
            const total = subtotal + tax + shipping;

            // Generate order number
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

            // 4. Create Order
            const [newOrder] = await tx
                .insert(orders)
                .values({
                    userId: userId || null,
                    orderNumber: orderNumber,
                    status: 'pending',
                    subtotal: subtotal.toString(),
                    tax: tax.toString(),
                    shippingCost: shipping.toString(),
                    total: total.toString(),
                    shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : shippingAddress,
                    billingAddress: billingAddress ? (typeof billingAddress === 'object' ? JSON.stringify(billingAddress) : billingAddress) : null,
                } as NewOrder)
                .returning();

            // 5. Create Order Items & Update Stock
            for (const item of orderItemsData) {
                item.orderId = newOrder.id; // Link to the new order

                await tx.insert(orderItems).values(item);

                // Update stock
                await tx
                    .update(products)
                    .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
                    .where(eq(products.id, item.productId));
            }

            // 6. Clear Cart
            await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));

            return newOrder;
        });
    }

    async getOrderByNumber(orderNumber: string) {
        const [order] = await db
            .select()
            .from(orders)
            .where(eq(orders.orderNumber, orderNumber))
            .limit(1);

        if (!order) return null;

        const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, order.id));

        return { ...order, items };
    }

    async getUserOrders(userId: number) {
        return await db
            .select()
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt));
    }
}

export default new OrderService();
