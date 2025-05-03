"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { format } from "date-fns"

export default function DetailsSheet({ listing, open, onClose }) {
  if (!listing) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Listing Details</SheetTitle>
          <SheetDescription>Review the flagged listing information</SheetDescription>
        </SheetHeader>

        {/* main */}
        <div className="mt-6 space-y-6 px-6">
          {/* image */}
          <div className="relative aspect-video overflow-hidden rounded-lg border">
            <img
              src={listing.image || "/placeholder.svg"}
              alt={listing.title}
              className="object-cover w-full h-full"
            />
          </div>

          {/* info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{listing.title}</h3>
              <p className="text-xl font-semibold">{listing.price}</p>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Listing Details</TabsTrigger>
                <TabsTrigger value="flags">Flag Information</TabsTrigger>
              </TabsList>

              {/* Listing tab */}
              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Category" value={listing.category} />
                  <Field label="Location" value={listing.location ?? "-"} />
                  <Field
                    label="Posted Date"
                    value={format(listing.date, "MMM d, yyyy")}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Seller Email
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Avatar>
                      <AvatarFallback>
                        {listing.sellerEmail?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">
                      {listing.sellerEmail}
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Flags tab */}
              <TabsContent value="flags" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Flag Count"
                    value={
                      <Badge variant="destructive">{listing.flagCount}</Badge>
                    }
                  />
                  <Field
                    label="First Flagged"
                    value={format(listing.date, "MMM d, yyyy")}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Reason for Flag
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p>{listing.reason}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* small presentational helper */
function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {typeof value === "string" ? <p>{value}</p> : value}
    </div>
  )
}
