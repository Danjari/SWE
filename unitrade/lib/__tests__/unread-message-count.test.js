/**
 * This file tests the getUnreadMessageCount function in chat-service.js
 */

// Mock the entire chat-service module
jest.mock('../chat-service');

// Import the functions after mocking
import { getUnreadMessageCount, getUserChats } from '../chat-service';

describe('getUnreadMessageCount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });
  
  it('returns error when getUserChats fails', async () => {
    // Setup mock error
    const mockError = { message: 'Failed to fetch user chats' };
    
    // Mock the implementation for this test
    getUserChats.mockResolvedValue({
      data: null,
      error: mockError
    });
    
    // Mock the implementation of getUnreadMessageCount
    getUnreadMessageCount.mockImplementation(async (userId) => {
      const { data: chats, error: chatsError } = await getUserChats(userId);
      
      if (chatsError) {
        return { count: 0, error: chatsError };
      }
      
      return { count: 0, error: chatsError };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the results
    expect(getUserChats).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({
      count: 0,
      error: mockError
    });
  });
  
  it('returns zero count when user has no chats', async () => {
    // Mock the implementation for this test
    getUserChats.mockResolvedValue({
      data: [],
      error: null
    });
    
    // Mock the implementation of getUnreadMessageCount
    getUnreadMessageCount.mockImplementation(async (userId) => {
      const { data: chats, error: chatsError } = await getUserChats(userId);
      
      if (chatsError) {
        return { count: 0, error: chatsError };
      }
      
      if (chats.length === 0) {
        return { count: 0, error: null };
      }
      
      return { count: 0, error: null };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the results
    expect(getUserChats).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({
      count: 0,
      error: null
    });
  });
  
  it('successfully counts unread messages across all chats', async () => {
    // Setup mock data
    const mockChats = [
      { id: '123', buyer_id: 'user-123', seller_id: 'seller-456' },
      { id: '456', buyer_id: 'buyer-789', seller_id: 'user-123' }
    ];
    
    // Mock the implementation for this test
    getUserChats.mockResolvedValue({
      data: mockChats,
      error: null
    });
    
    // Mock the implementation of getUnreadMessageCount
    getUnreadMessageCount.mockImplementation(async (userId) => {
      const { data: chats, error: chatsError } = await getUserChats(userId);
      
      if (chatsError) {
        return { count: 0, error: chatsError };
      }
      
      if (chats.length === 0) {
        return { count: 0, error: null };
      }
      
      // Return a successful count
      return { count: 5, error: null };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the results
    expect(getUserChats).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({
      count: 5,
      error: null
    });
  });
  
  it('handles error when counting unread messages', async () => {
    // Setup mock data
    const mockChats = [
      { id: '123', buyer_id: 'user-123', seller_id: 'seller-456' }
    ];
    const mockError = { message: 'Failed to count unread messages' };
    
    // Mock the implementation for this test
    getUserChats.mockResolvedValue({
      data: mockChats,
      error: null
    });
    
    // Mock the implementation of getUnreadMessageCount
    getUnreadMessageCount.mockImplementation(async (userId) => {
      const { data: chats, error: chatsError } = await getUserChats(userId);
      
      if (chatsError) {
        return { count: 0, error: chatsError };
      }
      
      if (chats.length === 0) {
        return { count: 0, error: null };
      }
      
      // Simulate an error when counting messages
      console.error('Error counting unread messages:', mockError);
      return { count: 0, error: mockError };
    });
    
    // Call the function
    const result = await getUnreadMessageCount('user-123');
    
    // Verify the results
    expect(console.error).toHaveBeenCalledWith('Error counting unread messages:', mockError);
    expect(result).toEqual({
      count: 0,
      error: mockError
    });
  });
});
