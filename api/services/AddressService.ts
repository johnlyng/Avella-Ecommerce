import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { addresses, type NewAddress, type Address } from '../db/schema';

export class AddressService {
    async createAddress(userId: number, data: Omit<NewAddress, 'userId'>) {
        return await db.transaction(async (tx) => {
            // If this is set as default, unset others first
            if (data.isDefault) {
                await tx
                    .update(addresses)
                    .set({ isDefault: false })
                    .where(eq(addresses.userId, userId));
            }

            const [newAddress] = await tx
                .insert(addresses)
                .values({
                    ...data,
                    userId
                } as NewAddress)
                .returning();

            return newAddress;
        });
    }

    async getAddressesByUserId(userId: number) {
        return await db
            .select()
            .from(addresses)
            .where(eq(addresses.userId, userId))
            .orderBy(addresses.isDefault ? addresses.isDefault : addresses.createdAt); // Simplified ordering
    }

    async getAddressById(id: number, userId: number) {
        const [address] = await db
            .select()
            .from(addresses)
            .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
            .limit(1);

        return address || null;
    }

    async updateAddress(id: number, userId: number, data: Partial<NewAddress>) {
        return await db.transaction(async (tx) => {
            if (data.isDefault) {
                await tx
                    .update(addresses)
                    .set({ isDefault: false })
                    .where(eq(addresses.userId, userId));
            }

            const [updatedAddress] = await tx
                .update(addresses)
                .set({ ...data, updatedAt: new Date() })
                .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
                .returning();

            return updatedAddress;
        });
    }

    async deleteAddress(id: number, userId: number) {
        const [deleted] = await db
            .delete(addresses)
            .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
            .returning();

        return deleted || null;
    }

    async setDefaultAddress(id: number, userId: number) {
        return await db.transaction(async (tx) => {
            // Unset current default
            await tx
                .update(addresses)
                .set({ isDefault: false })
                .where(eq(addresses.userId, userId));

            // Set new default
            const [updated] = await tx
                .update(addresses)
                .set({ isDefault: true, updatedAt: new Date() })
                .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
                .returning();

            return updated;
        });
    }
}

export default new AddressService();
