/**
 * This file tests the getUserChats function in chat-service.js
 */

// Mock the createClient function first before importing any modules that use it
import { createClient } from '@/lib/supabase/client';
jest.mock('@/lib/supabase/client');

// Import the function to test
import { getUserChats } from '../chat-service';

describe('getUserChats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('successfully retrieves user chats', async () => {
    const mockChats = [
      { id: '123', buyer_id: 'user-123', seller_id: 'seller-456' },
      { id: '456', buyer_id: 'buyer-789', seller_id: 'user-123' }
    ];
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOr = jest.fn();
    const mockIs = jest.fn();
    const mockOrder = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ or: mockOr });
    mockOr.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({
      data: mockChats,
      error: null
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getUserChats('user-123');
    
    // Verify the results
    expect(mockFrom).toHaveBeenCalledWith('chats');
    expect(mockSelect).toHaveBeenCalledWith(`
      *,
      listing:listings(*),
      buyer:users!buyer_id(*),
      seller:users!seller_id(*)
    `);
    expect(mockOr).toHaveBeenCalledWith(`buyer_id.eq.user-123,seller_id.eq.user-123`);
    expect(mockIs).toHaveBeenCalledWith('deleted_at', null);
    expect(mockOrder).toHaveBeenCalledWith('updated_at', { ascending: false });
    
    expect(result).toEqual({
      data: mockChats,
      error: null
    });
    expect(console.error).not.toHaveBeenCalled();
  });
  
  it('handles error when retrieving user chats', async () => {
    const mockError = { message: 'Failed to fetch user chats' };
    
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOr = jest.fn();
    const mockIs = jest.fn();
    const mockOrder = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ or: mockOr });
    mockOr.mockReturnValue({ is: mockIs });
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
    const result = await getUserChats('user-123');
    
    // Verify the results
    expect(result).toEqual({
      data: null,
      error: mockError
    });
    expect(console.error).toHaveBeenCalledWith('Error fetching user chats:', mockError);
  });
  
  it('returns empty array when no chats are found', async () => {
    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockSelect = jest.fn();
    const mockOr = jest.fn();
    const mockIs = jest.fn();
    const mockOrder = jest.fn();
    
    // Setup the chain
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ or: mockOr });
    mockOr.mockReturnValue({ is: mockIs });
    mockIs.mockReturnValue({ order: mockOrder });
    mockOrder.mockResolvedValue({
      data: [],
      error: null
    });
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Call the function
    const result = await getUserChats('user-123');
    
    // Verify the results
    expect(result).toEqual({
      data: [],
      error: null
    });
  });
  
  it('handles invalid userId parameter', async () => {
    // Call the function with undefined userId
    const result = await getUserChats(undefined);
    
    // Verify that createClient was not called
    expect(createClient).not.toHaveBeenCalled();
    
    // Verify the results - should return empty data and an error
    expect(result).toEqual({
      data: null,
      error: 'User ID is required'
    });
  });
});
