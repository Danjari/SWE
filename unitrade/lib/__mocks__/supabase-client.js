// Mock Supabase client
const mockSupabaseQuery = {
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

const mockGetUser = jest.fn();

const createClient = jest.fn(() => ({
  auth: {
    getUser: mockGetUser,
  },
  from: jest.fn(() => mockSupabaseQuery),
}));

module.exports = {
  createClient,
  mockSupabaseQuery,
  mockGetUser,
};
