import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page'

export default function RegrasIndex({ regras }) {
  return (
    <AppLayout title="Regras">
      <div className="space-y-6">
        <PageCard>
          <PageCardHeader
            icon={ShieldCheck}
            title="Regras"
            description="Controle os grupos de acesso disponíveis no sistema."
            action={
              <Button asChild className="w-auto gap-2 rounded-lg px-4">
                <Link href="/regras/create">
                  <Plus className="h-4 w-4" />
                  Nova regra
                </Link>
              </Button>
            }
          />
          <PageCardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regras.map((regra) => (
                <TableRow key={regra.id}>
                  <TableCell className="font-medium text-zinc-950">{regra.nome}</TableCell>
                  <TableCell><Badge variant="outline">{regra.slug}</Badge></TableCell>
                  <TableCell>{regra.descricao || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="icon-sm" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => router.visit(`/regras/${regra.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => router.delete(`/regras/${regra.id}`)}>
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </PageCardContent>
        </PageCard>
      </div>
    </AppLayout>
  )
}
