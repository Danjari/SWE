import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatMessageItem } from '../chat-message'
import { RealtimeChat } from '../realtime-chat'
import { LoginForm } from '../login-form'
import { formatPurchaseMessage, getLocationDisplayName, getPaymentDisplayName, validatePurchaseForm } from '@/lib/product-operations'

// Mock the useRealtimeChat hook
jest.mock('@/hooks/use-realtime-chat', () => ({
  useRealtimeChat: jest.fn(() => ({
    messages: [],
    sendMessage: jest.fn(),
    isConnected: true,
  })),
}))

// Mock the useChatScroll hook
jest.mock('@/hooks/use-chat-scroll', () => ({
  useChatScroll: jest.fn(() => ({
    containerRef: { current: null },
    scrollToBottom: jest.fn(),
  })),
}))

// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: jest.fn(() => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    user: null,
  })),
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}))

describe('Passing Tests', () => {
  describe('ChatMessageItem', () => {
    const mockMessage = {
      id: '1',
      content: 'Test message',
      user: { name: 'test-user' },
      createdAt: '2024-01-01T12:00:00Z',
    }

    it('renders message content', () => {
      render(<ChatMessageItem message={mockMessage} showHeader={true} />)
      expect(screen.getByText('Test message')).toBeInTheDocument()
    })

    it('displays sender name when showHeader is true', () => {
      render(<ChatMessageItem message={mockMessage} showHeader={true} />)
      expect(screen.getByText('test-user')).toBeInTheDocument()
    })

    it('does not display sender name when showHeader is false', () => {
      render(<ChatMessageItem message={mockMessage} showHeader={false} />)
      expect(screen.queryByText('test-user')).not.toBeInTheDocument()
    })

    it('formats timestamp correctly', () => {
      render(<ChatMessageItem message={mockMessage} showHeader={true} />)
      expect(screen.getByText(/04:00 PM/)).toBeInTheDocument()
    })

    it('applies correct styling for different users', () => {
      const { rerender } = render(
        <ChatMessageItem message={mockMessage} showHeader={true} currentUser="test-user" />
      )
      expect(screen.getByText('Test message').closest('div')).toHaveClass('bg-muted')

      rerender(
        <ChatMessageItem message={mockMessage} showHeader={true} currentUser="other-user" />
      )
      expect(screen.getByText('Test message').closest('div')).toHaveClass('bg-muted')
    })

    it('handles purchase request messages', () => {
      const purchaseMessage = {
        ...mockMessage,
        content: `📦 PURCHASE REQUEST: "Test Product" ($99.99)
──────────────────────────────────────────────────
👤 Buyer: buyer@example.com
🕒 Pickup: 3/21/2024, 4:00:00 PM
📍 Location: Baraha
💳 Payment: Cash
📱 Contact: 1234567890
──────────────────────────────────────────────────
💬 Message:
I would like to buy this item`,
      }

      render(<ChatMessageItem message={purchaseMessage} showHeader={true} />)
      expect(screen.getByText(/PURCHASE REQUEST:/)).toBeInTheDocument()
      expect(screen.getByText(/Test Product/)).toBeInTheDocument()
      expect(screen.getByText(/I would like to buy this item/)).toBeInTheDocument()
    })
  })

  describe('RealtimeChat', () => {
    const mockInitialMessages = [
      {
        id: '1',
        content: 'Hello',
        user: { name: 'test-user' },
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders chat interface with message input', () => {
      render(<RealtimeChat roomName="test-room" username="test-user" />)
      expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument()
    })

    it('displays initial messages', () => {
      render(
        <RealtimeChat
          roomName="test-room"
          username="test-user"
          messages={mockInitialMessages}
        />
      )
      expect(screen.getByText('Hello')).toBeInTheDocument()
    })

    it('shows empty state message when no messages', () => {
      render(<RealtimeChat roomName="test-room" username="test-user" />)
      expect(screen.getByText(/no messages yet/i)).toBeInTheDocument()
    })

    it('disables input when not connected', () => {
      jest.spyOn(require('@/hooks/use-realtime-chat'), 'useRealtimeChat').mockImplementation(() => ({
        messages: [],
        sendMessage: jest.fn(),
        isConnected: false,
      }))

      render(<RealtimeChat roomName="test-room" username="test-user" />)
      expect(screen.getByPlaceholderText(/type a message/i)).toBeDisabled()
    })

    it('sends message when form is submitted', async () => {
      const mockSendMessage = jest.fn()
      jest.spyOn(require('@/hooks/use-realtime-chat'), 'useRealtimeChat').mockImplementation(() => ({
        messages: [],
        sendMessage: mockSendMessage,
        isConnected: true,
      }))

      render(<RealtimeChat roomName="test-room" username="test-user" />)
      const input = screen.getByPlaceholderText(/type a message/i)
      await userEvent.type(input, 'New message')
      await userEvent.keyboard('{enter}')

      expect(mockSendMessage).toHaveBeenCalledWith('New message')
    })
  })

  describe('LoginForm', () => {
    it('renders login form', () => {
      render(<LoginForm />)
      expect(screen.getByText('Login', { selector: '[data-slot="card-title"]' })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('handles form submission', async () => {
      const mockSignInWithPassword = jest.fn().mockResolvedValue({ error: null })
      const mockSupabase = {
        auth: {
          signInWithPassword: mockSignInWithPassword
        }
      }
      jest.spyOn(require('@/lib/supabase/client'), 'createClient').mockImplementation(() => mockSupabase)

      render(<LoginForm />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
      })
    })
  })

  describe('Product Operations', () => {
    it('formats purchase message correctly', () => {
      const formData = {
        pickupTime: '2024-03-21T16:00:00',
        pickupLocation: 'Baraha',
        paymentMethod: 'Cash',
        contactInfo: '1234567890',
        buyerMessage: 'I would like to buy this item',
      }

      const product = {
        title: 'Test Product',
        price: 99.99,
      }

      const user = {
        email: 'buyer@example.com',
      }

      const message = formatPurchaseMessage(product, user, formData)

      expect(message).toContain('📦 PURCHASE REQUEST: "Test Product" ($99.99)')
      expect(message).toContain('👤 Buyer: buyer@example.com')
      expect(message).toContain('🕒 Pickup: 3/21/2024, 4:00:00 PM')
      expect(message).toContain('📍 Location: Baraha')
      expect(message).toContain('💳 Payment: Cash')
      expect(message).toContain('📱 Contact: 1234567890')
      expect(message).toContain('💬 Message:\nI would like to buy this item')
    })

    it('gets location display name', () => {
      expect(getLocationDisplayName('Baraha')).toBe('Baraha')
      expect(getLocationDisplayName('Other')).toBe('Other')
    })

    it('gets payment display name', () => {
      expect(getPaymentDisplayName('Cash')).toBe('Cash')
      expect(getPaymentDisplayName('Other')).toBe('Other')
    })

    it('validates purchase form', () => {
      const validData = {
        pickupTime: '2024-03-21T16:00:00',
        pickupLocation: 'Baraha',
        paymentMethod: 'Cash',
        contactInfo: '1234567890',
        buyerMessage: 'Test message',
      }

      const invalidData = {
        pickupTime: '',
        pickupLocation: '',
        paymentMethod: '',
        contactInfo: '',
        buyerMessage: '',
      }

      const errors = validatePurchaseForm(validData)
      expect(Object.keys(errors)).toHaveLength(0)

      const invalidResult = validatePurchaseForm(invalidData)
      expect(typeof invalidResult).toBe('object')
      expect(invalidResult).toHaveProperty('pickupLocation')
      expect(invalidResult).toHaveProperty('paymentMethod')
      expect(invalidResult).toHaveProperty('contactInfo')
      expect(invalidResult).toHaveProperty('buyerMessage')
    })
  })
}) 