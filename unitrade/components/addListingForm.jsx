'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { validateListingForm, prepareListingPayload } from '@/lib/validations/listing'
import { uploadListingImage, upsertUser, createListing } from '@/lib/supabase/listing-operations'
import { toast } from 'sonner'

const CATEGORY_OPTIONS = ['Books', 'Electronics', 'Clothing', 'Other']
const CONDITION_OPTIONS = ['new', 'used']

export default function AddListingForm({ userId, userEmail, userCreatedAt, onListingCreated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    file: null,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewListing((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewListing((prev) => ({ ...prev, file }))
      // Clear error when user selects a file
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: null }))
      }
    }
  }

  const handleSelectChange = (name, value) => {
    setNewListing((prev) => ({ ...prev, [name]: value }))
    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form
      const validationErrors = validateListingForm(newListing)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        setIsSubmitting(false)
        return
      }

      // Upload image
      const imageUrl = await uploadListingImage(newListing.file, userId)
    
      // Upsert user
      await upsertUser(userId, userEmail, userCreatedAt)
    
      // Create listing
      const payload = prepareListingPayload(newListing, userId, userEmail, imageUrl)
      const data = await createListing(payload)
      
      onListingCreated?.(data)
      setNewListing({
        title: '',
        description: '',
        price: '',
        category: '',
        condition: '',
        file: null,
      })
      setErrors({})
      setIsOpen(false)
      toast.success('Listing created successfully!')
    } catch (error) {
      setErrors({ submit: `An unexpected error occurred: ${error.message}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderError = (error) => {
    if (!error) return null
    return (
      <p className="text-sm text-red-500 mt-1" role="alert">
        {error}
      </p>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add New Listing</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Listing</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new listing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={newListing.title}
              onChange={handleInputChange}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {renderError(errors.title)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={newListing.description}
              onChange={handleInputChange}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {renderError(errors.description)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={newListing.price}
              onChange={handleInputChange}
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
            />
            {renderError(errors.price)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={newListing.category}
              onValueChange={(value) => handleSelectChange('category', value)}
            >
              <SelectTrigger id="category" aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError(errors.category)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={newListing.condition}
              onValueChange={(value) => handleSelectChange('condition', value)}
            >
              <SelectTrigger id="condition" aria-invalid={!!errors.condition}>
                <SelectValue placeholder="Select a condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError(errors.condition)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload Image</Label>
            <p className="text-sm text-muted-foreground -mt-1 mb-2">
              Only JPEG/PNG under 5MB allowed
            </p>
            <Input
              id="file"
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              aria-invalid={!!errors.file}
              aria-describedby={errors.file ? 'file-error' : undefined}
            />
            {renderError(errors.file)}
          </div>

          {renderError(errors.submit)}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
