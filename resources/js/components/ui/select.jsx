import * as React from "react"

import { cn } from "@/lib/utils"

const Select = React.forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      data-slot="select"
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-xs outline-none transition focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:border-zinc-500 dark:focus-visible:ring-zinc-700/50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
})

export { Select }
