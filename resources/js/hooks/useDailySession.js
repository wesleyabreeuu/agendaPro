import { router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'

function storageKey(userId, date) {
  return `agendapro.daily-session.hidden.${userId}.${date}`
}

function hasGuidedViewParam() {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const params = new window.URLSearchParams(window.location.search)
    return params.get('visao') === 'dia' || params.get('ritual') === '1'
  } catch (error) {
    console.warn('Nao foi possivel ler os parametros da URL da sessao do dia.', error)
    return false
  }
}

function clearGuidedViewParam() {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const url = new window.URL(window.location.href)
    url.searchParams.delete('visao')
    url.searchParams.delete('ritual')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  } catch (error) {
    console.warn('Nao foi possivel limpar o parametro de preview da sessao do dia.', error)
  }
}

function getHiddenFlag(key) {
  if (!key || typeof window === 'undefined') {
    return false
  }

  try {
    return window.localStorage.getItem(key) === 'true'
  } catch (error) {
    console.warn('Nao foi possivel ler o estado local da sessao do dia.', error)
    return false
  }
}

function setHiddenFlag(key) {
  if (!key || typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, 'true')
  } catch (error) {
    console.warn('Nao foi possivel salvar o estado local da sessao do dia.', error)
  }
}

function clearHiddenFlag(key) {
  if (!key || typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn('Nao foi possivel limpar o estado local da sessao do dia.', error)
  }
}

export function useDailySession({ enabled = true, userId = null }) {
  const [loading, setLoading] = useState(enabled)
  const [open, setOpen] = useState(false)
  const [starting, setStarting] = useState(false)
  const [date, setDate] = useState('')
  const [preview, setPreview] = useState(null)

  const hiddenKey = useMemo(() => (
    userId && date ? storageKey(userId, date) : null
  ), [date, userId])

  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false)
      setOpen(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      const forcePreview = hasGuidedViewParam()

      try {
        const response = await fetch('/api/daily-session/check', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })

        if (!response.ok) {
          throw new Error('Falha ao verificar sessao do dia.')
        }

        const payload = await response.json()
        const currentDate = payload?.date || ''
        const isHidden = currentDate ? getHiddenFlag(storageKey(userId, currentDate)) : false

        if (cancelled) {
          return
        }

        setDate(currentDate)

        if (!forcePreview && (payload?.iniciado || isHidden)) {
          setOpen(false)
          setPreview(null)
          return
        }

        const meuDiaResponse = await fetch('/api/meu-dia', {
          headers: { Accept: 'application/json' },
          credentials: 'same-origin',
        })

        if (!meuDiaResponse.ok) {
          throw new Error('Falha ao carregar preview do dia.')
        }

        const meuDiaPayload = await meuDiaResponse.json()

        if (cancelled) {
          return
        }

        setPreview(meuDiaPayload)
        setOpen(true)
      } catch (error) {
        console.error(error)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [enabled, userId])

  async function startDay() {
    setStarting(true)

    try {
      const response = await fetch('/api/daily-session/start', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      })

      if (!response.ok) {
        throw new Error('Falha ao iniciar o dia.')
      }

      setOpen(false)
      clearHiddenFlag(hiddenKey)
      router.visit('/meu-dia')
      clearGuidedViewParam()

      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          if (window.location.pathname !== '/meu-dia') {
            window.location.assign('/meu-dia')
          }
        }, 250)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setStarting(false)
    }
  }

  function skipForToday() {
    setOpen(false)
    setHiddenFlag(hiddenKey)
    clearGuidedViewParam()
  }

  return {
    loading,
    open,
    preview,
    starting,
    startDay,
    skipForToday,
  }
}
