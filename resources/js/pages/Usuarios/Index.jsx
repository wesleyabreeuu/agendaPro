import React from 'react'
import { Link } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Button } from '../../components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function UsuariosIndex({ usuario }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppLayout title="Meu Perfil">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 text-center shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <img src={usuario.profile_image_url} alt={usuario.name} className="h-32 w-32 rounded-3xl object-cover ring-1 ring-zinc-200" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{usuario.name}</h2>
              <p className="mt-1 text-sm text-zinc-500">{usuario.regra_label}</p>
            </div>
            <Link href={`/usuarios/${usuario.id}/edit`} className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white">Editar perfil</Link>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold tracking-tight text-zinc-950">Dados da conta</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ['E-mail', usuario.email],
              ['Telefone', usuario.telefone || 'Não informado'],
              ['Endereço', usuario.endereco || 'Não informado'],
              ['Regra de acesso', usuario.regra_label],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <p className="mt-2 text-base font-medium text-zinc-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-zinc-950">Aparência</h4>
                <p className="mt-1 text-sm text-zinc-500">Escolha entre tema claro ou escuro para o sistema.</p>
              </div>
              <Button type="button" variant="outline" className="w-auto rounded-xl px-4" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Usar claro' : 'Usar escuro'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
