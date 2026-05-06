import React from 'react'
import { Link, router } from '@inertiajs/react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Bike, Flame, Gauge, Mountain, Route, Timer, Trophy, Zap } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { Button } from '@/components/ui'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useTheme } from '../../contexts/ThemeContext'

const rideChartConfig = {
  km: { label: 'Km', color: '#22c55e' },
  altimetria: { label: 'Altimetria', color: '#f97316' },
  calorias: { label: 'Calorias', color: '#facc15' },
  velocidade_media: { label: 'Vel. média', color: '#38bdf8' },
  velocidade_maxima: { label: 'Vel. máxima', color: '#a78bfa' },
  altitude: { label: 'Altitude', color: '#e5e7eb' },
  velocidade: { label: 'Velocidade', color: '#38bdf8' },
}

function number(value, digits = 0) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0))
}

function panelClass(isDark) {
  return `rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'}`
}

function innerClass(isDark) {
  return `rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`
}

export default function SaudeDashboard({
  resumo,
  strava,
  atividadesPorCategoria = [],
  metasProgresso = [],
  ultimasAtividades = [],
  graficos = {},
}) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const monthly = graficos.evolucao_mensal || []
  const recentRides = graficos.pedais_recentes || []
  const elevation = graficos.perfil_altimetria || { pontos: [], atividade: null }
  const ranking = graficos.ranking || { distancia: [], altimetria: [], velocidade: [] }

  return (
    <AppLayout title="Saúde & Fitness" chrome="dashboard">
      <div className="space-y-6">
        <section className={panelClass(isDark)}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.22em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Painel Strava</p>
              <h2 className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Evolução dos seus pedais</h2>
              <p className={`mt-2 max-w-3xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Distância, velocidade, altimetria e esforço reunidos para acompanhar seus treinos sem abrir mão dos detalhes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium ${
                strava.connected
                  ? isDark ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-100 text-zinc-700'
              }`}>
                {strava.connected ? 'Conectado' : 'Desconectado'}
              </span>
              {strava.connected ? (
                <>
                  <Button type="button" onClick={() => router.post('/integracoes/strava/sync')} variant="outline" className="h-10 w-auto rounded-md px-4">Sincronizar agora</Button>
                  <Button type="button" onClick={() => router.post('/integracoes/strava/disconnect')} variant="outline" className="h-10 w-auto rounded-md border-red-500/40 px-4 text-red-400">Desconectar</Button>
                </>
              ) : (
                <Button asChild className="h-10 w-auto rounded-md px-4"><a href="/integracoes/strava/connect">Conectar Strava</a></Button>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Route} title="Km rodados" value={`${number(resumo.total_km, 1)} km`} helper={`${resumo.sessoes} pedais registrados`} isDark={isDark} />
          <Metric icon={Timer} title="Tempo em movimento" value={`${number(resumo.total_horas, 1)}h`} helper={`${number(resumo.tempo_decorrido_horas, 1)}h decorridas`} isDark={isDark} />
          <Metric icon={Mountain} title="Altimetria total" value={`${number(resumo.altimetria_total_m)} m`} helper={`Pico salvo: ${number(resumo.pico_altimetria_m)} m`} isDark={isDark} />
          <Metric icon={Gauge} title="Velocidade média" value={`${number(resumo.velocidade_media_kmh, 1)} km/h`} helper={`Máxima: ${number(resumo.velocidade_maxima_kmh, 1)} km/h`} isDark={isDark} />
          <Metric icon={Flame} title="Calorias" value={`${number(resumo.total_calorias)} kcal`} helper="Total importado do Strava" isDark={isDark} />
          <Metric icon={Bike} title="Maior pedal" value={`${number(resumo.maior_pedal_km, 1)} km`} helper="Melhor distância registrada" isDark={isDark} />
          <Metric icon={Zap} title="Maior ganho" value={`${number(resumo.maior_ganho_elevacao_m)} m`} helper="Elevação acumulada em um pedal" isDark={isDark} />
          <Metric icon={Trophy} title="Tipos de atividade" value={String(resumo.tipos_atividade)} helper="Categorias registradas" isDark={isDark} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <ChartAreaInteractive
            data={monthly}
            title="Volume mensal"
            description="Distância e altimetria no período selecionado."
          />

          <Panel title="Distribuição" subtitle="Como seus registros se dividem por tipo." action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/atividades">Ver atividades</Link></Button>} isDark={isDark}>
            <div className="space-y-3">
              {atividadesPorCategoria.map((atividade) => (
                <div key={atividade.categoria} className={innerClass(isDark)}>
                  <div className="flex items-center justify-between gap-4">
                    <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{atividade.categoria}</p>
                    <span className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{atividade.sessoes}x</span>
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {number(atividade.distancia_km, 1)} km • {number(atividade.horas, 1)}h • {number(atividade.calorias)} kcal
                  </p>
                </div>
              ))}
              {atividadesPorCategoria.length === 0 ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Sem atividades registradas ainda.</p> : null}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Pedais recentes" subtitle="Distância, altimetria e velocidade de cada saída." isDark={isDark}>
            <ChartContainer config={rideChartConfig} className="h-[320px] w-full">
              <BarChart data={recentRides}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="km" fill="var(--color-km)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="altimetria" fill="var(--color-altimetria)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Panel>

          <Panel
            title="Perfil do último pedal com streams"
            subtitle={elevation.atividade ? elevation.atividade.descricao : 'Sincronize novamente para trazer altitude ponto a ponto.'}
            isDark={isDark}
          >
            <ChartContainer config={rideChartConfig} className="h-[320px] w-full">
              <LineChart data={elevation.pontos}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="km" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis yAxisId="altitude" tickLine={false} axisLine={false} width={42} />
                <YAxis yAxisId="velocidade" orientation="right" tickLine={false} axisLine={false} width={42} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line yAxisId="altitude" type="monotone" dataKey="altitude" stroke="var(--color-altitude)" strokeWidth={2} dot={false} />
                <Line yAxisId="velocidade" type="monotone" dataKey="velocidade" stroke="var(--color-velocidade)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </Panel>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel title="Melhores resultados" subtitle="Ranking automático dos seus pedais." isDark={isDark}>
            <div className="grid gap-4 xl:grid-cols-3">
              <Ranking title="Distância" items={ranking.distancia} field={(item) => `${number(item.km, 1)} km`} isDark={isDark} />
              <Ranking title="Altimetria" items={ranking.altimetria} field={(item) => `${number(item.altimetria)} m`} isDark={isDark} />
              <Ranking title="Velocidade" items={ranking.velocidade} field={(item) => `${number(item.velocidade_media, 1)} km/h`} isDark={isDark} />
            </div>
          </Panel>

          <Panel title="Suas metas" subtitle="Progresso da semana atual." action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/metas">Gerenciar</Link></Button>} isDark={isDark}>
            <div className="space-y-4">
              {metasProgresso.map((item) => (
                <div key={item.meta.id}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.meta.titulo}</p>
                      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{number(item.progresso, 1)} / {item.meta.valor_alvo}</p>
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.percentual.toFixed(0)}%</span>
                  </div>
                  <div className={`h-2 overflow-hidden rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(item.percentual, 100)}%` }} />
                  </div>
                </div>
              ))}
              {metasProgresso.length === 0 ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Nenhuma meta criada.</p> : null}
            </div>
          </Panel>
        </div>

        <Panel title="Últimas atividades" action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/atividades">Abrir lista</Link></Button>} isDark={isDark}>
          <div className="space-y-3">
            {ultimasAtividades.map((atividade) => (
              <div key={atividade.id} className={innerClass(isDark)}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{atividade.categoria?.nome || 'Atividade'}</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{atividade.descricao || 'Sem descrição'}</p>
                    <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{atividade.data}{atividade.hora_inicio ? ` • ${atividade.hora_inicio}` : ''}</p>
                  </div>
                  <div className={`text-right text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <p>{atividade.distancia_formatada || `${atividade.duracao_minutos} min`}</p>
                    <p>{atividade.elevacao_formatada || `${atividade.calorias_queimadas} kcal`}</p>
                    <p>{atividade.velocidade_media_kmh ? `${number(atividade.velocidade_media_kmh, 1)} km/h méd.` : atividade.intensidade}</p>
                    {atividade.strava_url ? <a href={atividade.strava_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-emerald-400">Abrir Strava</a> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AppLayout>
  )
}

function Metric({ icon: Icon, title, value, helper, isDark }) {
  return (
    <div className={panelClass(isDark)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
          <p className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg border ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, action = null, children, isDark }) {
  return (
    <section className={panelClass(isDark)}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</h3>
          {subtitle ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Ranking({ title, items = [], field, isDark }) {
  return (
    <div className="space-y-3">
      <p className={`text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{title}</p>
      {items.map((item, index) => (
        <div key={`${title}-${item.id}`} className={innerClass(isDark)}>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>{index + 1}</span>
            <div className="min-w-0">
              <p className={`truncate text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{item.nome}</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <span className={`text-lg font-semibold leading-none ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{field(item)}</span>
                <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.data}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {!items.length ? <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Sem dados suficientes.</p> : null}
    </div>
  )
}
