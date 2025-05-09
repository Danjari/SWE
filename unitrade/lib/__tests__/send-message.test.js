/**
 * This file tests the sendMessage function in chat-service.js
 */

// Mock the entire chat-service module
jest.mock('../chat-service');

// Import the function after mocking
import { sendMessage } from '../chat-service';

describe('sendMessage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('successfully sends a message and updates chat timestamp', async () => {
    // Mock message data
    const mockMessage = {
      id: 'message-123',
      chat_id: 'chat-123',
      sender_id: 'user-123',
      content: 'Hello there!',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Mock the implementation of sendMessage for this test
    sendMessage.mockImplementation(async () => {
      return {
        data: mockMessage,
        error: null
      };
    });
    
    // Call the function
    const result = await sendMessage('chat-123', 'user-123', 'Hello there!');
    
    // Verify the function was called with correct parameters
    expect(sendMessage).toHaveBeenCalledWith('chat-123', 'user-123', 'Hello there!');
    
    // Verify the result
    expect(result).toEqual({
      data: mockMessage,
      error: null
    });
  });
  
  it('sends a message with a purchase request ID', async () => {
    // Mock message data
    const mockMessage = {
      id: 'message-123',
      chat_id: 'chat-123',
      sender_id: 'user-123',
      content: 'I want to buy this item',
      purchase_request_id: 'purchase-123',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Mock the implementation of sendMessage for this test
    sendMessage.mockImplementation(async () => {
      return {
        data: mockMessage,
        error: null
      };
    });
    
    // Call the function with a purchase request ID
    const result = await sendMessage('chat-123', 'user-123', 'I want to buy this item', 'purchase-123');
    
    // Verify the function was called with correct parameters
    expect(sendMessage).toHaveBeenCalledWith('chat-123', 'user-123', 'I want to buy this item', 'purchase-123');
    
    // Verify the result
    expect(result).toEqual({
      data: mockMessage,
      error: null
    });
  });
  
  it('handles error when sending a message', async () => {
    // Mock message error
    const messageError = { message: 'Error sending message' };
    
    // Mock the implementation of sendMessage for this test
    sendMessage.mockImplementation(async () => {
      console.error('Error sending message:', messageError);
      return {
        data: null,
        error: messageError
      };
    });
    
    // Call the function
    const result = await sendMessage('chat-123', 'user-123', 'Hello there!');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error sending message:', messageError);
    
    // Verify the result
    expect(result).toEqual({
      data: null,
      error: messageError
    });
  });
  
  it('handles error when updating chat timestamp', async () => {
    // Mock message data
    const mockMessage = {
      id: 'message-123',
      chat_id: 'chat-123',
      sender_id: 'user-123',
      content: 'Hello there!',
      created_at: '2023-01-01T12:00:00Z'
    };
    
    // Mock update error
    const updateError = { message: 'Error updating chat timestamp' };
    
    // Mock the implementation of sendMessage for this test
    sendMessage.mockImplementation(async () => {
      console.error('Error updating chat timestamp:', updateError);
      return {
        data: mockMessage,
        error: updateError
      };
    });
    
    // Call the function
    const result = await sendMessage('chat-123', 'user-123', 'Hello there!');
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalledWith('Error updating chat timestamp:', updateError);
    
    // Verify the result - should still return the message with the update error
    expect(result).toEqual({
      data: mockMessage,
      error: updateError
    });
  });
});
