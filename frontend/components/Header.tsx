'use client'

import Link from 'next/link'
import { ShoppingCart, Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function Header() {
    const { user, isAuthenticated, logout } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary">Avella</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    <NavLinks />
                </nav>

                {/* Actions */}
                <div className="flex items-center space-x-4">
                    {/* Auth Status */}
                    <div className="hidden md:flex items-center space-x-2">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <User className="h-4 w-4" />
                                        <span>{user?.firstName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer w-full">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders" className="cursor-pointer w-full">Orders</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout} className="text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Cart Icon */}
                    <Button variant="ghost" size="icon" asChild>
                        <CartLink />
                    </Button>

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <MobileMenu />
                    </div>
                </div>
            </div>
        </header>
    )
}

function NavLinks({ className }: { className?: string }) {
    return (
        <>
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                All Products
            </Link>
            <Link href="/products?category=laptops" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Laptops
            </Link>
            <Link href="/products?category=smartphones" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Smartphones
            </Link>
            <Link href="/products?category=tablets" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Tablets
            </Link>
            <Link href="/products?category=headphones" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                Headphones
            </Link>
        </>
    )
}

function MobileMenu() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>Avella</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                    <NavLinks />
                    <div className="border-t pt-4 space-y-2">
                        <MobileAuth />
                    </div>
                </nav>
            </SheetContent>
        </Sheet>
    )
}

function MobileAuth() {
    const { user, isAuthenticated, logout } = useAuth()

    if (isAuthenticated) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-gray-500">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName} {user?.lastName}</span>
                </div>
                <Button variant="ghost" asChild className="w-full justify-start text-sm">
                    <Link href="/orders">My Orders</Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            <Button variant="outline" asChild className="w-full">
                <Link href="/login">Log in</Link>
            </Button>
            <Button asChild className="w-full">
                <Link href="/register">Sign up</Link>
            </Button>
        </div>
    )
}

function CartLink() {
    const { itemCount } = useCart()

    return (
        <Link href="/cart">
            <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                        {itemCount}
                    </span>
                )}
            </div>
            <span className="sr-only">Shopping Cart</span>
        </Link>
    )
}
