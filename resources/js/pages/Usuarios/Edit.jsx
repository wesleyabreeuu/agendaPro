import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Input, Label } from '@/components/ui'

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
      <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs">
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Label className="text-zinc-900">Foto</Label>
            <Input type="file" name="foto" className="mt-2 block text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-white" onChange={(e) => setData('foto', e.target.files[0])} />
          </div>

          {['name', 'email', 'telefone', 'endereco'].map((field) => (
            <div key={field} className="grid gap-2">
              <Label className="text-zinc-900 capitalize">{field === 'name' ? 'Nome' : field === 'email' ? 'E-mail' : field === 'telefone' ? 'Telefone' : 'Endereço'}</Label>
              <Input
                type={field === 'email' ? 'email' : 'text'}
                value={data[field]}
                onChange={(e) => setData(field, e.target.value)}
              />
              {errors[field] ? <p className="text-sm text-red-600">{errors[field]}</p> : null}
            </div>
          ))}

          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-zinc-900">Nova senha</Label>
            <Input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
          </div>

          <div className="flex gap-3 lg:col-span-2">
            <Button disabled={processing} className="h-10 w-auto rounded-md px-4">Salvar</Button>
            <Button asChild variant="outline" className="h-10 w-auto rounded-md px-4">
              <Link href="/usuarios">Cancelar</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
