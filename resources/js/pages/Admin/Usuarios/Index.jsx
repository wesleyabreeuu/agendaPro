import React from 'react'
import { Link } from '@inertiajs/react'
import AppLayout from '../../../layouts/AppLayout'

export default function AdminUsuariosIndex({ usuarios = [] }) {
  return (
    <AppLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-950">Usuários cadastrados</h2>
            <p className="text-sm text-zinc-500">Somente administradores podem cadastrar novos usuários.</p>
          </div>
          <Link href="/admin/usuarios/create" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
            Novo usuário
          </Link>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">E-mail</th>
                <th className="px-4 py-3 text-left">Telefone</th>
                <th className="px-4 py-3 text-left">Regra</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-950">{usuario.name}</div>
                    {usuario.is_admin ? <div className="text-xs text-zinc-500">Administrador</div> : null}
                  </td>
                  <td className="px-4 py-3">{usuario.email}</td>
                  <td className="px-4 py-3">{usuario.telefone || 'Não informado'}</td>
                  <td className="px-4 py-3">{usuario.regra_label}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/usuarios/${usuario.id}/edit`} className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
