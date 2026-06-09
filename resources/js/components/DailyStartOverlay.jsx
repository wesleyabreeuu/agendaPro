import React from 'react'
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Progress,
} from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import {
  ArrowRight,
  CalendarDays,
  CheckSquare,
  BellRing,
  ListChecks,
  HeartPulse,
  Sparkles,
  Clock,
  ClipboardList,
  CheckCircle2,
  Target,
  TimerReset,
} from 'lucide-react'

const summaryItems = [
  { key: 'compromissos', label: 'Agenda', hint: 'com hora marcada', icon: CalendarDays },
  { key: 'tarefas', label: 'Tarefas', hint: 'para resolver', icon: CheckSquare },
  { key: 'rotinas', label: 'Rotinas', hint: 'ativas hoje', icon: ListChecks },
  { key: 'lembretes', label: 'Lembretes', hint: 'disparos previstos', icon: BellRing },
  { key: 'atividades', label: 'Saúde', hint: 'registros do dia', icon: HeartPulse },
]

const typeLabels = {
  compromisso: 'Compromisso',
  tarefa: 'Tarefa',
  rotina: 'Rotina',
  lembrete: 'Lembrete',
  atividade: 'Atividade',
  kanban: 'Kanban',
}

function formatItemTime(item) {
  if (!item?.hora_inicio) {
    return 'Sem horário'
  }

  return item.hora_fim ? `${item.hora_inicio}-${item.hora_fim}` : item.hora_inicio
}

function isPending(item) {
  return item?.status !== 'concluido'
}

