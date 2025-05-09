


"use client"
import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead } from "@/components/ui/table"
import { ModeToggle } from "@/components/mode-toggle"
import useFlaggedListings from "./useFlaggedListings"

import SuccessBanner from "@/components/flagged-listings/successBanner"
import SearchBar from "@/components/flagged-listings/searchBar"
import ListingsTable from "@/components/flagged-listings/ListingsTable"
import DetailsSheet from "@/components/flagged-listings/detailsSheet"
import RemoveDialog from "@/components/flagged-listings/removeDialog"
import Loading from "./loading"
import { banListing, unbanListing } from "@/lib/api" 

export default function FlaggedListingsPage() {
  const { listings, setListings, loading } = useFlaggedListings()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showRemove, setShowRemove] = useState(false)   // for ban-confirm dialog
  const [removeTarget, setRemoveTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return listings.filter(({ title, category, reason, sellerEmail, status }) =>
      [title, category, reason, sellerEmail, status].some((f) =>
        f.toLowerCase().includes(q)
      )
    )
  }, [query, listings])

  // open the “ban” confirmation
  const onBanClick = (listing) => {
    setRemoveTarget(listing)
    setShowRemove(true)
  }

  // actually ban
  const handleBan = async (listing) => {
    const { success } = await banListing(listing.id)
    if (!success) {
      return alert("Could not ban listing. Please try again.")
    }

    // mark it as banned in state
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id ? { ...l, status: "banned" } : l
      )
    )
    setShowRemove(false)
    setRemoveTarget(null)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // unban immediately (no confirm)
  const handleUnban = async (listing) => {
    const { success } = await unbanListing(listing.id)
    if (!success) {
      return alert("Could not unban listing. Please try again.")
    }

    // mark it as active (or whatever your “unbanned” status is)
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id ? { ...l, status: "active" } : l
      )
    )
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  if (loading) return <Loading />

  return (
    <div className="container mx-auto px-4 py-6">
      <SuccessBanner visible={showSuccess} onClose={() => setShowSuccess(false)} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flagged Listings</h1>
          <p className="text-muted-foreground">
            Manage reported listings that violate marketplace policies
          </p>
        </div>
        <ModeToggle />
      </div>

      {/* Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Flagged Items</CardTitle>
              <CardDescription>
                {filtered.length} items currently flagged for review
              </CardDescription>
            </div>
            <SearchBar value={query} onChange={setQuery} />
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Seller Email</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden md:table-cell">Date Flagged</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <ListingsTable
                listings={filtered}
                onSelect={(l) => setSelected(l)}
                onBan={onBanClick}       // ← pass ban handler
                onUnban={handleUnban}    // ← pass unban handler
              />
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Overlays */}
      <DetailsSheet
        listing={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
      <RemoveDialog
        listing={removeTarget}
        open={showRemove}
        onClose={() => setShowRemove(false)}
        onConfirm={handleBan}     // ← confirm ban here
      />
    </div>
  )
}
