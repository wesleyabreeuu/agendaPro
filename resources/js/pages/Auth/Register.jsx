import React from 'react'
import { Head, Link, useForm } from '@inertiajs/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@/components/ui'

export default function Register({ errors = {} }) {
  const { data, setData, post, processing } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  function submit(e) {
    e.preventDefault()
    post('/register')
  }

  return (
    <>
      <Head title="Criar conta" />
      <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Create an account</CardTitle>
                <CardDescription>Enter your details below to create your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="grid gap-6">
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium text-zinc-900">Name</label>
                    <Input id="name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                    {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium text-zinc-900">Email</label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                    {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="password" className="text-sm font-medium text-zinc-900">Password</label>
                    <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                    {errors.password ? <p className="text-sm text-red-600">{errors.password}</p> : null}
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="password_confirmation" className="text-sm font-medium text-zinc-900">Confirm password</label>
                    <Input id="password_confirmation" type="password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                  </div>

                  <Button type="submit" disabled={processing}>Create account</Button>

                  <div className="text-center text-sm text-zinc-500">
                    Already have an account? <Link href="/login" className="underline underline-offset-4">Login</Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
