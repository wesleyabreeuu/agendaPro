import React, { useEffect, useMemo, useState } from 'react'
import AppLayout from '../../layouts/AppLayout'
import { CalendarDays, ChevronLeft, ChevronRight, List, ListChecks } from 'lucide-react'
import { Calendar, Label, RadioGroup, RadioGroupItem } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'

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
  if (tipo === 'todo') return 'border-emerald-200 bg-emerald-50 text-slate-950'
  return 'border-blue-200 bg-blue-50 text-slate-950'
}

function permissionTone(permissao) {
  if (permissao === 'owner') return 'border-blue-200 bg-blue-50 text-slate-950'
  if (permissao === 'editar') return 'border-violet-200 bg-violet-50 text-slate-950'
  return 'border-amber-200 bg-amber-50 text-slate-950'
}

export default function CompromissosCalendario() {
  const { theme } = useTheme()
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()))
  const [viewMode, setViewMode] = useState('month')
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const isDark = theme === 'dark'

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
    <AppLayout title="Calendário" chrome="dashboard">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className={`rounded-[28px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Navegação rápida</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Selecione uma data para pular direto para o mês desejado.</p>
            </div>
            <div className={`overflow-hidden rounded-2xl border ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => {
                  if (date) setCurrentDate(startOfMonth(date))
                }}
                className="w-full"
              />
            </div>
          </section>

          <section className={`rounded-[28px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Modo de visualização</h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Troque entre a grade mensal e a lista da semana atual.</p>
            </div>
            <RadioGroup value={viewMode} onValueChange={setViewMode} className="gap-3">
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${viewMode === 'month' ? 'border-blue-300 bg-blue-50/80' : isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <RadioGroupItem value="month" id="view-mode-month" className="mt-1" />
                <div>
                  <Label htmlFor="view-mode-month" className={`cursor-pointer text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>Calendário mensal</Label>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Visão completa do mês com contagem e cartões por dia.</p>
                </div>
              </label>
              <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${viewMode === 'week-list' ? 'border-blue-300 bg-blue-50/80' : isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <RadioGroupItem value="week-list" id="view-mode-week-list" className="mt-1" />
                <div>
                  <Label htmlFor="view-mode-week-list" className={`cursor-pointer text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>Lista semanal</Label>
                  <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Agrupa os próximos itens por dia da semana atual.</p>
                </div>
              </label>
            </RadioGroup>
          </section>
        </aside>

        <div className="space-y-6">
        <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Calendário consolidado</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Veja compromissos e tarefas no calendário mensal ou em lista semanal.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                {viewMode === 'month' ? <CalendarDays className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
                {viewMode === 'month' ? 'Visualização mensal' : 'Visualização semanal'}
              </div>

              <div className={`inline-flex items-center gap-2 rounded-xl border p-1 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                <button type="button" onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className={`min-w-[170px] text-center text-sm font-medium capitalize ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{monthLabel(currentDate)}</div>
                <button type="button" onClick={() => setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${isDark ? 'text-zinc-300 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'}`}>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className={`rounded-[28px] border p-10 text-center text-sm shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-400' : 'border-zinc-200 bg-white text-zinc-500'}`}>
            Carregando eventos...
          </div>
        ) : null}

        {!loading && viewMode === 'month' ? (
          <section className={`overflow-hidden rounded-[28px] border shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <div className={`grid grid-cols-7 border-b ${isDark ? 'border-zinc-700 bg-white' : 'border-zinc-200 bg-zinc-50/80'}`}>
              {weekdayLabels.map((day) => (
                <div key={day} className={`px-4 py-3 text-sm font-medium ${isDark ? 'text-black' : 'text-zinc-500'}`}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const key = toDateKey(day)
                const dayEvents = eventsByDay[key] || []
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = key === toDateKey(new Date())

                return (
                  <div key={key} className={`min-h-[160px] border-b border-r p-3 ${isDark ? 'border-zinc-700' : 'border-zinc-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                        isToday
                          ? isDark
                            ? 'bg-white text-black'
                            : 'bg-zinc-950 text-white'
                          : isCurrentMonth
                            ? isDark
                              ? 'text-zinc-100'
                              : 'text-zinc-950'
                            : 'text-zinc-400'
                      }`}>
                        {day.getDate()}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{dayEvents.length ? `${dayEvents.length} item(ns)` : ''}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {dayEvents.slice(0, 3).map((evento) => (
                        <a
                          key={evento.id}
                          href={evento.extendedProps?.editUrl || '#'}
                          onClick={(e) => {
                            if (!evento.extendedProps?.editUrl) {
                              e.preventDefault()
                            }
                          }}
                          className={`block rounded-xl border px-3 py-2 text-xs ${evento.extendedProps?.tipo === 'compromisso' ? permissionTone(evento.extendedProps?.permissao) : eventTone(evento.extendedProps?.tipo)}`}
                        >
                          <div className="font-medium text-slate-950">{evento.title}</div>
                          <div className="mt-1 text-slate-700">{evento.allDay ? 'Dia inteiro' : formatDateTime(evento.start)}</div>
                          {evento.extendedProps?.owner ? <div className="mt-1 text-slate-600">Owner: {evento.extendedProps.owner}</div> : null}
                        </a>
                      ))}

                      {dayEvents.length > 3 ? (
                        <div className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>+{dayEvents.length - 3} mais</div>
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
              <div key={group.label} className={`rounded-[24px] border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{group.label}</h3>
                    <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{group.shortDate}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
                    <ListChecks className="h-3.5 w-3.5" />
                    {group.items.length} item(ns)
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {group.items.length ? group.items.map((evento) => (
                    <div key={evento.id} className={`rounded-2xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full border px-2.5 py-1 text-xs ${evento.extendedProps?.tipo === 'compromisso' ? permissionTone(evento.extendedProps?.permissao) : eventTone(evento.extendedProps?.tipo)}`}>
                              {evento.extendedProps?.tipo === 'todo' ? 'Tarefa' : 'Compromisso'}
                            </span>
                            {evento.extendedProps?.permissao ? <span className={`rounded-full border px-2.5 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-300' : 'border-zinc-200 text-zinc-600'}`}>{evento.extendedProps.permissao}</span> : null}
                            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{evento.allDay ? 'Dia inteiro' : formatDateTime(evento.start)}</span>
                          </div>
                          <h4 className={`mt-2 text-base font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{evento.title}</h4>
                          {evento.extendedProps?.owner ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Owner: {evento.extendedProps.owner}</p> : null}
                          {evento.extendedProps?.descricao ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{evento.extendedProps.descricao}</p> : null}
                        </div>
                        {evento.extendedProps?.editUrl ? (
                          <a href={evento.extendedProps.editUrl} className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
                            Editar
                          </a>
                        ) : (
                          <span className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-500' : 'border-zinc-200 bg-white text-zinc-400'}`}>
                            Somente leitura
                          </span>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className={`rounded-2xl border border-dashed p-6 text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
                      Nenhum item programado para este dia.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {!loading && eventos.length === 0 ? (
          <div className={`rounded-[28px] border border-dashed p-10 text-center text-sm shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-400' : 'border-zinc-300 bg-white text-zinc-500'}`}>
            Nenhum evento encontrado no período atual.
          </div>
        ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
