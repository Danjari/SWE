# UniTrade - University Marketplace

UniTrade is a modern web application built with Next.js and Supabase that allows university students to buy and sell items within their campus community.

## Features

- **User Authentication**: Secure login, signup, and password recovery
- **Listing Management**: Create, view, and manage product listings
- **Product Details**: View comprehensive information about products
- **Buy Requests**: Send purchase requests to sellers
- **Messaging**: Chat with sellers about products (coming soon)

## Technology Stack

- **Frontend**: Next.js 15.3, React 19, Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **UI Components**: Radix UI, shadcn/ui
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/unitrade.git
   cd unitrade
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in `lib/db/schema.sql` in the Supabase SQL editor

## Features Guide

### Buying Products

1. Browse listings on the main listings page
2. Click on a product's "View Details" button to see comprehensive information
3. On the product details page, click "Buy Now" to express interest
4. Fill in your contact information and a message to the seller
5. Submit your purchase request
6. The seller will receive your request and can contact you directly

### Selling Products

1. Navigate to the listings page
2. Click "Add New Listing"
3. Fill in the product details including title, description, price, category, and condition
4. Submit the listing
5. Your listing will immediately appear on the marketplace

## Project Structure

- `/app`: Next.js application routes and pages
- `/components`: Reusable React components
- `/hooks`: Custom React hooks
- `/lib`: Utility functions and services
- `/public`: Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.


