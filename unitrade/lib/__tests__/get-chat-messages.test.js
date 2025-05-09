/**
 * This file tests the getChatMessages function in chat-service.js
 */

// Import the function to test
import { getChatMessages } from '../chat-service';

// Mock the createClient function
import { createClient } from '@/lib/supabase/client';
jest.mock('@/lib/supabase/client');

describe('getChatMessages', () => {
  // Setup mocks for each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('returns error when chatId is not provided', async () => {
    // Call the function with no chatId
    const result = await getChatMessages();
    
    // Verify the results
    expect(result).toEqual({
      data: null,
      error: 'Chat ID is required'
    });
    
    // Verify that createClient wasn't called
    expect(createClient).not.toHaveBeenCalled();
  });
  
  it('successfully fetches messages for a chat', async () => {
    // Setup mock data
    const mockMessages = [
      { id: '1', chat_id: 'chat-123', sender_id: 'user-1', message: 'Hello', created_at: '2023-01-01T12:00:00Z' },
      { id: '2', chat_id: 'chat-123', sender_id: 'user-2', message: 'Hi there', created_at: '2023-01-01T12:01:00Z' }
    ];
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockIs = jest.fn();
    const mockOrder = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({
      data: mockMessages,
      error: null
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getChatMessages('chat-123');
    
    // Verify the results
    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockSelect).toHaveBeenCalledWith(`
      *,
      sender:users!sender_id(*)
    `);
    expect(mockEq).toHaveBeenCalledWith('chat_id', 'chat-123');
    expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    
    expect(result).toEqual({
      data: mockMessages,
      error: null
    });
  });
  
  it('handles error when fetching messages', async () => {
    // Setup mock error
    const mockError = { message: 'Failed to fetch messages' };
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockIs = jest.fn();
    const mockOrder = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({
      data: null,
      error: mockError
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getChatMessages('chat-123');
    
    // Verify the results
    expect(console.error).toHaveBeenCalledWith('Error fetching chat messages:', mockError);
    expect(result).toEqual({
      data: null,
      error: mockError
    });
  });
});
