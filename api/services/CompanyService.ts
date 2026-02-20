import { db } from '../db';
import { companies, type NewCompany } from '../db/schema';
import { eq, ilike } from 'drizzle-orm';

export class CompanyService {
    async getCompanies(search?: string, limit = 10, offset = 0) {
        let query = db.select().from(companies);

        if (search) {
            query = query.where(ilike(companies.name, `%${search}%`)) as any;
        }

        return await query.limit(limit).offset(offset);
    }

    async getCompanyById(id: number) {
        const [company] = await db
            .select()
            .from(companies)
            .where(eq(companies.id, id))
            .limit(1);

        return company;
    }

    async createCompany(data: NewCompany) {
        const [newCompany] = await db
            .insert(companies)
            .values(data)
            .returning();

        return newCompany;
    }

    async updateCompany(id: number, data: Partial<NewCompany>) {
        const [updatedCompany] = await db
            .update(companies)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(companies.id, id))
            .returning();

        return updatedCompany;
    }

    async deleteCompany(id: number) {
        const [deletedCompany] = await db
            .delete(companies)
            .where(eq(companies.id, id))
            .returning();

        return deletedCompany;
    }
}

export default new CompanyService();
