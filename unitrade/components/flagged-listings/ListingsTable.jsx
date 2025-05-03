"use client"

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Trash2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function ListingsTable({ listings, onSelect, onBan, onUnban }) {
  if (!listings.length) {
    return (
      <TableBody>
        <TableRow>
          <TableHead colSpan={7} className="text-center">
            No flagged listings found
          </TableHead>
        </TableRow>
      </TableBody>
    )
  }

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
            <Badge variant={listing.status === "banned" ? "destructive" : "outline"}>
              {listing.status}
            </Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onSelect(listing)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </Button>

              {listing.status === "banned" ? (
                <Button variant="outline" size="sm" onClick={() => onUnban(listing)}>
                  <Check className="mr-2 h-4 w-4" /> Unban
                </Button>
              ) : (
                <Button variant="destructive" size="sm" onClick={() => onBan(listing)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Ban
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
