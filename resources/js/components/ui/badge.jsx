import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-zinc-950 bg-zinc-950 text-white",
        secondary: "border-zinc-200 bg-zinc-100 text-zinc-700",
        outline: "border-zinc-200 bg-gradient-to-t from-primary/5 to-card text-zinc-700",
        success: "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning: "border-amber-200 bg-amber-50 text-amber-700",
        danger: "border-red-200 bg-red-50 text-red-700",
        info: "border-blue-200 bg-blue-50 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant, className }))} {...props} />
}

export { Badge, badgeVariants }
