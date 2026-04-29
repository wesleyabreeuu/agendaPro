import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus-visible:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-200/70 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})

export { Textarea }
