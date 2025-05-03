"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function RemoveDialog({
  listing,
  open,
  onClose,
  onConfirm,
}) {
  if (!listing) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this listing? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex items-start space-x-4">
          <div className="h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
            <img
              src={listing.image || "/placeholder.svg"}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h4 className="font-medium">{listing.title}</h4>
            <p className="text-sm text-muted-foreground">
              Listed for {listing.price}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Flagged for: {listing.reason}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(listing)}>
            Remove Listing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
