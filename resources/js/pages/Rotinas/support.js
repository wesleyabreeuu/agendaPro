export const CATEGORY_OPTIONS = [
  { value: 'espiritual', label: 'Espiritual' },
  { value: 'saude', label: 'Saúde' },
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'familia', label: 'Família' },
  { value: 'estudos', label: 'Estudos' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'outro', label: 'Outro' },
]

export const FREQUENCY_OPTIONS = [
  { value: 'diaria', label: 'Diária' },
  { value: 'dias_semana', label: 'Dias da semana' },
  { value: 'intervalo', label: 'A cada X dias' },
]

export const DIFFICULTY_OPTIONS = [
  { value: 'facil', label: 'Fácil' },
  { value: 'media', label: 'Média' },
  { value: 'dificil', label: 'Difícil' },
]

export const ENERGY_OPTIONS = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
]

export const WEEKDAY_OPTIONS = [
  { value: 'seg', label: 'Seg' },
  { value: 'ter', label: 'Ter' },
  { value: 'qua', label: 'Qua' },
  { value: 'qui', label: 'Qui' },
  { value: 'sex', label: 'Sex' },
  { value: 'sab', label: 'Sab' },
  { value: 'dom', label: 'Dom' },
]

export const STATUS_OPTIONS = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'pulada', label: 'Pulada' },
]

const categoryColors = {
  espiritual: '#4f46e5',
  saude: '#16a34a',
  trabalho: '#f59e0b',
  familia: '#ec4899',
  estudos: '#0ea5e9',
  financeiro: '#14b8a6',
  pessoal: '#8b5cf6',
  outro: '#64748b',
}

export function labelFor(options, value, fallback = '-') {
  return options.find((option) => option.value === value)?.label || fallback
}

export function categoryLabel(value) {
  return labelFor(CATEGORY_OPTIONS, value, 'Sem categoria')
}

export function difficultyLabel(value) {
  return labelFor(DIFFICULTY_OPTIONS, value, 'Média')
}

export function energyLabel(value) {
  return value ? labelFor(ENERGY_OPTIONS, value, 'Média') : 'Livre'
}

export function statusLabel(value) {
  return labelFor(STATUS_OPTIONS, value, 'Pendente')
}

export function frequencyLabel(rotina) {
  if (!rotina) return '-'

  if (rotina.frequencia_tipo === 'dias_semana') {
    const dias = (rotina.dias_semana || []).map((dia) => labelFor(WEEKDAY_OPTIONS, dia, dia)).join(', ')
    return dias ? `Dias: ${dias}` : 'Dias definidos'
  }

  if (rotina.frequencia_tipo === 'intervalo') {
    return `A cada ${rotina.intervalo_dias || 1} dia${Number(rotina.intervalo_dias || 1) > 1 ? 's' : ''}`
  }

  return 'Todos os dias'
}

export function categoryBadgeStyle(value, isDark = false) {
  const color = categoryColors[value] || categoryColors.outro

  return {
    backgroundColor: isDark ? `${color}22` : `${color}12`,
    borderColor: `${color}44`,
    color,
  }
}

export function statusBadgeClass(status, isDark = false) {
  if (status === 'concluida') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  }

  if (status === 'pulada') {
    return isDark ? 'border-amber-400/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-600'
}

export function difficultyBadgeClass(value, isDark = false) {
  if (value === 'dificil') {
    return isDark ? 'border-red-400/40 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-700'
  }

  if (value === 'media') {
    return isDark ? 'border-amber-400/40 bg-amber-500/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'
  }

  return isDark ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
}

export function formatPercent(value) {
  return `${Math.round(Number(value || 0))}%`
}

