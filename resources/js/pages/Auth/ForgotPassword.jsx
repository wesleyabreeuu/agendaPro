import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'

export default function ForgotPassword({ status = null, errors = {} }) {
  const { data, setData, post, processing } = useForm({
    email: '',
  })

  function submit(e) {
    e.preventDefault()
    post('/password/check-account')
  }

  return (
    <>
      <Head title="Recuperar senha" />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Recuperar senha</CardTitle>
              <CardDescription>Informe seu e-mail. Se ele estiver cadastrado, enviaremos um codigo para confirmar a recuperacao.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-6">
                {status ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div> : null}
                {errors.email ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.email}</div> : null}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-zinc-900">Email</label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                </div>
                <Button type="submit" disabled={processing}>Enviar codigo</Button>
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
