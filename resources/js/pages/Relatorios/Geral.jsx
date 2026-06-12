import React, { useMemo, useState } from 'react'
import { router } from '@inertiajs/react'
import {
  CalendarDays,
  ChartNoAxesCombined,
  CheckSquare,
  Columns3,
  Database,
  Filter,
  HeartPulse,
  ListChecks,
  Search,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AppLayout from '../../layouts/AppLayout'
import { Button } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'

function asArray(value) {
  return Array.isArray(value) ? value : []
}

function toggleValue(items, value) {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value]
}

function fieldKey(section, field) {
  return `${section}.${field}`
}

function shellClass(isDark) {
  return isDark
    ? 'border-zinc-700 bg-zinc-900 text-zinc-50'
    : 'border-zinc-200 bg-white text-zinc-950'
}

function subtleClass(isDark) {
  return isDark
    ? 'border-zinc-800 bg-zinc-950 text-zinc-300'
    : 'border-zinc-200 bg-zinc-50 text-zinc-700'
}

function inputClass(isDark) {
  return `h-11 rounded-lg border px-3 text-sm outline-none transition ${
    isDark
      ? 'border-zinc-700 bg-zinc-950 text-zinc-50 placeholder:text-zinc-500 focus:border-zinc-400'
      : 'border-zinc-300 bg-white text-zinc-950 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
  }`
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function formatNumber(value, suffix = '') {
  const formatted = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(Number(value || 0))
  return suffix ? `${formatted} ${suffix}` : formatted
}

export default function RelatorioGeral({ relatorio }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const secoesDisponiveis = relatorio?.secoes_disponiveis || {}
  const camposDisponiveis = relatorio?.campos_disponiveis || {}
  const secoesKeys = Object.keys(secoesDisponiveis)
  const camposKeys = useMemo(() => (
    Object.entries(camposDisponiveis).flatMap(([secao, campos]) => campos.map((campo) => fieldKey(secao, campo.key)))
  ), [camposDisponiveis])

  const [filters, setFilters] = useState({
    data_inicio: relatorio?.filtros?.data_inicio || '',
    data_fim: relatorio?.filtros?.data_fim || '',
    q: relatorio?.filtros?.q || '',
    status: relatorio?.filtros?.status || '',
    secoes: asArray(relatorio?.filtros?.secoes),
    campos: asArray(relatorio?.filtros?.campos),
  })

  const selectedSections = filters.secoes.length ? filters.secoes : secoesKeys
  const selectedFields = filters.campos.length ? filters.campos : camposKeys
  const graficos = relatorio?.graficos || {}
  const destaques = relatorio?.resumo?.destaques || {}
  const chartStroke = isDark ? '#fafafa' : '#2563eb'
  const chartFill = isDark ? '#d4d4d8' : '#60a5fa'
  const chartMuted = isDark ? '#52525b' : '#d4d4d8'

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function submit(event) {
    event.preventDefault()

    router.get('/relatorios/geral', filters, {
      preserveScroll: true,
      replace: true,
    })
  }

  function reset() {
    const clean = {
      data_inicio: '',
      data_fim: '',
      q: '',
      status: '',
      secoes: secoesKeys,
      campos: camposKeys,
    }

    setFilters(clean)
    router.get('/relatorios/geral', clean, { preserveScroll: true, replace: true })
  }

  return (
    <AppLayout title="Relatório Geral">
      <div className="space-y-6">
        <section className={`rounded-xl border p-5 shadow-xs ${shellClass(isDark)}`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Relatório Geral
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Leitura geral da rotina, projetos, saúde e dinheiro</h1>
              <p className={`mt-2 max-w-3xl text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                Veja onde estão concentradas as ações, o que mais aparece no período e depois aprofunde nos dados detalhados.
              </p>
            </div>

            <div className={`grid min-w-[220px] grid-cols-2 gap-3 rounded-lg border p-3 ${subtleClass(isDark)}`}>
              <Metric label="Registros" value={relatorio?.resumo?.total_registros ?? 0} />
              <Metric label="Seções" value={relatorio?.resumo?.total_secoes ?? 0} />
            </div>
          </div>
        </section>

        <form onSubmit={submit} className={`rounded-xl border p-5 shadow-xs ${shellClass(isDark)}`}>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr_1fr_auto]">
            <Field label="Data inicial" icon={CalendarDays} isDark={isDark}>
              <input
                type="date"
                value={filters.data_inicio}
                onChange={(event) => updateFilter('data_inicio', event.target.value)}
                className={inputClass(isDark)}
              />
            </Field>

            <Field label="Data final" icon={CalendarDays} isDark={isDark}>
              <input
                type="date"
                value={filters.data_fim}
                onChange={(event) => updateFilter('data_fim', event.target.value)}
                className={inputClass(isDark)}
              />
            </Field>

            <Field label="Busca" icon={Search} isDark={isDark}>
              <input
                type="search"
                value={filters.q}
                onChange={(event) => updateFilter('q', event.target.value)}
                placeholder="Título, descrição, origem..."
                className={inputClass(isDark)}
              />
            </Field>

            <Field label="Status" icon={Filter} isDark={isDark}>
              <select
                value={filters.status}
                onChange={(event) => updateFilter('status', event.target.value)}
                className={inputClass(isDark)}
              >
                <option value="">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="concluido">Concluído</option>
                <option value="finalizado">Finalizado</option>
                <option value="ativo">Ativo</option>
                <option value="iniciado">Iniciado</option>
                <option value="pago">Pago</option>
                <option value="recebido">Recebido</option>
              </select>
            </Field>

            <div className="flex items-end gap-2">
              <Button type="submit" className={`h-11 w-auto gap-2 px-4 ${
                isDark
                  ? 'border border-zinc-600 bg-white text-zinc-950 hover:bg-zinc-200'
                  : 'border border-blue-200 bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                <Filter className="h-4 w-4" />
                Filtrar
              </Button>
              <Button type="button" variant="outline" onClick={reset} className={`h-11 w-auto px-4 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100 hover:bg-zinc-800' : ''}`}>
                Limpar
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <SelectionPanel
              title="Módulos e seções"
              icon={Database}
              isDark={isDark}
              actions={[
                { label: 'Todos', onClick: () => updateFilter('secoes', secoesKeys) },
                { label: 'Limpar', onClick: () => updateFilter('secoes', []) },
              ]}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(secoesDisponiveis).map(([key, item]) => {
                  const selected = selectedSections.includes(key)

                  return (
                    <label key={key} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                      selected
                        ? isDark ? 'border-white bg-white text-zinc-950' : 'border-blue-200 bg-blue-50 text-blue-950 shadow-xs'
                        : subtleClass(isDark)
                    }`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => updateFilter('secoes', toggleValue(selectedSections, key))}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-semibold">{item.label}</span>
                        <span className={selected ? isDark ? 'text-zinc-700' : 'text-blue-700' : isDark ? 'text-zinc-500' : 'text-zinc-500'}>{item.modulo}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </SelectionPanel>

            <SelectionPanel
              title="Campos exibidos"
              icon={Columns3}
              isDark={isDark}
              actions={[
                { label: 'Todos', onClick: () => updateFilter('campos', camposKeys) },
                { label: 'Essenciais', onClick: () => updateFilter('campos', secoesKeys.flatMap((secao) => ['data', 'titulo', 'status', 'origem'].map((campo) => fieldKey(secao, campo)))) },
              ]}
            >
              <div className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
                {selectedSections.map((secao) => (
                  <div key={secao} className={`rounded-lg border p-3 ${subtleClass(isDark)}`}>
                    <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {secoesDisponiveis[secao]?.label || secao}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {(camposDisponiveis[secao] || []).map((campo) => {
                        const key = fieldKey(secao, campo.key)

                        return (
                          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedFields.includes(key)}
                              onChange={() => updateFilter('campos', toggleValue(selectedFields, key))}
                            />
                            <span>{campo.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </SelectionPanel>
          </div>
        </form>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Período analisado" value={relatorio?.resumo?.periodo || '-'} icon={CalendarDays} isDark={isDark} />
          <SummaryCard label="Módulo mais ativo" value={destaques.modulo_mais_movimentado?.name || '-'} helper={`${destaques.modulo_mais_movimentado?.total || 0} registros`} icon={ChartNoAxesCombined} isDark={isDark} />
          <SummaryCard label="Status dominante" value={destaques.status_principal?.name || '-'} helper={`${destaques.status_principal?.total || 0} ocorrências`} icon={ListChecks} isDark={isDark} />
          <SummaryCard label="Dias com dados" value={destaques.dias_com_dados || 0} helper="no período filtrado" icon={Database} isDark={isDark} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <ChartPanel title="Movimento por dia" description="Volume de registros encontrados em cada data do período." isDark={isDark}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={graficos.linha_do_tempo || []}>
                <CartesianGrid stroke={chartMuted} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="data" stroke={chartMuted} tickLine={false} axisLine={false} />
                <YAxis stroke={chartMuted} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Area type="monotone" dataKey="total" stroke={chartStroke} fill={chartFill} fillOpacity={isDark ? 0.18 : 0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Distribuição por módulo" description="Onde os dados estão mais concentrados." isDark={isDark}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={graficos.por_modulo || []} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid stroke={chartMuted} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke={chartMuted} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke={chartMuted} tickLine={false} axisLine={false} width={92} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Bar dataKey="total" fill={chartFill} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <ChartPanel title="Seções mais movimentadas" description="Ranking das áreas com mais registros." isDark={isDark}>
            <TopList data={(graficos.por_secao || []).slice(0, 7)} isDark={isDark} />
          </ChartPanel>

          <ChartPanel title="Status encontrados" description="Leitura rápida dos estados dos itens." isDark={isDark}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={graficos.por_status || []}>
                <CartesianGrid stroke={chartMuted} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke={chartMuted} tickLine={false} axisLine={false} />
                <YAxis stroke={chartMuted} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} />
                <Bar dataKey="total" fill={chartFill} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>

          <ChartPanel title="Sinais financeiros e saúde" description="Resumo visual dos módulos quantitativos." isDark={isDark}>
            <div className="grid gap-3">
              <SignalCard icon={Wallet} label="Receitas filtradas" value={formatCurrency(destaques.receitas)} isDark={isDark} />
              <SignalCard icon={Wallet} label="Despesas filtradas" value={formatCurrency(destaques.despesas)} isDark={isDark} />
              <SignalCard icon={HeartPulse} label="Distância registrada" value={formatNumber(destaques.distancia_km, 'km')} isDark={isDark} />
            </div>
            {(graficos.saude || []).length ? (
              <div className="mt-5">
                <p className={`mb-3 text-xs font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Atividades</p>
                <TopList data={(graficos.saude || []).map((item) => ({ name: item.name, total: item.sessoes, helper: `${formatNumber(item.distancia, 'km')}` })).slice(0, 4)} compact isDark={isDark} />
              </div>
            ) : null}
          </ChartPanel>
        </section>

        <div className="space-y-5">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Detalhamento</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Dados por seção</h2>
          </div>
          {(relatorio?.secoes || []).length ? (
            relatorio.secoes.map((secao) => (
              <ReportSection key={secao.key} secao={secao} isDark={isDark} />
            ))
          ) : (
            <div className={`rounded-xl border p-8 text-center shadow-xs ${shellClass(isDark)}`}>
              <CheckSquare className={`mx-auto h-8 w-8 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
              <p className="mt-3 text-lg font-semibold">Nenhum dado encontrado</p>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Ajuste os filtros ou amplie o período para montar o relatório.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

function Field({ label, icon: Icon, children, isDark }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={`flex items-center gap-2 text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
        <Icon className="h-4 w-4" />
        {label}
      </span>
      {children}
    </label>
  )
}

function SelectionPanel({ title, icon: Icon, children, actions, isDark }) {
  return (
    <div className={`rounded-lg border p-4 ${subtleClass(isDark)}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4" />
          {title}
        </h2>
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] opacity-60">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function SummaryCard({ label, value, helper, icon: Icon, isDark }) {
  return (
    <div className={`rounded-xl border p-4 shadow-xs ${shellClass(isDark)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
          <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
          {helper ? <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-lg border p-2 ${subtleClass(isDark)}`}>
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ChartPanel({ title, description, children, isDark }) {
  return (
    <section className={`rounded-xl border p-5 shadow-xs ${shellClass(isDark)}`}>
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{description}</p>
      </div>
      {children}
    </section>
  )
}

function ChartTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null

  return (
    <div className={`rounded-lg border px-3 py-2 text-sm shadow-xs ${shellClass(isDark)}`}>
      {label ? <p className="mb-1 font-semibold">{label}</p> : null}
      {payload.map((item) => (
        <p key={item.dataKey} className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>
          {item.name || item.dataKey}: {item.value}
        </p>
      ))}
    </div>
  )
}

function TopList({ data = [], compact = false, isDark }) {
  const max = Math.max(...data.map((item) => Number(item.total || 0)), 1)

  if (!data.length) {
    return <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Sem dados suficientes para este gráfico.</p>
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {data.map((item) => (
        <div key={item.name} className={`rounded-lg border p-3 ${subtleClass(isDark)}`}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">{item.name}</span>
            <span>{item.helper || `${item.total} registro(s)`}</span>
          </div>
          <div className={`mt-2 h-2 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
            <div
              className={`h-2 rounded-full ${isDark ? 'bg-zinc-100' : 'bg-blue-500'}`}
              style={{ width: `${Math.max(6, (Number(item.total || 0) / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function SignalCard({ icon: Icon, label, value, isDark }) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${subtleClass(isDark)}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg border p-2 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  )
}

function ReportSection({ secao, isDark }) {
  const columns = secao.campos || []
  const items = secao.items || []

  return (
    <section className={`rounded-xl border shadow-xs ${shellClass(isDark)}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 border-b p-5 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
        <div>
          <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{secao.modulo}</p>
          <h2 className="mt-1 text-lg font-semibold">{secao.label}</h2>
        </div>
        <span className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${subtleClass(isDark)}`}>
          {secao.total} registro(s)
        </span>
      </div>

      {items.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className={isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-600'}>
                {columns.map((column) => (
                  <th key={column.key} className={`border-b px-4 py-3 font-semibold ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={`${secao.key}-${index}`} className={isDark ? 'hover:bg-zinc-950' : 'hover:bg-zinc-50'}>
                  {columns.map((column) => (
                    <td key={column.key} className={`max-w-[280px] border-b px-4 py-3 align-top ${isDark ? 'border-zinc-800 text-zinc-200' : 'border-zinc-100 text-zinc-700'}`}>
                      <span className="line-clamp-3">{item[column.key] || '-'}</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={`p-5 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
          Nenhum registro nesta seção para os filtros atuais.
        </div>
      )}
    </section>
  )
}
