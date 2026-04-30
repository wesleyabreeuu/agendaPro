import React from 'react'
import { Button } from '@/components/ui'
import {
  CalendarDays,
  CheckSquare,
  BellRing,
  ListChecks,
  HeartPulse,
  Sparkles,
  Droplets,
  Footprints,
  Brain,
} from 'lucide-react'

const summaryItems = [
  { key: 'compromissos', label: 'Compromissos', icon: CalendarDays },
  { key: 'tarefas', label: 'Tarefas', icon: CheckSquare },
  { key: 'rotinas', label: 'Rotinas', icon: ListChecks },
  { key: 'lembretes', label: 'Lembretes', icon: BellRing },
  { key: 'atividades', label: 'Atividades', icon: HeartPulse },
]

const dailyTips = [
  {
    title: 'Beba água nas primeiras horas',
    description: 'Começar o dia hidratado ajuda a acordar com mais presença e menos arrasto.',
    icon: Droplets,
  },
  {
    title: 'Faça 10 minutos de movimento',
    description: 'Uma caminhada curta ou alongamento já muda energia, foco e postura.',
    icon: Footprints,
  },
  {
    title: 'Crie uma pausa mental antes da correria',
    description: 'Dois minutos sem tela ajudam a organizar a mente antes de entrar no ritmo.',
    icon: Brain,
  },
]

export default function DailyStartOverlay({
  open,
  user,
  preview,
  onStart,
  onSkip,
  starting = false,
}) {
  if (!open) {
    return null
  }

  const resumo = preview?.resumo || {}
  const counts = resumo?.itens_por_tipo || {}
  const miniTimeline = (preview?.timeline || []).slice(0, 4)

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/75 px-4 py-4 backdrop-blur-sm">
      <div className="w-full max-w-[860px] overflow-hidden rounded-xl border border-zinc-200 bg-card shadow-xs">
        <div className="grid gap-0 lg:grid-cols-[0.98fr_0.82fr]">
          <section className="p-4 sm:p-5 lg:p-6">
            <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
              <Sparkles className="h-3.5 w-3.5" />
              Ritual de início
            </span>
            <h2 className="mt-4 text-[36px] font-semibold tracking-tight text-zinc-950">
              Bom dia, {user?.name}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-7 text-zinc-600">
              Sua agenda já está organizada. Faça uma leitura rápida, entre no foco do dia e comece com clareza.
            </p>

            <div className="mt-5 grid max-w-[470px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(({ key, label, icon: Icon }) => (
                <div key={key} className="min-h-[102px] rounded-lg border border-zinc-200 bg-white px-4 py-3.5 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-zinc-600">{label}</p>
                    <Icon className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <p className="mt-3 text-[24px] font-semibold tracking-tight text-zinc-950">{counts[key] || 0}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={onStart}
                disabled={starting}
                className="h-11 w-auto px-5 text-sm font-semibold disabled:opacity-70"
              >
                {starting ? 'Iniciando...' : 'Começar meu dia'}
              </Button>
              <Button
                type="button"
                onClick={onSkip}
                variant="outline"
                className="h-11 w-auto border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-700"
              >
                Pular por hoje
              </Button>
            </div>
          </section>

          <aside className="border-t border-zinc-200/80 bg-zinc-950 px-4 py-4 text-white lg:border-l lg:border-t-0 lg:px-5 lg:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Mini timeline</p>
                <h3 className="mt-2 text-[18px] font-semibold">Seus próximos passos</h3>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Progresso</p>
                <p className="mt-1 text-[16px] font-semibold text-white">{resumo?.percentual || 0}%</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5">
              {miniTimeline.length ? miniTimeline.map((item) => (
                <div
                  key={`${item.tipo}-${item.origem_id}`}
                  className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[14px] font-medium text-white">{item.titulo}</p>
                    <span className="text-[13px] text-zinc-300">{item.hora_inicio || 'Sem hora'}</span>
                  </div>
                  {item.descricao ? <p className="mt-1 text-[13px] leading-6 text-zinc-400">{item.descricao}</p> : null}
                </div>
              )) : (
                <div className="rounded-lg border border-dashed border-white/15 p-5 text-sm text-zinc-400">
                  Nada programado na timeline por enquanto.
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Boas do dia</p>
                  <h4 className="mt-2 text-[14px] font-semibold text-white sm:text-[16px]">Pequenos ajustes, dia melhor</h4>
                </div>
                <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-medium text-amber-200">
                  3 lembretes
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {dailyTips.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2">
                        <Icon className="h-[14px] w-[14px] text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-white sm:text-[14px]">{title}</p>
                        <p className="mt-1 text-[13px] leading-6 text-zinc-400">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
