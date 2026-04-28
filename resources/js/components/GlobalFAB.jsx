import React, { useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Activity, BellPlus, CalendarPlus2, CheckSquare2, FolderKanban, Plus, X } from 'lucide-react'

export default function GlobalFAB({ permissions = {}, currentPath = '' }) {
  const [open, setOpen] = useState(false)

  const items = useMemo(() => {
    const nextItems = []

    if (permissions.compromissos) {
      nextItems.push({ key: 'compromisso', label: 'Compromisso', href: '/compromissos/create', icon: CalendarPlus2 })
      nextItems.push({ key: 'lembrete', label: 'Lembrete', href: '/lembretes/create', icon: BellPlus })
    }

    if (permissions.dia_a_dia) {
      nextItems.push({ key: 'tarefa', label: 'Tarefa', href: '/todo', icon: CheckSquare2 })
    }

    if (permissions.projetos) {
      nextItems.push({ key: 'kanban', label: 'Kanban', href: '/kanban', icon: FolderKanban })
    }

    if (permissions.saude) {
      nextItems.push({ key: 'atividade', label: 'Atividade', href: '/saude/atividades', icon: Activity })
    }

    return nextItems
  }, [permissions])

  if (!items.length || currentPath.startsWith('/login')) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? items.map((item, index) => {
        const Icon = item.icon

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setOpen(false)
              router.visit(item.href)
            }}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg transition hover:-translate-y-0.5"
            style={{ transitionDelay: `${index * 25}ms` }}
          >
            <span>{item.label}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white">
              <Icon className="h-4 w-4" />
            </span>
          </button>
        )
      }) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-950 text-white shadow-[0_18px_38px_rgba(24,24,27,0.26)] transition hover:scale-[1.03]"
        aria-label={open ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  )
}
