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
  error = '',
}) {
  const { theme } = useTheme()

  if (!open) {
    return null
  }

  const resumo = preview?.resumo || {}
  const counts = resumo?.itens_por_tipo || {}
  const miniTimeline = (preview?.timeline || []).slice(0, 4)
  const progress = resumo?.percentual || 0

  return (
    <Dialog open={open}>
      <DialogContent
        className={`${theme === 'dark' ? 'dark' : ''} max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[880px] overflow-y-auto border-border bg-card p-0 text-card-foreground shadow-xs`}
      >
        <div className="grid gap-0 lg:grid-cols-[1fr_0.86fr]">
          <section className="bg-card p-4 sm:p-5 lg:p-6">
            <DialogHeader>
              <Badge
                variant="outline"
                className="w-fit gap-2 rounded-lg border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" />
              Ritual de início
              </Badge>
              <DialogTitle className="mt-4 text-[32px] font-semibold tracking-tight text-foreground sm:text-[36px]">
                Bom dia, {user?.name}
              </DialogTitle>
              <DialogDescription className="max-w-lg text-[15px] leading-7 text-muted-foreground">
                Sua agenda já está organizada. Faça uma leitura rápida, entre no foco do dia e comece com clareza.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 grid max-w-[470px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {summaryItems.map(({ key, label, icon: Icon }) => (
                <Card
                  key={key}
                  size="sm"
                  className="min-h-[102px] gap-3 rounded-lg border-border bg-background py-3.5 shadow-none"
                >
                  <CardHeader className="grid-cols-[1fr_auto] gap-3 px-4">
                    <CardDescription className="text-[13px] font-medium">{label}</CardDescription>
                    <CardAction className="row-span-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="px-4">
                    <p className="text-[24px] font-semibold tracking-tight text-foreground">{counts[key] || 0}</p>
                  </CardContent>
                </Card>
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
                className="h-11 w-auto px-5 text-sm font-semibold"
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

          <aside className="border-t border-border bg-muted/35 px-4 py-4 text-foreground lg:border-l lg:border-t-0 lg:px-5 lg:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Mini timeline</p>
                <h3 className="mt-2 text-[18px] font-semibold text-foreground">Seus próximos passos</h3>
              </div>
              <Card size="sm" className="w-[112px] gap-2 rounded-lg border-border bg-background py-3 text-right shadow-none">
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
                  className="gap-2 rounded-lg border-border bg-background py-3 shadow-none"
                >
                  <CardHeader className="grid-cols-[1fr_auto] gap-3 px-4">
                    <CardTitle className="text-[14px] font-medium">{item.titulo}</CardTitle>
                    <CardAction className="row-span-1 text-[13px] text-muted-foreground">
                      {item.hora_inicio || 'Sem hora'}
                    </CardAction>
                  </CardHeader>
                  {item.descricao ? (
                    <CardContent className="px-4">
                      <p className="text-[13px] leading-6 text-muted-foreground">{item.descricao}</p>
                    </CardContent>
                  ) : null}
                </Card>
              )) : (
                <Card className="rounded-lg border-dashed border-border bg-background p-5 text-sm text-muted-foreground shadow-none">
                  Nada programado na timeline por enquanto.
                </Card>
              )}
            </div>

            <Card className="mt-4 rounded-xl border-border bg-background shadow-none">
              <CardHeader className="grid-cols-[1fr_auto] gap-3">
                <div>
                  <CardDescription className="text-xs uppercase tracking-[0.24em]">Boas do dia</CardDescription>
                  <CardTitle className="mt-2 text-[14px] font-semibold sm:text-[16px]">Pequenos ajustes, dia melhor</CardTitle>
                </div>
                <CardAction>
                  <Badge variant="warning" className="rounded-lg px-2 py-1 text-[10px] font-medium">
                  3 lembretes
                  </Badge>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-2">
                {dailyTips.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-lg border border-border bg-muted/30 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="ml-3 rounded-lg border border-border bg-background p-2">
                        <Icon className="h-[14px] w-[14px] text-amber-600" />
                      </div>
                      <div className="min-w-0 pr-3">
                        <p className="text-[13px] font-semibold text-foreground sm:text-[14px]">{title}</p>
                        <p className="mt-1 text-[13px] leading-6 text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
