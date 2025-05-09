import { createClient } from '@/lib/supabase/client'
import { 
  fetchUserAndListings, 
  fetchUserListings, 
  fetchProductDetails,
  banListing,
  unbanListing 
} from '../api'

// Mock Supabase client
const mockSupabaseQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  is: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
}

const mockGetUser = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: jest.fn(() => mockSupabaseQuery),
  })),
}))

describe('API Functions', () => {
  let mockSupabase

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = createClient()
  })

  describe('fetchUserAndListings', () => {
    it('returns user data and listings when successful', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockListings = [
        { id: '1', title: 'Test Listing 1' },
        { id: '2', title: 'Test Listing 2' },
      ]

      mockGetUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockListings,
        error: null
      })

      const result = await fetchUserAndListings()

      expect(result).toEqual({
        user: mockUser,
        listings: mockListings,
        error: null
      })
    })

    it('handles user not found error', async () => {
      mockGetUser.mockResolvedValue({ 
        data: { user: null }, 
        error: { message: 'User not found' }
      })

      const result = await fetchUserAndListings()

      expect(result).toEqual({
        user: null,
        listings: [],
        error: 'User not found'
      })
    })

    it('handles listings fetch error', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockError = { message: 'Failed to fetch listings' }

      mockGetUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      mockSupabaseQuery.order.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await fetchUserAndListings()

      expect(result).toEqual({
        user: mockUser,
        listings: [],
        error: mockError.message
      })
    })
  })

  describe('fetchUserListings', () => {
    it('returns user data and their listings when successful', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockListings = [
        { id: '1', title: 'User Listing 1' },
        { id: '2', title: 'User Listing 2' },
      ]

      mockGetUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      mockSupabaseQuery.order.mockResolvedValue({
        data: mockListings,
        error: null
      })

      const result = await fetchUserListings()

      expect(result).toEqual({
        user: mockUser,
        listings: mockListings,
        error: null
      })
    })
  })

  describe('fetchProductDetails', () => {
    it('returns product and seller details when successful', async () => {
      const mockProduct = {
        id: '123',
        title: 'Test Product',
        seller_id: '456'
      }
      const mockSeller = {
        id: '456',
        name: 'Test Seller'
      }

      mockSupabaseQuery.single
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null
        })
        .mockResolvedValueOnce({
          data: mockSeller,
          error: null
        })

      const result = await fetchProductDetails('123')

      expect(result).toEqual({
        product: mockProduct,
        seller: mockSeller,
        error: null
      })
    })

    it('handles missing product ID', async () => {
      const result = await fetchProductDetails()

      expect(result).toEqual({
        product: null,
        seller: null,
        error: 'Product ID is required'
      })
    })

    it('handles product fetch error', async () => {
      const mockError = { message: 'Failed to fetch product' }

      mockSupabaseQuery.single.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await fetchProductDetails('123')

      expect(result).toEqual({
        product: null,
        seller: null,
        error: mockError.message
      })
    })
  })

  describe('banListing', () => {
    it('successfully bans a listing', async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValue({
        data: { id: '123' },
        error: null
      })

      const result = await banListing('123')

      expect(result).toEqual({ success: true })
    })

    it('handles ban error', async () => {
      const mockError = { message: 'Failed to ban listing' }

      mockSupabaseQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await banListing('123')

      expect(result).toEqual({
        success: false,
        error: mockError.message
      })
    })
  })

  describe('unbanListing', () => {
    it('successfully unbans a listing', async () => {
      mockSupabaseQuery.maybeSingle.mockResolvedValue({
        data: { id: '123' },
        error: null
      })

      const result = await unbanListing('123')

      expect(result).toEqual({ success: true })
    })

    it('handles unban error', async () => {
      const mockError = { message: 'Failed to unban listing' }

      mockSupabaseQuery.maybeSingle.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await unbanListing('123')

      expect(result).toEqual({
        success: false,
        error: mockError.message
      })
    })
  })
}) 