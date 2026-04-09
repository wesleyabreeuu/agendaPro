import React from 'react'

export function Card({ className = '', children }) {
  return <div className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`.trim()}>{children}</div>
}

export function CardHeader({ className = '', children }) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`.trim()}>{children}</div>
}

export function CardTitle({ className = '', children }) {
  return <h1 className={`text-2xl font-semibold leading-none tracking-tight ${className}`.trim()}>{children}</h1>
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-sm text-zinc-500 ${className}`.trim()}>{children}</p>
}

export function CardContent({ className = '', children }) {
  return <div className={`p-6 pt-0 ${className}`.trim()}>{children}</div>
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${props.className || ''}`.trim()}
    />
  )
}

export function Select(props) {
  return (
    <select
      {...props}
      className={`flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${props.className || ''}`.trim()}
    />
  )
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 ${props.className || ''}`.trim()}
    />
  )
}

export function Button({ variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-zinc-950 text-white hover:bg-zinc-800',
    outline: 'border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50',
  }

  return (
    <button
      {...props}
      className={`inline-flex h-10 w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition ${variants[variant] || variants.default} ${className}`.trim()}
    />
  )
}
