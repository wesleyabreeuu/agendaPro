import React from 'react'
import { useForm } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Select, Textarea } from '../../components/ui'

export default function CheckinsIndex({ today, checkinHoje, historico, errors = {} }) {
  const { data, setData, post, processing } = useForm({
    data: checkinHoje?.data || today,
    humor: checkinHoje?.humor || 3,
    energia: checkinHoje?.energia || 3,
    produtividade: checkinHoje?.produtividade || 3,
    destaque: checkinHoje?.destaque || '',
    gratidao: checkinHoje?.gratidao || '',
    observacoes: checkinHoje?.observacoes || '',
  })

  function submit(e) {
    e.preventDefault()
    post('/check-ins')
  }

  const shellClassName = 'flex h-11 w-full items-center rounded-xl border border-zinc-200 bg-white px-3 shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100'
  const shellInputClassName = 'h-full w-full !rounded-none !border-0 !bg-transparent !p-0 text-sm text-zinc-950 !shadow-none outline-none appearance-none focus:!border-0 focus:!ring-0'

  return (
    <AppLayout title="Check-in Diário">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={submit} className="grid gap-4">
            {['humor', 'energia', 'produtividade'].map((field) => (
              <div key={field} className="grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                <label className="text-sm font-medium text-zinc-900 capitalize">{field}</label>
                <div className={shellClassName}>
                  <Select value={data[field]} onChange={(e) => setData(field, e.target.value)} className={shellInputClassName}>
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                  </Select>
                </div>
                {errors[field] ? <p className="text-sm text-red-600">{errors[field]}</p> : null}
              </div>
            ))}
            {['destaque', 'gratidao', 'observacoes'].map((field) => (
              <div key={field} className="grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
                <label className="text-sm font-medium text-zinc-900 capitalize">{field}</label>
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                  <Textarea className="min-h-24 resize-y border-0 shadow-none focus:ring-0" value={data[field]} onChange={(e) => setData(field, e.target.value)} />
                </div>
              </div>
            ))}
            <button disabled={processing} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Salvar check-in</button>
          </form>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Hoje</h3>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl bg-zinc-50 p-4">Humor: {checkinHoje?.humor ?? '-'}</div>
            <div className="rounded-2xl bg-zinc-50 p-4">Energia: {checkinHoje?.energia ?? '-'}</div>
            <div className="rounded-2xl bg-zinc-50 p-4">Produtividade: {checkinHoje?.produtividade ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Humor</th>
              <th className="px-4 py-3 text-left">Energia</th>
              <th className="px-4 py-3 text-left">Produtividade</th>
              <th className="px-4 py-3 text-left">Destaque</th>
            </tr>
          </thead>
          <tbody>
            {historico.map((item) => (
              <tr key={item.id} className="border-t border-zinc-200">
                <td className="px-4 py-3">{item.data}</td>
                <td className="px-4 py-3">{item.humor}/5</td>
                <td className="px-4 py-3">{item.energia}/5</td>
                <td className="px-4 py-3">{item.produtividade}/5</td>
                <td className="px-4 py-3">{item.destaque || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  )
}
