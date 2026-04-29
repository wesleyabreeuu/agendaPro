import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef(function Table({ className, ...props }, ref) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        ref={ref}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
})

const TableHeader = React.forwardRef(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
})

const TableBody = React.forwardRef(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
})

const TableFooter = React.forwardRef(function TableFooter({ className, ...props }, ref) {
  return (
    <tfoot
      ref={ref}
      data-slot="table-footer"
      className={cn("border-t bg-zinc-50/80 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
})

const TableRow = React.forwardRef(function TableRow({ className, ...props }, ref) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      className={cn("border-b border-zinc-200 transition-colors hover:bg-zinc-50/50", className)}
      {...props}
    />
  )
})

const TableHead = React.forwardRef(function TableHead({ className, ...props }, ref) {
  return (
    <th
      ref={ref}
      data-slot="table-head"
      className={cn("h-12 px-4 text-left align-middle font-medium text-zinc-500", className)}
      {...props}
    />
  )
})

const TableCell = React.forwardRef(function TableCell({ className, ...props }, ref) {
  return <td ref={ref} data-slot="table-cell" className={cn("px-4 py-3 align-middle", className)} {...props} />
})

const TableCaption = React.forwardRef(function TableCaption({ className, ...props }, ref) {
  return <caption ref={ref} data-slot="table-caption" className={cn("mt-4 text-sm text-zinc-500", className)} {...props} />
})

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
