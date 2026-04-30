import React from 'react'
import { Link, router } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Button } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'

export default function SaudeDashboard({ resumo, strava, atividadesPorCategoria = [], metasProgresso = [], ultimasAtividades = [] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <AppLayout title="Saúde & Fitness" chrome="dashboard">
      <div className="space-y-6">
        <div className={`rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Integração com Strava</h2>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Quando você salvar uma nova atividade no Strava, o sistema poderá importar para o módulo de saúde.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className={`inline-flex h-10 items-center rounded-md px-4 text-sm font-medium ${
                strava.connected
                  ? 'bg-green-100 text-green-800'
                  : isDark
                    ? 'border border-zinc-700 bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-700'
              }`}>
                {strava.connected ? 'Conectado' : 'Desconectado'}
              </span>
              {strava.connected ? (
                <>
                  <Button type="button" onClick={() => router.post('/integracoes/strava/sync')} variant="outline" className={`h-10 w-auto rounded-md px-4 ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-card text-zinc-900'}`}>Sincronizar agora</Button>
                  <Button type="button" onClick={() => router.post('/integracoes/strava/disconnect')} variant="outline" className={`h-10 w-auto rounded-md px-4 ${isDark ? 'border-red-500/40 bg-zinc-900 text-red-400' : 'border-red-200 bg-white text-red-600'}`}>Desconectar</Button>
                </>
              ) : (
                <Button asChild className="h-10 w-auto rounded-md px-4"><a href="/integracoes/strava/connect">Conectar Strava</a></Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric title="Total de horas" value={`${Number(resumo.total_horas).toFixed(1)}h`} />
          <Metric title="Calorias queimadas" value={`${resumo.total_calorias} kcal`} />
          <Metric title="Sessões" value={String(resumo.sessoes)} />
          <Metric title="Tipos de atividade" value={String(resumo.tipos_atividade)} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Panel title="Suas metas" action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/metas">Gerenciar</Link></Button>}>
            <div className="space-y-4">
              {metasProgresso.map((item) => (
                <div key={item.meta.id}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-zinc-950">{item.meta.titulo}</p>
                      <p className="text-sm text-zinc-500">{item.progresso} / {item.meta.valor_alvo}</p>
                    </div>
                    <span className="text-sm font-medium text-zinc-700">{item.percentual.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100">
                    <div className="h-2 rounded-full bg-zinc-900" style={{ width: `${Math.min(item.percentual, 100)}%` }} />
                  </div>
                </div>
              ))}
              {metasProgresso.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma meta criada.</p> : null}
            </div>
          </Panel>

          <Panel title="Distribuição de atividades" action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/atividades">Ver atividades</Link></Button>}>
            <div className="space-y-4">
              {atividadesPorCategoria.map((atividade) => (
                <div key={atividade.categoria} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-zinc-950">{atividade.categoria}</p>
                    <span className="text-sm text-zinc-500">{atividade.sessoes}x</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">{Number(atividade.horas).toFixed(1)}h • {atividade.calorias} kcal</p>
                </div>
              ))}
              {atividadesPorCategoria.length === 0 ? <p className="text-sm text-zinc-500">Sem atividades nesta semana.</p> : null}
            </div>
          </Panel>
        </div>

        <Panel title="Últimas atividades" action={<Button asChild variant="outline" size="sm" className="w-auto"><Link href="/saude/atividades">Abrir lista</Link></Button>}>
          <div className="space-y-3">
            {ultimasAtividades.map((atividade) => (
              <div key={atividade.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-950">{atividade.categoria?.nome || 'Atividade'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.descricao || 'Sem descrição'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.data}{atividade.hora_inicio ? ` • ${atividade.hora_inicio}` : ''}</p>
                  </div>
                  <div className="text-right text-sm text-zinc-600">
                    <p>{atividade.duracao_minutos} min</p>
                    <p>{atividade.calorias_queimadas} kcal</p>
                    <p>{atividade.intensidade}</p>
                    {atividade.strava_url ? <a href={atividade.strava_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-amber-600">Abrir Strava</a> : null}
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

function Metric({ title, value }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-xl border p-5 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
      <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{title}</p>
      <p className={`mt-3 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{value}</p>
    </div>
  )
}

function Panel({ title, action = null, children }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-card'}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className={`text-lg font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}
