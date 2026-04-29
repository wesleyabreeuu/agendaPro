import React, { useMemo, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui'
import { Clock3, MoreHorizontal, TableProperties } from 'lucide-react'

export default function LembretesIndex({ lembretes, proximos }) {
  const [selectedUpcoming, setSelectedUpcoming] = useState(null)
  const upcomingById = useMemo(() => Object.fromEntries(proximos.map((item) => [item.id, item])), [proximos])

  return (
    <AppLayout title="Lembretes">
      <div className="space-y-4">
        <Tabs defaultValue="lista" className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="lista" className="gap-2">
                <TableProperties className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="proximos" className="gap-2">
                <Clock3 className="h-4 w-4" />
                Próximos disparos
              </TabsTrigger>
            </TabsList>
          <div className="flex justify-end">
            <Button asChild className="w-auto">
              <Link href="/lembretes/create">Novo lembrete</Link>
            </Button>
          </div>
          </div>

          <TabsContent value="proximos">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Próximos disparos</h3>
              <div className="mt-5 space-y-4">
                {proximos.length ? proximos.map((item) => (
                  <Button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedUpcoming(item)}
                    variant="outline"
                    className="h-auto w-full justify-start rounded-2xl p-4 text-left transition hover:bg-zinc-50"
                  >
                    <p className="font-medium text-zinc-950">{item.titulo_exibicao}</p>
                    <p className="mt-1 text-sm text-zinc-500">{item.descricao_exibicao || 'Sem descrição complementar.'}</p>
                    <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-500">
                      <Clock3 className="h-4 w-4" />
                      {item.momento_disparo || 'Sem horário'}
                    </p>
                  </Button>
                )) : <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">Nenhum lembrete pendente no momento.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lista">
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
                      <HoverCard openDelay={120}>
                        <HoverCardTrigger asChild>
                          <Button type="button" variant="ghost" className="h-auto justify-start p-0 text-left hover:bg-transparent">
                            <div className="font-medium text-zinc-950">{lembrete.titulo_exibicao}</div>
                            <div className="text-zinc-500">{lembrete.categoria || 'Sem categoria'}</div>
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent align="start" className="w-80 space-y-3">
                          <div>
                            <p className="font-medium text-zinc-950">{lembrete.titulo_exibicao}</p>
                            <p className="mt-1 text-sm text-zinc-500">{lembrete.descricao || lembrete.categoria || 'Sem descrição complementar.'}</p>
                          </div>
                          <div className="grid gap-2 text-xs text-zinc-500">
                            <div className="flex items-center justify-between gap-3">
                              <span>Próximo disparo</span>
                              <span className="font-medium text-zinc-800">{lembrete.momento_disparo || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Antecedência</span>
                              <span className="font-medium text-zinc-800">{lembrete.minutos_antes > 0 ? `${lembrete.minutos_antes} min antes` : 'No horário'}</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>{lembrete.origem}</TableCell>
                    <TableCell>{lembrete.minutos_antes > 0 ? `${lembrete.minutos_antes} min antes` : 'No horário'}</TableCell>
                    <TableCell>{lembrete.recorrencia || 'Único'}</TableCell>
                    <TableCell>{lembrete.momento_disparo || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={lembrete.ativo ? 'success' : 'secondary'}>{lembrete.ativo ? 'Ativo' : 'Finalizado'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="outline" size="icon-sm" className="w-auto">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Ações do lembrete</TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.visit(`/lembretes/${lembrete.id}/edit`)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedUpcoming(upcomingById[lembrete.id] || {
                            id: lembrete.id,
                            titulo_exibicao: lembrete.titulo_exibicao,
                            descricao_exibicao: lembrete.categoria || 'Sem descrição complementar.',
                            momento_disparo: lembrete.momento_disparo || '-',
                          })}>
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => router.delete(`/lembretes/${lembrete.id}`)}>
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={Boolean(selectedUpcoming)} onOpenChange={(open) => !open && setSelectedUpcoming(null)}>
        <SheetContent>
          {selectedUpcoming ? (
            <>
              <SheetHeader>
                <SheetTitle>{selectedUpcoming.titulo_exibicao}</SheetTitle>
                <SheetDescription>Detalhes do próximo lembrete agendado</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-4">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Descrição</p>
                  <p className="mt-2 text-sm text-zinc-800">{selectedUpcoming.descricao_exibicao || 'Sem descrição complementar.'}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Próximo disparo</p>
                  <p className="mt-2 text-sm text-zinc-800">{selectedUpcoming.momento_disparo || 'Sem horário'}</p>
                </div>
                <Button asChild className="w-full">
                  <Link href={selectedUpcoming.id ? `/lembretes/${selectedUpcoming.id}/edit` : '/lembretes'}>Abrir lembrete</Link>
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppLayout>
  )
}
