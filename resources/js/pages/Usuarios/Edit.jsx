import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Input } from '@/components/ui'

export default function UsuariosEdit({ usuario, errors = {} }) {
  const { data, setData, post, processing } = useForm({
    _method: 'PUT',
    name: usuario.name || '',
    email: usuario.email || '',
    telefone: usuario.telefone || '',
    endereco: usuario.endereco || '',
    password: '',
    foto: null,
  })

  function submit(e) {
    e.preventDefault()
    post(`/usuarios/${usuario.id}`, { forceFormData: true })
  }

  return (
    <AppLayout title="Editar Perfil">
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Foto</label>
            <input type="file" name="foto" className="mt-2 block w-full text-sm text-zinc-500" onChange={(e) => setData('foto', e.target.files[0])} />
          </div>

          {['name', 'email', 'telefone', 'endereco'].map((field) => (
            <div key={field} className="grid gap-2">
              <label className="text-sm font-medium text-zinc-900 capitalize">{field === 'name' ? 'Nome' : field === 'email' ? 'E-mail' : field === 'telefone' ? 'Telefone' : 'Endereço'}</label>
              <Input
                type={field === 'email' ? 'email' : 'text'}
                value={data[field]}
                onChange={(e) => setData(field, e.target.value)}
              />
              {errors[field] ? <p className="text-sm text-red-600">{errors[field]}</p> : null}
            </div>
          ))}

          <div className="grid gap-2 lg:col-span-2">
            <label className="text-sm font-medium text-zinc-900">Nova senha</label>
            <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
          </div>

          <div className="flex gap-3 lg:col-span-2">
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar</button>
            <Link href="/usuarios" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">Cancelar</Link>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
