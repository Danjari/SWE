"use client"

import { useState } from "react"
import { Eye, Trash2, Search, X, AlertTriangle } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"

// Mock data for flagged listings
const flaggedListings = [
  {
    id: "1",
    title: "Macbook Pro 2023",
    category: "Electronics",
    seller: "Alex Johnson",
    sellerEmail: "alex.j@university.edu",
    reason: "Suspected stolen item",
    date: new Date("2023-03-15"),
    price: "$1,200",
    description:
      "Like new MacBook Pro 2023 with M2 chip, 16GB RAM, and 512GB SSD. Only used for 3 months. Comes with original packaging, charger, and AppleCare+ until 2025. Perfect condition with no scratches.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    location: "Under the Palms",
    flaggedBy: "Campus Security",
    flagCount: 3,
  },
  {
    id: "2",
    title: "iPhone 14 Pro",
    category: "Electronics",
    seller: "Jamie Smith",
    sellerEmail: "jamie.smith@university.edu",
    reason: "Unrealistic price",
    date: new Date("2023-03-18"),
    price: "$300",
    description:
      "iPhone 14 Pro, 256GB, Graphite. Minor scratches on screen but works perfectly. Includes charger and case.",
    image: "/placeholder.svg?height=600&width=600",
    location: "Library Entrance",
    flaggedBy: "Admin",
    flagCount: 2,
  },
  {
    id: "3",
    title: "Calculus Textbook",
    category: "Books",
    seller: "Taylor Wong",
    sellerEmail: "taylor.w@university.edu",
    reason: "Counterfeit material",
    date: new Date("2023-03-20"),
    price: "$45",
    description: "Calculus: Early Transcendentals, 8th Edition. Barely used, no highlights or notes.",
    image: "/placeholder.svg?height=600&width=600",
    location: "Math Building",
    flaggedBy: "Professor Davis",
    flagCount: 1,
  },
  {
    id: "4",
    title: "Dorm Refrigerator",
    category: "Appliances",
    seller: "Jordan Lee",
    sellerEmail: "jordan.l@university.edu",
    reason: "Prohibited item",
    date: new Date("2023-03-22"),
    price: "$80",
    description: "Mini fridge, 3.2 cubic feet. Perfect for dorm rooms. Used for one semester only.",
    image: "/placeholder.svg?height=600&width=600",
    location: "Dorm C",
    flaggedBy: "Residence Life",
    flagCount: 2,
  },
  {
    id: "5",
    title: "Concert Tickets",
    category: "Entertainment",
    seller: "Morgan Chen",
    sellerEmail: "morgan.c@university.edu",
    reason: "Potential scalping",
    date: new Date("2023-03-25"),
    price: "$150",
    description: "Two tickets to the upcoming campus concert. Section A, Row 3.",
    image: "/placeholder.svg?height=600&width=600",
    location: "Student Union",
    flaggedBy: "Event Committee",
    flagCount: 4,
  },
]

export default function FlaggedListings() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedListing, setSelectedListing] = useState<(typeof flaggedListings)[0] | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [listings, setListings] = useState(flaggedListings)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)

  const filteredListings = listings.filter(
    (listing) =>
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.reason.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleRemoveListing = () => {
    setListings(listings.filter((listing) => listing.id !== selectedListing?.id))
    setIsRemoveDialogOpen(false)
    setShowSuccessBanner(true)
    setTimeout(() => setShowSuccessBanner(false), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {showSuccessBanner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-100">
          <div className="flex items-center gap-2">Listing successfully removed</div>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowSuccessBanner(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Flagged Listings</h1>
          <p className="text-muted-foreground">Manage reported listings that violate marketplace policies</p>
        </div>
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Flagged Items</CardTitle>
              <CardDescription>{filteredListings.length} items currently flagged for review</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search listings..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing Title</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                  <TableHead className="hidden md:table-cell">Date Flagged</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No flagged listings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">{listing.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{listing.category}</TableCell>
                      <TableCell>{listing.seller}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="truncate max-w-[150px]">{listing.reason}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{format(listing.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing)
                              setIsDetailsOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing)
                              setIsRemoveDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Listing Details</SheetTitle>
            <SheetDescription>Review the flagged listing information</SheetDescription>
          </SheetHeader>
          {selectedListing && (
            <div className="mt-6 space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden border">
                <img
                  src={selectedListing.image || "/placeholder.svg"}
                  alt={selectedListing.title}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{selectedListing.title}</h3>
                  <p className="text-xl font-semibold">{selectedListing.price}</p>
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Listing Details</TabsTrigger>
                    <TabsTrigger value="flags">Flag Information</TabsTrigger>
                  </TabsList>
                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p>{selectedListing.category}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p>{selectedListing.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Posted Date</p>
                        <p>{format(selectedListing.date, "MMM d, yyyy")}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm mt-1">{selectedListing.description}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Seller Information</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Avatar>
                          <AvatarFallback>{selectedListing.seller.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedListing.seller}</p>
                          <p className="text-sm text-muted-foreground">{selectedListing.sellerEmail}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flags" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Flag Count</p>
                        <Badge variant="destructive" className="mt-1">
                          {selectedListing.flagCount}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">First Flagged</p>
                        <p>{format(selectedListing.date, "MMM d, yyyy")}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reason for Flag</p>
                      <div className="flex items-center gap-2 mt-1">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <p>{selectedListing.reason}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Flagged By</p>
                      <p className="mt-1">{selectedListing.flaggedBy}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailsOpen(false)
                    setIsRemoveDialogOpen(true)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Listing
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Remove Confirmation Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this listing? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedListing && (
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={selectedListing.image || "/placeholder.svg"}
                    alt={selectedListing.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedListing.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Listed by {selectedListing.seller} for {selectedListing.price}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Flagged for: {selectedListing.reason}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveListing}>
              Remove Listing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

