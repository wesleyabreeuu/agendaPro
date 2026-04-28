import React from 'react'
import { CalendarDays, Check, Clock3, HeartPulse, ListChecks, BellRing, FolderKanban, ArrowRight, CheckSquare2 } from 'lucide-react'

const typeStyles = {
  compromisso: {
    badge: 'bg-zinc-100 text-zinc-700',
    icon: CalendarDays,
    label: 'Compromisso',
  },
  tarefa: {
    badge: 'bg-zinc-100 text-zinc-700',
    icon: CheckSquare2,
    label: 'Tarefa',
  },
  rotina: {
    badge: 'bg-zinc-100 text-zinc-700',
    icon: ListChecks,
    label: 'Rotina',
  },
  lembrete: {
    badge: 'bg-zinc-100 text-zinc-700',
    icon: BellRing,
    label: 'Lembrete',
  },
  atividade: {
    badge: 'bg-zinc-100 text-zinc-700',
    icon: HeartPulse,
    label: 'Atividade',
  },
  kanban: {
    badge: 'bg-zinc-100 text-zinc-700',
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
    <article className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-300 hover:bg-zinc-50/40">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.8fr)_120px_150px_190px] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-medium text-zinc-950 sm:text-[15px]">{titulo}</h3>
              {descricao ? <p className="mt-1 truncate text-sm text-zinc-500">{descricao}</p> : null}
            </div>
          </div>
        </div>

        <div className="flex items-center lg:justify-center">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${style.badge}`}>
            {style.label}
          </span>
        </div>

        <div className="flex items-center lg:justify-center">
          <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${status === 'concluido' ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
            {status === 'concluido' ? 'Concluído' : 'Pendente'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
            <Clock3 className="h-3.5 w-3.5" />
            {hora || 'Sem hora'}
          </span>

          {canComplete ? (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-950 px-3 text-xs font-medium text-white"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Concluir
            </button>
          ) : null}

          {canDelay ? (
            <button
              type="button"
              onClick={onDelay}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700"
            >
              Adiar
            </button>
          ) : null}

          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700"
            >
              Abrir
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
