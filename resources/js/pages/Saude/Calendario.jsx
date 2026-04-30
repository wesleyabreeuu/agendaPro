import React from 'react'
import AppLayout from '../../layouts/AppLayout'

export default function SaudeCalendario({ eventos = [], mes, ano }) {
  return (
    <AppLayout title="Calendário de Atividades">
      <div className="rounded-xl border border-zinc-200 bg-gradient-to-t from-primary/5 to-card p-6 shadow-xs">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-950">Calendário de atividades</h2>
          <p className="text-sm text-zinc-500">Eventos encontrados em {String(mes).padStart(2, '0')}/{ano}.</p>
        </div>
        <div className="space-y-3">
          {eventos.map((evento, index) => (
            <div key={`${evento.date}-${index}`} className="rounded-lg border border-zinc-200 p-4">
              <p className="font-medium text-zinc-950">{evento.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{evento.date} • {evento.duracao} • {evento.calorias}</p>
            </div>
          ))}
          {eventos.length === 0 ? <p className="text-sm text-zinc-500">Nenhuma atividade encontrada para este mês.</p> : null}
        </div>
      </div>
    </AppLayout>
  )
}
