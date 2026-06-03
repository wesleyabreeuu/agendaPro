import React from 'react'
import { Head, Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { LogIn, Mail, LockKeyhole } from 'lucide-react'

export default function Login({ errors = {}, canResetPassword = true, status = null }) {
  const { theme } = useTheme()
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
      <div className={`flex min-h-svh w-full items-center justify-center p-6 md:p-10 ${
        theme === 'dark'
          ? 'bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.10),transparent_30%),linear-gradient(145deg,#050505_0%,#111111_52%,#18181b_100%)]'
          : 'bg-[radial-gradient(circle_at_50%_10%,rgba(148,163,184,0.22),transparent_34%),#e4e7ec]'
      }`}>
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card className={`border py-6 shadow-2xl backdrop-blur ${
              theme === 'dark'
                ? 'border-white/10 bg-zinc-950/80 shadow-black/60 ring-white/10'
                : 'border-white/75 bg-white/88 shadow-zinc-300/70 ring-white/70'
            }`}>
              <CardHeader className="text-center">
                <div className="flex items-start justify-center gap-3">
                  <div className="w-full">
                    <div className="mb-4 flex justify-center">
                      <div className={`rounded-2xl p-2 shadow-lg ${
                        theme === 'dark' ? 'bg-white shadow-black/50' : 'bg-white shadow-zinc-200'
                      }`}>
                        <img src="/brand/agendapro-mark.svg" alt="AgendaPro" className="h-14 w-14 object-contain" />
                      </div>
                    </div>
                    <CardTitle className={`brand-agendapro text-[2.35rem] ${
                      theme === 'dark' ? 'text-white' : 'text-zinc-950'
                    }`}>AgendaPro</CardTitle>
                    <p className={`mt-2 text-[11px] font-semibold uppercase tracking-[0.32em] ${
                      theme === 'dark' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>Versão 2.0</p>
                  </div>
                </div>
                <CardDescription className={theme === 'dark' ? 'italic text-zinc-300' : 'italic text-zinc-600'}>
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
                    <label htmlFor="email" className={theme === 'dark' ? 'text-sm font-medium text-zinc-100' : 'text-sm font-medium text-zinc-900'}>Email</label>
                    <div className="relative">
                      <Mail className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-zinc-400'
                      }`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={data.email}
                      onChange={(e) => setData('email', e.target.value)}
                      className={`login-auth-input h-12 pl-10 ${
                        theme === 'dark'
                          ? 'border-white/10 bg-zinc-900/85 text-zinc-50 placeholder:text-zinc-500 focus-visible:border-zinc-300/70 focus-visible:ring-zinc-400/20'
                          : 'border-zinc-200 bg-white/90 text-zinc-950 placeholder:text-zinc-400'
                      }`}
                    />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <label htmlFor="password" className={theme === 'dark' ? 'text-sm font-medium text-zinc-100' : 'text-sm font-medium text-zinc-900'}>Password</label>
                      {canResetPassword ? (
                        <Link href="/password/reset" className={`ml-auto inline-block text-sm underline-offset-4 hover:underline ${
                          theme === 'dark' ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-zinc-950'
                        }`}>
                          Esqueceu sua senha?
                        </Link>
                      ) : null}
                    </div>
                    <div className="relative">
                      <LockKeyhole className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        theme === 'dark' ? 'text-zinc-400' : 'text-zinc-400'
                      }`} />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      className={`login-auth-input h-12 pl-10 ${
                        theme === 'dark'
                          ? 'border-white/10 bg-zinc-900/85 text-zinc-50 focus-visible:border-zinc-300/70 focus-visible:ring-zinc-400/20'
                          : 'border-zinc-200 bg-white/90 text-zinc-950'
                      }`}
                    />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Button
                      type="submit"
                      disabled={processing}
                      fullWidth
                      className={`h-11 gap-2 font-semibold ${
                        theme === 'dark'
                          ? 'border-white/10 bg-white text-zinc-950 shadow-lg shadow-black/35 hover:bg-zinc-200'
                          : 'bg-zinc-950 text-white hover:bg-zinc-800'
                      }`}
                    >
                      <LogIn className="h-4 w-4" />
                      Login
                    </Button>
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
