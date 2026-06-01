export const STATUS_LABELS = {
  planejamento: 'Planejamento',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  pausado: 'Pausado',
}

export const TYPE_LABELS = {
  peso: 'Peso',
  distancia: 'Distância',
  financeiro: 'Financeiro',
  estudo: 'Estudo',
  personalizado: 'Personalizado',
}

export const PROGRESS_TYPE_LABELS = {
  distancia: 'Distância',
  peso: 'Peso',
  financeiro: 'Financeiro',
  estudo: 'Estudo',
  treino: 'Treino',
  personalizado: 'Personalizado',
}

export function statusClass(status, isDark = false) {
  const palette = {
    planejamento: isDark ? 'border-sky-400/40 bg-sky-500/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700',
    em_andamento: isDark ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700',
    concluido: isDark ? 'border-violet-400/40 bg-violet-500/10 text-violet-300' : 'border-violet-200 bg-violet-50 text-violet-700',
    cancelado: isDark ? 'border-red-400/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700',
    pausado: isDark ? 'border-amber-400/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700',
  }

  return palette[status] || (isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700')
}

export function panelClass(isDark) {
  return `rounded-xl border p-6 shadow-xs ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-gradient-to-t from-primary/5 to-card'}`
}

export function innerClass(isDark) {
  return `rounded-lg border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`
}

export function number(value, digits = 0) {
  if (value === null || value === undefined || value === '') return '-'
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0))
}

export function percent(value) {
  return `${number(value, value % 1 === 0 ? 0 : 1)}%`
}
