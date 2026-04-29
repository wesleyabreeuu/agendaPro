import React, { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Button } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'

function formatPermissionLabel(permission) {
  return {
    owner: 'Dono',
    visualizar: 'Pode visualizar',
    editar: 'Pode editar',
  }[permission] || permission
}

function formatCategoryLabel(compromisso) {
  if (!compromisso.categoria) {
    return 'Sem categoria'
  }

  return typeof compromisso.categoria === 'string' ? compromisso.categoria : compromisso.categoria.nome
}

function CompromissoCard({ compromisso }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-base font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{compromisso.titulo}</h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{formatCategoryLabel(compromisso)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {compromisso.permissao ? (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-200 text-zinc-700'}`}>
              {formatPermissionLabel(compromisso.permissao)}
            </span>
          ) : null}
          {compromisso.dia_inteiro ? (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-200 text-zinc-700'}`}>Dia inteiro</span>
          ) : null}
        </div>
      </div>

      <div className={`mt-4 space-y-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
        <p><span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Início:</span> {compromisso.data_inicio}</p>
        <p><span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Fim:</span> {compromisso.data_fim || 'Não definido'}</p>
        {compromisso.owner?.nome ? <p><span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Dono:</span> {compromisso.owner.nome}</p> : null}
        {compromisso.telefone ? <p><span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>WhatsApp:</span> {compromisso.telefone}</p> : null}
        {compromisso.recorrencia ? (
          <p>
            <span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Recorrência:</span> {compromisso.recorrencia}
            {compromisso.recorrencia_intervalo ? ` a cada ${compromisso.recorrencia_intervalo}` : ''}
          </p>
        ) : null}
        {compromisso.compartilhado_com?.length ? (
          <div className="pt-1">
            <p className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Compartilhado com</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {compromisso.compartilhado_com.map((item) => (
                <span
                  key={item.usuario_id}
                  className={`rounded-full border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-zinc-100 text-black'}`}
                >
                  {item.nome} • {formatPermissionLabel(item.permissao)}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {compromisso.descricao ? <p className={`pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{compromisso.descricao}</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {compromisso.pode_editar ? (
          <Button asChild variant="outline" className={`h-10 w-auto rounded-md px-4 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
            <Link href={`/compromissos/${compromisso.id}/edit`}>Editar</Link>
          </Button>
        ) : null}
        {compromisso.pode_excluir ? (
          <Button type="button" onClick={() => router.delete(`/compromissos/${compromisso.id}`)} variant="outline" className={`h-10 w-auto rounded-md px-4 ${isDark ? 'border-red-500/40 bg-zinc-900 text-red-400' : 'border-red-200 bg-white text-red-600'}`}>
            Excluir
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export default function CompromissosIndex({ compromissos = [], compromissosCompartilhados = [] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [ownedItems] = useState(compromissos)
  const [sharedItems] = useState(compromissosCompartilhados)

  return (
    <AppLayout title="Compromissos">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Compromissos</h2>
            <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-500'} text-sm`}>Gerencie agenda e recorrências do seu dia a dia.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/compromissos/calendario" className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
              Calendário
            </Link>
            <Link href="/compromissos/create" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white dark:bg-white dark:text-black">
              Novo compromisso
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Meus compromissos</h3>
            <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Você é o dono destes compromissos e pode compartilhá-los com outros usuários cadastrados.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ownedItems.map((compromisso) => (
              <CompromissoCard key={compromisso.id} compromisso={compromisso} />
            ))}
          </div>
        </div>

        {sharedItems.length ? (
          <div className="space-y-4">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Compartilhados comigo</h3>
              <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Compromissos de outros usuários aos quais você recebeu acesso.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sharedItems.map((compromisso) => (
                <CompromissoCard key={`shared-${compromisso.id}`} compromisso={compromisso} />
              ))}
            </div>
          </div>
        ) : null}

        {ownedItems.length === 0 && sharedItems.length === 0 ? (
          <div className={`rounded-3xl border border-dashed p-10 text-center shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Nenhum compromisso cadastrado</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie o primeiro compromisso para começar a organizar sua agenda.</p>
          </div>
        ) : null}
      </div>

    </AppLayout>
  )
}
