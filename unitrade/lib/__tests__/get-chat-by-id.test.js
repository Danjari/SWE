/**
 * This file tests the getChatById function in chat-service.js
 */

// Import the function to test
import { getChatById } from '../chat-service';

// Mock the createClient function
import { createClient } from '@/lib/supabase/client';
jest.mock('@/lib/supabase/client');

describe('getChatById', () => {
  // Setup mocks for each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('returns error when chatId is not provided', async () => {
    // Call the function with no chatId
    const result = await getChatById();
    
    // Verify the results
    expect(result).toEqual({
      data: null,
      error: 'Chat ID is required'
    });
    
    // Verify that createClient wasn't called
    expect(createClient).not.toHaveBeenCalled();
  });
  
  it('successfully fetches a chat by ID', async () => {
    // Setup mock data
    const mockChat = {
      id: 'chat-123',
      buyer_id: 'user-1',
      seller_id: 'user-2',
      listing_id: 'listing-1',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockIs = jest.fn();
    const mockSingle = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: mockChat,
      error: null
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getChatById('chat-123');
    
    // Verify the results
    expect(mockFrom).toHaveBeenCalledWith('chats');
    expect(mockSelect).toHaveBeenCalledWith(`
      *,
      listing:listings(*),
      buyer:users!buyer_id(*),
      seller:users!seller_id(*)
    `);
    expect(mockEq).toHaveBeenCalledWith('id', 'chat-123');
    expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    expect(mockSingle).toHaveBeenCalled();
    
    expect(result).toEqual({
      data: mockChat,
      error: null
    });
  });
  
  it('handles error when chat is not found', async () => {
    // Setup mock error
    const mockError = { message: 'Chat not found', code: 'PGRST116' };
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockIs = jest.fn();
    const mockSingle = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: null,
      error: mockError
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getChatById('nonexistent-chat');
    
    // Verify the results
    expect(console.error).toHaveBeenCalledWith('Error fetching chat by ID:', mockError);
    expect(result).toEqual({
      data: null,
      error: mockError
    });
  });
  
  it('handles unexpected errors when fetching chat', async () => {
    // Setup mock error
    const mockError = { message: 'Database connection error' };
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockIs = jest.fn();
    const mockSingle = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: null,
      error: mockError
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getChatById('chat-123');
    
    // Verify the results
    expect(console.error).toHaveBeenCalledWith('Error fetching chat by ID:', mockError);
    expect(result).toEqual({
      data: null,
      error: mockError
    });
  });
});
