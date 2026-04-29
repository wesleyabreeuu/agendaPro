import React from 'react'
import { Link } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  ENERGY_OPTIONS,
  FREQUENCY_OPTIONS,
  WEEKDAY_OPTIONS,
  categoryLabel,
} from './support'

function FieldError({ message }) {
  if (!message) return null
  return <p className="text-sm text-red-600">{message}</p>
}

export default function RotinasForm({ mode = 'create', rotina = null }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const form = useForm({
    nome: rotina?.nome || '',
    descricao: rotina?.descricao || '',
    categoria: rotina?.categoria || 'pessoal',
    frequencia_tipo: rotina?.frequencia_tipo || 'diaria',
    dias_semana: rotina?.dias_semana || [],
    intervalo_dias: rotina?.intervalo_dias || 1,
    data_inicio: rotina?.data_inicio || new Date().toISOString().slice(0, 10),
    horario: rotina?.horario || '',
    dificuldade: rotina?.dificuldade || 'media',
    energia_recomendada: rotina?.energia_recomendada || '',
    modo_minimo_ativo: Boolean(rotina?.modo_minimo_ativo),
    modo_minimo_descricao: rotina?.modo_minimo_descricao || '',
    cor: rotina?.cor || '',
    icone: rotina?.icone || '',
    ativo: rotina?.ativo ?? true,
    ordem: rotina?.ordem || '',
  })

  function toggleWeekday(day) {
    form.setData('dias_semana', form.data.dias_semana.includes(day)
      ? form.data.dias_semana.filter((item) => item !== day)
      : [...form.data.dias_semana, day]
    )
  }

  function submit(event) {
    event.preventDefault()

    if (mode === 'edit' && rotina?.id) {
      form.put(`/rotinas/${rotina.id}`)
      return
    }

    form.post('/rotinas')
  }

  return (
    <AppLayout title={mode === 'edit' ? 'Editar rotina' : 'Nova rotina'} chrome="dashboard">
      <div className="space-y-6">
        <div className={`rounded-[30px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className={`text-sm uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Rotinas</p>
              <h1 className={`mt-2 text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{mode === 'edit' ? 'Editar rotina' : 'Criar nova rotina'}</h1>
              <p className={`mt-2 max-w-2xl text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Defina frequência, dificuldade, energia e um modo mínimo para proteger sua constância.</p>
            </div>
            <Link href="/rotinas/minhas" className={`inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}>
              Voltar para minhas rotinas
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <form onSubmit={submit} className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Nome</label>
                <Input value={form.data.nome} onChange={(event) => form.setData('nome', event.target.value)} placeholder="Ex.: Ler 10 páginas" />
                <FieldError message={form.errors.nome} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Descrição</label>
                <Textarea value={form.data.descricao} onChange={(event) => form.setData('descricao', event.target.value)} className="min-h-28" placeholder="Contexto ou intenção da rotina" />
                <FieldError message={form.errors.descricao} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Categoria</label>
                <Select value={form.data.categoria} onChange={(event) => form.setData('categoria', event.target.value)}>
                  {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
                <FieldError message={form.errors.categoria} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Dificuldade</label>
                <Select value={form.data.dificuldade} onChange={(event) => form.setData('dificuldade', event.target.value)}>
                  {DIFFICULTY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
                <FieldError message={form.errors.dificuldade} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Frequência</label>
                <Select
                  value={form.data.frequencia_tipo}
                  onChange={(event) => {
                    const value = event.target.value
                    form.setData((current) => ({
                      ...current,
                      frequencia_tipo: value,
                      dias_semana: value === 'dias_semana' ? current.dias_semana : [],
                      intervalo_dias: value === 'intervalo' ? current.intervalo_dias || 1 : '',
                    }))
                  }}
                >
                  {FREQUENCY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
                <FieldError message={form.errors.frequencia_tipo} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Data de início</label>
                <Input type="date" value={form.data.data_inicio} onChange={(event) => form.setData('data_inicio', event.target.value)} />
                <FieldError message={form.errors.data_inicio} />
              </div>

              {form.data.frequencia_tipo === 'dias_semana' ? (
                <div className="space-y-2 md:col-span-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Dias da semana</label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_OPTIONS.map((day) => {
                      const active = form.data.dias_semana.includes(day.value)
                      return (
                        <Button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeekday(day.value)}
                          variant={active ? 'default' : 'outline'}
                          className={`rounded-full px-3 py-2 text-sm transition ${!active && isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : !active ? 'border-zinc-200 bg-white text-zinc-700' : ''}`}
                        >
                          {day.label}
                        </Button>
                      )
                    })}
                  </div>
                  <FieldError message={form.errors.dias_semana} />
                </div>
              ) : null}

              {form.data.frequencia_tipo === 'intervalo' ? (
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Intervalo em dias</label>
                  <Input type="number" min="1" value={form.data.intervalo_dias} onChange={(event) => form.setData('intervalo_dias', event.target.value)} />
                  <FieldError message={form.errors.intervalo_dias} />
                </div>
              ) : null}

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Horário</label>
                <Input type="time" value={form.data.horario} onChange={(event) => form.setData('horario', event.target.value)} />
                <FieldError message={form.errors.horario} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Energia recomendada</label>
                <Select value={form.data.energia_recomendada} onChange={(event) => form.setData('energia_recomendada', event.target.value)}>
                  <option value="">Livre</option>
                  {ENERGY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </Select>
                <FieldError message={form.errors.energia_recomendada} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Cor de apoio</label>
                <Input type="text" value={form.data.cor} onChange={(event) => form.setData('cor', event.target.value)} placeholder="#111827" />
                <FieldError message={form.errors.cor} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Ícone</label>
                <Input type="text" value={form.data.icone} onChange={(event) => form.setData('icone', event.target.value)} placeholder="book-open, heart, sun..." />
                <FieldError message={form.errors.icone} />
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Ordem</label>
                <Input type="number" min="0" value={form.data.ordem} onChange={(event) => form.setData('ordem', event.target.value)} placeholder="Opcional" />
                <FieldError message={form.errors.ordem} />
              </div>
            </div>

            <div className={`mt-5 rounded-3xl border p-5 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
              <label className={`flex items-center gap-3 text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                <Checkbox checked={form.data.modo_minimo_ativo} onCheckedChange={(checked) => form.setData('modo_minimo_ativo', Boolean(checked))} />
                Ativar modo mínimo
              </label>
              <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Use uma versão reduzida da rotina para dias difíceis e ainda assim manter constância.</p>
              {form.data.modo_minimo_ativo ? (
                <div className="mt-4 space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Descrição do modo mínimo</label>
                  <Textarea value={form.data.modo_minimo_descricao} onChange={(event) => form.setData('modo_minimo_descricao', event.target.value)} className="min-h-24" placeholder="Ex.: Ler 2 páginas ou caminhar 5 minutos" />
                  <FieldError message={form.errors.modo_minimo_descricao} />
                </div>
              ) : null}
            </div>

            <label className={`mt-5 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-300' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
              <Checkbox checked={form.data.ativo} onCheckedChange={(checked) => form.setData('ativo', Boolean(checked))} />
              Rotina ativa
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="submit" className="w-auto rounded-xl px-5" disabled={form.processing}>{mode === 'edit' ? 'Salvar alterações' : 'Criar rotina'}</Button>
              <Link href="/rotinas/minhas" className={`inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}>
                Cancelar
              </Link>
            </div>
          </form>

          <aside className="space-y-6">
            <section className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <p className={`text-sm uppercase tracking-[0.18em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Prévia</p>
              <h2 className={`mt-3 text-2xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{form.data.nome || 'Sua nova rotina'}</h2>
              <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{form.data.descricao || 'Descreva brevemente o sentido dessa prática.'}</p>

              <div className="mt-5 grid gap-3">
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Categoria</p>
                  <p className={`mt-2 font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{categoryLabel(form.data.categoria)}</p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Frequência</p>
                  <p className={`mt-2 font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>
                    {form.data.frequencia_tipo === 'dias_semana'
                      ? `Dias: ${(form.data.dias_semana || []).map((day) => WEEKDAY_OPTIONS.find((item) => item.value === day)?.label || day).join(', ') || 'selecionar'}`
                      : form.data.frequencia_tipo === 'intervalo'
                        ? `A cada ${form.data.intervalo_dias || 1} dia(s)`
                        : 'Todos os dias'}
                  </p>
                </div>
                <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Modo mínimo</p>
                  <p className={`mt-2 font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{form.data.modo_minimo_ativo ? form.data.modo_minimo_descricao || 'Ativo, mas sem descrição' : 'Desativado'}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AppLayout>
  )
}
