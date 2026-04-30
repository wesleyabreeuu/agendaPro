import React, { useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui'
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
          <Button
            key={item.key}
            type="button"
            onClick={() => {
              setOpen(false)
              router.visit(item.href)
            }}
            variant="outline"
            className="h-auto gap-3 rounded-xl border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-xs"
            style={{ transitionDelay: `${index * 25}ms` }}
          >
            <span>{item.label}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <Icon className="h-4 w-4" />
            </span>
          </Button>
        )
      }) : null}

      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        size="icon-lg"
        className="h-14 w-14 rounded-xl shadow-xs"
        aria-label={open ? 'Fechar ações rápidas' : 'Abrir ações rápidas'}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </Button>
    </div>
  )
}
