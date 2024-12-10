'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ENTRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  entriesPerPage: number;
  totalItems: number;
  startIndex: number;
}

export function Pagination({
  currentPage,
  totalPages,
  entriesPerPage,
  totalItems,
  startIndex,
}: PaginationProps) {
  return (
    <div className="mt-4 flex items-center justify-between border-t pt-4">
      <div className="flex items-center space-x-2 text-sm">
        <p className="text-sm text-muted-foreground">
          Show
        </p>
        <Select
          defaultValue={entriesPerPage.toString()}
          onValueChange={(value) => {
            const url = new URL(window.location.href);
            url.searchParams.set('limit', value);
            url.searchParams.delete('page'); // Reset to first page
            window.location.href = url.toString();
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {ENTRIES_PER_PAGE_OPTIONS.map(value => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          entries per page
        </p>
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('page', (currentPage - 1).toString());
              window.location.href = url.toString();
            }}
            disabled={currentPage === 1}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => {
              // Show first, last, and pages around current page
              return page === 1 || 
                     page === totalPages || 
                     Math.abs(page - currentPage) <= 1;
            })
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="text-muted-foreground">...</span>
                )}
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('page', page.toString());
                    window.location.href = url.toString();
                  }}
                >
                  <span className="sr-only">Go to page {page}</span>
                  {page}
                </Button>
              </React.Fragment>
            ))}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set('page', (currentPage + 1).toString());
              window.location.href = url.toString();
            }}
            disabled={currentPage === totalPages}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 