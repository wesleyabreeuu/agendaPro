import React, { useEffect, useMemo, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { useForm } from '@tanstack/react-form'
import AppLayout from '../../layouts/AppLayout'
import { Alert, AlertDescription, AlertTitle, Button, Checkbox, Input, Label, Select, Switch, Textarea } from '@/components/ui'
import { BellRing } from 'lucide-react'

function buildDefaultValues(lembrete) {
  return {
    tipo: lembrete?.tipo || 'personalizado',
    compromisso_id: lembrete?.compromisso_id || '',
    titulo: lembrete?.titulo || '',
    descricao: lembrete?.descricao || '',
    categoria: lembrete?.categoria || '',
    inicio_em: lembrete?.inicio_em || '',
    minutos_antes: lembrete?.minutos_antes ?? 15,
    recorrencia: lembrete?.recorrencia || '',
    intervalo_recorrencia: lembrete?.intervalo_recorrencia ?? 1,
    dias_semana: lembrete?.dias_semana || [],
    fim_recorrencia_em: lembrete?.fim_recorrencia_em || '',
    ativo: lembrete?.ativo ?? true,
  }
}

function getFirstError(field, serverError) {
  if (serverError) return serverError
  if (!field.state.meta.isTouched && field.form.state.submissionAttempts === 0) return null

  const firstError = field.state.meta.errors.find(Boolean)
  return typeof firstError === 'string' ? firstError : firstError ? String(firstError) : null
}

export default function LembretesForm({ lembrete = null, compromissos = [], diasSemana = {}, errors = {} }) {
  const editing = Boolean(lembrete?.id)
  const defaultValues = useMemo(() => buildDefaultValues(lembrete), [lembrete])
  const [serverErrors, setServerErrors] = useState(errors)

  useEffect(() => {
    setServerErrors(errors)
  }, [errors])

  function clearServerError(fieldName) {
    setServerErrors((current) => {
      if (!current[fieldName]) return current

      const next = { ...current }
      delete next[fieldName]
      return next
    })
  }

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setServerErrors({})

      const submit = editing
        ? (options) => router.put(`/lembretes/${lembrete.id}`, value, options)
        : (options) => router.post('/lembretes', value, options)

      await new Promise((resolve) => {
        submit({
          preserveScroll: true,
          preserveState: true,
          onError: (nextErrors) => setServerErrors(nextErrors),
          onFinish: () => resolve(),
        })
      })
    },
  })

  const shellClassName = 'flex h-11 w-full items-center rounded-xl border border-zinc-200 bg-white px-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100'
  const shellInputClassName = 'h-full w-full !rounded-none !border-0 !bg-transparent !p-0 text-sm text-zinc-950 !shadow-none outline-none appearance-none focus:!border-0 focus:!ring-0'
  const sectionClassName = 'grid gap-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 lg:grid-cols-2'

  return (
    <AppLayout title={editing ? 'Editar Lembrete' : 'Novo Lembrete'}>
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {Object.keys(serverErrors).length ? (
            <Alert variant="destructive">
              <BellRing className="h-4 w-4" />
              <AlertTitle>Não foi possível salvar o lembrete</AlertTitle>
              <AlertDescription>{Object.values(serverErrors)[0]}</AlertDescription>
            </Alert>
          ) : null}

          <form.Field name="tipo">
            {(field) => (
              <div className="grid gap-2 lg:col-span-2">
                <Label className="text-zinc-900">Tipo</Label>
                <div className={shellClassName}>
                  <Select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError('tipo')
                      clearServerError('compromisso_id')
                      clearServerError('titulo')
                      clearServerError('inicio_em')
                      field.handleChange(event.target.value)
                    }}
                    className={shellInputClassName}
                  >
                    <option value="personalizado">Personalizado</option>
                    <option value="compromisso">Vinculado a compromisso</option>
                  </Select>
                </div>
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => ({ tipo: state.values.tipo, recorrencia: state.values.recorrencia, isSubmitting: state.isSubmitting })}>
            {({ tipo, recorrencia, isSubmitting }) => (
              <>
                {tipo === 'compromisso' ? (
                  <div className={sectionClassName}>
                    <form.Field
                      name="compromisso_id"
                      validators={{
                        onChangeListenTo: ['tipo'],
                        onChange: ({ value, fieldApi }) => {
                          if (fieldApi.form.state.values.tipo !== 'compromisso') return undefined
                          return value ? undefined : 'Selecione um compromisso para esse tipo de lembrete.'
                        },
                      }}
                    >
                      {(field) => {
                        const error = getFirstError(field, serverErrors.compromisso_id)

                        return (
                          <div className="grid gap-2">
                            <Label className="text-zinc-900">Compromisso</Label>
                            <div className={shellClassName}>
                              <Select
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  clearServerError('compromisso_id')
                                  field.handleChange(event.target.value)
                                }}
                                className={shellInputClassName}
                                aria-invalid={Boolean(error)}
                              >
                                <option value="">Selecione</option>
                                {compromissos.map((compromisso) => (
                                  <option key={compromisso.id} value={compromisso.id}>
                                    {compromisso.label}
                                  </option>
                                ))}
                              </Select>
                            </div>
                            {error ? <p className="text-sm text-red-600">{error}</p> : null}
                          </div>
                        )
                      }}
                    </form.Field>

                    <form.Field
                      name="minutos_antes"
                      validators={{
                        onChange: ({ value }) => {
                          if (value === '') return undefined

                          const parsed = Number(value)
                          if (Number.isNaN(parsed)) return 'Informe um número válido.'
                          if (parsed < 0 || parsed > 10080) return 'Use um valor entre 0 e 10080 minutos.'
                          return undefined
                        },
                      }}
                    >
                      {(field) => {
                        const error = getFirstError(field, serverErrors.minutos_antes)

                        return (
                          <div className="grid gap-2">
                            <Label className="text-zinc-900">Minutos antes</Label>
                            <div className={shellClassName}>
                              <Input
                                type="number"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  clearServerError('minutos_antes')
                                  field.handleChange(event.target.value)
                                }}
                                className={shellInputClassName}
                                aria-invalid={Boolean(error)}
                              />
                            </div>
                            {error ? <p className="text-sm text-red-600">{error}</p> : null}
                          </div>
                        )
                      }}
                    </form.Field>
                  </div>
                ) : (
                  <>
                    <div className={sectionClassName}>
                      <form.Field
                        name="titulo"
                        validators={{
                          onChangeListenTo: ['tipo'],
                          onChange: ({ value, fieldApi }) => {
                            if (fieldApi.form.state.values.tipo !== 'personalizado') return undefined
                            return String(value).trim() ? undefined : 'Informe um título para o lembrete personalizado.'
                          },
                        }}
                      >
                        {(field) => {
                          const error = getFirstError(field, serverErrors.titulo)

                          return (
                            <div className="grid gap-2">
                              <Label className="text-zinc-900">Título</Label>
                              <div className={shellClassName}>
                                <Input
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    clearServerError('titulo')
                                    field.handleChange(event.target.value)
                                  }}
                                  className={shellInputClassName}
                                  aria-invalid={Boolean(error)}
                                />
                              </div>
                              {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                          )
                        }}
                      </form.Field>

                      <form.Field name="categoria">
                        {(field) => (
                          <div className="grid gap-2">
                            <Label className="text-zinc-900">Categoria</Label>
                            <div className={shellClassName}>
                              <Input
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => field.handleChange(event.target.value)}
                                className={shellInputClassName}
                              />
                            </div>
                          </div>
                        )}
                      </form.Field>

                      <form.Field
                        name="inicio_em"
                        validators={{
                          onChangeListenTo: ['tipo'],
                          onChange: ({ value, fieldApi }) => {
                            if (fieldApi.form.state.values.tipo !== 'personalizado') return undefined
                            return value ? undefined : 'Informe data e horário para o lembrete personalizado.'
                          },
                        }}
                      >
                        {(field) => {
                          const error = getFirstError(field, serverErrors.inicio_em)

                          return (
                            <div className="grid gap-2">
                              <Label className="text-zinc-900">Início</Label>
                              <div className={shellClassName}>
                                <Input
                                  type="datetime-local"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    clearServerError('inicio_em')
                                    field.handleChange(event.target.value)
                                  }}
                                  className={shellInputClassName}
                                  aria-invalid={Boolean(error)}
                                />
                              </div>
                              {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                          )
                        }}
                      </form.Field>

                      <form.Field
                        name="minutos_antes"
                        validators={{
                          onChange: ({ value }) => {
                            if (value === '') return undefined

                            const parsed = Number(value)
                            if (Number.isNaN(parsed)) return 'Informe um número válido.'
                            if (parsed < 0 || parsed > 10080) return 'Use um valor entre 0 e 10080 minutos.'
                            return undefined
                          },
                        }}
                      >
                        {(field) => {
                          const error = getFirstError(field, serverErrors.minutos_antes)

                          return (
                            <div className="grid gap-2">
                              <Label className="text-zinc-900">Disparar quantos minutos antes?</Label>
                              <div className={shellClassName}>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10080"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    clearServerError('minutos_antes')
                                    field.handleChange(event.target.value)
                                  }}
                                  className={shellInputClassName}
                                  aria-invalid={Boolean(error)}
                                />
                              </div>
                              <p className="text-xs text-zinc-500">Use 0 para disparar exatamente no horário informado.</p>
                              {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                          )
                        }}
                      </form.Field>

                      <form.Field name="recorrencia">
                        {(field) => (
                          <div className="grid gap-2">
                            <Label className="text-zinc-900">Recorrência</Label>
                            <div className={shellClassName}>
                              <Select
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  clearServerError('dias_semana')
                                  field.handleChange(event.target.value)
                                }}
                                className={shellInputClassName}
                              >
                                <option value="">Sem recorrência</option>
                                <option value="diaria">Diária</option>
                                <option value="semanal">Semanal</option>
                                <option value="mensal">Mensal</option>
                                <option value="dias_semana">Dias da semana</option>
                              </Select>
                            </div>
                          </div>
                        )}
                      </form.Field>
                    </div>

                    <div className={sectionClassName}>
                      <form.Field
                        name="intervalo_recorrencia"
                        validators={{
                          onChange: ({ value }) => {
                            if (value === '') return undefined

                            const parsed = Number(value)
                            if (Number.isNaN(parsed)) return 'Informe um número válido.'
                            if (parsed < 1 || parsed > 365) return 'Use um valor entre 1 e 365.'
                            return undefined
                          },
                        }}
                      >
                        {(field) => {
                          const error = getFirstError(field, serverErrors.intervalo_recorrencia)

                          return (
                            <div className="grid gap-2">
                              <Label className="text-zinc-900">Intervalo</Label>
                              <div className={shellClassName}>
                                <Input
                                  type="number"
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(event) => {
                                    clearServerError('intervalo_recorrencia')
                                    field.handleChange(event.target.value)
                                  }}
                                  className={shellInputClassName}
                                  aria-invalid={Boolean(error)}
                                />
                              </div>
                              {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                          )
                        }}
                      </form.Field>

                      <form.Field name="fim_recorrencia_em">
                        {(field) => (
                          <div className="grid gap-2">
                            <Label className="text-zinc-900">Fim da recorrência</Label>
                            <div className={shellClassName}>
                              <Input
                                type="date"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  clearServerError('fim_recorrencia_em')
                                  field.handleChange(event.target.value)
                                }}
                                className={shellInputClassName}
                              />
                            </div>
                          </div>
                        )}
                      </form.Field>
                    </div>

                    {recorrencia === 'dias_semana' ? (
                      <form.Field
                        name="dias_semana"
                        validators={{
                          onChangeListenTo: ['recorrencia'],
                          onChange: ({ value, fieldApi }) => {
                            if (fieldApi.form.state.values.recorrencia !== 'dias_semana') return undefined
                            return value.length ? undefined : 'Selecione ao menos um dia da semana.'
                          },
                        }}
                      >
                        {(field) => {
                          const error = getFirstError(field, serverErrors.dias_semana)

                          return (
                            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
                              <Label className="text-zinc-900">Dias da semana</Label>
                              <div className="flex flex-wrap gap-3">
                                {Object.entries(diasSemana).map(([value, label]) => {
                                  const day = Number(value)
                                  const selected = field.state.value.includes(day)

                                  return (
                                    <label key={value} className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
                                      <Checkbox
                                        checked={selected}
                                        onCheckedChange={() => {
                                          clearServerError('dias_semana')
                                          field.handleChange(
                                            selected
                                              ? field.state.value.filter((item) => item !== day)
                                              : [...field.state.value, day]
                                          )
                                        }}
                                      />
                                      <span>{label}</span>
                                    </label>
                                  )
                                })}
                              </div>
                              {error ? <p className="text-sm text-red-600">{error}</p> : null}
                            </div>
                          )
                        }}
                      </form.Field>
                    ) : null}

                    <form.Field name="descricao">
                      {(field) => (
                        <div className="grid gap-2">
                          <Label className="text-zinc-900">Descrição</Label>
                          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                            <Textarea
                              className="min-h-32 resize-y border-0 shadow-none focus:ring-0"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(event) => field.handleChange(event.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </form.Field>
                  </>
                )}

                <form.Field name="ativo">
                  {(field) => (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5">
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                        <div>
                          <Label className="text-zinc-900">Manter lembrete ativo</Label>
                          <p className="mt-1 text-sm text-zinc-500">Desative para parar novos disparos sem apagar o histórico.</p>
                        </div>
                        <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(Boolean(checked))} />
                      </div>
                    </div>
                  )}
                </form.Field>

                <div className="flex gap-3">
                  <Button disabled={isSubmitting} className="w-auto">
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Link href="/lembretes" className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900">
                    Cancelar
                  </Link>
                </div>
              </>
            )}
          </form.Subscribe>
        </form>
      </div>
    </AppLayout>
  )
}
