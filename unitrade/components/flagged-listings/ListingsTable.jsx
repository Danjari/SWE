"use client"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ListingsTable({ listings, onSelect, onRemove }) {
  if (!listings.length)
    return (
      <TableBody>
        <TableRow>
          <TableHead colSpan={6} className="text-center">
            No flagged listings found
          </TableHead>
        </TableRow>
      </TableBody>
    )


  return (
    <TableBody>
      {listings.map((listing) => (
        <TableRow key={listing.id}>
          <TableCell className="font-medium">{listing.title}</TableCell>
          <TableCell className="hidden md:table-cell">{listing.category}</TableCell>
          <TableCell>{listing.sellerEmail}</TableCell>
          <TableCell className="hidden md:table-cell">{listing.reason}</TableCell>
          <TableCell className="hidden md:table-cell">
            {new Date(listing.date).toLocaleDateString()}
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Badge variant={listing.status === 'banned' ? 'destructive' : 'outline'}>
              {listing.status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(listing)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(listing)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
