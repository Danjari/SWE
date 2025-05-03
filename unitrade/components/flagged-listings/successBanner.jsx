"use client"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessBanner({ visible, onClose }) {
  if (!visible) return null
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-100">
      <span>Listing successfully Updated</span>
      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onClose}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  )
}
