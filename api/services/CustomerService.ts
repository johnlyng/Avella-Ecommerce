import { eq, or, ilike, and } from 'drizzle-orm';
import { db } from '../db';
import { users, type NewUser, type User } from '../db/schema';

export class CustomerService {
    async getCustomers(params: {
        search?: string;
        email?: string;
        limit?: number;
        offset?: number;
    }) {
        const { search, email, limit = 20, offset = 0 } = params;

        const conditions = [eq(users.role, 'customer')];

        if (email) {
            conditions.push(eq(users.email, email));
        }

        if (search) {
            const pattern = `%${search}%`;
            conditions.push(
                or(
                    ilike(users.firstName, pattern),
                    ilike(users.lastName, pattern),
                    ilike(users.email, pattern)
                ) as any
            );
        }

        const data = await db
            .select({
                id: users.id,
                uuid: users.uuid,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                phoneNumber: users.phoneNumber,
                createdAt: users.createdAt
            })
            .from(users)
            .where(and(...conditions))
            .limit(limit)
            .offset(offset);

        return { data };
    }

    async createCustomer(data: NewUser) {
        // Ensure role is customer
        const customerData = {
            ...data,
            role: 'customer' as const
        };

        const [newUser] = await db
            .insert(users)
            .values(customerData)
            .returning({
                id: users.id,
                uuid: users.uuid,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role: users.role,
                createdAt: users.createdAt
            });

        return newUser;
    }
}

export default new CustomerService();
