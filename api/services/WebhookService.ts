import { eq, and, sql, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { webhookEndpoints, webhookLogs } from '../db/schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface WebhookEndpointInput {
    label: string;
    url: string;
    events: string[];
    isActive?: boolean;
}

class WebhookService {
    async getEndpoints() {
        return db.select().from(webhookEndpoints).orderBy(desc(webhookEndpoints.createdAt));
    }

    async createEndpoint(data: WebhookEndpointInput) {
        const [endpoint] = await db.insert(webhookEndpoints).values({
            label: data.label,
            url: data.url,
            events: data.events,
            isActive: data.isActive ?? true,
        }).returning();
        return endpoint;
    }

    async updateEndpoint(id: number, data: Partial<WebhookEndpointInput>) {
        const [endpoint] = await db.update(webhookEndpoints)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(webhookEndpoints.id, id))
            .returning();
        return endpoint;
    }

    async deleteEndpoint(id: number) {
        const [endpoint] = await db.delete(webhookEndpoints)
            .where(eq(webhookEndpoints.id, id))
            .returning();
        return endpoint;
    }

    async getLogs(limit = 100) {
        return db.select()
            .from(webhookLogs)
            .leftJoin(webhookEndpoints, eq(webhookLogs.endpointId, webhookEndpoints.id))
            .orderBy(desc(webhookLogs.createdAt))
            .limit(limit);
    }

    async dispatch(event: string, data: object) {
        // Find all active endpoints subscribed to this event
        const endpoints = await db.select()
            .from(webhookEndpoints)
            .where(
                and(
                    eq(webhookEndpoints.isActive, true),
                    sql`${event} = ANY(${webhookEndpoints.events})`
                )
            );

        if (endpoints.length === 0) return;

        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data,
        };

        for (const endpoint of endpoints) {
            let status: 'success' | 'failed' = 'failed';
            let statusCode: number | null = null;
            let errorMessage: string | null = null;

            try {
                const response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(5000),
                });

                statusCode = response.status;
                status = response.ok ? 'success' : 'failed';
                if (!response.ok) {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
            } catch (err: any) {
                errorMessage = err.message ?? 'Unknown error';
            }

            // Log the delivery attempt (fire-and-forget, don't block)
            db.insert(webhookLogs).values({
                endpointId: endpoint.id,
                event,
                status,
                statusCode,
                errorMessage,
                payload,
            }).catch((logErr) => {
                console.error('Failed to write webhook log:', logErr);
            });

            if (status === 'failed') {
                console.error(`Webhook delivery failed to ${endpoint.url} for event ${event}: ${errorMessage}`);
            }
        }
    }
}

export default new WebhookService();
