/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductDetailPage from './page'
import { useAuth } from '@/hooks/use-auth'

// Mock the next/navigation hooks
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}))

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}))

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(),
}))

describe('ProductDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
  }
  
  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    category: 'Electronics',
    condition: 'Like New',
    seller_id: 'user-123',
    status: 'active',
    contact_email: 'seller@example.com',
    created_at: '2023-01-01T00:00:00Z',
  }
  
  const mockSellerData = {
    id: 'user-123',
    email: 'seller@example.com',
    username: 'TestSeller',
    created_at: '2022-01-01T00:00:00Z',
  }
  
  const mockUser = {
    id: 'user-456',
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up the router and params mocks
    useParams.mockReturnValue({ id: mockProduct.id })
    useRouter.mockReturnValue(mockRouter)
    
    // Set up the useAuth mock
    useAuth.mockReturnValue({ user: mockUser })
    
    // Set up the Supabase client mock
    const mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockProduct,
        error: null,
      }),
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    }
    
    createClient.mockReturnValue(mockSupabase)
  })
  
  it('should render loading state initially', () => {
    render(<ProductDetailPage />)
    expect(screen.getByText('Loading product details...')).toBeInTheDocument()
  })
  
  it('should render product details after loading', async () => {
    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
      expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.condition)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.category)).toBeInTheDocument()
      expect(screen.getByText('Buy Now')).toBeInTheDocument()
    })
  })
  
  it('should show "This is your listing" for seller', async () => {
    // Set up the user as the seller
    useAuth.mockReturnValue({ user: { id: mockProduct.seller_id } })
    
    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText('This is your listing')).toBeInTheDocument()
      expect(screen.queryByText('Buy Now')).not.toBeInTheDocument()
    })
  })
}) 