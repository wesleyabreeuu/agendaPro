import React from 'react'
import { Link } from '@inertiajs/react'
import AppLayout from '../../../layouts/AppLayout'
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

export default function AdminUsuariosIndex({ usuarios = [] }) {
  return (
    <AppLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Usuários cadastrados</h2>
            <p className="text-sm text-zinc-500">Somente administradores podem cadastrar novos usuários.</p>
          </div>
          <Button asChild className="w-auto">
            <Link href="/admin/usuarios/create">Novo usuário</Link>
          </Button>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Regra</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="font-medium text-zinc-950">{usuario.name}</div>
                    {usuario.is_admin ? <div className="mt-1"><Badge variant="secondary">Administrador</Badge></div> : null}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>{usuario.telefone || 'Não informado'}</TableCell>
                  <TableCell>{usuario.regra_label}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/usuarios/${usuario.id}/edit`} className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900">
                      Editar
                    </Link>
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
