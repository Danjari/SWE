'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useSearchFilters() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [error, setError] = useState(null)

  // Parse search parameters
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'all'
  const minPrice = searchParams.get('minPrice') || '0'
  const maxPrice = searchParams.get('maxPrice') || '1000'
  const condition = searchParams.get('condition') || 'any'
  const datePosted = searchParams.get('datePosted') || 'any'
  const sortBy = searchParams.get('sortBy') || 'newest'

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const supabase = createClient()
        console.log('Fetching listings with filters:', { 
          q, category, minPrice, maxPrice, condition, datePosted, sortBy 
        })

        // Start building the query
        let query = supabase
          .from('listings')
          .select('*')

        // Only include non-deleted items
        query = query.is('deleted_at', null)

        // Apply keyword search - search in both title and description
        if (q) {
          // Using ilike for case-insensitive matching
          query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
        }

        // Apply category filter if not set to "all"
        if (category && category !== 'all') {
          query = query.eq('category', category)
        }

        // Apply condition filter if not set to "any"
        if (condition && condition !== 'any') {
          query = query.eq('condition', condition)
        }

        // Apply price range filters
        if (minPrice) {
          query = query.gte('price', parseFloat(minPrice))
        }

        if (maxPrice) {
          query = query.lte('price', parseFloat(maxPrice))
        }

        // Apply date posted filter if not set to "any"
        if (datePosted && datePosted !== 'any') {
          const dateThreshold = computeDate(datePosted)
          query = query.gte('created_at', dateThreshold)
        }

        // Apply sorting
        if (sortBy === 'priceAsc') {
          query = query.order('price', { ascending: true })
        } else if (sortBy === 'priceDesc') {
          query = query.order('price', { ascending: false })
        } else {
          // Default to newest
          query = query.order('created_at', { ascending: false })
        }

        // Execute the query
        const { data, error: supabaseError } = await query

        if (supabaseError) {
          console.error('Supabase error:', supabaseError)
          setError(supabaseError.message)
          setListings([])
          setTotalResults(0)
        } else {
          console.log('Fetched listings:', data?.length)
          setListings(data || [])
          setTotalResults(data?.length || 0)
        }
      } catch (err) {
        console.error('Error in fetchListings:', err)
        setError(err.message)
        setListings([])
        setTotalResults(0)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [q, category, minPrice, maxPrice, condition, datePosted, sortBy])

  return {
    listings,
    loading,
    totalResults,
    error,
    filters: {
      q,
      category,
      minPrice,
      maxPrice,
      condition,
      datePosted,
      sortBy
    }
  }
}

// Helper function to compute date threshold based on datePosted filter
function computeDate(range) {
  const now = new Date()
  if (range === '24h') {
    now.setDate(now.getDate() - 1)
  } else if (range === '7d') {
    now.setDate(now.getDate() - 7)
  } else if (range === '30d') {
    now.setDate(now.getDate() - 30)
  }
  return now.toISOString()
}