import React from 'react'
import { CalendarDays, Check, Clock3, HeartPulse, ListChecks, BellRing, FolderKanban, ArrowRight } from 'lucide-react'

const typeStyles = {
  compromisso: {
    stripe: 'bg-fuchsia-500',
    badge: 'bg-fuchsia-50 text-fuchsia-700',
    icon: CalendarDays,
    label: 'Compromisso',
  },
  tarefa: {
    stripe: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700',
    icon: Check,
    label: 'Tarefa',
  },
  rotina: {
    stripe: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700',
    icon: ListChecks,
    label: 'Rotina',
  },
  lembrete: {
    stripe: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700',
    icon: BellRing,
    label: 'Lembrete',
  },
  atividade: {
    stripe: 'bg-rose-500',
    badge: 'bg-rose-50 text-rose-700',
    icon: HeartPulse,
    label: 'Atividade',
  },
  kanban: {
    stripe: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-700',
    icon: FolderKanban,
    label: 'Kanban',
  },
}

export default function TimelineItem({
  tipo,
  titulo,
  hora,
  status,
  descricao = '',
  onComplete = null,
  onDelay = null,
  onOpen = null,
  canComplete = false,
  canDelay = false,
}) {
  const style = typeStyles[tipo] || typeStyles.tarefa
  const Icon = style.icon

  return (
    <article className="overflow-hidden rounded-[26px] border border-zinc-200 bg-white shadow-sm">
      <div className="flex">
        <div className={`w-1.5 ${style.stripe}`} />
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${style.badge}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {style.label}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${status === 'concluido' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
                  {status === 'concluido' ? 'Concluído' : 'Pendente'}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-950 sm:text-lg">{titulo}</h3>
                {descricao ? <p className="mt-1 text-sm text-zinc-500">{descricao}</p> : null}
              </div>
            </div>

            <div className="flex min-w-[96px] items-center justify-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-700">
              <Clock3 className="h-4 w-4" />
              <span>{hora || 'Sem hora'}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {canComplete ? (
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                Concluir
              </button>
            ) : null}

            {canDelay ? (
              <button
                type="button"
                onClick={onDelay}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900"
              >
                Adiar
              </button>
            ) : null}

            {onOpen ? (
              <button
                type="button"
                onClick={onOpen}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium text-zinc-700"
              >
                Abrir
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
