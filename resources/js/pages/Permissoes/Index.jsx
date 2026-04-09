import React from 'react'
import { useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'

function RowForm({ usuario, regras }) {
  const { data, setData, put, processing } = useForm({
    regra_id: usuario.regra_id || '',
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        put(`/permissoes/${usuario.id}`)
      }}
      className="inline-flex items-center gap-2"
    >
      <select className="h-10 rounded-md border border-zinc-200 px-3 text-sm" value={data.regra_id} onChange={(e) => setData('regra_id', e.target.value)}>
        {regras.map((regra) => (
          <option key={regra.id} value={regra.id}>{regra.nome}</option>
        ))}
      </select>
      <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar</button>
    </form>
  )
}

export default function PermissoesIndex({ usuarios, regras }) {
  return (
    <AppLayout title="Permissões">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left">Usuário</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Regra atual</th>
              <th className="px-4 py-3 text-right">Alterar</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="border-t border-zinc-200">
                <td className="px-4 py-3">{usuario.name}</td>
                <td className="px-4 py-3">{usuario.email}</td>
                <td className="px-4 py-3">{usuario.is_admin ? 'Administrador' : 'Usuário'}</td>
                <td className="px-4 py-3">{usuario.regra_nome}</td>
                <td className="px-4 py-3 text-right">
                  {usuario.is_admin ? <span className="text-zinc-500">Administrador fixo</span> : <RowForm usuario={usuario} regras={regras} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
