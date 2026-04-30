import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import {
  Badge,
  Button,
  Card,
  CardContent,
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
import { MoreHorizontal, Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import { PageCardHeader } from '@/components/page'

export default function CategoriasIndex({ categorias }) {
  return (
    <AppLayout title="Categorias">
      <div className="space-y-6">
        <Card className="rounded-xl border-zinc-200 bg-card shadow-xs">
          <PageCardHeader
            icon={Tags}
            title="Categorias"
            description="Organize compromissos, lembretes e filtros por área."
            action={
              <Button asChild className="w-auto gap-2 rounded-lg px-4">
                <Link href="/categorias/create">
                  <Plus className="h-4 w-4" />
                  Nova categoria
                </Link>
              </Button>
            }
          />
          <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="w-40">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.length ? categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell className="font-mono text-xs text-zinc-500">#{categoria.id}</TableCell>
                  <TableCell className="font-medium text-zinc-950">{categoria.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Ativa</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline" size="icon-sm" className="rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => router.visit(`/categorias/${categoria.id}/edit`)}>
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => router.delete(`/categorias/${categoria.id}`)}>
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan="4" className="py-12 text-center">
                    <p className="font-medium text-zinc-950">Nenhuma categoria cadastrada</p>
                    <p className="mt-1 text-sm text-zinc-500">Crie a primeira categoria para organizar sua agenda.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
