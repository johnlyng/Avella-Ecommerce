'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { Search, Building, Check, ChevronRight } from 'lucide-react'

// Define the company interface based on our backend
interface Company {
    id: number;
    name: string;
    vatNumber: string;
    registrationNumber: string;
}

export default function CompanyRegisterPage() {
    // Top-level state
    const [step, setStep] = useState<1 | 2>(1)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const { login } = useAuth()
    const { mergeCart } = useCart()
    const router = useRouter()

    // Step 1 State: Company
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Company[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false)
    const [newCompanyData, setNewCompanyData] = useState({
        name: '',
        vatNumber: '',
        registrationNumber: ''
    })

    // Step 2 State: User Profile
    const [userFormData, setUserFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    // Handle company search with basic debounce
    useEffect(() => {
        const fetchCompanies = async () => {
            if (!searchQuery.trim() || searchQuery.length < 2) {
                setSearchResults([])
                return
            }

            setIsSearching(true)
            try {
                // Assuming the backend returns an object with a `data` array
                const response = await api.getCompanies(searchQuery)
                setSearchResults(response.data || [])
            } catch (err) {
                console.error("Failed to search companies:", err)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }

        const timeoutId = setTimeout(fetchCompanies, 300)
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // --- STEP 1 HANDLERS ---
    const handleSelectCompany = (company: Company) => {
        setSelectedCompany(company)
        setIsCreatingNewCompany(false)
        setStep(2)
        setError('')
    }

    const handleCreateNewCompany = async () => {
        setError('')

        if (!newCompanyData.name) {
            setError('Company name is required')
            return
        }

        setIsLoading(true)
        try {
            const response = await api.createCompany({
                name: newCompanyData.name,
                vatNumber: newCompanyData.vatNumber || undefined,
                registrationNumber: newCompanyData.registrationNumber || undefined
            })
            // Move to step 2 with the newly created company
            setSelectedCompany(response.data)
            setStep(2)
        } catch (err: any) {
            setError(err.message || 'Failed to create company')
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCompanyData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    // --- STEP 2 HANDLERS ---
    const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserFormData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!selectedCompany) {
            setError('No company selected. Please go back to Step 1.')
            return
        }

        if (userFormData.password !== userFormData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (userFormData.password.length < 8) {
            setError('Password must be at least 8 characters')
            return
        }

        setIsLoading(true)

        try {
            const response: any = await api.register({
                email: userFormData.email,
                password: userFormData.password,
                firstName: userFormData.firstName,
                lastName: userFormData.lastName,
                companyId: selectedCompany.id
            })

            if (response.data && response.data.token && response.data.user) {
                login(response.data.token, response.data.user)

                // Merge guest cart if it exists
                try {
                    await mergeCart(response.data.user.id)
                } catch (mergeErr) {
                    console.error('Failed to merge cart during registration:', mergeErr)
                }

                router.push('/')
            } else {
                // If API doesn't return token immediately, redirect to login
                router.push('/login?registered=true')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create account')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Business Registration</CardTitle>
                    <CardDescription>
                        {step === 1 ? 'Find your company or create a new one' : 'Create your user account'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Top Error Display */}
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* --- STEP 1 UI --- */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {!isCreatingNewCompany ? (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="companySearch">Search for your company</Label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="companySearch"
                                                type="text"
                                                placeholder="e.g. Acme Corporation"
                                                className="pl-9"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Search Results */}
                                    {searchQuery.trim().length >= 2 && (
                                        <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                                            {isSearching ? (
                                                <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                                                    Searching...
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <div className="divide-y">
                                                    {searchResults.map(company => (
                                                        <button
                                                            key={company.id}
                                                            onClick={() => handleSelectCompany(company)}
                                                            className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between group"
                                                        >
                                                            <div>
                                                                <div className="font-medium text-sm">{company.name}</div>
                                                                {(company.vatNumber || company.registrationNumber) && (
                                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                                        {company.vatNumber && `VAT: ${company.vatNumber}`}
                                                                        {company.vatNumber && company.registrationNumber && ' • '}
                                                                        {company.registrationNumber && `Reg: ${company.registrationNumber}`}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">
                                                    No companies found.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">
                                                Or
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsCreatingNewCompany(true)}
                                    >
                                        <Building className="mr-2 h-4 w-4" />
                                        Register a new company
                                    </Button>
                                </>
                            ) : (
                                /* Create New Company Form */
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Company Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="name"
                                            placeholder="Acme Corporation"
                                            value={newCompanyData.name}
                                            onChange={handleNewCompanyChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vatNumber">VAT Number (Optional)</Label>
                                        <Input
                                            id="vatNumber"
                                            placeholder="EU123456789"
                                            value={newCompanyData.vatNumber}
                                            onChange={handleNewCompanyChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationNumber">Registration Number (Optional)</Label>
                                        <Input
                                            id="registrationNumber"
                                            placeholder="REG-987654321"
                                            value={newCompanyData.registrationNumber}
                                            onChange={handleNewCompanyChange}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button type="button" onClick={handleCreateNewCompany} disabled={isLoading || !newCompanyData.name}>
                                            {isLoading ? 'Creating...' : 'Create & Continue'}
                                        </Button>
                                        <Button type="button" variant="ghost" onClick={() => { setIsCreatingNewCompany(false); setError(''); }}>
                                            Back to search
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )} {/* End Step 1 */}

                    {/* --- STEP 2 UI --- */}
                    {step === 2 && selectedCompany && (
                        <form id="userRegistrationForm" onSubmit={handleFinalSubmit} className="space-y-4">
                            <div className="bg-muted p-3 rounded-md flex items-center mb-4">
                                <div className="bg-primary/20 p-2 rounded-full mr-3">
                                    <Building className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="text-xs text-muted-foreground">Joining as</div>
                                    <div className="font-semibold text-sm truncate">{selectedCompany.name}</div>
                                </div>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs h-auto py-1">
                                    Change
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={userFormData.firstName}
                                        onChange={handleUserFormChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={userFormData.lastName}
                                        onChange={handleUserFormChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={userFormData.email}
                                    onChange={handleUserFormChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={userFormData.password}
                                    onChange={handleUserFormChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={userFormData.confirmPassword}
                                    onChange={handleUserFormChange}
                                    required
                                />
                            </div>
                        </form>
                    )} {/* End Step 2 */}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 border-t pt-6">
                    {step === 2 && (
                        <Button className="w-full" type="submit" form="userRegistrationForm" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Create account'}
                        </Button>
                    )}

                    <div className="text-center text-sm text-gray-500 w-full">
                        Already have an account?{' '}
                        <Link href="/login" className="font-semibold text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
