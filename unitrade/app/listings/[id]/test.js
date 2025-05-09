/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ProductDetailPage from './page'
import { useAuth } from '@/hooks/use-auth'
import userEvent from '@testing-library/user-event'

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
    id: '123',
    title: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'Electronics',
    condition: 'New',
    seller_id: '456',
    status: 'active',
    created_at: '2024-03-21T00:00:00.000Z',
    contact_email: 'seller@example.com'
  }
  
  const mockSeller = {
    id: '456',
    email: 'seller@example.com',
    username: 'Test Seller',
    created_at: '2024-01-01T00:00:00.000Z'
  }
  
  const mockUser = {
    id: '789',
    email: 'buyer@example.com',
  }
  
  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up the router and params mocks
    useParams.mockReturnValue({ id: mockProduct.id })
    useRouter.mockReturnValue(mockRouter)
    
    // Set up the useAuth mock
    useAuth.mockReturnValue({ user: mockUser })
    
    // Set up the Supabase client mock
    createClient.mockReturnValue(mockSupabase)
  })
  
  it('renders loading state initially', () => {
    render(<ProductDetailPage />)
    expect(screen.getByText(/loading product details/i)).toBeInTheDocument()
  })
  
  it('renders product details after loading', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: mockProduct, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: mockSeller, error: null })

    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
      expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.description)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.category)).toBeInTheDocument()
      expect(screen.getByText(mockProduct.condition)).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
    })
  })
  
  it('handles error when fetching product', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Failed to load product' } })

    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load product/i)).toBeInTheDocument()
    })
  })

  it('opens buy dialog when buy button is clicked', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: mockProduct, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: mockSeller, error: null })

    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    })

    const buyButton = screen.getByRole('button', { name: /buy now/i })
    await userEvent.click(buyButton)

    expect(screen.getByText(/purchase request/i)).toBeInTheDocument()
  })

  it('validates buy form fields', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: mockProduct, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: mockSeller, error: null })

    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    })

    const buyButton = screen.getByRole('button', { name: /buy now/i })
    await userEvent.click(buyButton)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    expect(screen.getAllByText(/this field is required/i)).toHaveLength(5)
  })

  it('submits buy form with valid data', async () => {
    mockSupabase.single.mockResolvedValueOnce({ data: mockProduct, error: null })
    mockSupabase.single.mockResolvedValueOnce({ data: mockSeller, error: null })

    render(<ProductDetailPage />)
    
    await waitFor(() => {
      expect(screen.getByText(mockProduct.title)).toBeInTheDocument()
    })

    const buyButton = screen.getByRole('button', { name: /buy now/i })
    await userEvent.click(buyButton)

    const messageInput = screen.getByLabelText(/message/i)
    const contactInput = screen.getByLabelText(/contact/i)
    const pickupTimeInput = screen.getByLabelText(/pickup time/i)
    const pickupLocationInput = screen.getByLabelText(/pickup location/i)
    const paymentMethodInput = screen.getByLabelText(/payment method/i)

    await userEvent.type(messageInput, 'Test message')
    await userEvent.type(contactInput, '1234567890')
    await userEvent.type(pickupTimeInput, '2024-03-21T12:00')
    await userEvent.selectOptions(pickupLocationInput, 'baraha')
    await userEvent.selectOptions(paymentMethodInput, 'cash')

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.queryByText(/this field is required/i)).not.toBeInTheDocument()
    })
  })
}) 