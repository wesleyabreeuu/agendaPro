import React, { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { useInertiaForm as useForm } from '@/hooks/useInertiaForm'
import AppLayout from '../../layouts/AppLayout'
import { Button, Select, Textarea, Input } from '@/components/ui'

export default function SaudeAtividades({ atividades, categorias = [] }) {
  const [tipoModo, setTipoModo] = useState(categorias.length ? 'existente' : 'novo')

  const atividadeForm = useForm({
    tipo_modo: categorias.length ? 'existente' : 'novo',
    categoria_atividade_fisica_id: '',
    categoria_nome: '',
    categoria_cor: '#e74c3c',
    categoria_icone: 'fas fa-dumbbell',
    categoria_caloria_leve: 4,
    categoria_caloria_moderada: 6,
    categoria_caloria_intensa: 8,
    descricao: '',
    data: '',
    hora_inicio: '',
    duracao_minutos: '',
    intensidade: 'moderada',
    notas: '',
  })

  return (
    <AppLayout title="Atividades Físicas">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Registrar atividade</h2>
            <form onSubmit={(e) => { e.preventDefault(); atividadeForm.post('/saude/atividades') }} className="mt-5 grid gap-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-white p-1">
                <button
                  type="button"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${tipoModo === 'existente' ? 'bg-zinc-950 text-white' : 'text-zinc-600'}`}
                  onClick={() => {
                    setTipoModo('existente')
                    atividadeForm.setData({ tipo_modo: 'existente' })
                  }}
                  disabled={!categorias.length}
                >
                  Tipo existente
                </button>
                <button
                  type="button"
                  className={`rounded-md px-3 py-2 text-sm font-medium ${tipoModo === 'novo' ? 'bg-zinc-950 text-white' : 'text-zinc-600'}`}
                  onClick={() => {
                    setTipoModo('novo')
                    atividadeForm.setData({ tipo_modo: 'novo', categoria_atividade_fisica_id: '' })
                  }}
                >
                  Novo tipo
                </button>
              </div>

              {tipoModo === 'existente' ? (
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-zinc-700">Tipo de atividade</label>
                  <Select value={atividadeForm.data.categoria_atividade_fisica_id} onChange={(e) => atividadeForm.setData('categoria_atividade_fisica_id', e.target.value)}>
                    <option value="">Selecione a atividade</option>
                    {categorias.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>)}
                  </Select>
                </div>
              ) : (
                <div className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium text-zinc-700">Nome do tipo</label>
                    <Input placeholder="Ex: Musculação" value={atividadeForm.data.categoria_nome} onChange={(e) => atividadeForm.setData('categoria_nome', e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-zinc-700">Cor</label>
                      <Input type="color" value={atividadeForm.data.categoria_cor} onChange={(e) => atividadeForm.setData('categoria_cor', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-zinc-700">Ícone</label>
                      <Input placeholder="fas fa-dumbbell" value={atividadeForm.data.categoria_icone} onChange={(e) => atividadeForm.setData('categoria_icone', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-zinc-700">Kcal/min leve</label>
                      <Input type="number" step="0.01" min="0" value={atividadeForm.data.categoria_caloria_leve} onChange={(e) => atividadeForm.setData('categoria_caloria_leve', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-zinc-700">Kcal/min moderada</label>
                      <Input type="number" step="0.01" min="0" value={atividadeForm.data.categoria_caloria_moderada} onChange={(e) => atividadeForm.setData('categoria_caloria_moderada', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium text-zinc-700">Kcal/min intensa</label>
                      <Input type="number" step="0.01" min="0" value={atividadeForm.data.categoria_caloria_intensa} onChange={(e) => atividadeForm.setData('categoria_caloria_intensa', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <Input placeholder="Descrição" value={atividadeForm.data.descricao} onChange={(e) => atividadeForm.setData('descricao', e.target.value)} />
              <Input type="date" value={atividadeForm.data.data} onChange={(e) => atividadeForm.setData('data', e.target.value)} />
              <Input type="time" value={atividadeForm.data.hora_inicio} onChange={(e) => atividadeForm.setData('hora_inicio', e.target.value)} />
              <Input type="number" min="1" placeholder="Duração em minutos" value={atividadeForm.data.duracao_minutos} onChange={(e) => atividadeForm.setData('duracao_minutos', e.target.value)} />
              <Select value={atividadeForm.data.intensidade} onChange={(e) => atividadeForm.setData('intensidade', e.target.value)}>
                <option value="leve">Leve</option>
                <option value="moderada">Moderada</option>
                <option value="intensa">Intensa</option>
              </Select>
              <Textarea className="min-h-24" placeholder="Notas" value={atividadeForm.data.notas} onChange={(e) => atividadeForm.setData('notas', e.target.value)} />
              <Button className="w-auto" disabled={atividadeForm.processing}>Salvar atividade</Button>
            </form>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Atividades registradas</h3>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm" className="w-auto">
                <Link href="/saude/calendario">Calendário</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-auto">
                <Link href="/saude/relatorios">Relatórios</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {atividades.data.map((atividade) => (
              <div key={atividade.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-zinc-950">{atividade.categoria?.nome || 'Atividade'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.descricao || '-'}</p>
                    <p className="mt-1 text-sm text-zinc-500">{atividade.data} • {atividade.duracao_minutos} min • {atividade.intensidade}</p>
                    {atividade.fonte ? <p className="mt-1 text-xs text-zinc-400">Origem: {atividade.fonte}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-zinc-950">{atividade.calorias_queimadas} kcal</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" className="w-auto">
                        <Link href={`/saude/atividades/${atividade.id}/edit`}>Editar</Link>
                      </Button>
                      <Button type="button" variant="destructive" size="sm" className="w-auto" onClick={() => router.delete(`/saude/atividades/${atividade.id}`)}>Excluir</Button>
                    </div>
                  </div>
                </div>
                {atividade.mapa_resumo_svg_path ? (
                  <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <svg viewBox="0 0 260 96" className="h-24 w-full">
                      <path d={atividade.mapa_resumo_svg_path} fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-5 text-sm text-zinc-500">
            Página {atividades.current_page} de {atividades.last_page} • {atividades.total} registros
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
