"use client"

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ResponsiveTableProps {
  headers: string[]
  data: Record<string, React.ReactNode>[]
}

export function ResponsiveTable({ headers, data }: ResponsiveTableProps) {
  return (
    <div className="overflow-x-auto w-full">
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="px-4 py-2 text-left">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header, cellIndex) => {
                const key = header.toLowerCase().replace(/ /g, "")
                return (
                  <TableCell key={cellIndex} className="px-4 py-2">
                    <div className="md:hidden font-medium mb-1">{header}</div>
                    <div className={cellIndex === 2 ? "text-green-500" : ""}>
                      {row[key]}
                    </div>
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

