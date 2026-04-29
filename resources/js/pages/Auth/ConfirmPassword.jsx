import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import { Droplets, Footprints, ShieldCheck, Sparkles, TimerReset } from 'lucide-react'

const dailyTips = [
  {
    title: 'Beba agua logo cedo',
    description: 'Um copo de agua nos primeiros minutos do dia ajuda a despertar com mais leveza.',
    icon: Droplets,
  },
  {
    title: 'Movimente o corpo por 10 minutos',
    description: 'Uma caminhada curta ou alongamento ja melhora energia, foco e disposicao.',
    icon: Footprints,
  },
  {
    title: 'Reserve uma pausa sem tela',
    description: 'Dois minutos de respiracao ou silencio antes da correria ajudam a organizar a mente.',
    icon: TimerReset,
  },
]

export default function ConfirmPassword({ errors = {} }) {
  const { data, setData, post, processing } = useForm({
    password: '',
  })

  function submit(e) {
    e.preventDefault()
    post('/password/confirm')
  }

  return (
    <>
      <Head title="Confirmar senha" />

      <div className="flex min-h-svh w-full items-center justify-center bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff8ee_22%,#f5f5f4_62%,#e7e5e4_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <Card className="w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_30px_100px_rgba(24,24,27,0.18)] backdrop-blur">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <section className="border-b border-zinc-200/80 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Area segura
              </div>

              <CardHeader className="px-0 pb-0 pt-5">
                <CardTitle className="text-3xl leading-tight text-zinc-950 sm:text-4xl">
                  Confirme sua senha
                </CardTitle>
                <CardDescription className="max-w-xl pt-2 text-sm leading-6 text-zinc-600 sm:text-base">
                  Estamos prestes a liberar uma parte sensivel da sua agenda. Faca uma confirmacao rapida para continuar com seguranca.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-0 pt-8">
                <form onSubmit={submit} className="space-y-6">
                  {errors.password ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {errors.password}
                    </div>
                  ) : null}

                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-900">
                      Senha atual
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      required
                      autoFocus
                      placeholder="Digite sua senha para continuar"
                      className="h-12 rounded-xl border-zinc-200 bg-zinc-50/70 px-4"
                    />
                    <p className="mt-3 text-sm text-zinc-500">
                      Esse passo ajuda a proteger alteracoes importantes e manter seu espaco seguro.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="h-12 rounded-2xl px-6 text-sm font-semibold shadow-lg shadow-zinc-950/15 sm:w-auto"
                    >
                      {processing ? 'Confirmando...' : 'Confirmar e continuar'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                      className="h-12 rounded-2xl px-6 text-sm font-semibold text-zinc-700 sm:w-auto"
                    >
                      Voltar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </section>

            <aside className="bg-zinc-950 px-6 py-8 text-white sm:px-8 sm:py-10">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Acesso consciente</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    Proteja o que importa e comece o dia melhor
                  </h2>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
              </div>

              <div className="mt-6 rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm leading-6 text-zinc-300">
                  Enquanto voce confirma seu acesso, aqui vai um lembrete simples: um dia produtivo costuma comecar melhor quando existe ritmo, nao pressa.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {dailyTips.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-2xl border border-white/10 bg-white/5 p-2">
                        <Icon className="h-4 w-4 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </Card>
      </div>
    </>
  )
}