export default function DailyStartOverlay({
  open,
  user,
  preview,
  onStart,
  onSkip,
  starting = false,
  error = '',
}) {
  const { theme } = useTheme()

  if (!open) {
    return null
  }

  const resumo = preview?.resumo || {}
  const counts = resumo?.itens_por_tipo || {}
  const timeline = preview?.timeline || []
  const pendencias = preview?.pendencias || []
  const pendingTimeline = timeline.filter(isPending)
  const pendingLooseItems = pendencias.filter(isPending)
  const miniTimeline = (pendingTimeline.length ? pendingTimeline : timeline).slice(0, 3)
  const loosePreview = pendingLooseItems.slice(0, 3)
  const progress = resumo?.percentual || 0
  const total = resumo?.total || 0
  const completed = resumo?.concluidos || 0
  const nextItem = pendingTimeline[0] || null
  const focusItems = [...pendingTimeline, ...pendingLooseItems].slice(0, 4)
  const hasSchedule = timeline.length > 0
  const hasLooseItems = pendingLooseItems.length > 0
  const firstName = user?.name?.split(' ')?.[0] || user?.name
  const headline = total > 0
    ? `Bom dia, ${firstName || 'vamos começar'}`
    : `Bom dia, ${firstName || 'tudo certo'}`
  const lead = total > 0
    ? `${total} item${total === 1 ? '' : 's'} no radar, ${completed} concluído${completed === 1 ? '' : 's'} e ${Math.max(total - completed, 0)} aguardando sua atenção.`
    : 'Seu dia está livre por enquanto. Bom momento para escolher uma prioridade simples antes da agenda encher.'
  const focusTitle = nextItem?.titulo || loosePreview[0]?.titulo || 'Escolha a primeira prioridade'
  const focusDescription = nextItem
    ? `${typeLabels[nextItem.tipo] || 'Item'} previsto para ${formatItemTime(nextItem)}.`
    : loosePreview[0]
      ? `${typeLabels[loosePreview[0].tipo] || 'Item'} sem horário definido para encaixar no dia.`
      : 'Sem compromissos, tarefas ou rotinas pendentes cadastradas para hoje.'

  return (
    <Dialog open={open}>
      <DialogContent
        className={`${theme === 'dark' ? 'dark' : ''} left-4 right-4 max-h-[calc(100dvh-2rem)] w-auto max-w-none translate-x-0 overflow-x-hidden overflow-y-auto border p-0 text-card-foreground shadow-2xl sm:left-1/2 sm:right-auto sm:w-[calc(100dvw-2rem)] sm:max-w-[920px] sm:-translate-x-1/2 ${
          theme === 'dark'
            ? 'border-zinc-700/70 bg-zinc-950 shadow-black/60'
            : 'border-zinc-200 bg-white shadow-zinc-300/60'
        }`}
      >
        <div className="grid min-w-0 gap-0 overflow-x-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,0.86fr)]">
          <section className={`min-w-0 p-4 sm:p-5 lg:p-6 ${
            theme === 'dark'
              ? 'bg-[radial-gradient(circle_at_16%_8%,rgba(255,255,255,0.08),transparent_34%),#0a0a0a]'
              : 'bg-[radial-gradient(circle_at_16%_8%,rgba(0,0,0,0.05),transparent_32%),#ffffff]'
          }`}>
            <DialogHeader>
              <Badge
                variant="outline"
                className={`w-fit gap-2 rounded-lg px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                  theme === 'dark'
                    ? 'border-white/15 bg-white/5 text-zinc-100'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-800'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
              Ritual de início
              </Badge>
              <DialogTitle className="mt-4 break-words text-[28px] font-semibold tracking-tight text-foreground sm:text-[36px]">
                {headline}
              </DialogTitle>
              <DialogDescription className="max-w-lg break-words text-[15px] leading-7 text-muted-foreground">
                {lead}
              </DialogDescription>
            </DialogHeader>

            <div className={`mt-5 rounded-xl border p-4 ${
              theme === 'dark' ? 'border-white/10 bg-zinc-900/70' : 'border-zinc-200 bg-zinc-50/80'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`rounded-lg border p-2 ${
                  theme === 'dark' ? 'border-white/15 bg-white/5 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'
                }`}>
                  <Target className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Foco do dia</p>
                  <h3 className="mt-1 break-words text-[18px] font-semibold text-foreground">{focusTitle}</h3>
                  <p className="mt-1 break-words text-[13px] leading-6 text-muted-foreground">{focusDescription}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid w-full min-w-0 max-w-[520px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(({ key, label, hint, icon: Icon }) => (
                <Card
                  key={key}
                  size="sm"
                  className={`min-h-[112px] gap-3 rounded-lg border py-3.5 shadow-none ${
                    theme === 'dark'
                      ? 'border-zinc-700/70 bg-zinc-950/70'
                      : 'border-zinc-200 bg-white'
                  }`}
                >
                  <CardHeader className="grid-cols-[1fr_auto] gap-3 px-4">
                    <CardDescription className="text-[13px] font-medium">{label}</CardDescription>
                    <CardAction className="row-span-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="px-4">
                    <p className="text-[24px] font-semibold tracking-tight text-foreground">{counts[key] || 0}</p>
                    <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-5 flex min-w-0 flex-wrap gap-3">
              <Button
                type="button"
                onClick={onStart}
                disabled={starting}
                className="h-11 w-full px-5 text-sm font-semibold disabled:opacity-70 sm:w-auto"
              >
                {starting ? 'Iniciando...' : 'Começar meu dia'}
              </Button>
              <Button
                type="button"
                onClick={onSkip}
                variant="outline"
                className="h-11 w-full px-5 text-sm font-semibold sm:w-auto"
              >
                Pular por hoje
              </Button>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </section>

          <aside className={`min-w-0 border-t px-4 py-4 text-foreground lg:border-l lg:border-t-0 lg:px-5 lg:py-5 ${
            theme === 'dark'
              ? 'border-zinc-700/70 bg-zinc-900'
              : 'border-zinc-200 bg-zinc-50'
          }`}>
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mini timeline</p>
                <h3 className="mt-2 break-words text-[18px] font-semibold text-foreground">Seus próximos passos</h3>
              </div>
              <Card size="sm" className={`w-[112px] gap-2 rounded-lg border py-3 text-right shadow-none ${
                theme === 'dark' ? 'border-zinc-700 bg-zinc-950/75' : 'border-zinc-200 bg-white'
              }`}>
                <CardContent className="px-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progresso</p>
                  <p className="mt-1 text-[16px] font-semibold text-foreground">{progress}%</p>
                  <Progress value={progress} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 space-y-2.5">
              {miniTimeline.length ? miniTimeline.map((item) => (
                <Card
                  key={`${item.tipo}-${item.origem_id}`}
                  size="sm"
                  className={`gap-2 rounded-lg border py-3 shadow-none ${
                    theme === 'dark' ? 'border-zinc-700 bg-zinc-950/75' : 'border-zinc-200 bg-white'
                  }`}
                >
                  <CardHeader className="grid-cols-[minmax(0,1fr)_auto] gap-3 px-4">
                    <CardTitle className="break-words text-[14px] font-semibold">{item.titulo}</CardTitle>
                    <CardAction className="row-span-1 flex items-center gap-1 whitespace-nowrap text-[13px] text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {formatItemTime(item)}
                    </CardAction>
                    <CardDescription className="text-[12px]">{typeLabels[item.tipo] || item.tipo}</CardDescription>
                  </CardHeader>
                  {item.descricao ? (
                    <CardContent className="px-4">
                      <p className="break-words text-[13px] leading-6 text-muted-foreground">{item.descricao}</p>
                    </CardContent>
                  ) : null}
                </Card>
              )) : (
                <Card className={`rounded-lg border-dashed p-5 text-sm text-muted-foreground shadow-none ${
                  theme === 'dark' ? 'border-zinc-700 bg-zinc-950/60' : 'border-zinc-200 bg-white'
                }`}>
                  Nada com horário marcado por enquanto.
                </Card>
              )}
            </div>

            <Card className={`mt-4 rounded-xl border shadow-none ${
              theme === 'dark' ? 'border-zinc-700 bg-zinc-950/75' : 'border-zinc-200 bg-white'
            }`}>
              <CardHeader className="grid-cols-[minmax(0,1fr)_auto] gap-3">
                <div className="min-w-0">
                  <CardDescription className="text-xs uppercase tracking-[0.24em]">Leitura rápida</CardDescription>
                  <CardTitle className="mt-2 break-words text-[14px] font-semibold sm:text-[16px]">O que merece atenção</CardTitle>
                </div>
                <CardAction>
                  <Badge variant="outline" className={`rounded-lg px-2 py-1 text-[10px] font-medium ${
                    theme === 'dark' ? 'border-white/15 bg-white/5 text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-700'
                  }`}>
                    {hasLooseItems ? `${pendingLooseItems.length} sem hora` : `${focusItems.length} itens`}
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className={`rounded-lg border py-3 ${
                  theme === 'dark' ? 'border-zinc-700 bg-zinc-900/75' : 'border-zinc-200 bg-zinc-50'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`ml-3 rounded-lg border p-2 ${
                      theme === 'dark' ? 'border-white/15 bg-white/5 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'
                    }`}>
                      <TimerReset className="h-[14px] w-[14px]" />
                    </div>
                    <div className="min-w-0 pr-3">
                      <p className="break-words text-[13px] font-semibold text-foreground sm:text-[14px]">
                        {hasSchedule ? 'Agenda com horários definidos' : 'Manhã sem horários travados'}
                      </p>
                      <p className="mt-1 break-words text-[13px] leading-6 text-muted-foreground">
                        {hasSchedule
                          ? `${timeline.length} item${timeline.length === 1 ? '' : 's'} na timeline. Comece pelo primeiro pendente e avance em sequência.`
                          : 'Use essa janela para encaixar uma tarefa importante ou revisar as pendências soltas.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border py-3 ${
                  theme === 'dark' ? 'border-zinc-700 bg-zinc-900/75' : 'border-zinc-200 bg-zinc-50'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`ml-3 rounded-lg border p-2 ${
                      theme === 'dark' ? 'border-white/15 bg-white/5 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'
                    }`}>
                      <CheckCircle2 className="h-[14px] w-[14px]" />
                    </div>
                    <div className="min-w-0 pr-3">
                      <p className="break-words text-[13px] font-semibold text-foreground sm:text-[14px]">Ritmo atual: {completed}/{total || 0}</p>
                      <p className="mt-1 break-words text-[13px] leading-6 text-muted-foreground">
                        {total > 0
                          ? `${Math.max(total - completed, 0)} item${Math.max(total - completed, 0) === 1 ? '' : 's'} ainda aberto${Math.max(total - completed, 0) === 1 ? '' : 's'} para fechar ou adiar com intenção.`
                          : 'Nada pendente encontrado. Um check-in curto já basta para manter o dia sob controle.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg border py-3 ${
                  theme === 'dark' ? 'border-zinc-700 bg-zinc-900/75' : 'border-zinc-200 bg-zinc-50'
                }`}>
                  <div className="flex items-start gap-2.5">
                    <div className={`ml-3 rounded-lg border p-2 ${
                      theme === 'dark' ? 'border-white/15 bg-white/5 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'
                    }`}>
                      <ClipboardList className="h-[14px] w-[14px]" />
                    </div>
                    <div className="min-w-0 pr-3">
                      <p className="break-words text-[13px] font-semibold text-foreground sm:text-[14px]">
                        {hasLooseItems ? 'Pendências flexíveis' : 'Sem pendências soltas'}
                      </p>
                      <p className="mt-1 break-words text-[13px] leading-6 text-muted-foreground">
                        {hasLooseItems
                          ? `${pendingLooseItems.length} item${pendingLooseItems.length === 1 ? '' : 's'} sem horário. Reserve um bloco ou adie o que não couber.`
                          : 'As tarefas sem horário estão limpas para hoje.'}
                      </p>
                    </div>
                  </div>
                </div>

                {loosePreview.length ? (
                  <div className="space-y-2 pt-1">
                    {loosePreview.map((item) => (
                      <div key={`loose-${item.tipo}-${item.origem_id}`} className="flex items-center justify-between gap-3 text-[13px]">
                        <span className="min-w-0 truncate text-muted-foreground">{item.titulo}</span>
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-foreground">
                          {typeLabels[item.tipo] || item.tipo}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
