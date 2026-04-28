import { router } from '@inertiajs/react'
import { useEffect, useMemo, useState } from 'react'

function storageKey(userId, date) {
  return `agendapro.daily-session.hidden.${userId}.${date}`
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
        const isHidden = currentDate ? window.localStorage.getItem(storageKey(userId, currentDate)) === 'true' : false

        if (cancelled) {
          return
        }

        setDate(currentDate)

        if (payload?.iniciado || isHidden) {
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

      if (hiddenKey) {
        window.localStorage.removeItem(hiddenKey)
      }

      setOpen(false)
      router.visit('/meu-dia')
    } catch (error) {
      console.error(error)
    } finally {
      setStarting(false)
    }
  }

  function skipForToday() {
    if (hiddenKey) {
      window.localStorage.setItem(hiddenKey, 'true')
    }

    setOpen(false)
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
