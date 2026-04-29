import React from 'react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'

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
      <Select value={data.regra_id} onChange={(e) => setData('regra_id', e.target.value)}>
        {regras.map((regra) => (
          <option key={regra.id} value={regra.id}>{regra.nome}</option>
        ))}
      </Select>
      <Button disabled={processing} className="w-auto">Salvar</Button>
    </form>
  )
}

export default function PermissoesIndex({ usuarios, regras }) {
  return (
    <AppLayout title="Permissões">
      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent">
              <TableHead>Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Regra atual</TableHead>
              <TableHead className="text-right">Alterar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.name}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>{usuario.is_admin ? 'Administrador' : 'Usuário'}</TableCell>
                <TableCell>{usuario.regra_nome}</TableCell>
                <TableCell className="text-right">
                  {usuario.is_admin ? <span className="text-zinc-500">Administrador fixo</span> : <RowForm usuario={usuario} regras={regras} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppLayout>
  )
}
