import { createClient } from '@/lib/supabase/client'

/**
 * Fetches the current user and all active listings
 * @returns {Object} Object containing user data, listings, and any errors
 */
export const fetchUserAndListings = async () => {
  const supabase = createClient()
  
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { 
      user: null, 
      listings: [], 
      error: userError?.message || 'User not found' 
    }
  }
  
  // Get all active listings
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error(listingsError)
    return {
      user: userData.user,
      listings: [],
      error: listingsError.message
    }
  }
  
  return {
    user: userData.user,
    listings,
    error: null
  }
}

/**
 * Fetches the current user and their listings for the dashboard
 * @returns {Object} Object containing user data, user's listings, and any errors
 */
export const fetchUserListings = async () => {
  const supabase = createClient()
  
  // Get current user
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { 
      user: null, 
      listings: [], 
      error: userError?.message || 'User not found' 
    }
  }
  
  // Get all listings for this user
  const { data: listings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userData.user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (listingsError) {
    console.error(listingsError)
    return {
      user: userData.user,
      listings: [],
      error: listingsError.message
    }
  }
  
  return {
    user: userData.user,
    listings,
    error: null
  }
}

/**
 * Fetches a product's details and its seller information by product ID
 * @param {string} productId - The ID of the product to fetch
 * @returns {Object} Object containing product data, seller data, and any errors
 */
export const fetchProductDetails = async (productId) => {
  if (!productId) {
    return {
      product: null,
      seller: null,
      error: 'Product ID is required'
    }
  }

  const supabase = createClient()
  
  try {
    // Fetch the product details
    const { data: productData, error: productError } = await supabase
      .from('listings')
      .select('*')
      .eq('id', productId)
      .single()
    
    if (productError) {
      return {
        product: null,
        seller: null,
        error: productError.message || 'Failed to load product details'
      }
    }
    
    // Fetch seller information if we have a seller_id
    let sellerData = null
    if (productData.seller_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', productData.seller_id)
        .single()
      
      if (!userError) {
        sellerData = userData
      }
    }
    
    return {
      product: productData,
      seller: sellerData,
      error: null
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return {
      product: null,
      seller: null,
      error: error.message || 'Failed to load product details'
    }
  }
}