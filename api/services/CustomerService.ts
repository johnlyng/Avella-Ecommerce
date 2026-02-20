import { eq, or, ilike, and } from 'drizzle-orm';
import { db } from '../db';
import { users, companies, type NewUser, type User, type NewCompany } from '../db/schema';

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
                createdAt: users.createdAt,
                company: {
                    id: companies.id,
                    name: companies.name,
                    vatNumber: companies.vatNumber,
                    registrationNumber: companies.registrationNumber
                }
            })
            .from(users)
            .leftJoin(companies, eq(users.companyId, companies.id))
            .where(and(...conditions))
            .limit(limit)
            .offset(offset);

        return { data };
    }

    async createCustomer(data: NewUser & { company?: NewCompany }) {
        const { company, ...userData } = data;

        return await db.transaction(async (tx) => {
            let companyId: number | undefined;

            if (company && company.name) {
                const [newCompany] = await tx
                    .insert(companies)
                    .values(company)
                    .returning({ id: companies.id });
                companyId = newCompany.id;
            }

            // Ensure role is customer
            const customerData = {
                ...userData,
                role: 'customer' as const,
                ...(companyId ? { companyId } : {})
            };

            const [newUser] = await tx
                .insert(users)
                .values(customerData)
                .returning({
                    id: users.id,
                    uuid: users.uuid,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    role: users.role,
                    createdAt: users.createdAt,
                    companyId: users.companyId
                });

            return newUser;
        });
    }
}

export default new CustomerService();
