import React, { useEffect, useMemo, useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronDown,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  HeartPulse,
  LayoutGrid,
  LogOut,
  Menu,
  UserCircle2,
  Wallet,
  X,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
// import AIAssistantWidget from '../components/AIAssistantWidget'

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AP'
}

function DashboardNavLink({ href, active, icon: Icon, children, collapsed = false, onClick, isDark = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? children : undefined}
      className={`flex items-center rounded-xl px-3 py-2.5 text-sm transition ${collapsed ? 'justify-center' : 'gap-3'} ${
        isDark
          ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-700'
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      {!collapsed ? <span>{children}</span> : null}
    </Link>
  )
}

function DashboardSubLink({ href, active, children, collapsed = false, onClick, isDark = false }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? children : undefined}
      className={`block rounded-xl px-4 py-2.5 text-sm transition ${
        isDark
          ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
          : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-700'
      }`}
    >
      {collapsed ? children.slice(0, 1) : children}
    </Link>
  )
}

function DashboardNavGroup({ label, icon: Icon, open, children, collapsed = false, isDark = false }) {
  if (collapsed) {
    return (
      <div className="space-y-1">
        <div
          title={label}
          className={`flex items-center justify-center rounded-xl px-3 py-2.5 text-sm transition ${
            isDark ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-700'
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      </div>
    )
  }

  return (
    <details open={open} className="rounded-2xl">
      <summary
        className={`flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
          isDark ? 'text-zinc-300 hover:bg-zinc-900 hover:text-white' : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-700'
        }`}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4" strokeWidth={2} />
          <span>{label}</span>
        </span>
        <ChevronDown className={`h-4 w-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
      </summary>
      <div className="mt-1 space-y-1 pl-8">
        {children}
      </div>
    </details>
  )
}

function DashboardSidebar({ currentPath, permissions, auth, collapsed, onToggle, mobileOpen = false, onClose, mobile = false, isDark = false }) {
  const userName = auth?.user?.name || 'Usuário'
  const isAdmin = Boolean(auth?.user?.is_admin)

  const asideClassName = mobile
    ? `fixed inset-y-0 left-0 z-50 w-[304px] border-r backdrop-blur transition-transform duration-200 lg:hidden ${
      isDark ? 'border-zinc-800 bg-zinc-950/96' : 'border-zinc-200/80 bg-zinc-50/95'
    } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    : `hidden border-r lg:flex lg:flex-col ${
      isDark ? 'border-zinc-800 bg-zinc-950/92' : 'border-zinc-200/80 bg-zinc-50/70'
    } ${collapsed ? 'lg:w-[96px]' : 'lg:w-[304px]'}`

  const handleNavigate = () => {
    if (mobile && onClose) {
      onClose()
    }
  }

  return (
    <aside className={asideClassName}>
      <div className="flex h-full flex-col p-5">
        <div className={`relative flex items-center px-2 ${collapsed ? 'justify-center' : 'justify-between gap-3'}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border p-2 shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'}`}>
              <img src="/brand/agendapro-mark.svg" alt="AgendaPro" className="h-full w-full object-contain" />
            </div>
            {!collapsed ? (
              <div>
                <p className={`text-base font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>Agenda Pro</p>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{auth?.user?.profile_role_label || 'Workspace'}</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={mobile ? onClose : onToggle}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isDark
                ? 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            } ${collapsed ? 'absolute top-5 -right-4 shadow-sm' : ''}`}
            title={mobile ? 'Fechar menu' : collapsed ? 'Expandir menu' : 'Recolher menu'}
          >
            {mobile ? <X className="h-4 w-4" /> : <ChevronLeft className={`h-4 w-4 transition ${collapsed ? 'rotate-180' : ''}`} />}
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto">
          <DashboardNavLink href="/home" active={currentPath === '/home'} icon={LayoutGrid} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
            Dashboard
          </DashboardNavLink>

          <DashboardNavLink href="/usuarios" active={currentPath.startsWith('/usuarios')} icon={UserCircle2} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
            Meu Perfil
          </DashboardNavLink>

          {permissions.compromissos ? (
            <DashboardNavGroup
              label="Compromissos"
              icon={CalendarDays}
              open={currentPath.startsWith('/compromissos') || currentPath.startsWith('/categorias') || currentPath.startsWith('/lembretes')}
              collapsed={collapsed}
              isDark={isDark}
            >
              <DashboardSubLink href="/compromissos" active={currentPath.startsWith('/compromissos') && !currentPath.includes('/calendario')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Compromissos
              </DashboardSubLink>
              <DashboardSubLink href="/categorias" active={currentPath.startsWith('/categorias')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Categorias
              </DashboardSubLink>
              <DashboardSubLink href="/lembretes" active={currentPath.startsWith('/lembretes')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Lembretes
              </DashboardSubLink>
            </DashboardNavGroup>
          ) : null}

          {permissions.dia_a_dia ? (
            <DashboardNavGroup
              label="Dia a dia"
              icon={CheckSquare}
              open={currentPath.startsWith('/todo') || currentPath.startsWith('/rotinas') || currentPath.startsWith('/check-ins') || currentPath === '/compromissos/calendario'}
              collapsed={collapsed}
              isDark={isDark}
            >
              <DashboardSubLink href="/todo" active={currentPath.startsWith('/todo')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Todo list
              </DashboardSubLink>
              <DashboardSubLink href="/rotinas" active={currentPath === '/rotinas'} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Dashboard Rotinas
              </DashboardSubLink>
              <DashboardSubLink href="/rotinas/minhas" active={currentPath.startsWith('/rotinas/minhas') || currentPath.startsWith('/rotinas/criar') || currentPath.includes('/editar')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Minhas Rotinas
              </DashboardSubLink>
              <DashboardSubLink href="/rotinas/hoje" active={currentPath.startsWith('/rotinas/hoje')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Rotinas de Hoje
              </DashboardSubLink>
              <DashboardSubLink href="/rotinas/historico" active={currentPath.startsWith('/rotinas/historico')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Histórico
              </DashboardSubLink>
              <DashboardSubLink href="/rotinas/templates" active={currentPath.startsWith('/rotinas/templates')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Templates
              </DashboardSubLink>
              <DashboardSubLink href="/compromissos/calendario" active={currentPath === '/compromissos/calendario'} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Calendário
              </DashboardSubLink>
            </DashboardNavGroup>
          ) : null}

          {permissions.projetos ? (
            <DashboardNavGroup label="Projetos" icon={FolderKanban} open={currentPath.startsWith('/kanban')} collapsed={collapsed} isDark={isDark}>
              <DashboardSubLink href="/kanban" active={currentPath.startsWith('/kanban')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Kanban
              </DashboardSubLink>
            </DashboardNavGroup>
          ) : null}

          {permissions.financeiro ? (
            <DashboardNavLink href="/financeiro" active={currentPath.startsWith('/financeiro')} icon={Wallet} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
              Controle Financeiro
            </DashboardNavLink>
          ) : null}

          {permissions.saude ? (
            <DashboardNavLink href="/saude" active={currentPath.startsWith('/saude') || currentPath.startsWith('/integracoes/strava')} icon={HeartPulse} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
              Saúde e Fitness
            </DashboardNavLink>
          ) : null}

          {isAdmin ? (
            <DashboardNavGroup
              label="Administração"
              icon={ClipboardList}
              open={currentPath.startsWith('/regras') || currentPath.startsWith('/permissoes') || currentPath.startsWith('/admin/usuarios')}
              collapsed={collapsed}
              isDark={isDark}
            >
              <DashboardSubLink href="/admin/usuarios" active={currentPath.startsWith('/admin/usuarios')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Usuários
              </DashboardSubLink>
              <DashboardSubLink href="/regras" active={currentPath.startsWith('/regras')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Regras
              </DashboardSubLink>
              <DashboardSubLink href="/permissoes" active={currentPath.startsWith('/permissoes')} collapsed={collapsed} onClick={handleNavigate} isDark={isDark}>
                Permissões
              </DashboardSubLink>
            </DashboardNavGroup>
          ) : null}
        </nav>

        <div className={`mt-5 rounded-2xl border p-3 shadow-sm ${
          isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-white'
        } ${collapsed ? 'space-y-3' : 'flex items-center gap-3'}`}>
          {auth?.user?.profile_image_url ? (
            <img src={auth.user.profile_image_url} alt={userName} className={`h-11 w-11 rounded-xl object-cover ring-1 ${isDark ? 'ring-zinc-700' : 'ring-zinc-200'}`} />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white">
              {getInitials(userName)}
            </div>
          )}
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-semibold ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{userName}</p>
              <p className={`truncate text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{auth?.user?.email || auth?.user?.profile_role_label || 'Conta ativa'}</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => router.post('/logout')}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isDark
                ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
            }`}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

function DashboardHeader({ title, auth, onOpenMenu, isDark = false }) {
  const userName = auth?.user?.name || 'Usuário'

  return (
    <header className={`border-b backdrop-blur ${isDark ? 'border-zinc-800 bg-zinc-950/90' : 'border-zinc-200 bg-white/90'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-7">
        <div className="min-w-0">
          <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <button
              type="button"
              onClick={onOpenMenu}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm lg:hidden ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-200' : 'border-zinc-200 bg-white text-zinc-700'}`}
            >
              <Menu className="h-4 w-4" />
            </button>
            <LayoutGrid className="h-4 w-4" />
            <span>Workspace</span>
            <ChevronRight className="h-4 w-4" />
            <span className={`truncate font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden items-center gap-3 rounded-xl border px-3 py-2 sm:flex ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}>
            {auth?.user?.profile_image_url ? (
              <img src={auth.user.profile_image_url} alt={userName} className="h-10 w-10 rounded-xl object-cover ring-1 ring-zinc-200" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 text-sm font-semibold text-white">
                {getInitials(userName)}
              </div>
            )}
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Sessão</p>
              <p className={`text-sm font-medium ${isDark ? 'text-zinc-50' : 'text-zinc-950'}`}>{userName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.post('/logout')}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'}`}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  )
}

function ReminderToasts({ items, onDismiss }) {
  if (!items.length) {
    return null
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            onDismiss(item.key)
            if (item.url) {
              window.location.assign(item.url)
            }
          }}
          className="rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-950">{item.titulo}</p>
              <p className="mt-1 text-sm text-zinc-600">{item.mensagem}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-400">{item.quando}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
              Lembrete
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function AppLayout({ title, children, chrome = 'default' }) {
  const { theme } = useTheme()
  const { auth, flash, webPush } = usePage().props
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const permissions = auth?.user?.permissions || {}
  const isDashboardChrome = chrome === 'dashboard'
  const isDark = theme === 'dark'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [reminderToasts, setReminderToasts] = useState([])
  const [notificationBannerClosed, setNotificationBannerClosed] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState(() => (
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'
  ))
  const canWatchReminders = useMemo(() => Boolean(auth?.user && permissions.compromissos), [auth?.user, permissions.compromissos])
  const pushPublicKey = webPush?.publicKey || ''
  const pushEnabled = Boolean(webPush?.enabled && pushPublicKey)
  const notificationBannerStorageKey = useMemo(
    () => `agendapro.notifications.banner-dismissed.${auth?.user?.id || 'guest'}`,
    [auth?.user?.id],
  )

  const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
  }

  const syncPushSubscription = async (registration) => {
    if (!pushEnabled || !('PushManager' in window) || window.Notification.permission !== 'granted') {
      return
    }

    const existingSubscription = await registration.pushManager.getSubscription()
    const subscription = existingSubscription || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
    })

    await fetch('/push-subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(subscription.toJSON()),
    })
  }

  const registerServiceWorker = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null
    }

    try {
      return await navigator.serviceWorker.register('/service-worker.js')
    } catch (error) {
      console.error('Falha ao registrar service worker para lembretes.', error)
      return null
    }
  }

  const requestNotificationPermission = async ({ force = false } = {}) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported')
      return 'unsupported'
    }

    setNotificationPermission(window.Notification.permission)

    if (window.Notification.permission === 'granted' || window.Notification.permission === 'denied') {
      return window.Notification.permission
    }

    const requestedBefore = window.localStorage.getItem('agendapro.notifications.permission-requested')
    if (!force && requestedBefore === 'true') {
      return window.Notification.permission
    }

    try {
      const permission = await window.Notification.requestPermission()
      window.localStorage.setItem('agendapro.notifications.permission-requested', 'true')
      setNotificationPermission(permission)
      return permission
    } catch (error) {
      console.error('Falha ao solicitar permissao de notificacao.', error)
      return 'default'
    }
  }

  const handleEnableNotifications = async () => {
    const registration = await registerServiceWorker()
    const permission = await requestNotificationPermission({ force: true })

    if (permission === 'granted') {
      setNotificationBannerClosed(false)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(notificationBannerStorageKey)
      }

      if (registration) {
        try {
          await syncPushSubscription(registration)
        } catch (error) {
          console.error('Falha ao sincronizar inscricao Web Push.', error)
        }
      }
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    setSidebarCollapsed(window.localStorage.getItem('agendapro.sidebar.collapsed') === 'true')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setNotificationBannerClosed(window.sessionStorage.getItem(notificationBannerStorageKey) === 'true')
  }, [notificationBannerStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('agendapro.sidebar.collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    if (typeof window === 'undefined' || !canWatchReminders) return undefined

    let cancelled = false

    ;(async () => {
      const registration = await registerServiceWorker()
      const permission = await requestNotificationPermission()

      if (!cancelled && permission === 'granted') {
        setNotificationBannerClosed(false)
        window.sessionStorage.removeItem(notificationBannerStorageKey)
      }

      if (registration && permission === 'granted') {
        try {
          await syncPushSubscription(registration)
        } catch (error) {
          console.error('Falha ao sincronizar inscricao Web Push.', error)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [canWatchReminders, notificationBannerStorageKey, pushEnabled, pushPublicKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !canWatchReminders) return undefined

    let cancelled = false

    const showBrowserNotification = async (item) => {
      if (!('Notification' in window) || window.Notification.permission !== 'granted') {
        return
      }

      try {
        const registration = await navigator.serviceWorker?.getRegistration()

        if (registration) {
          await registration.showNotification(item.titulo, {
            body: item.mensagem,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-192x192.png',
            tag: `lembrete-${item.id}`,
            data: { url: item.url },
          })
          return
        }

        const notification = new window.Notification(item.titulo, {
          body: item.mensagem,
          icon: '/icons/icon-192x192.png',
          tag: `lembrete-${item.id}`,
        })

        notification.onclick = () => {
          window.focus()
          if (item.url) {
            window.location.assign(item.url)
          }
        }
      } catch (error) {
        console.error('Falha ao exibir notificacao do navegador.', error)
      }
    }

    const rememberNotification = (item) => {
      const key = `${item.id}:${item.quando}`
      window.localStorage.setItem(`agendapro.reminders.${key}`, 'shown')
      return key
    }

    const alreadyShown = (item) => {
      const key = `${item.id}:${item.quando}`
      return Boolean(window.localStorage.getItem(`agendapro.reminders.${key}`))
    }

    const pollDueReminders = async () => {
      try {
        const response = await fetch('/lembretes/due/feed', {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        })

        if (!response.ok) {
          return
        }

        const data = await response.json()
        if (!Array.isArray(data) || cancelled) {
          return
        }

        const freshItems = data
          .filter((item) => !alreadyShown(item))
          .map((item) => ({ ...item, key: rememberNotification(item) }))

        if (!freshItems.length) {
          return
        }

        setReminderToasts((current) => [...freshItems, ...current].slice(0, 4))
        await Promise.all(freshItems.map((item) => showBrowserNotification(item)))
      } catch (error) {
        console.error('Falha ao consultar lembretes pendentes.', error)
      }
    }

    pollDueReminders()
    const intervalId = window.setInterval(pollDueReminders, 15000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [canWatchReminders])

  useEffect(() => {
    if (!reminderToasts.length || typeof window === 'undefined') return undefined

    const timer = window.setTimeout(() => {
      setReminderToasts((current) => current.slice(0, -1))
    }, 12000)

    return () => window.clearTimeout(timer)
  }, [reminderToasts])

  return (
    <>
      <Head title={title} />
      <div className={`min-h-screen lg:grid ${sidebarCollapsed ? 'lg:grid-cols-[96px_minmax(0,1fr)]' : 'lg:grid-cols-[304px_minmax(0,1fr)]'} ${isDashboardChrome ? (isDark ? 'bg-zinc-950' : 'bg-zinc-100/70') : 'bg-white'}`}>
        <DashboardSidebar currentPath={currentPath} permissions={permissions} auth={auth} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} isDark={isDark} />
        {mobileSidebarOpen ? (
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-zinc-950/35 lg:hidden"
          />
        ) : null}
        <DashboardSidebar
          currentPath={currentPath}
          permissions={permissions}
          auth={auth}
          collapsed={false}
          mobile
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          isDark={isDark}
        />

        <main className="min-w-0">
          {isDashboardChrome ? (
            <DashboardHeader title={title} auth={auth} onOpenMenu={() => setMobileSidebarOpen(true)} isDark={isDark} />
          ) : (
            <header className="border-b border-zinc-200 bg-white">
              <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-8">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMobileSidebarOpen(true)}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 shadow-sm lg:hidden"
                    >
                      <Menu className="h-4 w-4" />
                    </button>
                    <p className="brand-agendapro text-xs uppercase tracking-[0.25em] text-zinc-400">AgendaPro</p>
                  </div>
                  <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-950">{title}</h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                    <img src={auth?.user?.profile_image_url} alt={auth?.user?.name} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-zinc-200" />
                    <div>
                      <div className="text-base font-semibold text-zinc-950">{auth?.user?.name}</div>
                      <div className="text-sm text-zinc-500">{auth?.user?.profile_role_label}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.post('/logout')}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </header>
          )}

          <div className={`${isDashboardChrome ? 'space-y-6 px-5 py-5 lg:px-7 lg:py-6' : 'mx-auto max-w-7xl space-y-6 px-6 py-6'}`}>
            {canWatchReminders && notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && !notificationBannerClosed ? (
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                <p className="flex-1">
                  As notificacoes do navegador ainda nao estao liberadas. Se quiser receber alerta fora da tela do sistema, habilite as notificacoes do site no navegador.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-900 transition hover:bg-amber-100"
                  >
                    Habilitar notificacoes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationBannerClosed(true)
                      if (typeof window !== 'undefined') {
                        window.sessionStorage.setItem(notificationBannerStorageKey, 'true')
                      }
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-700 transition hover:bg-amber-100"
                    aria-label="Fechar aviso de notificacoes"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : null}
            {flash?.success ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{flash.success}</div>
            ) : null}
            {flash?.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{flash.error}</div>
            ) : null}
            {children}
          </div>
        </main>
      </div>
      <ReminderToasts
        items={reminderToasts}
        onDismiss={(key) => setReminderToasts((current) => current.filter((item) => item.key !== key))}
      />
      {/* Assistente de IA temporariamente oculto até retomarmos esse fluxo. */}
      {/* {auth?.user ? <AIAssistantWidget permissions={permissions} isDark={isDark} /> : null} */}
    </>
  )
}
