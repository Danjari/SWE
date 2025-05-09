import { createClient } from '@/lib/supabase/client';
import {
  createChat,
  sendMessage,
  getUserChats,
  getChatById,
  getChatMessages,
  markChatAsRead,
  getUnreadMessageCount
} from '../chat-service';

// The mocking is now handled in jest.setup.js

describe('Chat Service', () => {
  // Access the mocked functions
  let mockFrom;
  let mockSelect;
  let mockEq;
  let mockNeq;
  let mockIs;
  let mockIn;
  let mockOr;
  let mockOrder;
  let mockSingle;
  let mockInsert;
  let mockUpdate;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh mock for each test
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };
    
    // Save references to the mock functions
    mockSelect = mockQueryBuilder.select;
    mockEq = mockQueryBuilder.eq;
    mockNeq = mockQueryBuilder.neq;
    mockIs = mockQueryBuilder.is;
    mockIn = mockQueryBuilder.in;
    mockOr = mockQueryBuilder.or;
    mockOrder = mockQueryBuilder.order;
    mockSingle = mockQueryBuilder.single;
    mockInsert = mockQueryBuilder.insert;
    mockUpdate = mockQueryBuilder.update;
    
    // Setup the from mock to return our query builder
    mockFrom = jest.fn().mockReturnValue(mockQueryBuilder);
    
    // Override the createClient mock for this test suite
    createClient.mockImplementation(() => ({
      from: mockFrom
    }));
  });

  describe('createChat', () => {
    it('returns existing chat if one already exists', async () => {
      const mockExistingChat = {
        id: '123',
        listing_id: 'listing-123',
        buyer_id: 'buyer-123',
        seller_id: 'seller-123'
      };

      // Setup the mock to return the existing chat
      mockSingle.mockResolvedValue({
        data: mockExistingChat,
        error: null
      });

      const result = await createChat('listing-123', 'buyer-123', 'seller-123');

      expect(mockFrom).toHaveBeenCalledWith('chats');
      expect(mockEq).toHaveBeenCalledWith('listing_id', 'listing-123');
      expect(mockEq).toHaveBeenCalledWith('buyer_id', 'buyer-123');
      expect(mockEq).toHaveBeenCalledWith('seller_id', 'seller-123');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(result).toEqual({
        data: mockExistingChat,
        error: null
      });
    });

    it('creates a new chat if none exists', async () => {
      const mockNewChat = {
        id: '456',
        listing_id: 'listing-123',
        buyer_id: 'buyer-123',
        seller_id: 'seller-123'
      };

      // First call returns no existing chat
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // No rows returned
      });

      // Second call returns the newly created chat
      mockSingle.mockResolvedValueOnce({
        data: mockNewChat,
        error: null
      });

      const result = await createChat('listing-123', 'buyer-123', 'seller-123');

      expect(mockFrom).toHaveBeenCalledWith('chats');
      expect(mockInsert).toHaveBeenCalledWith([
        {
          listing_id: 'listing-123',
          buyer_id: 'buyer-123',
          seller_id: 'seller-123',
          updated_at: '2025-01-01T12:00:00.000Z'
        }
      ]);
      expect(result).toEqual({
        data: mockNewChat,
        error: null
      });
    });

    it('handles error when checking for existing chat', async () => {
      const mockError = { code: 'ERROR', message: 'Database error' };

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await createChat('listing-123', 'buyer-123', 'seller-123');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });

    it('handles error when creating a new chat', async () => {
      const mockError = { message: 'Failed to create chat' };

      // First call returns no existing chat
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' } // No rows returned
      });

      // Second call returns an error
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const result = await createChat('listing-123', 'buyer-123', 'seller-123');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });
  });

  describe('sendMessage', () => {
    it('successfully sends a message and updates chat timestamp', async () => {
      const mockMessage = {
        id: '789',
        chat_id: '123',
        sender_id: 'user-123',
        content: 'Hello there!',
        purchase_request_id: null
      };

      // First call for sending message
      mockSingle.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      // Second call for updating chat timestamp
      mockEq.mockResolvedValueOnce({
        error: null
      });

      const result = await sendMessage('123', 'user-123', 'Hello there!');

      expect(mockFrom).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith([
        {
          chat_id: '123',
          sender_id: 'user-123',
          content: 'Hello there!',
          purchase_request_id: null
        }
      ]);
      expect(mockFrom).toHaveBeenCalledWith('chats');
      expect(mockUpdate).toHaveBeenCalledWith({ 
        updated_at: '2025-01-01T12:00:00.000Z' 
      });
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result).toEqual({
        data: mockMessage,
        error: null
      });
    });

    it('sends a message with purchase request ID when provided', async () => {
      const mockMessage = {
        id: '789',
        chat_id: '123',
        sender_id: 'user-123',
        content: 'Hello there!',
        purchase_request_id: 'purchase-123'
      };

      mockSingle.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      mockEq.mockResolvedValueOnce({
        error: null
      });

      const result = await sendMessage('123', 'user-123', 'Hello there!', 'purchase-123');

      expect(mockInsert).toHaveBeenCalledWith([
        {
          chat_id: '123',
          sender_id: 'user-123',
          content: 'Hello there!',
          purchase_request_id: 'purchase-123'
        }
      ]);
      expect(result).toEqual({
        data: mockMessage,
        error: null
      });
    });

    it('handles error when sending message', async () => {
      const mockError = { message: 'Failed to send message' };

      mockSingle.mockResolvedValueOnce({
        data: null,
        error: mockError
      });

      const result = await sendMessage('123', 'user-123', 'Hello there!');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });

    it('handles error when updating chat timestamp', async () => {
      const mockMessage = {
        id: '789',
        chat_id: '123',
        sender_id: 'user-123',
        content: 'Hello there!'
      };
      const mockError = { message: 'Failed to update chat timestamp' };

      mockSingle.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      mockEq.mockResolvedValueOnce({
        error: mockError
      });

      const result = await sendMessage('123', 'user-123', 'Hello there!');

      expect(result).toEqual({
        data: mockMessage,
        error: mockError
      });
    });
  });

  describe('getUserChats', () => {
    it('successfully retrieves user chats', async () => {
      const mockChats = [
        { id: '123', buyer_id: 'user-123', seller_id: 'seller-456' },
        { id: '456', buyer_id: 'buyer-789', seller_id: 'user-123' }
      ];

      mockOrder.mockResolvedValue({
        data: mockChats,
        error: null
      });

      const result = await getUserChats('user-123');

      expect(mockFrom).toHaveBeenCalledWith('chats');
      expect(mockOr).toHaveBeenCalledWith('buyer_id.eq.user-123,seller_id.eq.user-123');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual({
        data: mockChats,
        error: null
      });
    });

    it('handles error when retrieving user chats', async () => {
      const mockError = { message: 'Failed to fetch user chats' };

      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await getUserChats('user-123');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });
  });

  describe('getChatById', () => {
    it('successfully retrieves a chat by ID', async () => {
      const mockChat = {
        id: '123',
        buyer_id: 'user-123',
        seller_id: 'seller-456',
        listing: { id: 'listing-123', title: 'Test Listing' },
        buyer: { id: 'user-123', name: 'Test Buyer' },
        seller: { id: 'seller-456', name: 'Test Seller' }
      };

      mockSingle.mockResolvedValue({
        data: mockChat,
        error: null
      });

      const result = await getChatById('123');

      expect(mockFrom).toHaveBeenCalledWith('chats');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(result).toEqual({
        data: mockChat,
        error: null
      });
    });

    it('handles error when retrieving a chat by ID', async () => {
      const mockError = { message: 'Failed to fetch chat' };

      mockSingle.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await getChatById('123');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });
  });

  describe('getChatMessages', () => {
    it('successfully retrieves messages for a chat', async () => {
      const mockMessages = [
        { id: '123', chat_id: '456', sender_id: 'user-123', content: 'Hello!' },
        { id: '789', chat_id: '456', sender_id: 'user-456', content: 'Hi there!' }
      ];

      mockOrder.mockResolvedValue({
        data: mockMessages,
        error: null
      });

      const result = await getChatMessages('456');

      expect(mockFrom).toHaveBeenCalledWith('messages');
      expect(mockEq).toHaveBeenCalledWith('chat_id', '456');
      expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
      expect(result).toEqual({
        data: mockMessages,
        error: null
      });
    });

    it('handles error when retrieving chat messages', async () => {
      const mockError = { message: 'Failed to fetch chat messages' };

      mockOrder.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await getChatMessages('456');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });
  });

  describe('markChatAsRead', () => {
    it('successfully marks messages as read', async () => {
      mockIs.mockResolvedValue({
        data: { count: 3 }, // 3 messages marked as read
        error: null
      });

      const result = await markChatAsRead('123', 'user-456');

      expect(mockFrom).toHaveBeenCalledWith('messages');
      expect(mockUpdate).toHaveBeenCalledWith({ 
        read_at: '2025-01-01T12:00:00.000Z' 
      });
      expect(mockEq).toHaveBeenCalledWith('chat_id', '123');
      expect(mockNeq).toHaveBeenCalledWith('sender_id', 'user-456');
      expect(mockIs).toHaveBeenCalledWith('read_at', null);
      expect(result).toEqual({
        data: { count: 3 },
        error: null
      });
    });

    it('handles error when marking messages as read', async () => {
      const mockError = { message: 'Failed to mark messages as read' };

      mockIs.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await markChatAsRead('123', 'user-456');

      expect(result).toEqual({
        data: null,
        error: mockError
      });
    });
  });

  // getUnreadMessageCount tests are now in a separate file
});
