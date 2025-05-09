'use client'

import { useEffect, useState } from 'react'
import { fetchUserAndListings } from '@/lib/api'
import Image from 'next/image'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Tag, 
  DollarSign, 
  Clock, 
  SlidersHorizontal, 
  RefreshCw, 
  X,
  BookOpen,
  Monitor,
  ShoppingBag,
  Package,
  Check
} from 'lucide-react'
import AddListingForm from '@/components/addListingForm'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Other']
const CONDITION_OPTIONS = ['Any', 'new', 'used']
const DATE_POSTED_OPTIONS = [
  { value: '1', label: 'Last 24 hours' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: 'all', label: 'All time' }
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'title_az', label: 'Title: A-Z' },
  { value: 'title_za', label: 'Title: Z-A' }
]

const getCategoryIcon = (category) => {
  switch(category) {
    case 'Books':
      return <BookOpen size={16} />;
    case 'Electronics':
      return <Monitor size={16} />;
    case 'Clothing':
      return <ShoppingBag size={16} />;
    default:
      return <Package size={16} />;
  }
};

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [newListing, setNewListing] = useState({ title: '', description: '', price: '', category: '', condition: '' })
  const [openForm, setOpenForm] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userCreatedAt, setUserCreatedAt] = useState(null)
  const router = useRouter()
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [selectedCondition, setSelectedCondition] = useState('Any')
  const [datePosted, setDatePosted] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(true)
  const [activeFilterCount, setActiveFilterCount] = useState(0)
  
  useEffect(() => {
    const loadUserAndListings = async () => {
      try {
        const { user, listings, error } = await fetchUserAndListings()
        
        if (error) {
          console.error(error)
          if (!user) {
            alert('Error fetching user: ' + error)
            return
          }
        }
        
        if (user) {
          setUserId(user.id)
          setUserEmail(user.email)
          setUserCreatedAt(user.created_at)
        }
        
        setListings(listings)
        setFilteredListings(listings)
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndListings()
  }, [])
  
  useEffect(() => {
    applyFilters()
  }, [searchQuery, selectedCategories, priceRange, selectedCondition, datePosted, sortBy])
  useEffect(() => {
    // random code 
    // Calculate active filter count
    let count = 0
    if (searchQuery) count++
    if (selectedCategories.length > 0) count++
    if (priceRange.min || priceRange.max) count++
    if (selectedCondition !== 'Any') count++
    if (datePosted !== 'all') count++
    if (sortBy !== 'newest') count++
    
    setActiveFilterCount(count)
  }, [searchQuery, selectedCategories, priceRange, selectedCondition, datePosted, sortBy])
  
  const applyFilters = () => {
    let result = [...listings]
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        item => 
          item.title.toLowerCase().includes(query) || 
          item.description.toLowerCase().includes(query)
      )
    }
    
    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter(item => selectedCategories.includes(item.category))
    }
    
    // Price range filter
    if (priceRange.min !== '') {
      result = result.filter(item => parseFloat(item.price) >= parseFloat(priceRange.min))
    }
    if (priceRange.max !== '') {
      result = result.filter(item => parseFloat(item.price) <= parseFloat(priceRange.max))
    }
    
    // Condition filter
    if (selectedCondition !== 'Any') {
      result = result.filter(item => item.condition === selectedCondition)
    }
    
    // Date posted filter
    if (datePosted !== 'all') {
      const now = new Date()
      const daysAgo = parseInt(datePosted)
      const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo))
      
      result = result.filter(item => new Date(item.created_at) >= cutoffDate)
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        break
      case 'price_low':
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
        break
      case 'price_high':
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
        break
      case 'title_az':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title_za':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      default:
        break
    }
    
    setFilteredListings(result)
  }
  
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedCategories([])
    setPriceRange({ min: '', max: '' })
    setSelectedCondition('Any')
    setDatePosted('all')
    setSortBy('newest')
  }
  
  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  

  const navigateToProductDetail = (listingId) => {
    router.push(`/listings/${listingId}`)
  }
  
  const renderFilterSidebar = () => {
    return (
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-card rounded-lg border shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal size={18} />
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <Button 
                onClick={resetFilters} 
                variant="ghost" 
                size="sm"
                className="h-8 px-2 text-xs"
              >
                <RefreshCw size={14} className="mr-1" /> Reset ({activeFilterCount})
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-5">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Search size={14} /> Keyword Search
            </Label>
            <div className="relative">
              <Input 
                className="pr-8"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <Separator className="my-4" />
          
          {/* Categories */}
          <div className="mb-5">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Tag size={14} /> Categories
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition ${
                    selectedCategories.includes(category)
                      ? 'bg-primary/15 text-primary font-medium'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {getCategoryIcon(category)}
                  {category}
                  {selectedCategories.includes(category) && (
                    <Check size={14} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="my-4" />

          {/* Price Range */}
          <div className="mb-5">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <DollarSign size={14} /> Price Range
            </Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Input 
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="text-sm"
                />
              </div>
              <div>
                <Input 
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />

          {/* Item Condition */}
          <div className="mb-5">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Package size={14} /> Item Condition
            </Label>
            <Select
              value={selectedCondition}
              onValueChange={setSelectedCondition}
            >
              <SelectTrigger className="mt-1.5 text-sm">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />

          {/* Date Posted */}
          <div className="mb-5">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Clock size={14} /> Date Posted
            </Label>
            <Select
              value={datePosted}
              onValueChange={setDatePosted}
            >
              <SelectTrigger className="mt-1.5 text-sm">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {DATE_POSTED_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator className="my-4" />

          {/* Sort By */}
          <div className="mb-1">
            <Label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <SlidersHorizontal size={14} /> Sort By
            </Label>
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="mt-1.5 text-sm">
                <SelectValue placeholder="Select sorting method" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Listings</h1>
          <p className="text-muted-foreground mt-1">Browse and buy products from the community</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} className="mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 px-0 text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <AddListingForm
            userId={userId}
            userEmail={userEmail}
            userCreatedAt={userCreatedAt}
            onListingCreated={(newItem) => setListings(prev => [newItem, ...prev])}
          />
        </div>
      </div>

      {/* Mobile Filters (toggleable) */}
      <div className={`lg:hidden ${showFilters ? 'block mb-6' : 'hidden'}`}>
        {renderFilterSidebar()}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar (always visible) */}
        <div className="hidden lg:block">
          {renderFilterSidebar()}
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
                <p className="text-muted-foreground">Loading listings...</p>
              </div>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[400px] flex items-center justify-center">
              <div>
                <h3 className="text-xl font-medium mb-2">No listings found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria</p>
                <Button onClick={resetFilters} variant="outline">Reset Filters</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{filteredListings.length}</span> {filteredListings.length === 1 ? 'listing' : 'listings'}
                </p>
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                  className="w-44"
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl line-clamp-1">{listing.title}</CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
                          {getCategoryIcon(listing.category)}
                          {listing.category}
                        </Badge>
                      </div>
                      <CardDescription className="font-semibold text-primary">${listing.price}</CardDescription>
                    </CardHeader>
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={listing.image_url || '/placeholder-image.jpg'}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="space-y-3">
                      <p className="text-sm line-clamp-2 text-muted-foreground">
                        {listing.description}
                      </p>
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm flex items-center gap-2">
                          <Badge variant={listing.condition === 'old' ? 'success' : 'secondary'} className="text-[10px]">
                            {listing.condition}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Button 
                          onClick={() => navigateToProductDetail(listing.id)}
                          variant="default"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-md">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                <p><strong>Description:</strong> {selectedListing.description}</p>
                <p><strong>Price:</strong> ${selectedListing.price}</p>
                <p><strong>Category:</strong> {selectedListing.category}</p>
                <p><strong>Condition:</strong> {selectedListing.condition}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => navigateToProductDetail(selectedListing.id)}>
                    View Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}