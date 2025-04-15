'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Other']

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [newListing, setNewListing] = useState({ title: '', description: '', price: '', category: '', condition: '' })
  const [openForm, setOpenForm] = useState(false)
  const [userId, setUserId] = useState(null)
  const [userEmail,setUserEmail] = useState(null)
  const [userCreatedAt,setUserCreatedAt] =useState(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    const fetchUserAndListings = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData?.user) {
        alert('Error fetching user: ' + userError?.message)
        return
      }
      setUserId(userData.user.id)
      setUserEmail(userData.user.email)
      setUserCreatedAt(userData.user.created_at)

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) console.error(error)
      else setListings(data)
      setLoading(false)
    }

    fetchUserAndListings()
  }, [])

  const handleAddListing = async (e) => {
    e.preventDefault()
    const supabase = createClient()
    const {error: userInsertError } = await supabase.from('users').upsert({
        id: userId,
        email: userEmail,
        created_at: userCreatedAt,
        // add any other default fields
      })
      if(userInsertError){
        console.log("error Upsert: ", userInsertError.message)
        return
      }

    const payload = {
      ...newListing,
      price: parseFloat(newListing.price),
      seller_id: userId,
      status: 'active',
      contact_email: userEmail,
    }
    

    const { data, error } = await supabase.from('listings').insert(payload).select().single()

    if (error) {
      alert('Error creating listing: ' + error.message)
    } else {
      setListings([data, ...listings])
      setNewListing({ title: '', description: '', price: '', category: '', condition: '' })
      setOpenForm(false)
    }
  }

  const navigateToProductDetail = (listingId) => {
    router.push(`/listings/${listingId}`)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Listings</h1>
          <p className="text-muted-foreground mt-1">Browse and buy products from the community</p>
        </div>
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
                <Input id="condition" value={newListing.condition} onChange={(e) => setNewListing({ ...newListing, condition: e.target.value })} />
              </div>
              <Button type="submit" disabled={!userId}>Create Listing</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <CardDescription className="font-semibold text-primary">${listing.price}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {listing.description}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        {listing.category} • {listing.condition}
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