import React from 'react'
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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-zinc-950/75 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top,#fef3c7_0%,#fff7ed_26%,#ffffff_60%)] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
        <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="p-6 sm:p-8 lg:p-9">
            <span className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              Ritual de início
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Bom dia, {user?.name}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base">
              Sua agenda já está organizada. Faça uma leitura rápida, entre no foco do dia e comece com clareza.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(({ key, label, icon: Icon }) => (
                <div key={key} className="rounded-[24px] border border-zinc-200/90 bg-white/90 p-4 shadow-[0_10px_30px_rgba(24,24,27,0.06)]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-zinc-600">{label}</p>
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </div>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">{counts[key] || 0}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStart}
                disabled={starting}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 disabled:opacity-70"
              >
                {starting ? 'Iniciando...' : 'Começar meu dia'}
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-700"
              >
                Pular por hoje
              </button>
            </div>
          </section>

          <aside className="border-t border-zinc-200/80 bg-zinc-950 px-6 py-6 text-white lg:border-l lg:border-t-0 lg:px-7 lg:py-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Mini timeline</p>
                <h3 className="mt-2 text-xl font-semibold">Seus próximos passos</h3>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Progresso</p>
                <p className="mt-1 text-lg font-semibold text-white">{resumo?.percentual || 0}%</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {miniTimeline.length ? miniTimeline.map((item) => (
                <div
                  key={`${item.tipo}-${item.origem_id}`}
                  className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{item.titulo}</p>
                    <span className="text-sm text-zinc-300">{item.hora_inicio || 'Sem hora'}</span>
                  </div>
                  {item.descricao ? <p className="mt-1 text-sm text-zinc-400">{item.descricao}</p> : null}
                </div>
              )) : (
                <div className="rounded-[24px] border border-dashed border-white/15 p-5 text-sm text-zinc-400">
                  Nada programado na timeline por enquanto.
                </div>
              )}
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.02] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Boas do dia</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">Pequenos ajustes, dia melhor</h4>
                </div>
                <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-200">
                  3 lembretes
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {dailyTips.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-[22px] border border-white/8 bg-black/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5">
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
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
