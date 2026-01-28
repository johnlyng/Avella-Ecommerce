'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useState, useEffect } from 'react'

const categories = [
    { id: 'laptops', label: 'Laptops' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'tablets', label: 'Tablets' },
    { id: 'headphones', label: 'Headphones' },
    { id: 'cameras', label: 'Cameras' },
    { id: 'smartwatches', label: 'Smartwatches' },
]

export function ProductFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // State initialization from URL params
    const initialCategory = searchParams.get('category')
    const [priceRange, setPriceRange] = useState([0, 2000])

    // Update URL when filters change
    const updateFilters = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // Reset page on filter change
        params.delete('page')
        router.push(`/products?${params.toString()}`)
    }

    const handleCategoryChange = (categoryId: string) => {
        // Toggle behavior if needed, or single select
        // For MVP, single select matches basic query logic
        if (initialCategory === categoryId) {
            updateFilters('category', null)
        } else {
            updateFilters('category', categoryId)
        }
    }

    return (
        <div className="space-y-6">
            <h3 className="font-semibold text-lg">Filters</h3>

            <Accordion type="single" collapsible defaultValue="categories" className="w-full">
                <AccordionItem value="categories">
                    <AccordionTrigger>Categories</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={category.id}
                                        checked={initialCategory === category.id}
                                        onCheckedChange={() => handleCategoryChange(category.id)}
                                    />
                                    <Label
                                        htmlFor={category.id}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {category.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="price">
                    <AccordionTrigger>Price Range</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-4 px-1 pt-2">
                            <Slider
                                defaultValue={[0, 2000]}
                                max={5000}
                                step={100}
                                value={priceRange}
                                onValueChange={setPriceRange}
                                onValueCommit={(vals) => {
                                    // Could update URL with min/max price
                                    // For now just update state for display
                                }}
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>${priceRange[0]}</span>
                                <span>${priceRange[1]}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
