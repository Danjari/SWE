"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"

/**
 * Props:
 *  - listingId (uuid)
 *  - listingTitle (string)
 *  - isSeller (boolean)   → hide button if current user is the seller
 */
export default function Report({ listingId, listingTitle, isSeller = false }) {
  const { user } = useAuth() || { user: null }
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen]           = useState(false)
  const [reason, setReason]       = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState(null)

  const handleSubmit = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (!reason.trim()) {
      setError("Please enter a reason.")
      return
    }

    setSubmitting(true)
    const { error: dbError } = await supabase.from("flagged_listings").insert({
      listing_id: listingId,
      flagged_by: user.id,
      reason: reason.trim()
    })

    setSubmitting(false)

    if (dbError) {
      console.error(dbError)
      setError("Unable to submit report. Please try again.")
      return
    }

    // Success
    setOpen(false)
    setReason("")
    alert("Thanks! Your report was sent to the moderators.")
  }

  if (isSeller) return null

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1"
      >
        <AlertCircle size={14} />
        Report
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Report this listing</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Tell us why you think “{listingTitle}” should be reviewed.
            </p>
          </DialogHeader>

          <Textarea
            placeholder="Describe the issue…"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              if (error) setError(null)
            }}
            className={error ? "border-destructive" : ""}
            minLength={5}
          />

          {error && (
            <p className="text-destructive text-xs flex items-center gap-1 mt-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-1"
            >
              {submitting ? (
                <span className="animate-spin h-4 w-4 border-2 border-r-transparent rounded-full" />
              ) : (
                <AlertCircle size={14} />
              )}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
