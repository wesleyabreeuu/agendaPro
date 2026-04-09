import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'

export default function CompromissosIndex({ compromissos = [] }) {
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {compromissos.map((compromisso) => (
            <div key={compromisso.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-950">{compromisso.titulo}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{compromisso.categoria || 'Sem categoria'}</p>
                </div>
                {compromisso.dia_inteiro ? (
                  <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">Dia inteiro</span>
                ) : null}
              </div>

              <div className="mt-4 space-y-2 text-sm text-zinc-600">
                <p><span className="font-medium text-zinc-900">Início:</span> {compromisso.data_inicio}</p>
                <p><span className="font-medium text-zinc-900">Fim:</span> {compromisso.data_fim || 'Não definido'}</p>
                {compromisso.telefone ? <p><span className="font-medium text-zinc-900">WhatsApp:</span> {compromisso.telefone}</p> : null}
                {compromisso.recorrencia ? (
                  <p>
                    <span className="font-medium text-zinc-900">Recorrência:</span> {compromisso.recorrencia}
                    {compromisso.recorrencia_intervalo ? ` a cada ${compromisso.recorrencia_intervalo}` : ''}
                  </p>
                ) : null}
                {compromisso.descricao ? <p className="pt-1 text-zinc-500">{compromisso.descricao}</p> : null}
              </div>

              <div className="mt-5 flex gap-2">
                <Link href={`/compromissos/${compromisso.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                  Editar
                </Link>
                <button
                  type="button"
                  onClick={() => router.delete(`/compromissos/${compromisso.id}`)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-600"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {compromissos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-zinc-950">Nenhum compromisso cadastrado</h3>
            <p className="mt-2 text-sm text-zinc-500">Crie o primeiro compromisso para começar a organizar sua agenda.</p>
          </div>
        ) : null}
      </div>
    </AppLayout>
  )
}
