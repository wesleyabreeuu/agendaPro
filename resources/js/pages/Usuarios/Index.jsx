import React from 'react'
import { Link } from '@inertiajs/react'
import AppLayout from '../../layouts/AppLayout'
import { Badge, Button, Card, CardContent } from '@/components/ui'
import { useTheme } from '../../contexts/ThemeContext'
import { Moon, Sun, UserCircle2 } from 'lucide-react'
import { PageCard, PageCardContent, PageCardHeader } from '@/components/page'

export default function UsuariosIndex({ usuario }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppLayout title="Meu Perfil">
      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="rounded-xl border-zinc-200 bg-card text-center shadow-xs">
          <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <img src={usuario.profile_image_url} alt={usuario.name} className="h-28 w-28 rounded-xl object-cover ring-1 ring-zinc-200" />
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">{usuario.name}</h2>
              <Badge variant="outline" className="mt-2">{usuario.regra_label}</Badge>
            </div>
            <Button asChild className="w-auto rounded-lg px-4">
              <Link href={`/usuarios/${usuario.id}/edit`}>Editar perfil</Link>
            </Button>
          </div>
          </CardContent>
        </Card>

        <PageCard>
          <PageCardHeader
            icon={UserCircle2}
            title="Dados da conta"
            description="Informações principais do seu perfil e preferências."
          />
          <PageCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['E-mail', usuario.email],
              ['Telefone', usuario.telefone || 'Não informado'],
              ['Endereço', usuario.endereco || 'Não informado'],
              ['Regra de acesso', usuario.regra_label],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <p className="mt-2 text-base font-medium text-zinc-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-semibold text-zinc-950">Aparência</h4>
                <p className="mt-1 text-sm text-zinc-500">Escolha entre tema claro ou escuro para o sistema.</p>
              </div>
              <Button type="button" variant="outline" className="w-auto rounded-lg px-4" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Usar claro' : 'Usar escuro'}
              </Button>
            </div>
          </div>
          </PageCardContent>
        </PageCard>
      </div>
    </AppLayout>
  )
}
