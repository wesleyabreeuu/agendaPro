import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../../layouts/AppLayout'
import { Input } from '../../../components/ui'

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
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Foto</label>
            <input type="file" className="mt-2 block w-full text-sm text-zinc-500" onChange={(e) => setData('foto', e.target.files?.[0] || null)} />
          </div>

          {[
            ['name', 'Nome', 'text'],
            ['email', 'E-mail', 'email'],
            ['telefone', 'Telefone', 'text'],
            ['endereco', 'Endereço', 'text'],
          ].map(([field, label, type]) => (
            <div key={field} className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900">{label}</label>
              <Input type={type} value={data[field]} onChange={(e) => setData(field, e.target.value)} />
              {errors[field] ? <p className="text-sm text-red-600">{errors[field]}</p> : null}
            </div>
          ))}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">{isEdit ? 'Nova senha' : 'Senha'}</label>
            <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-900">{isEdit ? 'Confirmar nova senha' : 'Confirmar senha'}</label>
            <Input type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
            {errors.password_confirmation ? <p className="text-sm text-red-600">{errors.password_confirmation}</p> : null}
          </div>

          <div className="flex gap-3 lg:col-span-2">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">
              {isEdit ? 'Salvar alterações' : 'Cadastrar usuário'}
            </button>
            <Link href="/admin/usuarios" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
