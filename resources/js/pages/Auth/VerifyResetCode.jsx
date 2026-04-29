import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'

export default function VerifyResetCode({ email = '', status = null, errors = {} }) {
  const { data, setData, post, processing } = useForm({
    code: '',
  })

  const resendForm = useForm({})

  function submit(e) {
    e.preventDefault()
    post('/password/code/verify')
  }

  function resendCode() {
    resendForm.post('/password/code/resend')
  }

  return (
    <>
      <Head title="Confirmar codigo" />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Confirmar codigo</CardTitle>
              <CardDescription>
                Enviamos um codigo de 6 digitos para {email}. Digite-o abaixo para continuar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-6">
                {status ? <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</div> : null}
                {errors.code ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.code}</div> : null}
                <div className="grid gap-2">
                  <label htmlFor="code" className="text-sm font-medium text-zinc-900">Codigo</label>
                  <Input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    value={data.code}
                    onChange={(e) => setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </div>
                <Button type="submit" disabled={processing}>Validar codigo</Button>
              </form>
              <div className="mt-4 flex flex-col gap-3 text-center text-sm text-zinc-500">
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={resendForm.processing}
                  className="underline underline-offset-4 text-zinc-900"
                >
                  Reenviar codigo
                </button>
                <Link href="/login" className="underline underline-offset-4 text-zinc-900">Voltar para o login</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
