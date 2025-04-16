'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Description } from '@radix-ui/react-dialog'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Other']
const CONDITION_OPTIONS = ['Any', 'new', 'used']

export default function AddListingForm({ userId, userEmail, userCreatedAt, onListingCreated }) {
  const [openForm, setOpenForm] = useState(false)
  const [newListing, setNewListing] = useState({ title: '', description: '', price: '', category: '', condition: '' })
  const [errors, setErrors] = useState({})
  const [file, setFile] = useState(null)
  const MAX_FILE_SIZE_MB = 5

  const handleAddListing = async (e) => {
    e.preventDefault()
  
    const newErrors = {}
    if (!newListing.title || newListing.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }
    if (!newListing.price || isNaN(newListing.price) || parseFloat(newListing.price) <= 0) {
      newErrors.price = 'Price must be a valid number greater than 0'
    }
    if (!file) {
      newErrors.file = 'You must upload a JPEG or PNG image'
    } else if (!['image/jpeg', 'image/png'].includes(file.type)) {
      newErrors.file = 'Only JPEG or PNG files are allowed'
    } else if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      newErrors.file = 'File must be less than 5MB'
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
  
    const supabase = createClient()
  
    // Upload image
    const filename = `${userId}-${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filename, file)
  
    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message)
      return
    }
  
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filename)
  
    const imageUrl = urlData?.publicUrl
  
    // Upsert user (same as before)
    await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      created_at: userCreatedAt,
    })
  
    const payload = {
      ...newListing,
      price: parseFloat(newListing.price),
      seller_id: userId,
      contact_email: userEmail,
      image_url: imageUrl,
      status: 'active',
    }
  
    const { data, error } = await supabase.from('listings').insert(payload).select().single()
    if (error) {
      alert('Error creating listing: ' + error.message)
    } else {
      onListingCreated(data)
      setNewListing({ title: '', description: '', price: '', category: '', condition: '' })
      setFile(null)
      setOpenForm(false)
      setErrors({})
    }
  }

  return (
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
            <Input
              id="title"
              value={newListing.title}
              onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
              required
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newListing.description}
              onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={newListing.price}
              onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              required
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          <div className="flex gap-4">
            <div className="grid gap-2 flex-1">
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

            <div className="grid gap-2 flex-1">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={newListing.condition}
                onValueChange={(value) => setNewListing({ ...newListing, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPTIONS.filter(c => c !== 'Any').map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Upload Image</Label>
            <p className="text-sm text-muted-foreground -mt-1 mb-2">
            Only JPEG/PNG under 5MB allowed
            </p>
            <Input
                id="image"
                type="file"
                accept="image/jpeg, image/png"
                onChange={(e) => setFile(e.target.files?.[0])}
            />
            {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
            </div>

          <Button type="submit" disabled={!userId}>Create Listing</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
