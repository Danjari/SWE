'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchUserListings } from '@/lib/api'

import { Button } from '@/components/ui/button'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'

import AddListingForm from '@/components/addListingForm'



export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [userId, setUserId] = useState(null)
  const [userEmail,setUserEmail] = useState(null)
  const [userCreatedAt,setUserCreatedAt] =useState(null)
  const supabase = createClient()
  useEffect(() => {
    const loadUserAndListings = async () => {
      try {
        const { user, listings, error } = await fetchUserListings()
        
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
        
        setListings(listings || [])
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndListings()
  }, [])
  

    const markAsSold = async (id) => {
    const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', id)

    if (!error) {
        setListings(prev =>
        prev.map(item => item.id === id ? { ...item, status: 'sold' } : item)
        )
        setSelectedListing(null)
    }
    }

    const deleteListing = async (id) => {
    const { error } = await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

    if (!error) {
        setListings(prev => prev.filter(item => item.id !== id))
        setSelectedListing(null)
    }
    }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-1">Manage your product listings</p>
        </div>
        <AddListingForm
            userId={userId}
            userEmail={userEmail}
            userCreatedAt={userCreatedAt}
            onListingCreated={(newItem) => setListings(prev => [newItem, ...prev])}
            />
      </div>

      
          {loading ? (
            <p>Loading listings...</p>
          ) : listings.length === 0 ? (
            <p>No listings found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Title</th>
                    <th className="p-2 border">Price</th>
                    <th className="p-2 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <td className="p-2 border">{listing.title}</td>
                      <td className="p-2 border">${listing.price}</td>
                      <td className="p-2 border">{listing.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                            {selectedListing.image_url && (
                <img
                    src={selectedListing.image_url}
                    alt="Listing Image"
                    className="rounded w-full max-h-60 object-cover border"
                />
                )}
                <p><strong>Description:</strong> {selectedListing.description}</p>
                <p><strong>Price:</strong> ${selectedListing.price}</p>
                <p><strong>Category:</strong> {selectedListing.category}</p>
                <p><strong>Condition:</strong> {selectedListing.condition}</p>
                <div className="mt-4 flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => markAsSold(selectedListing.id)}
                        disabled={selectedListing.status === 'sold'}
                    >
                        Mark as Sold
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => deleteListing(selectedListing.id)}
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