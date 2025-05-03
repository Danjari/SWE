"use client"
import { Eye, Trash2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { TableRow, TableCell } from "@/components/ui/table"

export default function Row({ listing, onView, onRemove }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{listing.title}</TableCell>
      <TableCell className="hidden md:table-cell">{listing.category}</TableCell>
      <TableCell>{listing.sellerEmail}</TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="truncate max-w-[150px]">{listing.reason}</span>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {format(listing.date, "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="mr-2 h-4 w-4" /> View
          </Button>
          <Button variant="destructive" size="sm" onClick={onRemove}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
