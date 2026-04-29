import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

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
            <Button asChild className="w-auto">
              <Link href="/lembretes/create">Novo lembrete</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Título</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Antecedência</TableHead>
                  <TableHead>Recorrência</TableHead>
                  <TableHead>Próximo disparo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lembretes.map((lembrete) => (
                  <TableRow key={lembrete.id}>
                    <TableCell>
                      <div className="font-medium text-zinc-950">{lembrete.titulo_exibicao}</div>
                      <div className="text-zinc-500">{lembrete.categoria || 'Sem categoria'}</div>
                    </TableCell>
                    <TableCell>{lembrete.origem}</TableCell>
                    <TableCell>{lembrete.minutos_antes > 0 ? `${lembrete.minutos_antes} min antes` : 'No horário'}</TableCell>
                    <TableCell>{lembrete.recorrencia || 'Único'}</TableCell>
                    <TableCell>{lembrete.momento_disparo || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={lembrete.ativo ? 'success' : 'secondary'}>{lembrete.ativo ? 'Ativo' : 'Finalizado'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Link href={`/lembretes/${lembrete.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2">Editar</Link>
                        <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/lembretes/${lembrete.id}`)}>Excluir</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
