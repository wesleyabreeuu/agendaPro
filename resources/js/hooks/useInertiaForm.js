import { router, usePage } from '@inertiajs/react'
import { useForm as useTanStackForm } from '@tanstack/react-form'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(cloneValue)
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]))
  }

  return value
}

function mergeData(current, next) {
  if (!isPlainObject(current) || !isPlainObject(next)) return cloneValue(next)
  return { ...current, ...next }
}

export function useInertiaForm(initialValues = {}) {
  const page = usePage()
  const pageErrors = page.props?.errors || {}
  const defaultsRef = useRef(cloneValue(initialValues))
  const transformRef = useRef((data) => data)
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState(pageErrors)

  const form = useTanStackForm({
    defaultValues: defaultsRef.current,
  })

  useEffect(() => {
    setErrors(pageErrors)
  }, [pageErrors])

  const clearErrors = useCallback((...fields) => {
    if (!fields.length) {
      setErrors({})
      return
    }

    setErrors((current) => {
      const next = { ...current }
      fields.forEach((field) => delete next[field])
      return next
    })
  }, [])

  const setError = useCallback((fieldOrFields, maybeValue) => {
    setErrors((current) => {
      if (typeof fieldOrFields === 'string') {
        return { ...current, [fieldOrFields]: maybeValue }
      }

      return { ...current, ...(fieldOrFields || {}) }
    })
  }, [])

  const setData = useCallback((fieldOrUpdater, maybeValue) => {
    if (typeof fieldOrUpdater === 'function') {
      clearErrors()
      const nextValues = fieldOrUpdater(form.state.values)
      form.reset(mergeData(form.state.values, nextValues), { keepDefaultValues: true })
      return
    }

    if (typeof fieldOrUpdater === 'string') {
      clearErrors(fieldOrUpdater)
      form.setFieldValue(fieldOrUpdater, maybeValue)
      return
    }

    clearErrors()
    form.reset(mergeData(form.state.values, fieldOrUpdater || {}), { keepDefaultValues: true })
  }, [clearErrors, form])

  const reset = useCallback((...fields) => {
    clearErrors(...fields)

    if (!fields.length) {
      form.reset(cloneValue(defaultsRef.current))
      return
    }

    const nextValues = cloneValue(form.state.values)
    fields.forEach((field) => {
      nextValues[field] = cloneValue(defaultsRef.current[field])
      form.resetField(field)
    })
    form.reset(nextValues, { keepDefaultValues: true })
  }, [clearErrors, form])

  const defaults = useCallback((fieldOrFields, maybeValue) => {
    if (typeof fieldOrFields === 'undefined') {
      defaultsRef.current = cloneValue(form.state.values)
      return
    }

    if (typeof fieldOrFields === 'string') {
      defaultsRef.current = { ...defaultsRef.current, [fieldOrFields]: cloneValue(maybeValue) }
      return
    }

    defaultsRef.current = mergeData(defaultsRef.current, fieldOrFields)
  }, [form])

  const submit = useCallback((method, url, options = {}) => {
    const { onError, onFinish, onSuccess, data: overrideData, ...visitOptions } = options
    const methodName = method.toLowerCase()
    const payload = transformRef.current(overrideData ?? form.state.values)

    setProcessing(true)
    setErrors({})

    const nextOptions = {
      ...visitOptions,
      onError: (nextErrors) => {
        setErrors(nextErrors || {})
        onError?.(nextErrors)
      },
      onSuccess: (pageData) => {
        onSuccess?.(pageData)
      },
      onFinish: (...args) => {
        setProcessing(false)
        onFinish?.(...args)
      },
    }

    if (methodName === 'delete') {
      router.delete(url, { ...nextOptions, data: payload })
      return
    }

    if (methodName === 'get') {
      router.get(url, payload, nextOptions)
      return
    }

    router[methodName](url, payload, nextOptions)
  }, [form])

  const api = useMemo(() => ({
    data: form.state.values,
    errors,
    processing,
    setData,
    setError,
    clearErrors,
    reset,
    defaults,
    transform: (callback) => {
      transformRef.current = callback
    },
    submit: (method, url, options) => submit(method, url, options),
    get: (url, options) => submit('get', url, options),
    post: (url, options) => submit('post', url, options),
    put: (url, options) => submit('put', url, options),
    patch: (url, options) => submit('patch', url, options),
    delete: (url, options) => submit('delete', url, options),
  }), [errors, form.state.values, processing, setData, setError, clearErrors, reset, defaults, submit])

  return api
}

export default useInertiaForm
