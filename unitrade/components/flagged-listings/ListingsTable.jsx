"use client"
import { Table, TableHeader, TableHead, TableRow, TableBody } from "@/components/ui/table"
import Row from "./TableRow"

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
      {listings.map((l) => (
        <Row
          key={l.id}
          listing={l}
          onView={() => onSelect(l)}
          onRemove={() => onRemove(l)}
        />
      ))}
    </TableBody>
  )
}
