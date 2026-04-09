import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'

export default function CategoriasIndex({ categorias }) {
  return (
    <AppLayout title="Categorias">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link href="/categorias/create" className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Nova categoria</Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3">{categoria.id}</td>
                  <td className="px-4 py-3">{categoria.nome}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <Link href={`/categorias/${categoria.id}/edit`} className="rounded-md border border-zinc-200 px-3 py-2">Editar</Link>
                      <button onClick={() => router.delete(`/categorias/${categoria.id}`)} className="rounded-md border border-red-200 px-3 py-2 text-red-600">Excluir</button>
                    </div>
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
