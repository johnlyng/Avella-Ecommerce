// API Client for Avella Ecommerce
// Communicates with Node.js backend

const API_URL = (typeof window === 'undefined' && process.env.SERVER_API_URL)
    ? process.env.SERVER_API_URL
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T = any>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                const error: any = new Error(data.message || 'API request failed');
                error.status = response.status;
                error.data = data;
                throw error;
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    // Products
    async getProducts(params?: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        limit?: number;
        offset?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return this.request(`/api/products?${queryParams}`);
    }

    async getProduct(slug: string) {
        return this.request(`/api/products/${slug}`);
    }

    // Categories
    async getCategories() {
        return this.request('/api/categories');
    }

    async getCategory(slug: string, params?: { limit?: number; offset?: number }) {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryParams.append(key, value.toString());
                }
            });
        }

        return this.request(`/api/categories/${slug}?${queryParams}`);
    }

    // Cart
    async createCart(data: { userId?: string; sessionId?: string }) {
        return this.request('/api/cart', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getCart(cartToken: string) {
        return this.request(`/api/cart/${cartToken}`);
    }

    async addToCart(cartToken: string, data: { productSlug?: string; productId?: string; quantity?: number }) {
        return this.request(`/api/cart/${cartToken}/items`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateCartItem(
        cartToken: string,
        itemId: string,
        data: { quantity: number }
    ) {
        return this.request(`/api/cart/${cartToken}/items/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async removeFromCart(cartToken: string, itemId: string) {
        return this.request(`/api/cart/${cartToken}/items/${itemId}`, {
            method: 'DELETE',
        });
    }

    async mergeCart(guestCartToken: string, userId: string) {
        return this.request('/api/cart/merge', {
            method: 'POST',
            body: JSON.stringify({ guestCartToken, userId }),
        });
    }

    // Orders
    async createOrder(data: {
        cartToken: string;
        userId?: string;
        shippingAddress: {
            name: string;
            street: string;
            city: string;
            state: string;
            zip: string;
            country: string;
        };
        billingAddress?: any;
    }) {
        return this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async getOrder(orderNumber: string) {
        return this.request(`/api/orders/${orderNumber}`);
    }

    async getUserOrders(userId: string) {
        return this.request(`/api/orders?userId=${userId}`);
    }

    // Auth
    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        companyId?: number;
    }) {
        return this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async login(data: { email: string; password: string }) {
        return this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Addresses
    async getAddresses(token: string) {
        return this.request('/api/addresses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    async createAddress(token: string, data: any) {
        return this.request('/api/addresses', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    }

    async updateAddress(token: string, id: number, data: any) {
        return this.request(`/api/addresses/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
    }

    async deleteAddress(token: string, id: number) {
        return this.request(`/api/addresses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    }

    async setDefaultAddress(token: string, id: number) {
        return this.request(`/api/addresses/${id}/default`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });
    }

    // Companies
    async getCompanies(search?: string) {
        const queryParams = new URLSearchParams();
        if (search) {
            queryParams.append('search', search);
        }
        return this.request(`/api/companies?${queryParams.toString()}`);
    }

    async createCompany(data: {
        name: string;
        vatNumber?: string;
        registrationNumber?: string;
    }) {
        return this.request('/api/companies', {
            method: 'POST',
            // API key might be required depending on implementation, 
            // but we'll try without for public registration flow first.
            // If the backend requires auth for creating companies, 
            // we will need to adjust the backend to allow public creation, 
            // or pass an admin key (less secure for frontend).
            // Currently, our backend implementation is mounted plainly:
            // app.use('/api/companies', companyRoutes) without verifyToken in app.js
            body: JSON.stringify(data),
        });
    }
}

export const api = new ApiClient(API_URL);
