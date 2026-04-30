import React, { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import { CalendarDays, MoreHorizontal, Pencil, Plus, Repeat2, Share2, Trash2 } from 'lucide-react'

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
    <Card className={`rounded-xl shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
      <CardHeader className="gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'}`}>
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <CardTitle className={isDark ? 'text-zinc-50' : 'text-zinc-950'}>{compromisso.titulo}</CardTitle>
            <CardDescription>{formatCategoryLabel(compromisso)}</CardDescription>
          </div>
        </div>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="icon-sm" className={isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-card text-zinc-700'}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {compromisso.pode_editar ? (
                <DropdownMenuItem onClick={() => router.visit(`/compromissos/${compromisso.id}/edit`)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              ) : null}
              {compromisso.pode_excluir ? (
                <DropdownMenuItem variant="destructive" onClick={() => router.delete(`/compromissos/${compromisso.id}`)}>
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
        <div className="flex flex-wrap gap-2">
          {compromisso.permissao ? (
            <Badge variant="outline">{formatPermissionLabel(compromisso.permissao)}</Badge>
          ) : null}
          {compromisso.dia_inteiro ? (
            <Badge variant="secondary">Dia inteiro</Badge>
          ) : null}
          {compromisso.recorrencia ? (
            <Badge variant="info" className="gap-1">
              <Repeat2 className="h-3 w-3" />
              {compromisso.recorrencia}
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className={`space-y-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
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
            <p className={`inline-flex items-center gap-2 font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              <Share2 className="h-4 w-4" />
              Compartilhado com
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {compromisso.compartilhado_com.map((item) => (
                <Badge key={item.usuario_id} variant="secondary">
                  {item.nome} • {formatPermissionLabel(item.permissao)}
                </Badge>
              ))}
            </div>
          </div>
        ) : null}
        {compromisso.descricao ? <p className={`pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{compromisso.descricao}</p> : null}
      </CardContent>

      <CardFooter className={`gap-2 ${isDark ? 'border-zinc-700 bg-zinc-950/60' : 'border-zinc-100 bg-zinc-50/80'}`}>
        {compromisso.pode_editar ? (
          <Button asChild variant="outline" className={`h-9 w-auto gap-2 rounded-lg px-3 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-card text-zinc-900'}`}>
            <Link href={`/compromissos/${compromisso.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        ) : null}
        {compromisso.pode_excluir ? (
          <Button type="button" onClick={() => router.delete(`/compromissos/${compromisso.id}`)} variant="outline" className={`h-9 w-auto gap-2 rounded-lg px-3 ${isDark ? 'border-red-500/40 bg-zinc-900 text-red-400' : 'border-red-200 bg-white text-red-600'}`}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        ) : null}
      </CardFooter>
    </Card>
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
            <Button asChild variant="outline" className={`w-auto rounded-lg px-4 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-card text-zinc-900'}`}>
              <Link href="/compromissos/calendario">
                <CalendarDays className="h-4 w-4" />
              Calendário
              </Link>
            </Button>
            <Button asChild className="w-auto rounded-lg px-4">
              <Link href="/compromissos/create">
                <Plus className="h-4 w-4" />
              Novo compromisso
              </Link>
            </Button>
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
          <div className={`rounded-xl border border-dashed p-10 text-center shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-white'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Nenhum compromisso cadastrado</h3>
            <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Crie o primeiro compromisso para começar a organizar sua agenda.</p>
          </div>
        ) : null}
      </div>

    </AppLayout>
  )
}
