import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../../layouts/AppLayout'
import { Button, Input, Label } from '../../../components/ui'

export default function AdminUsuariosForm({ usuario = null, mode = 'create', errors = {} }) {
  const isEdit = mode === 'edit'
  const { data, setData, post, processing } = useForm({
    _method: isEdit ? 'PUT' : 'POST',
    name: usuario?.name || '',
    email: usuario?.email || '',
    telefone: usuario?.telefone || '',
    endereco: usuario?.endereco || '',
    password: '',
    password_confirmation: '',
    foto: null,
  })

  function submit(e) {
    e.preventDefault()
    post(isEdit ? `/admin/usuarios/${usuario.id}` : '/admin/usuarios', { forceFormData: true })
  }

  return (
    <AppLayout title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label className="text-zinc-900">Foto</Label>
            <Input type="file" className="mt-2 block text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-white" onChange={(e) => setData('foto', e.target.files?.[0] || null)} />
          </div>

          {[
            ['name', 'Nome', 'text'],
            ['email', 'E-mail', 'email'],
            ['telefone', 'Telefone', 'text'],
            ['endereco', 'Endereço', 'text'],
          ].map(([field, label, type]) => (
            <div key={field} className="grid gap-2">
              <Label className="text-zinc-900">{label}</Label>
              <Input type={type} value={data[field]} onChange={(e) => setData(field, e.target.value)} />
              {errors[field] ? <p className="text-sm text-red-600">{errors[field]}</p> : null}
            </div>
          ))}

          <div className="grid gap-2">
            <Label className="text-zinc-900">{isEdit ? 'Nova senha' : 'Senha'}</Label>
            <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-900">{isEdit ? 'Confirmar nova senha' : 'Confirmar senha'}</Label>
            <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
            {errors.password_confirmation ? <p className="text-sm text-red-600">{errors.password_confirmation}</p> : null}
          </div>

          <div className="flex gap-3 lg:col-span-2">
            <Button disabled={processing} className="h-10 w-auto rounded-md px-4">
              {isEdit ? 'Salvar alterações' : 'Cadastrar usuário'}
            </Button>
            <Button asChild variant="outline" className="h-10 w-auto rounded-md px-4">
              <Link href="/admin/usuarios">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
