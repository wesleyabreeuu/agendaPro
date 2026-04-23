import React from 'react'
import { router } from '@inertiajs/react'
import { Sparkles } from 'lucide-react'
import AppLayout from '../../layouts/AppLayout'
import { useTheme } from '../../contexts/ThemeContext'
import { categoryBadgeStyle, categoryLabel } from './support'

export default function RotinasTemplates({ templates = [] }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  function applyTemplate(id) {
    if (!window.confirm('Aplicar este template vai criar novas rotinas na sua conta. Deseja continuar?')) {
      return
    }

    router.post(`/rotinas/templates/${id}/aplicar`, {}, { preserveScroll: true })
  }

  return (
    <AppLayout title="Templates de Rotinas" chrome="dashboard">
      <div className="space-y-6">
        <div className={`rounded-[30px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
          <h1 className={`text-3xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Templates</h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Escolha uma estrutura pronta e importe várias rotinas de uma vez. Depois você pode editar cada uma livremente.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {templates.map((template) => (
            <section key={template.id} className={`rounded-[28px] border p-6 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className={`text-xl font-semibold tracking-tight ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{template.nome}</h2>
                    <span className="rounded-full border px-2.5 py-1 text-xs font-medium" style={categoryBadgeStyle(template.categoria, isDark)}>{categoryLabel(template.categoria)}</span>
                  </div>
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{template.descricao}</p>
                </div>
                <button type="button" onClick={() => applyTemplate(template.id)} className="inline-flex h-11 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Aplicar template
                </button>
              </div>

              <div className="mt-5 grid gap-3">
                {template.rotinas.map((rotina, index) => (
                  <div key={`${template.id}-${index}`} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50/70'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{rotina.nome}</p>
                        <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{categoryLabel(rotina.categoria)}</p>
                      </div>
                      {rotina.modo_minimo_ativo ? <span className={`rounded-full border px-2.5 py-1 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-700'}`}>modo mínimo</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

          {!templates.length ? (
            <div className={`rounded-[28px] border border-dashed px-6 py-12 text-center text-sm ${isDark ? 'border-zinc-700 text-zinc-400' : 'border-zinc-300 text-zinc-500'}`}>
              Nenhum template disponível.
            </div>
          ) : null}
        </div>
      </div>
    </AppLayout>
  )
}
