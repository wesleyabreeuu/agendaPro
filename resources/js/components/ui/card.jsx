import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow-sm",
        className
      )}
      {...props}
    />
  )
})

const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
})

const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <h1
      ref={ref}
      data-slot="card-title"
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
})

const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="card-description"
      className={cn("text-sm text-zinc-500", className)}
      {...props}
    />
  )
})

const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
})

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
