import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Dialog(props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...props}
    />
  )
})

const DialogContent = React.forwardRef(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs duration-200",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})

const DialogHeader = React.forwardRef(function DialogHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn("flex flex-col space-y-1.5 text-left", className)}
      {...props}
    />
  )
})

const DialogFooter = React.forwardRef(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
})

const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn("text-lg font-semibold tracking-tight text-zinc-950", className)}
      {...props}
    />
  )
})

const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn("text-sm text-zinc-500", className)}
      {...props}
    />
  )
})

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
}
