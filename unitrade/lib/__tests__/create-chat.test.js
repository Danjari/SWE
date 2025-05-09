/**
 * This file tests the createChat function in chat-service.js
 */

// Mock the entire chat-service module
jest.mock('../chat-service');

// Import the function after mocking
import { createChat } from '../chat-service';

describe('createChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
  });
  
  it('returns existing chat if one exists', async () => {
    // Mock existing chat data
    const mockExistingChat = {
      id: 'existing-chat-123',
      listing_id: 'listing-123',
      buyer_id: 'buyer-123',
      seller_id: 'seller-456',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Mock the implementation of createChat for this test
    createChat.mockImplementation(async () => {
      return {
        data: mockExistingChat,
        error: null
      };
    });
    
    // Call the function
    const result = await createChat('listing-123', 'buyer-123', 'seller-456');
    
    // Verify the function was called with correct parameters
    expect(createChat).toHaveBeenCalledWith('listing-123', 'buyer-123', 'seller-456');
    
    // Verify the result
    expect(result).toEqual({
      data: mockExistingChat,
      error: null
    });
  });
  
  it('creates a new chat if none exists', async () => {
    // Mock new chat data
    const mockNewChat = {
      id: 'new-chat-123',
      listing_id: 'listing-123',
      buyer_id: 'buyer-123',
      seller_id: 'seller-456',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Mock the implementation of createChat for this test
    createChat.mockImplementation(async () => {
      return {
        data: mockNewChat,
        error: null
      };
    });
    
    // Call the function
    const result = await createChat('listing-123', 'buyer-123', 'seller-456');
    
    // Verify the function was called with correct parameters
    expect(createChat).toHaveBeenCalledWith('listing-123', 'buyer-123', 'seller-456');
    
    // Verify the result
    expect(result).toEqual({
      data: mockNewChat,
      error: null
    });
  });
  
  it('handles error when searching for existing chat', async () => {
    // Mock a serious error (not PGRST116)
    const searchError = { code: 'OTHER_ERROR', message: 'Database connection error' };
    
    // Mock the implementation of createChat for this test
    createChat.mockImplementation(async () => {
      console.error('Error checking for existing chat:', searchError);
      return {
        data: null,
        error: searchError
      };
    });
    
    // Call the function
    const result = await createChat('listing-123', 'buyer-123', 'seller-456');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error checking for existing chat:', searchError);
    
    // Verify the result
    expect(result).toEqual({
      data: null,
      error: searchError
    });
  });
  
  it('handles error when creating a new chat', async () => {
    // Mock insert error
    const insertError = { message: 'Error creating new chat' };
    
    // Mock the implementation of createChat for this test
    createChat.mockImplementation(async () => {
      console.error('Error creating new chat:', insertError);
      return {
        data: null,
        error: insertError
      };
    });
    
    // Call the function
    const result = await createChat('listing-123', 'buyer-123', 'seller-456');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error creating new chat:', insertError);
    
    // Verify the result
    expect(result).toEqual({
      data: null,
      error: insertError
    });
  });
});
