import React, { useEffect, useMemo, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Button, Textarea } from '@/components/ui'
import { Bot, CalendarDays, CheckSquare, LoaderCircle, SendHorizontal, Sparkles, Wallet, X } from 'lucide-react'

function messageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `ai-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function commandSuggestions(permissions = {}) {
  const items = []

  if (permissions.compromissos) {
    items.push('cria um compromisso amanhã às 14h com João')
    items.push('me lembra de pagar conta de luz amanhã')
    items.push('quais são meus compromissos de hoje?')
  }

  if (permissions.dia_a_dia) {
    items.push('adiciona tarefa estudar laravel hoje')
  }

  if (permissions.financeiro) {
    items.push('gastei 50 reais com gasolina hoje')
    items.push('recebi 2000 de salário hoje')
    items.push('quero guardar 10 mil reais até dezembro')
    items.push('quero comprar um carro de 50 mil')
  }

  return items.slice(0, 6)
}

function actionLabel(action) {
  return {
    create_event: 'Compromisso criado',
    create_reminder: 'Lembrete criado',
    create_expense: 'Despesa lançada',
    create_income: 'Receita lançada',
    create_income_goal: 'Meta de receita criada',
    create_asset_goal: 'Meta de bem criada',
    create_task: 'Tarefa criada',
    list_events_today: 'Compromissos de hoje',
    unknown: 'Comando não entendido',
  }[action] || 'Resposta do assistente'
}

function normalizeErrorMessage(message = '') {
  if (message.includes('OpenAI nao esta configurada') || message.includes('OpenAI não está configurada')) {
    return 'Configure a variável OPENAI_API_KEY no arquivo .env para liberar o assistente.'
  }

  return message || 'Não foi possível processar o comando.'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))
}

function renderActionSummary(action, data) {
  if (action === 'list_events_today') {
    if (!Array.isArray(data) || !data.length) {
      return 'Nenhum compromisso encontrado para hoje.'
    }

    return `${data.length} compromisso(s) encontrado(s) para hoje.`
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return 'Ação processada com sucesso.'
  }

  switch (action) {
    case 'create_event':
      return `${data.title || 'Compromisso'} em ${data.date || '-'}${data.time ? ` às ${data.time}` : ''}.`
    case 'create_reminder':
      return `${data.description || data.title || 'Lembrete'} para ${data.date || '-'}.`
    case 'create_expense':
      return `${data.description || 'Despesa'} registrada no valor de ${formatCurrency(data.amount)}.`
    case 'create_income':
      return `${data.description || 'Receita'} registrada no valor de ${formatCurrency(data.amount)}.`
    case 'create_income_goal':
      return `${data.description || 'Meta de economia'} com alvo de ${formatCurrency(data.target_amount)}.`
    case 'create_asset_goal':
      return `${data.description || 'Meta de bem'} com alvo de ${formatCurrency(data.target_amount)}.`
    case 'create_task':
      return `${data.title || 'Tarefa'} agendada para ${data.date || '-'}.`
    default:
      return 'Ação processada com sucesso.'
  }
}

function ResultCard({ item, isDark = false }) {
  const { role, content, action, data, isError } = item

  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${isDark ? 'bg-white text-black' : 'bg-zinc-950 text-white'}`}>
          {content}
        </div>
      </div>
    )
  }

  const events = action === 'list_events_today' && Array.isArray(data) ? data : []

  return (
    <div className="flex justify-start">
      <div className={`max-w-[92%] rounded-3xl border px-4 py-3 shadow-sm ${isError
        ? 'border-red-200 bg-red-50 text-red-700'
        : isDark
          ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
          : 'border-zinc-200 bg-white text-zinc-900'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-2xl ${isError
            ? 'bg-red-100 text-red-600'
            : isDark
              ? 'bg-zinc-800 text-zinc-100'
              : 'bg-zinc-100 text-zinc-900'
          }`}>
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{actionLabel(action)}</p>
            <p className={`text-xs ${isError ? 'text-red-600' : isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{content}</p>
          </div>
        </div>

        {!isError ? (
          <div className={`mt-3 rounded-2xl border px-3 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
            <p>{renderActionSummary(action, data)}</p>

            {events.length ? (
              <div className="mt-3 space-y-2">
                {events.map((event) => (
                  <div key={event.id} className={`rounded-2xl border px-3 py-2 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
                    <p className="font-medium">{event.title}</p>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {event.date}{event.time ? ` às ${event.time}` : ' • dia inteiro'}
                    </p>
                    {event.description ? <p className={`mt-1 text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>{event.description}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function AIAssistantWidget({ permissions = {}, isDark = false }) {
  const [open, setOpen] = useState(false)
  const [command, setCommand] = useState('')
  const [messages, setMessages] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const scrollRef = useRef(null)
  const suggestions = useMemo(() => commandSuggestions(permissions), [permissions])

  const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  useEffect(() => {
    if (!open || !scrollRef.current) return

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, open])

  const submitCommand = async (rawCommand) => {
    const nextCommand = rawCommand.trim()

    if (!nextCommand || sending) {
      return
    }

    setError('')
    setSending(true)
    setMessages((current) => [...current, { id: messageId(), role: 'user', content: nextCommand }])
    setCommand('')

    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': getCsrfToken(),
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ command: nextCommand }),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        const message = normalizeErrorMessage(payload?.message || '')

        setMessages((current) => [...current, {
          id: messageId(),
          role: 'assistant',
          content: message,
          action: 'unknown',
          data: {},
          isError: true,
        }])
        return
      }

      setMessages((current) => [...current, {
        id: messageId(),
        role: 'assistant',
        content: payload.message || 'Ação executada com sucesso.',
        action: payload.action || 'unknown',
        data: payload.data,
        isError: false,
      }])

      if (payload.action && payload.action !== 'unknown' && payload.action !== 'list_events_today') {
        window.setTimeout(() => {
          router.reload({ preserveScroll: true, preserveState: true })
        }, 1200)
      }
    } catch (requestError) {
      const message = normalizeErrorMessage(requestError?.message || '')
      setError(message)
      setMessages((current) => [...current, {
        id: messageId(),
        role: 'assistant',
        content: message,
        action: 'unknown',
        data: {},
        isError: true,
      }])
    } finally {
      setSending(false)
    }
  }

  const available = Boolean(suggestions.length)

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen((value) => !value)}
        size="icon-lg"
        className={`fixed right-4 bottom-4 z-[70] h-14 w-14 rounded-2xl border shadow-2xl transition hover:-translate-y-0.5 lg:right-6 lg:bottom-6 ${isDark ? 'border-zinc-700 bg-white text-black' : 'border-zinc-200 bg-zinc-950 text-white'}`}
        aria-label={open ? 'Fechar assistente' : 'Abrir assistente'}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </Button>

      {open ? (
        <section className={`fixed right-4 bottom-20 z-[69] flex h-[min(78vh,680px)] w-[calc(100vw-2rem)] max-w-[420px] flex-col overflow-hidden rounded-[30px] border shadow-2xl lg:right-6 lg:bottom-24 ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950'}`}>
          <div className={`border-b px-5 py-4 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? 'bg-white text-black' : 'bg-zinc-950 text-white'}`}>
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Assistente AgendaPro</h3>
                  <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Interpreta seu comando e executa apenas ações permitidas no sistema.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="outline"
                size="icon-lg"
                className={`rounded-2xl ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-200 bg-white text-zinc-600'}`}
                aria-label="Fechar assistente"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {!messages.length ? (
              <div className={`rounded-[26px] border px-4 py-4 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-sm font-semibold">O que você pode pedir agora</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      onClick={() => setCommand(suggestion)}
                      variant="outline"
                      className={`h-auto rounded-full px-3 py-2 text-left text-xs transition ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-200 hover:bg-zinc-800' : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'}`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                {!available ? (
                  <p className={`mt-4 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Seu perfil ainda não possui acesso aos módulos usados pelo assistente.
                  </p>
                ) : null}

                <div className={`mt-4 grid grid-cols-3 gap-2 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                    <CalendarDays className="mb-2 h-4 w-4" />
                    Agenda
                  </div>
                  <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                    <CheckSquare className="mb-2 h-4 w-4" />
                    Tarefas
                  </div>
                  <div className={`rounded-2xl border px-3 py-3 ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
                    <Wallet className="mb-2 h-4 w-4" />
                    Financeiro
                  </div>
                </div>
              </div>
            ) : null}

            {messages.map((item) => (
              <ResultCard key={item.id} item={item} isDark={isDark} />
            ))}

            {sending ? (
              <div className="flex justify-start">
                <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-zinc-200 bg-zinc-50 text-zinc-700'}`}>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Interpretando seu comando...
                </div>
              </div>
            ) : null}
          </div>

          <div className={`border-t px-4 py-4 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-200 bg-zinc-50'}`}>
            {error ? (
              <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}

            <div className={`rounded-[26px] border p-3 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <Textarea
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    submitCommand(command)
                  }
                }}
                rows={3}
                placeholder="Digite algo como: cria um compromisso amanhã às 14h com João"
                className={`w-full resize-none border-0 bg-transparent text-sm outline-none shadow-none focus-visible:border-0 focus-visible:ring-0 ${isDark ? 'text-zinc-100 placeholder:text-zinc-500' : 'text-zinc-950 placeholder:text-zinc-400'}`}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  Enter envia. Shift + Enter quebra linha.
                </p>
                <Button
                  type="button"
                  onClick={() => submitCommand(command)}
                  disabled={!command.trim() || sending || !available}
                  className={`h-11 w-auto gap-2 rounded-2xl px-4 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-950 text-white hover:bg-zinc-800'}`}
                >
                  {sending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                  Enviar
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
