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

            return {
                ...newOrder,
                order_number: newOrder.orderNumber,
                user_id: newOrder.userId,
                shipping_cost: newOrder.shippingCost,
                shipping_address: newOrder.shippingAddress,
                billing_address: newOrder.billingAddress,
                created_at: newOrder.createdAt,
                updated_at: newOrder.updatedAt
            };
        });
    }

    async updateOrderStatus(orderId: number, status: string, trackingNumber?: string) {
        const updateData: any = { status };

        const [updatedOrder] = await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, orderId))
            .returning();

        if (!updatedOrder) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        return {
            ...updatedOrder,
            order_number: updatedOrder.orderNumber,
            user_id: updatedOrder.userId,
            shipping_cost: updatedOrder.shippingCost,
            shipping_address: updatedOrder.shippingAddress,
            billing_address: updatedOrder.billingAddress,
            created_at: updatedOrder.createdAt,
            updated_at: updatedOrder.updatedAt
        };
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

            return {
                ...newOrder,
                order_number: newOrder.orderNumber,
                user_id: newOrder.userId,
                shipping_cost: newOrder.shippingCost,
                shipping_address: newOrder.shippingAddress,
                billing_address: newOrder.billingAddress,
                created_at: newOrder.createdAt,
                updated_at: newOrder.updatedAt
            };
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

        return {
            ...order,
            order_number: order.orderNumber,
            user_id: order.userId,
            shipping_cost: order.shippingCost,
            shipping_address: order.shippingAddress,
            billing_address: order.billingAddress,
            created_at: order.createdAt,
            updated_at: order.updatedAt,
            items: items.map(item => ({
                ...item,
                order_id: item.orderId,
                product_id: item.productId,
                product_name: item.productName,
                product_sku: item.productSku,
                created_at: item.createdAt
            }))
        };
    }

    async getUserOrders(userId: number) {
        const result = await db
            .select()
            .from(orders)
            .where(eq(orders.userId, userId))
            .orderBy(desc(orders.createdAt));

        return result.map(order => ({
            ...order,
            order_number: order.orderNumber,
            user_id: order.userId,
            shipping_cost: order.shippingCost,
            shipping_address: order.shippingAddress,
            billing_address: order.billingAddress,
            created_at: order.createdAt,
            updated_at: order.updatedAt
        }));
    }
}

export default new OrderService();
