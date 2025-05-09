import { createClient } from '@/lib/supabase/client';
import { 
  fetchUserAndListings, 
  fetchUserListings, 
  fetchProductDetails,
  banListing,
  unbanListing 
} from '../api';

// The mocking is now handled in jest.setup.js

describe('API Functions', () => {
  // Access the mocked functions
  let mockFrom;
  let mockGetUser;
  let mockSelect;
  let mockEq;
  let mockIs;
  let mockOrder;
  let mockSingle;
  let mockMaybeSingle;
  let mockUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh mock for each test
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };
    
    // Save references to the mock functions
    mockSelect = mockQueryBuilder.select;
    mockEq = mockQueryBuilder.eq;
    mockIs = mockQueryBuilder.is;
    mockOrder = mockQueryBuilder.order;
    mockSingle = mockQueryBuilder.single;
    mockMaybeSingle = mockQueryBuilder.maybeSingle;
    mockUpdate = mockQueryBuilder.update;
    
    // Setup the from mock to return our query builder
    mockFrom = jest.fn().mockReturnValue(mockQueryBuilder);
    
    // Setup the getUser mock
    mockGetUser = jest.fn();
    
    // Override the createClient mock for this test suite
    createClient.mockImplementation(() => ({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom
    }));
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

      mockOrder.mockResolvedValue({
        data: mockListings,
        error: null
      })

      const result = await fetchUserAndListings()

      expect(mockFrom).toHaveBeenCalledWith('listings')
      expect(mockEq).toHaveBeenCalledWith('status', 'active')
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      
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

      mockOrder.mockResolvedValue({
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

      mockOrder.mockResolvedValue({
        data: mockListings,
        error: null
      })

      const result = await fetchUserListings()

      expect(mockFrom).toHaveBeenCalledWith('listings')
      expect(mockEq).toHaveBeenCalledWith('seller_id', mockUser.id)
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null)
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      
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

      const result = await fetchUserListings()

      expect(result).toEqual({
        user: null,
        listings: [],
        error: 'User not found'
      })
    })

    it('handles listings fetch error', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockError = { message: 'Failed to fetch user listings' }

      mockGetUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      })

      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      })

      // Mock console.error to prevent test output clutter
      const originalConsoleError = console.error
      console.error = jest.fn()

      const result = await fetchUserListings()

      expect(console.error).toHaveBeenCalledWith(mockError)
      expect(result).toEqual({
        user: mockUser,
        listings: [],
        error: mockError.message
      })

      // Restore console.error
      console.error = originalConsoleError
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

      mockSingle
        .mockResolvedValueOnce({
          data: mockProduct,
          error: null
        })
        .mockResolvedValueOnce({
          data: mockSeller,
          error: null
        })

      const result = await fetchProductDetails('123')

      expect(mockFrom).toHaveBeenCalledWith('listings')
      expect(mockEq).toHaveBeenCalledWith('id', '123')
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

      mockSingle.mockResolvedValue({
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
    
    it('handles unexpected errors in try/catch block', async () => {
      // Mock console.error to prevent test output clutter
      const originalConsoleError = console.error
      console.error = jest.fn()
      
      // Force an error by making the from method throw an exception
      mockFrom.mockImplementationOnce(() => {
        throw new Error('Unexpected error')
      })
      
      const result = await fetchProductDetails('123')
      
      expect(console.error).toHaveBeenCalled()
      expect(result).toEqual({
        product: null,
        seller: null,
        error: 'Unexpected error'
      })
      
      // Restore console.error
      console.error = originalConsoleError
    })
  })

  describe('banListing', () => {
    it('successfully bans a listing', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { id: '123' },
        error: null
      })

      const result = await banListing('123')

      expect(mockFrom).toHaveBeenCalledWith('listings')
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'banned',
        banned_at: expect.any(String)
      })
      expect(mockEq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual({ success: true })
    })

    it('handles ban error', async () => {
      const mockError = { message: 'Failed to ban listing' }

      mockMaybeSingle.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await banListing('123')

      expect(result).toEqual({
        success: false,
        error: mockError.message
      })
    })
    
    it('handles case when no data is returned but operation succeeds', async () => {
      // Mock console.log to prevent test output clutter
      const originalConsoleLog = console.log
      console.log = jest.fn()
      
      mockMaybeSingle.mockResolvedValue({
        data: null,  // No data returned
        error: null  // But no error either
      })

      const result = await banListing('123')

      expect(console.log).toHaveBeenCalledWith('this is the received data, ', null)
      expect(result).toEqual({ success: true })
      
      // Restore console.log
      console.log = originalConsoleLog
    })
  })

  describe('unbanListing', () => {
    it('successfully unbans a listing', async () => {
      mockMaybeSingle.mockResolvedValue({
        data: { id: '123' },
        error: null
      })

      const result = await unbanListing('123')

      expect(mockFrom).toHaveBeenCalledWith('listings')
      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'active',
        banned_at: null
      })
      expect(mockEq).toHaveBeenCalledWith('id', '123')
      expect(result).toEqual({ success: true })
    })

    it('handles unban error', async () => {
      const mockError = { message: 'Failed to unban listing' }

      mockMaybeSingle.mockResolvedValue({
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