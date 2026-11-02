import { useState, type ReactNode } from 'react'
import { sanitizeImageSrc } from '@shared/url'
import { useAuth } from '../context/AuthContext'
import { useCms } from '../context/CmsContext'
import heiferLogoDark from '@siteAssets/heifer-academy-logo-dark.png'
import {
  CategoriesIcon,
  CoursesIcon,
  DashboardIcon,
  ExternalIcon,
  FolderIcon,
  HomeIcon,
  LanguagesIcon,
  LayoutIcon,
  LogOutIcon,
  MenuIcon,
  PagesIcon,
  RefreshIcon,
  SettingsIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
} from './icons'

export type AdminTab =
  | 'dashboard'
  | 'courses'
  | 'course-edit'
  | 'materials'
  | 'categories'
  | 'homepage'
  | 'header-footer'
  | 'pages'
  | 'strings'
  | 'settings'
  | 'users'

type NavGroup = {
  heading: string
  items: {
    id: AdminTab
    label: string
    icon: ReactNode
    superOnly?: boolean
  }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ id: 'dashboard', label: 'Overview & Queue', icon: <DashboardIcon size={18} /> }],
  },
  {
    heading: 'Learning Catalog',
    items: [
      { id: 'courses', label: 'Courses & Videos', icon: <CoursesIcon size={18} /> },
      { id: 'materials', label: 'Materials & Guides', icon: <FolderIcon size={18} /> },
      { id: 'categories', label: 'Topic Categories', icon: <CategoriesIcon size={18} /> },
    ],
  },
  {
    heading: 'Website Content',
    items: [
      { id: 'homepage', label: 'Homepage Sections', icon: <HomeIcon size={18} /> },
      { id: 'header-footer', label: 'Header & Footer', icon: <LayoutIcon size={18} /> },
      { id: 'pages', label: 'Custom & Info Pages', icon: <PagesIcon size={18} /> },
      { id: 'strings', label: 'Bilingual UI Labels', icon: <LanguagesIcon size={18} /> },
    ],
  },
  {
    heading: 'Administration',
    items: [
      { id: 'settings', label: 'Branding & Settings', icon: <SettingsIcon size={18} /> },
      { id: 'users', label: 'Team & Permissions', icon: <UsersIcon size={18} />, superOnly: true },
    ],
  },
]

const TAB_TITLES: Record<AdminTab, { group: string; title: string }> = {
  dashboard: { group: 'Overview', title: 'Editorial Dashboard' },
  courses: { group: 'Learning Catalog', title: 'Courses & Video Curriculum' },
  'course-edit': { group: 'Learning Catalog', title: 'Course Studio Editor' },
  materials: { group: 'Learning Catalog', title: 'Learning Materials & Field Guides' },
  categories: { group: 'Learning Catalog', title: 'Topic Categories' },
  homepage: { group: 'Website Content', title: 'Homepage Sections' },
  'header-footer': { group: 'Website Content', title: 'Header & Footer Navigation' },
  pages: { group: 'Website Content', title: 'Custom, About & Legal Pages' },
  strings: { group: 'Website Content', title: 'Bilingual UI Translations' },
  settings: { group: 'Administration', title: 'Branding, Banner & Survey Settings' },
  users: { group: 'Administration', title: 'Staff Accounts & Invitations' },
}

