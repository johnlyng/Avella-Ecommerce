import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Avella Electronics - Premium Tech for Modern Living',
    description: 'Shop the latest electronics including laptops, smartphones, tablets, headphones, smartwatches, and cameras. Quality products at competitive prices.',
    keywords: ['electronics', 'laptops', 'smartphones', 'tablets', 'headphones', 'ecommerce'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    <CartProvider>
                        <div className="flex min-h-screen flex-col">
                            <Header />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </div>
                    </CartProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
