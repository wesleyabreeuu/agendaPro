import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

export default function CategoriasIndex({ categorias }) {
  return (
    <AppLayout title="Categorias">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button asChild className="w-auto">
            <Link href="/categorias/create">Nova categoria</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categorias.map((categoria) => (
                <TableRow key={categoria.id}>
                  <TableCell>{categoria.id}</TableCell>
                  <TableCell>{categoria.nome}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-2">
                      <Link href={`/categorias/${categoria.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2">Editar</Link>
                      <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/categorias/${categoria.id}`)}>Excluir</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
