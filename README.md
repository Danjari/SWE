# UniTrade - University Marketplace

UniTrade is a modern web application built with Next.js and Supabase that allows university students to buy and sell items within their campus community.

## Features

- **User Authentication**: Secure login, signup, and password recovery
- **Listing Management**: Create, view, and manage product listings
- **Product Details**: View comprehensive information about products
- **Buy Requests**: Send purchase requests to sellers
- **Messaging**: Chat with sellers about products
- **Search & Filter**: Find products by category, price, or keyword

## Technology Stack

- **Frontend**: Next.js 15.3, React 19, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **UI Components**: Radix UI, shadcn/ui
- **Testing**: Jest for unit and integration testing
- **Deployment**: Vercel (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project (for the context of the class, .env keys provided in the deliverable 5 document)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Danjari/SWE.git
   cd SWE/unitrade
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the unitrade directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

3. To build the application for production:
   ```bash
   npm run build
   ```

4. To start the production server:
   ```bash
   npm run start
   ```

## Running Tests

UniTrade uses Jest for testing the application's functionality.

### Running All Tests

To run all tests:
```bash
npm test
```

### Running Tests with Coverage Report

To run tests and generate a coverage report:
```bash
npm run test:coverage
```

This will:
- Run all tests in the `lib/__tests__` directory
- Generate a coverage report for the specified files in the jest.config.js
- Display a summary of the coverage in the terminal


## Database Setup with Supabase (Optional)

If you want to use your own Supabase keys:

1. Create a new Supabase project: [https://supabase.com](https://supabase.com)
2. Run the SQL scripts in `unitrade/lib/db/schema.sql` in the Supabase SQL editor
3. Update your `.env` file with your new Supabase credentials


    Each table is created with a primary key and foreign key constraints to maintain referential integrity.
    Indexes are created on foreign key columns to improve query performance.
    Make sure to enable Row Level Security (RLS) and create appropriate policies for each table after creating them.


## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: Reusable React components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and services
  - `/lib/api.js`: API functions for interacting with Supabase
  - `/lib/chat-service.js`: Chat functionality implementation
  - `/lib/__tests__`: Test files for the lib directory
- `/public`: Static assets

## Features Guide

### Buying Products

1. Browse listings on the main listings page
2. Click on a product's "View Details" button to see comprehensive information
3. On the product details page, click "Buy Now" to express interest
4. Fill in your contact information and a message to the seller
5. Submit your purchase request
6. The seller will receive your message request and can contact you directly

### Selling Products

1. Navigate to the listings page
2. Click "Add New Listing"
3. Fill in the product details including title, description, price, category, and condition
4. Submit the listing
5. Your listing will immediately appear on the marketplace

### Chat System

The application features a comprehensive chat system that:
- Automatically creates chat threads when users buy items
- Allows users to view all their conversations
- Provides a dedicated conversation view for individual chats
- Uses Supabase auth user IDs directly for proper foreign key constraints

## License

This project is licensed under the MIT License - see the LICENSE file for details.
