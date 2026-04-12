import React, { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { useTheme } from '../../contexts/ThemeContext'

function buildShareText(compromisso) {
  const lines = [
    `Compromisso: ${compromisso.titulo}`,
    `Início: ${compromisso.data_inicio || 'Não definido'}`,
    `Fim: ${compromisso.data_fim || 'Não definido'}`,
  ]

  if (compromisso.owner?.nome) {
    lines.push(`Owner: ${compromisso.owner.nome}`)
  }

  if (compromisso.descricao) {
    lines.push(`Descrição: ${compromisso.descricao}`)
  }

  return lines.join('\n')
}

function CompromissoCard({ compromisso, onShare }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-base font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{compromisso.titulo}</h3>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{compromisso.categoria || 'Sem categoria'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {compromisso.permissao ? (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-200 text-zinc-700'}`}>
              {compromisso.permissao === 'owner' ? 'Owner' : compromisso.permissao}
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
        {compromisso.owner?.nome ? <p><span className={`font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Owner:</span> {compromisso.owner.nome}</p> : null}
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
                <span key={item.usuario_id} className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs text-black">
                  {item.nome} • {item.permissao}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {compromisso.descricao ? <p className={`pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{compromisso.descricao}</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {compromisso.pode_editar ? (
          <Link href={`/compromissos/${compromisso.id}/edit`} className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}>
            Editar
          </Link>
        ) : null}
        {compromisso.pode_compartilhar ? (
          <button
            type="button"
            onClick={() => onShare(compromisso)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700"
          >
            Compartilhar
          </button>
        ) : null}
        {compromisso.pode_excluir ? (
          <button
            type="button"
            onClick={() => router.delete(`/compromissos/${compromisso.id}`)}
            className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium ${isDark ? 'border-red-500/40 bg-zinc-900 text-red-400' : 'border-red-200 bg-white text-red-600'}`}
          >
            Excluir
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default function CompromissosIndex({ compromissos = [], compromissosCompartilhados = [], usuarios = [] }) {
  const [ownedItems, setOwnedItems] = useState(compromissos)
  const [sharedItems] = useState(compromissosCompartilhados)
  const [shareFeedback, setShareFeedback] = useState(null)

  const shareCompromisso = async (compromisso) => {
    const shareText = buildShareText(compromisso)
    const shareUrl = `${window.location.origin}/compromissos/${compromisso.id}/edit`

    setShareFeedback(null)

    try {
      if (navigator.share) {
        await navigator.share({
          title: compromisso.titulo,
          text: shareText,
          url: shareUrl,
        })

        return
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        setShareFeedback({ type: 'success', message: 'Detalhes do compromisso copiados para a área de transferência.' })
        return
      }

      throw new Error('Compartilhamento não suportado neste dispositivo.')
    } catch (error) {
      if (error?.name === 'AbortError') {
        return
      }

      setShareFeedback({ type: 'error', message: error.message || 'Não foi possível compartilhar este compromisso.' })
    }
  }

  return (
    <AppLayout title="Compromissos">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Compromissos</h2>
            <p className="text-sm text-zinc-500">Gerencie agenda, recorrências e lembretes vinculados.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/compromissos/calendario" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
              Calendário
            </Link>
            <Link href="/compromissos/create" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
              Novo compromisso
            </Link>
          </div>
        </div>

        {shareFeedback ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${
            shareFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {shareFeedback.message}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Meus compromissos</h3>
            <p className="text-sm text-zinc-500">Você é owner destes compromissos e pode compartilhá-los com outras pessoas.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ownedItems.map((compromisso) => (
              <CompromissoCard key={compromisso.id} compromisso={compromisso} onShare={shareCompromisso} />
            ))}
          </div>
        </div>

        {sharedItems.length ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-950">Compartilhados comigo</h3>
              <p className="text-sm text-zinc-500">Compromissos de outros usuários aos quais você recebeu acesso.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sharedItems.map((compromisso) => (
                <CompromissoCard key={`shared-${compromisso.id}`} compromisso={compromisso} onShare={shareCompromisso} />
              ))}
            </div>
          </div>
        ) : null}

        {ownedItems.length === 0 && sharedItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-950">Nenhum compromisso cadastrado</h3>
            <p className="mt-2 text-sm text-zinc-500">Crie o primeiro compromisso para começar a organizar sua agenda.</p>
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}
