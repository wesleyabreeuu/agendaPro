import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'

export default function LembretesIndex({ lembretes, proximos }) {
  return (
    <AppLayout title="Lembretes">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Próximos disparos</h3>
          <div className="mt-5 space-y-4">
            {proximos.length ? proximos.map((item) => (
              <div key={item.id} className="rounded-2xl border border-zinc-200 p-4">
                <p className="font-medium text-zinc-950">{item.titulo_exibicao}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.descricao_exibicao || 'Sem descrição complementar.'}</p>
                <p className="mt-1 text-sm text-zinc-500">{item.momento_disparo || 'Sem horário'}</p>
              </div>
            )) : <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">Nenhum lembrete pendente no momento.</div>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-end">
            <Link href="/lembretes/create" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Novo lembrete</Link>
          </div>
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left">Título</th>
                  <th className="px-4 py-3 text-left">Origem</th>
                  <th className="px-4 py-3 text-left">Antecedência</th>
                  <th className="px-4 py-3 text-left">Recorrência</th>
                  <th className="px-4 py-3 text-left">Próximo disparo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lembretes.map((lembrete) => (
                  <tr key={lembrete.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-950">{lembrete.titulo_exibicao}</div>
                      <div className="text-zinc-500">{lembrete.categoria || 'Sem categoria'}</div>
                    </td>
                    <td className="px-4 py-3">{lembrete.origem}</td>
                    <td className="px-4 py-3">{lembrete.minutos_antes > 0 ? `${lembrete.minutos_antes} min antes` : 'No horário'}</td>
                    <td className="px-4 py-3">{lembrete.recorrencia || 'Único'}</td>
                    <td className="px-4 py-3">{lembrete.momento_disparo || '-'}</td>
                    <td className="px-4 py-3">{lembrete.ativo ? 'Ativo' : 'Finalizado'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/lembretes/${lembrete.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2">Editar</Link>
                        <button onClick={() => router.delete(`/lembretes/${lembrete.id}`)} className="rounded-md border border-red-200 px-3 py-2 text-red-600">Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
