/**
 * This file tests specific functions in chat-service.js to improve coverage
 */

// Mock the createClient function first before importing any modules that use it
import { createClient } from '@/lib/supabase/client';
jest.mock('@/lib/supabase/client');

// Import the functions to test
import { getUnreadMessageCount } from '../chat-service';

// Create a mock implementation of getUserChats that we can control
jest.mock('../chat-service', () => {
  const originalModule = jest.requireActual('../chat-service');
  return {
    ...originalModule,
    getUserChats: jest.fn().mockImplementation(async (userId) => {
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }
      return {
        data: [
          { id: 'chat-123', buyer_id: userId, seller_id: 'seller-456' },
          { id: 'chat-456', buyer_id: 'buyer-789', seller_id: userId }
        ],
        error: null
      };
    }),
    // Use the real getUnreadMessageCount implementation
    getUnreadMessageCount: originalModule.getUnreadMessageCount
  };
});

describe('getUnreadMessageCount - Direct Implementation Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it('counts unread messages across all chats', async () => {
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockIn = jest.fn();
    const mockNeq = jest.fn();
    const mockIs = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ in: mockIn });
    mockIn.mockReturnValue({ neq: mockNeq });
    mockNeq.mockReturnValue({ is: mockIs });
    mockIs.mockResolvedValue({
      count: 5,
      error: null
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the Supabase query was built correctly
    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
    expect(mockIn).toHaveBeenCalledWith('chat_id', ['chat-123', 'chat-456']);
    expect(mockNeq).toHaveBeenCalledWith('sender_id', 'user-123');
    expect(mockIs).toHaveBeenCalledWith('read_at', null);
    
    // Verify the result
    expect(result).toEqual({
      count: 5,
      error: null
    });
  });

  it('handles error when counting unread messages', async () => {
    // Create a mock for the Supabase query chain
    const mockError = { message: 'Database error' };
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockIn = jest.fn();
    const mockNeq = jest.fn();
    const mockIs = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ in: mockIn });
    mockIn.mockReturnValue({ neq: mockNeq });
    mockNeq.mockReturnValue({ is: mockIs });
    mockIs.mockResolvedValue({
      count: null,
      error: mockError
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error counting unread messages:', mockError);
    
    // Verify the result
    expect(result).toEqual({
      count: 0,
      error: mockError
    });
  });

  it('returns zero count when user has no chats', async () => {
    // Override the getUserChats mock for this test only
    const { getUserChats } = require('../chat-service');
    getUserChats.mockImplementationOnce(async () => {
      return {
        data: [],
        error: null
      };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the result
    expect(result).toEqual({
      count: 0,
      error: null
    });
  });

  it('returns error when getUserChats fails', async () => {
    // Override the getUserChats mock for this test only
    const { getUserChats } = require('../chat-service');
    const mockError = { message: 'Failed to fetch user chats' };
    getUserChats.mockImplementationOnce(async () => {
      return {
        data: null,
        error: mockError
      };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the result
    expect(result).toEqual({
      count: 0,
      error: mockError
    });
  });
});