export function AdminLayout({
  currentTab,
  onSelectTab,
  children,
}: {
  currentTab: AdminTab
  onSelectTab: (tab: AdminTab) => void
  children: ReactNode
}) {
  const { profile, isSuperAdmin, isEditor, logout } = useAuth()
  const { pendingChangesCount, publishAll, publishing, lastSync, getSettings } = useCms()
  const sidebarLogoSrc = sanitizeImageSrc(getSettings().data.brand?.logoDarkUrl, heiferLogoDark)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [publishNotice, setPublishNotice] = useState<string | null>(null)

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const publicSiteHref = isStandaloneAdmin ? 'http://localhost:8443/#/' : '#/'

  const handlePublishAll = async () => {
    if (pendingChangesCount === 0) return
    try {
      await publishAll()
      setPublishNotice('All pending drafts are now published live.')
      setTimeout(() => setPublishNotice(null), 4000)
    } catch (err) {
      console.error('Publish all failed:', err)
    }
  }

  const activeNavId: AdminTab = currentTab === 'course-edit' ? 'courses' : currentTab
  const currentMeta = TAB_TITLES[currentTab]

  const sidebarContent = (
    <div className="relative flex h-full flex-col bg-primary-950 text-white">
      <div aria-hidden className="contours pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(24rem_16rem_at_0%_0%,rgb(63_192_200/0.16),transparent_70%)]"
      />

      {/* Brand Lockup */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
        <button
          type="button"
          onClick={() => {
            onSelectTab('dashboard')
            setMobileOpen(false)
          }}
          className="flex flex-col items-start gap-1.5 text-left"
        >
          <img
            src={sidebarLogoSrc}
            alt="Heifer Academy"
            className="h-8 w-auto"
          />
          <span className="inline-block rounded-full bg-accent-500/15 px-2.5 py-0.5 text-[0.62rem] font-bold tracking-[0.14em] text-accent-500 uppercase">
            CMS Portal
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <XIcon size={18} />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="relative flex-1 space-y-6 overflow-y-auto px-3.5 py-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => !item.superOnly || isSuperAdmin)
          if (visibleItems.length === 0) return null

          return (
            <div key={group.heading}>
              <p className="mb-2 px-3 text-[0.65rem] font-bold tracking-[0.14em] text-white/45 uppercase">
                {group.heading}
              </p>
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = activeNavId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id)
                        setMobileOpen(false)
                      }}
                      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-white text-primary-950 shadow-soft'
                          : 'text-white/78 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={
                            isActive
                              ? 'text-primary-900'
                              : 'text-white/60 group-hover:text-accent-500'
                          }
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </span>

                      {item.id === 'dashboard' && pendingChangesCount > 0 && (
                        <span
                          className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.68rem] font-extrabold ${
                            isActive
                              ? 'bg-accent-500 text-primary-950'
                              : 'bg-accent-500/20 text-accent-500'
                          }`}
                        >
                          {pendingChangesCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Public Site Link + Signed-in Staff Card */}
      <div className="relative space-y-3 border-t border-white/10 p-4">
        <a
          href={publicSiteHref}
          target={isStandaloneAdmin ? '_blank' : undefined}
          rel={isStandaloneAdmin ? 'noopener noreferrer' : undefined}
          className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2.5 text-xs font-semibold text-white/90 transition hover:border-accent-500/50 hover:bg-white/10 hover:text-white"
        >
          <span>View Public Website</span>
          <ExternalIcon size={14} className="text-accent-500" />
        </a>

        <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.05] px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-extrabold text-primary-950">
              {(profile?.name || profile?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">
                {profile?.name || 'Administrator'}
              </p>
              <p className="truncate text-[0.68rem] font-semibold tracking-wider text-accent-500 uppercase">
                {profile?.role?.replace('_', ' ') || 'Staff'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign out"
            className="rounded-lg p-2 text-white/65 transition hover:bg-red-500/20 hover:text-red-300"
          >
            <LogOutIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      {/* Mobile Sidebar Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-primary-950/65 md:backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] shrink-0 shadow-modal">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-68 shrink-0 lg:block">
        {sidebarContent}
      </aside>

      {/* Main Content Shell */}
      <div className="flex min-h-screen flex-col lg:pl-68">
        {/* Top Editorial Bar */}
        <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-line text-ink hover:bg-subtle lg:hidden"
              >
                <MenuIcon size={20} />
              </button>
              <div className="min-w-0">
                <p className="hidden text-[0.68rem] font-bold tracking-[0.12em] text-ink-3 uppercase sm:block">
                  {currentMeta.group}
                </p>
                <p className="truncate text-sm font-bold text-ink sm:text-base">
                  {currentMeta.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-line bg-subtle/70 px-3 py-1 text-xs text-ink-2 md:inline-flex">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>
                  {lastSync
                    ? `Synced ${lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : 'Live Connected'}
                </span>
              </div>

              {pendingChangesCount > 0 && isEditor && (
                <button
                  type="button"
                  onClick={handlePublishAll}
                  disabled={publishing}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-accent-500 px-4 text-xs font-extrabold text-primary-950 shadow-soft transition hover:bg-[#f09324] disabled:opacity-50"
                >
                  {publishing ? (
                    <RefreshIcon size={14} className="animate-spin" />
                  ) : (
                    <UploadIcon size={14} />
                  )}
                  <span>Publish All ({pendingChangesCount})</span>
                </button>
              )}

              <a
                href={publicSiteHref}
                target={isStandaloneAdmin ? '_blank' : undefined}
                rel={isStandaloneAdmin ? 'noopener noreferrer' : undefined}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
              >
                <span className="hidden sm:inline">Live Site</span>
                <ExternalIcon size={13} />
              </a>
            </div>
          </div>

          {publishNotice && (
            <div className="border-t border-emerald-200 bg-emerald-50 px-4 py-2 text-center text-xs font-semibold text-emerald-800">
              {publishNotice}
            </div>
          )}
        </header>

        {/* Page Workspace */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
