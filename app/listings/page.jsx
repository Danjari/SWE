'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SearchFilterPanel } from '@/components/SearchFilterPanel'
import { ListingGrid } from '@/components/ListingGrid'
import { useSearchFilters } from '@/hooks/use-search-filters'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Furniture', 'Other']
const CONDITION_OPTIONS = ['new', 'used']

export default function ListingsPage() {
  // Use our custom hook to get filtered listings
  const { listings, loading, totalResults, error } = useSearchFilters()
  
  const [selectedListing, setSelectedListing] = useState(null)
  const [newListing, setNewListing] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    category: '', 
    condition: ''
  })
  const [openForm, setOpenForm] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userEmail, setUserEmail] = useState(null)
  const [userCreatedAt, setUserCreatedAt] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [showMyListings, setShowMyListings] = useState(false)
  const [formError, setFormError] = useState(null)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        console.error('Error fetching user:', userError?.message)
        return
      }
      
      setUserId(userData.user.id)
      setUserEmail(userData.user.email)
      setUserCreatedAt(userData.user.created_at)
      
      // Fetch user's own listings if needed for "My Listings" view
      if (showMyListings) {
        fetchMyListings(userData.user.id)
      }
    }

    fetchUser()
  }, [showMyListings])
  
  const fetchMyListings = async (id) => {
    if (!id) return
    
    const supabase = createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error('Error fetching my listings:', error)
    } else {
      setMyListings(data || [])
    }
  }

  const handleAddListing = async (e) => {
    e.preventDefault()
    setFormError(null)
    
    // Validation
    if (!newListing.title) {
      setFormError('Title is required')
      return
    }
    if (!newListing.description) {
      setFormError('Description is required')
      return
    }
    if (!newListing.price || isNaN(parseFloat(newListing.price)) || parseFloat(newListing.price) <= 0) {
      setFormError('Price must be a positive number')
      return
    }
    if (!newListing.category) {
      setFormError('Category is required')
      return
    }
    if (!newListing.condition) {
      setFormError('Condition is required')
      return
    }
    
    const supabase = createClient()
    
    // Ensure user record exists
    const { error: userInsertError } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      created_at: userCreatedAt,
    })
    
    if (userInsertError) {
      setFormError("Error saving user data: " + userInsertError.message)
      return
    }

    const payload = {
      ...newListing,
      price: parseFloat(newListing.price),
      seller_id: userId,
      status: 'active',
      contact_email: userEmail,
      created_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase.from('listings').insert(payload).select().single()

    if (error) {
      setFormError('Error creating listing: ' + error.message)
    } else {
      // If we're showing my listings, update the list
      if (showMyListings) {
        setMyListings([data, ...myListings])
      }
      // Reset form fields
      setNewListing({ 
        title: '', 
        description: '', 
        price: '', 
        category: '', 
        condition: ''
      })
      setOpenForm(false)
    }
  }
  
  const handleMarkAsSold = async (listingId) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ status: 'sold' })
      .eq('id', listingId)
      
    if (error) {
      console.error('Error marking as sold:', error)
    } else {
      // Update the listing in myListings array
      setMyListings(myListings.map(listing => 
        listing.id === listingId ? { ...listing, status: 'sold' } : listing
      ))
      setSelectedListing(null)
    }
  }
  
  const handleDeleteListing = async (listingId) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('listings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', listingId)
      
    if (error) {
      console.error('Error deleting listing:', error)
    } else {
      // Remove the listing from myListings array
      setMyListings(myListings.filter(listing => listing.id !== listingId))
      setSelectedListing(null)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">UniTrade Marketplace</h1>
          <p className="text-muted-foreground mt-1">Find and sell items in your university community</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant={showMyListings ? "outline" : "default"}
            onClick={() => setShowMyListings(false)}
          >
            Browse Listings
          </Button>
          <Button 
            variant={showMyListings ? "default" : "outline"}
            onClick={() => {
              setShowMyListings(true)
              if (userId) fetchMyListings(userId)
            }}
          >
            My Listings
          </Button>
          <Dialog open={openForm} onOpenChange={setOpenForm}>
            <DialogTrigger asChild>
              <Button>Add New Listing</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Listing</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddListing} className="grid gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={newListing.title} onChange={(e) => setNewListing({ ...newListing, title: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" value={newListing.description} onChange={(e) => setNewListing({ ...newListing, description: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" step="0.01" value={newListing.price} onChange={(e) => setNewListing({ ...newListing, price: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newListing.category}
                    onValueChange={(value) => setNewListing({ ...newListing, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={newListing.condition}
                    onValueChange={(value) => setNewListing({ ...newListing, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                <Button type="submit" disabled={!userId}>Create Listing</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {showMyListings ? (
        // My Listings View
        <div>
          <h2 className="text-2xl font-bold mb-4">My Listings</h2>
          {myListings.length === 0 ? (
            <p>You haven't posted any listings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Category</th>
                    <th className="p-2 border">Condition</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Date Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {myListings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <td className="p-2 border">{listing.title}</td>
                      <td className="p-2 border">${listing.price}</td>
                      <td className="p-2 border">{listing.category}</td>
                      <td className="p-2 border">{listing.condition}</td>
                      <td className="p-2 border">{listing.status}</td>
                      <td className="p-2 border">{new Date(listing.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // Browse Listings View with Search and Filters
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <SearchFilterPanel />
          </div>
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">Search Results</h2>
              <p className="text-gray-500">{totalResults} items</p>
            </div>
            {error ? (
              <div className="bg-red-50 p-4 rounded-md text-red-600">
                <p>Error loading listings: {error}</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <p>Loading listings...</p>
              </div>
            ) : (
              <ListingGrid listings={listings} />
            )}
          </div>
        </div>
      )}

      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogTrigger asChild />
        <DialogContent className="sm:max-w-md">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedListing.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2">
                {selectedListing.imageUrl && (
                  <div className="w-full h-48 overflow-hidden rounded-md">
                    <img 
                      src={selectedListing.imageUrl} 
                      alt={selectedListing.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/fallback.png';
                      }}
                    />
                  </div>
                )}
                <p><strong>Description:</strong> {selectedListing.description}</p>
                <p><strong>Price:</strong> ${selectedListing.price}</p>
                <p><strong>Category:</strong> {selectedListing.category}</p>
                <p><strong>Condition:</strong> {selectedListing.condition}</p>
                <p><strong>Status:</strong> {selectedListing.status}</p>
                <p><strong>Date Posted:</strong> {new Date(selectedListing.created_at).toLocaleDateString()}</p>
                <div className="mt-4 flex gap-2">
                  {selectedListing.status !== 'sold' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleMarkAsSold(selectedListing.id)}
                    >
                      Mark as Sold
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeleteListing(selectedListing.id)}
                  >
                    Delete
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