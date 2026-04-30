import React from 'react'
import { ResponsiveContainer, Tooltip } from 'recharts'

export function ChartContainer({ config = {}, className = '', children }) {
  const style = Object.entries(config).reduce((accumulator, [key, value]) => {
    if (value?.color) {
      accumulator[`--color-${key}`] = value.color
    }

    return accumulator
  }, {})

  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-card p-3 shadow-xs ${className}`.trim()}
      style={style}
    >
      <div className="h-[220px] w-full md:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function ChartTooltip({ content }) {
  return <Tooltip cursor={{ stroke: '#d4d4d8', strokeDasharray: '4 4' }} content={content} />
}

export function ChartTooltipContent({ active, payload, label, indicator = 'dot' }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="min-w-[180px] rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-xs">
      {label ? <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</div> : null}
      <div className="space-y-1.5">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2 text-zinc-600">
              {indicator === 'line' ? (
                <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
              ) : (
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              )}
              <span>{entry.name}</span>
            </div>
            <span className="font-medium text-zinc-950">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
