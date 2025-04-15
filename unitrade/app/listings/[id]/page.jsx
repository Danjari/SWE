'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { Calendar, DollarSign, Clock, MapPin, CreditCard, MessageSquare, Tag, Package, User, Calendar as CalendarIcon, Info } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [buyerMessage, setBuyerMessage] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [sellerData, setSellerData] = useState(null)
  const { user } = useAuth() || { user: null }

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true)
      const supabase = createClient()
      
      try {
        // Fetch the product details
        const { data: productData, error: productError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (productError) throw productError
        
        setProduct(productData)
        
        // Fetch seller information
        if (productData.seller_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', productData.seller_id)
            .single()
          
          if (!userError) {
            setSellerData(userData)
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setError(error.message || 'Failed to load product details')
      } finally {
        setLoading(false)
      }
    }
    
    if (params.id) {
      fetchProductDetails()
    }
  }, [params.id])

  const handleBuyRequest = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Validate required fields
    if (!buyerMessage.trim()) {
      alert('Please enter a message for the seller')
      return
    }
    
    if (!contactInfo.trim()) {
      alert('Please provide your contact information')
      return
    }
    
    if (!pickupTime) {
      alert('Please select a pickup time')
      return
    }
    
    if (!pickupLocation) {
      alert('Please select a pickup location')
      return
    }
    
    if (!paymentMethod) {
      alert('Please select a payment method')
      return
    }

    try {
      // Format the purchase request message in a clean column layout
      const purchaseMessage = `
📦 PURCHASE REQUEST: "${product.title}" ($${product.price})
──────────────────────────────────────────────────
👤 Buyer: ${user.email}
🕒 Pickup: ${new Date(pickupTime).toLocaleString()}
📍 Location: ${pickupLocation}
💳 Payment: ${paymentMethod}
📱 Contact: ${contactInfo}
──────────────────────────────────────────────────
💬 Message:
${buyerMessage}
      `.trim()
      
      // Close the dialog and redirect to chat
      setShowBuyDialog(false)
      
      // Show confirmation and redirect to chat with the purchase message pre-filled
      alert('You will now be redirected to chat with the seller')
      router.push(`/chats?room=${product.id}&message=${encodeURIComponent(purchaseMessage)}`)
    } catch (error) {
      console.error('Error preparing purchase request:', error)
      alert('Failed to prepare purchase request: ' + (error.message || 'Unknown error'))
    }
  }

  // Helper function to get location display name
  const getLocationDisplayName = (value) => {
    const locations = {
      'baraha': 'Baraha',
      'd2': 'D2 Dining Hall',
      'd1': 'D1 Dining Hall',
      'c2': 'C2',
      'welcome_centre': 'Welcome Centre',
      'convenience_store': 'Convenience Store'
    }
    return locations[value] || value
  }

  // Helper function to get payment method display name
  const getPaymentDisplayName = (value) => {
    const methods = {
      'campus_dihrams': 'Campus Dihrams',
      'falcon_dihrams': 'Falcon Dihrams',
      'cash': 'Cash'
    }
    return methods[value] || value
  }

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4"></div>
          <p className="text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error || 'Product not found'}</p>
            <Button 
              className="w-full" 
              onClick={() => router.push('/listings')}
            >
              Return to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isCurrentUserSeller = user && user.id === product.seller_id
  const conditionColor = 
    product.condition === 'New' ? 'bg-green-100 text-green-800' : 
    product.condition === 'Like New' ? 'bg-blue-100 text-blue-800' : 
    product.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' : 
    product.condition === 'Fair' ? 'bg-orange-100 text-orange-800' : 
    'bg-gray-100 text-gray-800';

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/listings')}
          className="flex items-center gap-1 group transition-colors"
        >
          <span className="transform transition-transform group-hover:-translate-x-1">&larr;</span>
          <span>Back to Listings</span>
        </Button>
        
        {!isCurrentUserSeller && (
          <div className="fixed bottom-4 right-4 z-10 md:relative md:bottom-auto md:right-auto md:z-auto">
            <Button 
              size="lg"
              className="shadow-lg md:shadow-none transition-all hover:scale-105 md:hover:scale-100"
              onClick={() => setShowBuyDialog(true)}
            >
              Buy Now
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Main product content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden border-2">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex flex-col gap-2">
                <CardTitle className="text-2xl md:text-3xl">{product.title}</CardTitle>
                <div className="flex items-center gap-3">
                  <CardDescription className="m-0">
                    <span className="font-medium text-primary text-2xl">${product.price}</span>
                  </CardDescription>
                  <Badge 
                    variant={product.status === 'active' ? 'success' : 'secondary'} 
                    className="ml-1"
                  >
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg">
                    <Tag size={16} className="text-muted-foreground" />
                    <span>Category: <span className="font-medium">{product.category}</span></span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${conditionColor}`}>
                    <Package size={16} />
                    <span>Condition: <span className="font-medium">{product.condition}</span></span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Info size={18} />
                    Description
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-muted/30 border-none">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar size={16} />
                        Listed on
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p>{new Date(product.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/30 border-none">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Tag size={16} />
                        Category
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p>{product.category}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Package size={18} />
                    Shipping & Payment
                  </h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      Pickup on campus or delivery available. Payment method to be agreed upon with seller.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar content */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-2 sticky top-20">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <User size={18} />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sellerData ? (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-lg">{sellerData.username || 'UniTrade User'}</p>
                    <p className="text-muted-foreground text-sm flex items-center gap-1">
                      <CalendarIcon size={12} />
                      Member since {new Date(sellerData.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                    </p>
                    {product.contact_email && (
                      <p className="text-sm mt-2 flex items-center gap-1">
                        <MessageSquare size={12} />
                        Contact: {product.contact_email}
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    {!isCurrentUserSeller ? (
                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => setShowBuyDialog(true)}
                      >
                        Buy Now for ${product.price}
                      </Button>
                    ) : (
                      <p className="text-center w-full text-sm text-muted-foreground py-2 px-4 border border-dashed rounded-md">
                        This is your listing
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Seller information unavailable</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-xl flex items-center gap-2">
                <Info size={18} />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign size={14} />
                  Price
                </span>
                <span className="font-semibold">${product.price}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Tag size={14} />
                  Condition
                </span>
                <span className={`px-2 py-0.5 rounded text-sm ${conditionColor}`}>
                  {product.condition}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} />
                  Listed
                </span>
                <span>{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Tag size={14} />
                  ID
                </span>
                <span className="font-mono text-xs bg-muted p-1 rounded">{product.id.substring(0, 8)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Purchase "{product.title}"</DialogTitle>
            <p className="text-muted-foreground mt-1">Fill out the details to send your purchase request</p>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-base">Message to Seller</Label>
              <Textarea 
                id="message" 
                className="min-h-[100px] resize-none"
                placeholder="Hello, I'm interested in buying this item..."
                value={buyerMessage}
                onChange={(e) => setBuyerMessage(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="contact" className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  Your Contact Information
                </Label>
                <Input 
                  id="contact" 
                  placeholder="Phone number or preferred contact method"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time" className="flex items-center gap-1">
                  <Clock size={14} />
                  Pickup Time
                </Label>
                <Input 
                  id="time" 
                  type="datetime-local"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin size={14} />
                  Pickup Location
                </Label>
                <select
                  id="location"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                >
                  <option value="">Select a location</option>
                  <option value="baraha">Baraha</option>
                  <option value="d2">D2 Dining Hall</option>
                  <option value="d1">D1 Dining Hall</option>
                  <option value="c2">C2</option>
                  <option value="welcome_centre">Welcome Centre</option>
                  <option value="convenience_store">Convenience Store</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="payment" className="flex items-center gap-1">
                  <CreditCard size={14} />
                  Payment Method
                </Label>
                <select
                  id="payment"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">Select payment method</option>
                  <option value="campus_dihrams">Campus Dihrams</option>
                  <option value="falcon_dihrams">Falcon Dihrams</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-md">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="sendEmail" className="text-sm">
                Send email notification to seller
              </Label>
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium block mb-1">What happens next?</span>
                After submitting, you'll be redirected to a chat with the seller where you can discuss the purchase further.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>Cancel</Button>
            <Button onClick={handleBuyRequest} size="lg" className="gap-2">
              <MessageSquare size={16} />
              Submit Purchase Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 