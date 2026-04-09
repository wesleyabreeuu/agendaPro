import React, { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { CalendarDays, ChevronLeft, ChevronRight, List, ListChecks } from 'lucide-react'

const weekdayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const fullWeekdayLabels = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeekMonday(date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function endOfWeekSunday(date) {
  const copy = startOfWeekMonday(date)
  copy.setDate(copy.getDate() + 6)
  copy.setHours(23, 59, 59, 999)
  return copy
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10)
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
}

function formatDateTime(value, allDay = false) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return allDay
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
    : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

function monthLabel(date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
}

function normalizeEvent(evento) {
  const start = new Date(evento.start)
  const end = evento.end ? new Date(evento.end) : null

  return {
    ...evento,
    startDate: start,
    endDate: end,
    dateKey: toDateKey(start),
  }
}

function eventTone(tipo) {
  if (tipo === 'todo') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

export default function CompromissosCalendario() {
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()))
  const [viewMode, setViewMode] = useState('month')
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const rangeStart = startOfWeekMonday(startOfMonth(currentDate))
      const rangeEnd = endOfWeekSunday(endOfMonth(currentDate))
      const params = new URLSearchParams({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      })

      const response = await fetch(`/compromissos/calendario/eventos?${params.toString()}`, {
        headers: { Accept: 'application/json' },
        credentials: 'same-origin',
      })

      const data = await response.json()
      setEventos(data.map(normalizeEvent))
      setLoading(false)
    }

    load()
  }, [currentDate])

  const monthDays = useMemo(() => {
    const firstDay = startOfWeekMonday(startOfMonth(currentDate))
    const lastDay = endOfWeekSunday(endOfMonth(currentDate))
    const days = []
    const cursor = new Date(firstDay)

    while (cursor <= lastDay) {
      days.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }

    return days
  }, [currentDate])

  const eventsByDay = useMemo(() => {
    return eventos.reduce((acc, evento) => {
      if (!acc[evento.dateKey]) acc[evento.dateKey] = []
      acc[evento.dateKey].push(evento)
      return acc
    }, {})
  }, [eventos])

  const weeklyGroups = useMemo(() => {
    const weekStart = startOfWeekMonday(new Date())

    return fullWeekdayLabels.map((label, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      const key = toDateKey(date)

      return {
        label,
        shortDate: formatDateLabel(date),
        items: (eventsByDay[key] || []).sort((a, b) => a.startDate - b.startDate),
      }
    })
  }, [eventsByDay])

  return (
    <AppLayout title="Calendário">
      <div className="space-y-6">
        <section className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">Calendário consolidado</h2>
              <p className="mt-1 text-sm text-zinc-500">Veja compromissos e tarefas no calendário mensal ou em lista semanal.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('month')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${viewMode === 'month' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600'}`}
                >
                  <CalendarDays className="h-4 w-4" />
                  Calendário
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('week-list')}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${viewMode === 'week-list' ? 'bg-white text-zinc-950 shadow-sm' : 'text-zinc-600'}`}
                >
                  <List className="h-4 w-4" />
                  Lista semanal
                </button>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-1 shadow-sm">
                <button type="button" onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-[170px] text-center text-sm font-medium capitalize text-zinc-950">{monthLabel(currentDate)}</div>
                <button type="button" onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
            Carregando eventos...
          </div>
        ) : null}

        {!loading && viewMode === 'month' ? (
          <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/80">
              {weekdayLabels.map((day) => (
                <div key={day} className="px-4 py-3 text-sm font-medium text-zinc-500">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const key = toDateKey(day)
                const dayEvents = eventsByDay[key] || []
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = key === toDateKey(new Date())

                return (
                  <div key={key} className="min-h-[160px] border-b border-r border-zinc-200 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${isToday ? 'bg-zinc-950 text-white' : isCurrentMonth ? 'text-zinc-950' : 'text-zinc-400'}`}>
                        {day.getDate()}
                      </span>
                      <span className="text-xs text-zinc-400">{dayEvents.length ? `${dayEvents.length} item(ns)` : ''}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayEvents.slice(0, 3).map((evento) => (
                        <a
                          key={evento.id}
                          href={evento.extendedProps?.editUrl || '#'}
                          className={`block rounded-xl border px-3 py-2 text-xs ${eventTone(evento.extendedProps?.tipo)}`}
                        >
                          <div className="font-medium">{evento.title}</div>
                          <div className="mt-1 opacity-80">{evento.allDay ? 'Dia inteiro' : formatDateTime(evento.start)}</div>
                        </a>
                      ))}

                      {dayEvents.length > 3 ? (
                        <div className="text-xs text-zinc-500">+{dayEvents.length - 3} mais</div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}

        {!loading && viewMode === 'week-list' ? (
          <section className="space-y-4">
            {weeklyGroups.map((group) => (
              <div key={group.label} className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-zinc-950">{group.label}</h3>
                    <p className="text-sm text-zinc-500">{group.shortDate}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-600">
                    <ListChecks className="h-3.5 w-3.5" />
                    {group.items.length} item(ns)
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {group.items.length ? group.items.map((evento) => (
                    <div key={evento.id} className="rounded-2xl border border-zinc-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs ${eventTone(evento.extendedProps?.tipo)}`}>
                              {evento.extendedProps?.tipo === 'todo' ? 'Tarefa' : 'Compromisso'}
                            </span>
                            <span className="text-xs text-zinc-500">{evento.allDay ? 'Dia inteiro' : formatDateTime(evento.start)}</span>
                          </div>
                          <h4 className="mt-2 text-base font-semibold text-zinc-950">{evento.title}</h4>
                          {evento.extendedProps?.descricao ? <p className="mt-1 text-sm text-zinc-600">{evento.extendedProps.descricao}</p> : null}
                        </div>
                        {evento.extendedProps?.editUrl ? (
                          <a href={evento.extendedProps.editUrl} className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm">
                            Editar
                          </a>
                        ) : null}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-500">
                      Nenhum item programado para este dia.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {!loading && eventos.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-zinc-300 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
            Nenhum evento encontrado no período atual.
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}
