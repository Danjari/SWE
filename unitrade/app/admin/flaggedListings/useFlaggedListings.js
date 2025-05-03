"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function useFlaggedListings() {
  const [listings, setListings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFlagged() {
      const { data, error } = await supabase
        .from("flagged_listings_view")
        .select("*")
        .order("date", { ascending: false })

      if (error) console.error(error)
      else {
        setListings(
          (data ?? []).map((item) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            sellerEmail: item.seller_email,
            price: item.price,
            description: item.description,
            image: item.image,
            location: item.location,
            date: new Date(item.date),
            flagCount: item.flag_count,
            reason: item.reason,
            flags: item.flags_json,
            status: item.status || 'flagged'
          }))
        )
      }
      setLoading(false)
    }
    fetchFlagged()
  }, [supabase])

  return { listings, setListings, loading }
}
