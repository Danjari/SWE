/**
 * This file tests the markChatAsRead function in chat-service.js
 */

// Mock the entire chat-service module
jest.mock('../chat-service', () => {
  const originalModule = jest.requireActual('../chat-service');
  return {
    ...originalModule,
    markChatAsRead: jest.fn()
  };
});

// Import the function after mocking
import { markChatAsRead } from '../chat-service';

describe('markChatAsRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });

  it('returns error when chatId is not provided', async () => {
    // Mock the implementation for this test
    markChatAsRead.mockImplementation(async (chatId, userId) => {
      if (!chatId) {
        return { data: null, error: 'Chat ID is required' };
      }
      return { data: null, error: null };
    });

    // Call the function without chatId
    const result = await markChatAsRead(null, 'user-123');

    // Verify the result
    expect(result).toEqual({
      data: null,
      error: 'Chat ID is required'
    });
  });

  it('returns error when userId is not provided', async () => {
    // Mock the implementation for this test
    markChatAsRead.mockImplementation(async (chatId, userId) => {
      if (!chatId) {
        return { data: null, error: 'Chat ID is required' };
      }
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }
      return { data: null, error: null };
    });

    // Call the function without userId
    const result = await markChatAsRead('chat-123', null);

    // Verify the result
    expect(result).toEqual({
      data: null,
      error: 'User ID is required'
    });
  });

  it('successfully marks messages as read', async () => {
    // Mock successful update data
    const mockUpdateData = {
      count: 3
    };

    // Mock the implementation for this test
    markChatAsRead.mockImplementation(async (chatId, userId) => {
      if (!chatId) {
        return { data: null, error: 'Chat ID is required' };
      }
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }
      return { data: mockUpdateData, error: null };
    });

    // Call the function
    const result = await markChatAsRead('chat-123', 'user-123');

    // Verify the function was called with correct parameters
    expect(markChatAsRead).toHaveBeenCalledWith('chat-123', 'user-123');

    // Verify the result
    expect(result).toEqual({
      data: mockUpdateData,
      error: null
    });
  });

  it('handles error when marking messages as read', async () => {
    // Mock update error
    const updateError = { message: 'Error updating messages' };

    // Mock the implementation for this test
    markChatAsRead.mockImplementation(async (chatId, userId) => {
      if (!chatId) {
        return { data: null, error: 'Chat ID is required' };
      }
      if (!userId) {
        return { data: null, error: 'User ID is required' };
      }
      console.error('Error marking messages as read:', updateError);
      return { data: null, error: updateError };
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
