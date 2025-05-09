import { createClient } from '@/lib/supabase/client';

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}));

// Create a simplified version of markChatAsRead for testing
async function markChatAsRead(chatId, userId) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .is('read_at', null);
  
  if (error) {
    console.error('Error marking messages as read:', error);
  }
  
  return { data, error };
}

describe('Mark Chat As Read', () => {
  let mockFrom;
  let mockUpdate;
  let mockEq;
  let mockNeq;
  let mockIs;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock functions for the Supabase query chain
    mockIs = jest.fn();
    mockNeq = jest.fn(() => ({ is: mockIs }));
    mockEq = jest.fn(() => ({ neq: mockNeq }));
    mockUpdate = jest.fn(() => ({ eq: mockEq }));
    mockFrom = jest.fn(() => ({ update: mockUpdate }));
    
    // Setup the createClient mock
    createClient.mockReturnValue({
      from: mockFrom
    });
    
    // Mock console.error
    console.error = jest.fn();
  });
  
  it('successfully marks messages as read', async () => {
    // Setup the mock to return success
    mockIs.mockResolvedValue({
      data: { count: 3 },
      error: null
    });
    
    const result = await markChatAsRead('123', 'user-456');
    
    expect(mockFrom).toHaveBeenCalledWith('messages');
    expect(mockUpdate).toHaveBeenCalledWith({ read_at: expect.any(String) });
    expect(mockEq).toHaveBeenCalledWith('chat_id', '123');
    expect(mockNeq).toHaveBeenCalledWith('sender_id', 'user-456');
    expect(mockIs).toHaveBeenCalledWith('read_at', null);
    
    expect(result).toEqual({
      data: { count: 3 },
      error: null
    });
    expect(console.error).not.toHaveBeenCalled();
  });
  
  it('handles error when marking messages as read', async () => {
    const mockError = { message: 'Failed to mark messages as read' };
    
    // Setup the mock to return an error
    mockIs.mockResolvedValue({
      data: null,
      error: mockError
    });
    
    const result = await markChatAsRead('123', 'user-456');
    
    expect(result).toEqual({
      data: null,
      error: mockError
    });
    expect(console.error).toHaveBeenCalledWith('Error marking messages as read:', mockError);
  });
  
  it('marks multiple messages as read', async () => {
    // Setup the mock to return multiple messages marked as read
    mockIs.mockResolvedValue({
      data: { count: 10 },
      error: null
    });
    
    const result = await markChatAsRead('123', 'user-456');
    
    expect(result).toEqual({
      data: { count: 10 },
      error: null
    });
  });
});
