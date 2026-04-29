import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'

export default function Login({ errors = {}, canResetPassword = true, status = null }) {
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  function submit(e) {
    e.preventDefault()
    post('/login')
  }

  return (
    <>
      <Head title="Login" />
      <div className="flex min-h-svh w-full items-center justify-center bg-zinc-200/70 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className="border-zinc-200 shadow-lg shadow-zinc-100/80">
              <CardHeader className="text-center">
                <div className="flex items-start justify-center gap-3">
                  <div className="w-full">
                    <div className="mb-4 flex justify-center">
                      <img src="/brand/agendapro-mark.svg" alt="AgendaPro" className="h-16 w-16 object-contain" />
                    </div>
                    <CardTitle className="brand-agendapro text-[2.4rem] text-zinc-950">AgendaPro</CardTitle>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-400">Versão 2.0</p>
                  </div>
                </div>
                <CardDescription className="italic">
                  Seu organizador de rotina de uma forma simples e inteligente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="grid gap-6">
                  {status ? (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {status}
                    </div>
                  ) : null}

                  {errors.email ? (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {errors.email}
                    </div>
                  ) : null}

                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-zinc-900">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <label htmlFor="password" className="text-sm font-medium text-zinc-900">Password</label>
                      {canResetPassword ? (
                        <Link href="/password/reset" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                          Esqueceu sua senha?
                        </Link>
                      ) : null}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3">
                    <Button type="submit" disabled={processing}>Login</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
