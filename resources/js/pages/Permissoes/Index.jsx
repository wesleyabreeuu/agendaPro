import React from 'react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page'
import { ShieldCheck } from 'lucide-react'

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
      <PageCard>
        <PageCardHeader
          icon={ShieldCheck}
          title="Permissões"
          description="Ajuste a regra de acesso de cada usuário cadastrado."
        />
        <PageCardContent className="p-0">
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
                <TableCell className="font-medium text-zinc-950">{usuario.name}</TableCell>
                <TableCell className="text-zinc-600">{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.is_admin ? 'default' : 'secondary'}>
                    {usuario.is_admin ? 'Administrador' : 'Usuário'}
                  </Badge>
                </TableCell>
                <TableCell><Badge variant="outline">{usuario.regra_nome}</Badge></TableCell>
                <TableCell className="text-right">
                  {usuario.is_admin ? <span className="text-zinc-500">Administrador fixo</span> : <RowForm usuario={usuario} regras={regras} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </PageCardContent>
      </PageCard>
    </AppLayout>
  )
}
