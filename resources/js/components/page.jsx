import React from 'react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'

function PageCard({ className = '', children, ...props }) {
  return (
    <Card
      className={cn('border-zinc-200 bg-gradient-to-t from-primary/5 to-card shadow-xs dark:border-zinc-800', className)}
      {...props}
    >
      {children}
    </Card>
  )
}

function PageCardHeader({ icon: Icon, title, description, action, className = '' }) {
  return (
    <CardHeader className={cn('border-b border-zinc-100 dark:border-zinc-800', className)}>
      <div className="flex min-w-0 items-center gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0">
          <CardTitle className="text-zinc-950 dark:text-zinc-50">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </div>
      </div>
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
  )
}

function PageCardContent({ className = '', ...props }) {
  return <CardContent className={cn('p-5', className)} {...props} />
}

function PageEmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-gradient-to-t from-primary/5 to-card px-6 py-12 text-center dark:border-zinc-700', className)}>
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <p className="font-medium text-zinc-950 dark:text-zinc-50">{title}</p>
      {description ? <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

function FieldGrid({ className = '', ...props }) {
  return <div className={cn('grid gap-5 lg:grid-cols-2', className)} {...props} />
}

function ActionBar({ className = '', ...props }) {
  return <div className={cn('flex flex-wrap items-center gap-3', className)} {...props} />
}

export { PageCard, PageCardHeader, PageCardContent, PageEmptyState, FieldGrid, ActionBar }
