/**
 * This file tests specific functions in chat-service.js to improve coverage
 */

// Mock the createClient function first before importing any modules that use it
import { createClient } from '@/lib/supabase/client';
jest.mock('@/lib/supabase/client');

// Import the function to test
import { markChatAsRead } from '../chat-service';

describe('markChatAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it('returns error when chatId is not provided', async () => {
    // Call the function without chatId
    const result = await markChatAsRead(null, 'user-123');

    // Verify the result
    expect(result).toEqual({
      data: null,
      error: 'Chat ID is required'
    });

    // Verify that createClient wasn't called
    expect(createClient).not.toHaveBeenCalled();
  });

  it('returns error when userId is not provided', async () => {
    // Call the function without userId
    const result = await markChatAsRead('chat-123', null);

    // Verify the result
    expect(result).toEqual({
      data: null,
      error: 'User ID is required'
    });

    // Verify that createClient wasn't called
    expect(createClient).not.toHaveBeenCalled();
  });

  it('successfully marks messages as read', async () => {
    // Mock successful update data
    const mockUpdateData = {
      count: 3
    };

    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockUpdate = jest.fn();
    const mockEq = jest.fn();
    const mockNeq = jest.fn();
    const mockIs = jest.fn();

    // Setup the chain
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ neq: mockNeq });
    mockNeq.mockReturnValue({ is: mockIs });
    mockIs.mockResolvedValue({
      data: mockUpdateData,
      error: null
    });

    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });

    // Call the function
    const result = await markChatAsRead('chat-123', 'user-123');

    // Verify the Supabase query was built correctly
    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockUpdate).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(mockEq).toHaveBeenCalledWith('chat_id', 'chat-123');
    expect(mockNeq).toHaveBeenCalledWith('sender_id', 'user-123');
    expect(mockIs).toHaveBeenCalledWith('read_at', null);

    // Verify the result
    expect(result).toEqual({
      data: mockUpdateData,
      error: null
    });
  });

  it('handles error when marking messages as read', async () => {
    // Mock update error
    const updateError = { message: 'Error updating messages' };

    // Create a mock for the Supabase query chain
    const mockFrom = jest.fn();
    const mockUpdate = jest.fn();
    const mockEq = jest.fn();
    const mockNeq = jest.fn();
    const mockIs = jest.fn();

    // Setup the chain
    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ neq: mockNeq });
    mockNeq.mockReturnValue({ is: mockIs });
    mockIs.mockResolvedValue({
      data: null,
      error: updateError
    });

    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });

    // Call the function
    const result = await markChatAsRead('chat-123', 'user-123');

    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error marking messages as read:', updateError);

    // Verify the result
    expect(result).toEqual({
      data: null,
      error: updateError
    });
  });
});


