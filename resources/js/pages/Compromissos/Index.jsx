import React, { useMemo, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { X } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'

function CompromissoCard({ compromisso, onOpenShare }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-zinc-950">{compromisso.titulo}</h3>
          <p className="mt-1 text-sm text-zinc-500">{compromisso.categoria || 'Sem categoria'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {compromisso.permissao ? (
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
              {compromisso.permissao === 'owner' ? 'Owner' : compromisso.permissao}
            </span>
          ) : null}
          {compromisso.dia_inteiro ? (
            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">Dia inteiro</span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-zinc-600">
        <p><span className="font-medium text-zinc-900">Início:</span> {compromisso.data_inicio}</p>
        <p><span className="font-medium text-zinc-900">Fim:</span> {compromisso.data_fim || 'Não definido'}</p>
        {compromisso.owner?.nome ? <p><span className="font-medium text-zinc-900">Owner:</span> {compromisso.owner.nome}</p> : null}
        {compromisso.telefone ? <p><span className="font-medium text-zinc-900">WhatsApp:</span> {compromisso.telefone}</p> : null}
        {compromisso.recorrencia ? (
          <p>
            <span className="font-medium text-zinc-900">Recorrência:</span> {compromisso.recorrencia}
            {compromisso.recorrencia_intervalo ? ` a cada ${compromisso.recorrencia_intervalo}` : ''}
          </p>
        ) : null}
        {compromisso.compartilhado_com?.length ? (
          <div className="pt-1">
            <p className="font-medium text-zinc-900">Compartilhado com</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {compromisso.compartilhado_com.map((item) => (
                <span key={item.usuario_id} className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700">
                  {item.nome} • {item.permissao}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {compromisso.descricao ? <p className="pt-1 text-zinc-500">{compromisso.descricao}</p> : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {compromisso.pode_editar ? (
          <Link href={`/compromissos/${compromisso.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
            Editar
          </Link>
        ) : null}
        {compromisso.pode_compartilhar ? (
          <button
            type="button"
            onClick={() => onOpenShare(compromisso)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700"
          >
            Compartilhar
          </button>
        ) : null}
        {compromisso.pode_excluir ? (
          <button
            type="button"
            onClick={() => router.delete(`/compromissos/${compromisso.id}`)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600"
          >
            Excluir
          </button>
        ) : null}
      </div>
    </div>
  )
}

function SharePanel({ compromisso, usuarios = [], onClose, onSave, onRemove, processing }) {
  const [usuarioId, setUsuarioId] = useState('')
  const [permissao, setPermissao] = useState('visualizar')

  const availableUsers = useMemo(
    () => usuarios.filter((usuario) => !compromisso?.compartilhado_com?.some((item) => item.usuario_id === usuario.id)),
    [usuarios, compromisso]
  )

  if (!compromisso) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/55 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950">Compartilhar compromisso</h3>
            <p className="mt-1 text-sm text-zinc-600">{compromisso.titulo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
            aria-label="Fechar compartilhamento"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
          <select
            value={usuarioId}
            onChange={(e) => setUsuarioId(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 shadow-sm"
          >
            <option value="">Selecione um usuário</option>
            {availableUsers.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.name} {usuario.email ? `• ${usuario.email}` : ''}
              </option>
            ))}
          </select>
          <select
            value={permissao}
            onChange={(e) => setPermissao(e.target.value)}
            className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-950 shadow-sm"
          >
            <option value="visualizar">visualizar</option>
            <option value="editar">editar</option>
          </select>
          <button
            type="button"
            disabled={processing || !usuarioId}
            onClick={async () => {
              const saved = await onSave(compromisso.id, Number(usuarioId), permissao)
              if (saved) {
                setUsuarioId('')
                setPermissao('visualizar')
              }
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {compromisso.compartilhado_com?.length ? (
            compromisso.compartilhado_com.map((item) => (
              <div key={item.usuario_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-950">{item.nome}</p>
                  <p className="text-sm text-zinc-500">{item.email || 'Sem e-mail'} • {item.permissao}</p>
                </div>
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => onRemove(compromisso.id, item.usuario_id)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600 disabled:opacity-60"
                >
                  Remover
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-500">
              Este compromisso ainda não foi compartilhado com ninguém.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CompromissosIndex({ compromissos = [], compromissosCompartilhados = [], usuarios = [] }) {
  const [ownedItems, setOwnedItems] = useState(compromissos)
  const [sharedItems] = useState(compromissosCompartilhados)
  const [activeShareId, setActiveShareId] = useState(null)
  const [processingShare, setProcessingShare] = useState(false)
  const [shareFeedback, setShareFeedback] = useState(null)

  const activeCompromisso = useMemo(
    () => ownedItems.find((item) => item.id === activeShareId) || null,
    [ownedItems, activeShareId]
  )

  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const updateOwnedCompromisso = (compromissoId, updater) => {
    setOwnedItems((current) => current.map((item) => (item.id === compromissoId ? updater(item) : item)))
  }

  const shareCompromisso = async (compromissoId, usuarioId, permissao) => {
    setProcessingShare(true)
    setShareFeedback(null)

    try {
      const response = await fetch(`/api/compromissos/${compromissoId}/compartilhar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrf(),
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ usuario_id: usuarioId, permissao }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Falha ao compartilhar compromisso.')
      }

      const selectedUser = usuarios.find((usuario) => usuario.id === usuarioId)

      updateOwnedCompromisso(compromissoId, (item) => ({
        ...item,
        compartilhado_com: [
          ...(item.compartilhado_com || []).filter((entry) => entry.usuario_id !== usuarioId),
          {
            usuario_id: usuarioId,
            nome: selectedUser?.name || 'Usuário',
            email: selectedUser?.email || '',
            permissao,
          },
        ],
      }))
      setShareFeedback({ type: 'success', message: 'Compartilhamento salvo com sucesso.' })
      return true
    } catch (error) {
      setShareFeedback({ type: 'error', message: error.message || 'Falha ao compartilhar compromisso.' })
      return false
    } finally {
      setProcessingShare(false)
    }
  }

  const removeShare = async (compromissoId, usuarioId) => {
    setProcessingShare(true)
    setShareFeedback(null)

    try {
      const response = await fetch(`/api/compromissos/${compromissoId}/compartilhar/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrf(),
          Accept: 'application/json',
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || 'Falha ao remover compartilhamento.')
      }

      updateOwnedCompromisso(compromissoId, (item) => ({
        ...item,
        compartilhado_com: (item.compartilhado_com || []).filter((entry) => entry.usuario_id !== usuarioId),
      }))
      setShareFeedback({ type: 'success', message: 'Acesso removido com sucesso.' })
    } catch (error) {
      setShareFeedback({ type: 'error', message: error.message || 'Falha ao remover compartilhamento.' })
    } finally {
      setProcessingShare(false)
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
              <CompromissoCard key={compromisso.id} compromisso={compromisso} onOpenShare={setActiveShareId} />
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
                <CompromissoCard key={`shared-${compromisso.id}`} compromisso={compromisso} onOpenShare={() => {}} />
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
      {activeCompromisso ? (
        <SharePanel
          compromisso={activeCompromisso}
          usuarios={usuarios}
          processing={processingShare}
          onClose={() => {
            setActiveShareId(null)
            setShareFeedback(null)
          }}
          onSave={shareCompromisso}
          onRemove={removeShare}
        />
      ) : null}
    </AppLayout>
  )
}
