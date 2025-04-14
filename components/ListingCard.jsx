'use client'

import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export function ListingCard({ listing }) {
  // Format the date to show how long ago the listing was posted
  const formattedDate = formatRelativeTime(listing.created_at)

  // Default image if none is provided
  const fallbackImageUrl = '/assets/fallback.png'

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow duration-200">
        <div className="aspect-square w-full overflow-hidden">
          <img 
            src={listing.imageUrl || fallbackImageUrl} 
            alt={listing.title} 
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImageUrl;
            }}
          />
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <div className="mt-2 flex items-center">
            <span className="text-lg font-bold text-primary">${listing.price?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="mt-2 flex gap-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full 
              ${listing.condition === 'used' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
              {listing.condition === 'used' ? 'Used' : 'New'}
            </span>
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {listing.category}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Added {formattedDate}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// Helper function to format the date as a relative time (e.g. "2 days ago")
function formatRelativeTime(dateString) {
  if (!dateString) return 'Unknown date'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  // Convert to appropriate time unit
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    // For older dates, just show the formatted date
    return formatDate(dateString)
  }
}

// Helper function to format the date as YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return 'Unknown date'
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}