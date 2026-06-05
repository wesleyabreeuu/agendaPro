import React from 'react'
import { Button } from '@/components/ui'
import { CalendarDays, Check, Clock3, HeartPulse, ListChecks, BellRing, FolderKanban, ArrowRight, CheckSquare2 } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const style = typeStyles[tipo] || typeStyles.tarefa
  const Icon = style.icon

  return (
    <article className={`rounded-xl border px-4 py-3 shadow-xs transition ${
      isDark
        ? 'border-zinc-700 bg-zinc-950 text-zinc-50 hover:border-zinc-600 hover:bg-zinc-900/70'
        : 'border-zinc-200 bg-white text-zinc-950 hover:border-zinc-300 hover:bg-zinc-50/40'
    }`}>
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
            isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`break-words text-sm font-medium leading-5 sm:text-[15px] ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{titulo}</h3>
            {descricao ? <p className={`mt-1 break-words text-sm leading-5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{descricao}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${
                isDark ? 'bg-zinc-800 text-zinc-200' : style.badge
              }`}>
                {style.label}
              </span>
              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${
                status === 'concluido'
                  ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-white'
                  : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
              }`}>
                {status === 'concluido' ? 'Concluído' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
            isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'
          }`}>
            <Clock3 className="h-3.5 w-3.5" />
            {hora || 'Sem hora'}
          </span>

          {canComplete ? (
            <Button
              type="button"
              onClick={onComplete}
              size="sm"
              className="h-8 w-auto rounded-lg px-3 text-xs"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Concluir
            </Button>
          ) : null}

          {canDelay ? (
            <Button
              type="button"
              onClick={onDelay}
              variant="outline"
              size="sm"
              className={`h-8 w-auto rounded-lg px-3 text-xs ${
                isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700'
              }`}
            >
              Adiar
            </Button>
          ) : null}

          {onOpen ? (
            <Button
              type="button"
              onClick={onOpen}
              variant="outline"
              size="sm"
              className={`h-8 w-auto rounded-lg px-3 text-xs ${
                isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700'
              }`}
            >
              Abrir
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
