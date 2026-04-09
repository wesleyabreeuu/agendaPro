import React from 'react'
import { Head, useForm } from '@inertiajs/react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '../../components/ui'

export default function ConfirmPassword({ errors = {} }) {
  const { data, setData, post, processing } = useForm({
    password: '',
  })

  function submit(e) {
    e.preventDefault()
    post('/password/confirm')
  }

  return (
    <>
      <Head title="Confirm Password" />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle>Confirm your password</CardTitle>
              <CardDescription>This is a secure area of the application. Please confirm your password before continuing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid gap-6">
                {errors.password ? <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errors.password}</div> : null}
                <div className="grid gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-zinc-900">Password</label>
                  <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                </div>
                <Button type="submit" disabled={processing}>Confirm password</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
