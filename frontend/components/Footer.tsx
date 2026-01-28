// Footer Component
import Link from 'next/link'

export function Footer() {
    return (
        <footer className="bg-dark text-white">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Avella</h3>
                        <p className="text-sm text-gray-300">
                            Premium electronics for the modern lifestyle. Quality products, exceptional service.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Shop</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <Link href="/products?category=laptops" className="hover:text-primary transition-colors">
                                    Laptops
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=smartphones" className="hover:text-primary transition-colors">
                                    Smartphones
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=tablets" className="hover:text-primary transition-colors">
                                    Tablets
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=headphones" className="hover:text-primary transition-colors">
                                    Headphones
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/shipping" className="hover:text-primary transition-colors">
                                    Shipping Info
                                </Link>
                            </li>
                            <li>
                                <Link href="/returns" className="hover:text-primary transition-colors">
                                    Returns
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-primary transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="hover:text-primary transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Avella Electronics. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
