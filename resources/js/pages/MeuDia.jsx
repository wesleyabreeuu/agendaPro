import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Flame, ListTodo, LoaderCircle, TrendingUp, Clock3 } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import TimelineItem from '../components/TimelineItem'

function summaryMessage(percentual) {
  if (percentual >= 80) return 'Você está indo muito bem hoje.'
  if (percentual >= 50) return 'Seu ritmo está consistente. Continue assim.'
  if (percentual > 0) return 'O dia já começou. Vamos transformar progresso em tração.'
  return 'Tudo pronto para você ganhar clareza e começar forte.'
}

function sectionTitle(grupo) {
  return {
    tarefas_sem_horario: 'Tarefas sem horário',
    kanban_vencendo_hoje: 'Kanban vencendo hoje',
    rotinas_sem_horario: 'Rotinas sem horário',
  }[grupo] || 'Pendências'
}

export default function MeuDia({ initialData = null }) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [actionLoading, setActionLoading] = useState('')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (initialData) {
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)

      try {
        const response = await fetch('/api/meu-dia', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })

        if (!response.ok) {
          throw new Error('Falha ao carregar o meu dia.')
        }

        const payload = await response.json()

        if (!cancelled) {
          setData(payload)
        }
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [initialData])

  const timeline = data?.timeline || []
  const pendencias = data?.pendencias || []
  const resumo = data?.resumo || { total: 0, concluidos: 0, percentual: 0 }
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const nextActivity = useMemo(() => {
    const pendingItems = timeline.filter((item) => item.status !== 'concluido')
    const upcoming = pendingItems.find((item) => item.hora_inicio && item.hora_inicio >= currentTime)

    return upcoming || pendingItems[0] || timeline[0] || null
  }, [currentTime, timeline])

  const pendenciasAgrupadas = useMemo(() => (
    pendencias.reduce((acc, item) => {
      const key = item.grupo || 'geral'
      acc[key] = [...(acc[key] || []), item]
      return acc
    }, {})
  ), [pendencias])

  async function refresh() {
    const response = await fetch('/api/meu-dia', {
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })

    if (!response.ok) {
      throw new Error('Falha ao atualizar o dia.')
    }

    const payload = await response.json()
    setData(payload)
  }

  async function handleAction(item, action) {
    const loadingKey = `${item.tipo}-${item.origem_id}-${action}`
    setActionLoading(loadingKey)

    try {
      const response = await fetch('/api/meu-dia/action', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          tipo: item.tipo,
          origem_id: item.origem_id,
          acao: action,
        }),
      })

      if (!response.ok) {
        throw new Error('Falha ao atualizar item da timeline.')
      }

      await refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setActionLoading('')
    }
  }

  return (
    <AppLayout title="Meu Dia" chrome="dashboard">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-zinc-200 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_32%,#ffffff_65%)] p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                <Flame className="h-3.5 w-3.5" />
                Foco agora
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">Centro de comando do seu dia</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                Uma visão consolidada com agenda, execução e o que ainda precisa de atenção para você sair do modo reativo.
              </p>

              <div className="mt-6 rounded-[28px] border border-zinc-200 bg-white/90 p-5 shadow-sm">
                {nextActivity ? (
                  <>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Próxima atividade</p>
                    <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{nextActivity.titulo}</h2>
                        <p className="mt-2 text-sm text-zinc-500">{nextActivity.descricao || 'Sem descrição adicional.'}</p>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Horário</p>
                        <p className="mt-2 text-xl font-semibold text-zinc-950">{nextActivity.hora_inicio || 'Sem hora'}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <Clock3 className="h-4 w-4" />
                    Nenhuma atividade prevista para hoje.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Itens do dia</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{resumo.total}</p>
              </div>
              <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-zinc-500">Concluídos</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950">{resumo.concluidos}</p>
              </div>
              <div className="rounded-[28px] border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-zinc-400">Resumo</p>
                    <p className="mt-3 text-4xl font-semibold tracking-tight">{resumo.percentual}%</p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-amber-300" />
                </div>
                <p className="mt-3 text-sm text-zinc-300">{summaryMessage(resumo.percentual)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Timeline</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Seu fluxo de hoje</h2>
            </div>
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-zinc-400" /> : null}
          </div>

          <div className="mt-5 space-y-4">
            {timeline.length ? timeline.map((item) => (
              <TimelineItem
                key={`${item.tipo}-${item.origem_id}`}
                tipo={item.tipo}
                titulo={item.titulo}
                descricao={item.descricao}
                hora={item.hora_inicio}
                status={item.status}
                canComplete={Boolean(item.pode_concluir) && actionLoading === '' }
                canDelay={Boolean(item.pode_adiar) && actionLoading === '' }
                onComplete={item.pode_concluir ? () => handleAction(item, 'concluir') : null}
                onDelay={item.pode_adiar ? () => handleAction(item, 'adiar') : null}
                onOpen={item.origem_url ? () => router.visit(item.origem_url) : null}
              />
            )) : (
              <div className="rounded-[26px] border border-dashed border-zinc-300 px-5 py-10 text-center text-sm text-zinc-500">
                Nenhum item programado na timeline de hoje.
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[30px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <ListTodo className="h-5 w-5 text-zinc-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pendências</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">O que ainda pede atenção</h2>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {Object.keys(pendenciasAgrupadas).length ? Object.entries(pendenciasAgrupadas).map(([grupo, items]) => (
                <div key={grupo} className="rounded-[24px] border border-zinc-200 bg-zinc-50/70 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">{sectionTitle(grupo)}</h3>
                  <div className="mt-3 space-y-3">
                    {items.map((item) => (
                      <TimelineItem
                        key={`${grupo}-${item.tipo}-${item.origem_id}`}
                        tipo={item.tipo}
                        titulo={item.titulo}
                        descricao={item.descricao}
                        hora={item.hora_inicio}
                        status={item.status}
                        canComplete={Boolean(item.pode_concluir) && actionLoading === '' }
                        canDelay={Boolean(item.pode_adiar) && actionLoading === '' }
                        onComplete={item.pode_concluir ? () => handleAction(item, 'concluir') : null}
                        onDelay={item.pode_adiar ? () => handleAction(item, 'adiar') : null}
                        onOpen={item.origem_url ? () => router.visit(item.origem_url) : null}
                      />
                    ))}
                  </div>
                </div>
              )) : (
                <div className="rounded-[26px] border border-dashed border-zinc-300 px-5 py-10 text-center text-sm text-zinc-500">
                  Nenhuma pendência fora da timeline por enquanto.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-zinc-200 bg-zinc-950 p-6 text-white shadow-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Resumo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Leitura rápida do dia</h2>
            <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-3 rounded-full bg-amber-300 transition-all" style={{ width: `${Math.min(resumo.percentual || 0, 100)}%` }} />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Total</p>
                <p className="mt-2 text-3xl font-semibold">{resumo.total}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Concluídos</p>
                <p className="mt-2 text-3xl font-semibold">{resumo.concluidos}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-zinc-400">Percentual</p>
                <p className="mt-2 text-3xl font-semibold">{resumo.percentual}%</p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-6 text-zinc-300">
              {summaryMessage(resumo.percentual)}
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
