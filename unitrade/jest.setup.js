// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => {
  // Create a function that returns a mock query builder with all methods
  const createMockQueryBuilder = () => {
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
    };
    
    // Add resolution methods that return data
    mockQueryBuilder.then = jest.fn((callback) => {
      callback({ data: [], error: null });
      return Promise.resolve({ data: [], error: null });
    });
    
    return mockQueryBuilder;
  };
  
  // Create the mock client factory
  return {
    createClient: jest.fn(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'mock-user-id' } }, error: null }),
      },
      from: jest.fn(() => createMockQueryBuilder()),
    })),
  };
});

// Mock console.error to prevent test output clutter
global.console.error = jest.fn();

// Mock Date for consistent test results
const mockDate = new Date('2025-01-01T12:00:00Z');
global.Date = jest.fn(() => mockDate);
global.Date.toISOString = jest.fn(() => mockDate.toISOString());
global.Date.now = jest.fn(() => mockDate.getTime());
