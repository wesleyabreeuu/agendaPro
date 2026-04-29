import React, { useEffect, useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Flame, ListTodo, LoaderCircle, TrendingUp, Clock3, CheckCircle2, CircleDashed, ArrowUpRight } from 'lucide-react'
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

function compactCountLabel(total, label) {
  return `${total} ${label}`
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

  const pendingCount = Math.max((resumo.total || 0) - (resumo.concluidos || 0), 0)

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
        <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-700">
                <Flame className="h-3.5 w-3.5" />
                Foco agora
              </span>
              <span className="text-sm text-zinc-500">Uma leitura direta do seu dia, sem excesso de ruído.</span>
            </div>

            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-[40px]">Centro de comando do seu dia</h1>
                {nextActivity ? (
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-950">Próxima atividade</span>
                    <span>{nextActivity.titulo}</span>
                    <span className="text-zinc-400">•</span>
                    <span>{nextActivity.descricao || 'Sem descrição'}</span>
                    <span className="text-zinc-400">•</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
                      <Clock3 className="h-3.5 w-3.5" />
                      {nextActivity.hora_inicio || 'Sem hora'}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
                    <Clock3 className="h-4 w-4" />
                    Nenhuma atividade prevista para hoje.
                  </div>
                )}
              </div>

              <div className="space-y-3 xl:min-w-[560px]">
                <div className="flex flex-col items-start gap-2 xl:items-end">
                  <button
                    type="button"
                    onClick={() => router.visit('/meu-dia?visao=dia')}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
                  >
                    Fazer leitura do dia
                  </button>
                  <p className="text-sm text-zinc-500 xl:max-w-[280px] xl:text-right">
                    Abra a visao guiada com seus proximos passos, progresso e boas do dia sempre que quiser se reorganizar.
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-4">
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Dia</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{resumo.total}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Feitos</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{resumo.concluidos}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Pendentes</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{pendingCount}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-950 bg-zinc-950 px-4 py-3 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">Ritmo</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">{resumo.percentual}%</p>
                      </div>
                      <TrendingUp className="h-4 w-4 text-zinc-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Timeline</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Seu fluxo de hoje</h2>
            </div>
            {loading ? <LoaderCircle className="h-5 w-5 animate-spin text-zinc-400" /> : null}
          </div>

          <div className="mt-4 hidden grid-cols-[minmax(0,1.8fr)_120px_150px_190px] gap-3 px-4 text-xs uppercase tracking-[0.16em] text-zinc-400 lg:grid">
            <span>Nome</span>
            <span className="text-center">Tipo</span>
            <span className="text-center">Status</span>
            <span className="text-right">Hora e ações</span>
          </div>

          <div className="mt-3 space-y-2">
            {timeline.length ? timeline.map((item) => (
              <TimelineItem
                key={`${item.tipo}-${item.origem_id}`}
                tipo={item.tipo}
                titulo={item.titulo}
                descricao={item.descricao}
                hora={item.hora_inicio}
                status={item.status}
                canComplete={Boolean(item.pode_concluir) && actionLoading === ''}
                canDelay={Boolean(item.pode_adiar) && actionLoading === ''}
                onComplete={item.pode_concluir ? () => handleAction(item, 'concluir') : null}
                onDelay={item.pode_adiar ? () => handleAction(item, 'adiar') : null}
                onOpen={item.origem_url ? () => router.visit(item.origem_url) : null}
              />
            )) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 px-5 py-10 text-center text-sm text-zinc-500">
                Nenhum item programado na timeline de hoje.
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <ListTodo className="h-5 w-5 text-zinc-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pendências</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">O que ainda pede atenção</h2>
              </div>
            </div>

            <div className="mt-5 space-y-5">
              {Object.keys(pendenciasAgrupadas).length ? Object.entries(pendenciasAgrupadas).map(([grupo, items]) => (
                <div key={grupo} className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{sectionTitle(grupo)}</h3>
                  <div className="mt-3 space-y-2">
                    {items.map((item) => (
                      <TimelineItem
                        key={`${grupo}-${item.tipo}-${item.origem_id}`}
                        tipo={item.tipo}
                        titulo={item.titulo}
                        descricao={item.descricao}
                        hora={item.hora_inicio}
                        status={item.status}
                        canComplete={Boolean(item.pode_concluir) && actionLoading === ''}
                        canDelay={Boolean(item.pode_adiar) && actionLoading === ''}
                        onComplete={item.pode_concluir ? () => handleAction(item, 'concluir') : null}
                        onDelay={item.pode_adiar ? () => handleAction(item, 'adiar') : null}
                        onOpen={item.origem_url ? () => router.visit(item.origem_url) : null}
                      />
                    ))}
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 px-5 py-10 text-center text-sm text-zinc-500">
                  Nenhuma pendência fora da timeline por enquanto.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Resumo</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">Leitura rápida do dia</h2>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-2 rounded-full bg-zinc-950 transition-all" style={{ width: `${Math.min(resumo.percentual || 0, 100)}%` }} />
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-zinc-600">Concluídos</span>
                </div>
                <span className="text-lg font-semibold text-zinc-950">{compactCountLabel(resumo.concluidos, 'itens')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <CircleDashed className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-600">Pendentes</span>
                </div>
                <span className="text-lg font-semibold text-zinc-950">{compactCountLabel(pendingCount, 'itens')}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-600">Progresso</span>
                </div>
                <span className="text-lg font-semibold text-zinc-950">{resumo.percentual}%</span>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-zinc-600">
              {summaryMessage(resumo.percentual)}
            </p>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
