'use client'

import { ListingCard } from '@/components/ListingCard'

export function ListingGrid({ listings }) {
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-lg text-gray-500">No listings found. Try adjusting your search criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}