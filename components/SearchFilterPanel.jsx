'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Other']
const DATE_POSTED_OPTIONS = [
  { label: 'Any Time', value: 'any' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' }
]
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price Low→High', value: 'priceAsc' },
  { label: 'Price High→Low', value: 'priceDesc' }
]

export function SearchFilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state with URL query params or defaults
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '0',
    maxPrice: searchParams.get('maxPrice') || '1000',
    condition: searchParams.get('condition') || 'any',
    datePosted: searchParams.get('datePosted') || 'any',
    sortBy: searchParams.get('sortBy') || 'newest'
  })

  // Load filters from URL when component mounts or URL changes
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      category: searchParams.get('category') || 'all',
      minPrice: searchParams.get('minPrice') || '0',
      maxPrice: searchParams.get('maxPrice') || '1000',
      condition: searchParams.get('condition') || 'any',
      datePosted: searchParams.get('datePosted') || 'any',
      sortBy: searchParams.get('sortBy') || 'newest'
    })
  }, [searchParams])

  // Format price range display
  const priceRange = `$${filters.minPrice} - $${filters.maxPrice}`
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()
    
    // Only add parameters that have values and aren't default values
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '') {
        if ((key === 'category' && value === 'all') || 
            (key === 'condition' && value === 'any') || 
            (key === 'datePosted' && value === 'any')) {
          // Skip default filter values to keep URL clean
          return
        }
        if (key === 'minPrice' && value === '0') {
          // Skip default min price
          return
        }
        if (key === 'maxPrice' && value === '1000') {
          // Skip default max price
          return
        }
        if (key === 'sortBy' && value === 'newest') {
          // Skip default sort
          return
        }
        
        params.set(key, value)
      }
    })
    
    // Update the URL with the filters
    router.push(`/listings?${params.toString()}`)
  }

  // Handle Enter key in the search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters()
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Search Listings</h2>
        
        <div className="space-y-6">
          {/* Search Input */}
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                id="search" 
                name="q"
                placeholder="Enter keywords..." 
                value={filters.q}
                onChange={handleInputChange}
                onKeyPress={handleSearchKeyPress}
              />
              <Button onClick={applyFilters}>Search</Button>
            </div>
          </div>
          
          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger id="category" className="w-full mt-1">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Price Range */}
          <div>
            <Label>Price Range</Label>
            <p className="text-sm text-gray-500 mt-1">{priceRange}</p>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <Input 
                  type="range" 
                  name="minPrice"
                  min="0" 
                  max="1000" 
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className="w-full accent-primary"
                />
              </div>
              <div className="flex-1">
                <Input 
                  type="range" 
                  name="maxPrice"
                  min="0" 
                  max="1000" 
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>
          
          {/* Item Condition */}
          <div>
            <Label>Item Condition</Label>
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="any-condition"
                  name="condition"
                  value="any"
                  checked={filters.condition === 'any'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Label htmlFor="any-condition" className="cursor-pointer">Any</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="new-condition"
                  name="condition"
                  value="new"
                  checked={filters.condition === 'new'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Label htmlFor="new-condition" className="cursor-pointer">New</Label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="used-condition"
                  name="condition"
                  value="used"
                  checked={filters.condition === 'used'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <Label htmlFor="used-condition" className="cursor-pointer">Used</Label>
              </div>
            </div>
          </div>
          
          {/* Date Posted */}
          <div>
            <Label htmlFor="datePosted">Date Posted</Label>
            <Select
              value={filters.datePosted}
              onValueChange={(value) => handleSelectChange('datePosted', value)}
            >
              <SelectTrigger id="datePosted" className="w-full mt-1">
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                {DATE_POSTED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort By */}
          <div>
            <Label htmlFor="sortBy">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleSelectChange('sortBy', value)}
            >
              <SelectTrigger id="sortBy" className="w-full mt-1">
                <SelectValue placeholder="Newest" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Apply Filters Button */}
          <Button onClick={applyFilters} className="w-full">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}