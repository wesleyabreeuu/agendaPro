import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'

export default function ResetPassword({ mode = 'token', token, email = '', errors = {} }) {
  const { data, setData, post, processing } = useForm({
    token: token || '',
    email: email || '',
    password: '',
    password_confirmation: '',
  })

  function submit(e) {
    e.preventDefault()
    post(mode === 'direct' ? '/password/change' : '/password/reset')
  }

  return (
    <>
      <Head title="Alterar senha" />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Alterar senha</CardTitle>
              <CardDescription>
                {mode === 'direct'
                  ? 'Conta verificada. Defina uma nova senha para continuar.'
                  : 'Escolha uma nova senha para continuar.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-6">
                {errors.email ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.email}</div> : null}
                {errors.password ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.password}</div> : null}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-900">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    readOnly={mode === 'direct'}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-zinc-900">Nova senha</label>
                  <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="password_confirmation" className="text-sm font-medium text-zinc-900">Confirmar nova senha</label>
                  <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                </div>
                <Button type="submit" disabled={processing} fullWidth>Salvar nova senha</Button>
                <div className="text-center text-sm text-zinc-500">
                  <Link href="/login" className="underline underline-offset-4 text-zinc-900">Voltar para o login</Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
