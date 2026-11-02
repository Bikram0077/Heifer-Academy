import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type {
  FooterColumn,
  FooterLinkItem,
  LayoutConfig,
  NavLinkItem,
  PageContent,
  SocialLink,
  SocialPlatform,
} from '@shared/schema'
import { defaultLayoutConfig } from '@siteData'
import {
  BilingualField,
  EditorHeader,
  SectionCard,
  StatusBadge,
  ToastBanner,
  useSyncedFormState,
  useToast,
} from '../components/CmsUi'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons'

type LayoutSubTab = 'header' | 'footer-banner' | 'footer-columns' | 'social-copyright'

const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'twitter', label: 'X / Twitter' },
  { id: 'website', label: 'Official Website' },
]

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`
}

export function HeaderFooterPage() {
  const {
    getLayoutPage,
    getCustomPages,
    saveDraft,
    saveAndPublish,
    discardDraft,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [activeSubTab, setActiveSubTab] = useState<LayoutSubTab>('header')

  const layoutDoc = getLayoutPage()
  const customPages = getCustomPages()
  const initialLayout: LayoutConfig = layoutDoc.data.layoutData || defaultLayoutConfig

  const versionKey = `${layoutDoc.updatedAt}:${layoutDoc.status}`
  const [layout, updateLayout, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<LayoutConfig>(initialLayout, 'page_layout', versionKey)

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const publicSiteHref = isStandaloneAdmin ? 'http://localhost:8443/#/' : '#/'

  const routePresets = [
    { label: 'Explore Courses (#/courses)', href: '#/courses' },
    { label: 'Materials & Field Guides (#/resources)', href: '#/resources' },
    { label: 'About Heifer Academy (#/about)', href: '#/about' },
    { label: 'Homepage (#/)', href: '#/' },
    { label: 'Privacy Policy (#/privacy)', href: '#/privacy' },
    { label: 'Terms of Use (#/terms)', href: '#/terms' },
    { label: 'Accessibility (#/accessibility)', href: '#/accessibility' },
    ...customPages.map((cp) => {
      const clean = cp.id.replace(/^custom_/, '')
      return {
        label: `Custom Page: ${cp.data.title.en || clean} (#/page/${clean})`,
        href: `#/page/${clean}`,
      }
    }),
  ]

  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir
    if (target < 0 || target >= arr.length) return arr
    const next = [...arr]
    const [picked] = next.splice(idx, 1)
    next.splice(target, 0, picked)
    return next
  }

  const buildPayload = (): PageContent => ({
    slug: 'layout',
    title: layoutDoc.data.title || {
      en: 'Header & Footer Navigation',
      ne: 'हेडर र फुटर नेभिगेसन',
    },
    layoutData: layout,
  })

  const handleSaveDraft = async () => {
    try {
      await saveDraft('page_layout', 'page', buildPayload(), 0)
      markClean()
      showToast('Header & Footer navigation saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save draft.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish('page_layout', 'page', buildPayload(), 0)
      markClean()
      showToast('Header & Footer published live! Menus and footer columns are now synced.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish Header & Footer.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (layoutDoc.status === 'draft_changes' || layoutDoc.status === 'draft_only') {
        markClean()
        await discardDraft('page_layout')
      } else {
        resetToRemote()
      }
      showToast('Reverted Header & Footer to last published version.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard draft.', 'error')
    }
  }

  // --- Header Helpers ---
  const addNavLink = () => {
    const nextItem: NavLinkItem = {
      id: makeId('nav'),
      label: { en: 'New Link', ne: 'नयाँ लिंक' },
      href: '#/resources',
      action: 'link',
      external: false,
      enabled: true,
    }
    updateLayout((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navLinks: [...(prev.header.navLinks || []), nextItem],
      },
    }))
  }

  const updateNavLink = (idx: number, patch: Partial<NavLinkItem>) => {
    updateLayout((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        navLinks: prev.header.navLinks.map((item, i) =>
          i === idx ? { ...item, ...patch } : item
        ),
      },
    }))
  }

  // --- Footer Column Helpers ---
  const addFooterColumn = () => {
    const nextCol: FooterColumn = {
      id: makeId('col'),
      title: { en: 'Resources', ne: 'स्रोतहरू' },
      links: [
        {
          id: makeId('flink'),
          label: { en: 'Materials & Guides', ne: 'सिकाइ सामग्री' },
          href: '#/resources',
          action: 'link',
          external: false,
        },
      ],
    }
    updateLayout((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        columns: [...(prev.footer.columns || []), nextCol],
      },
    }))
  }

  const updateFooterColumn = (cIdx: number, nextCol: FooterColumn) => {
    updateLayout((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        columns: prev.footer.columns.map((col, i) => (i === cIdx ? nextCol : col)),
      },
    }))
  }

  const addFooterLink = (cIdx: number) => {
    const col = layout.footer.columns[cIdx]
    if (!col) return
    const nextLink: FooterLinkItem = {
      id: makeId('flink'),
      label: { en: 'New Footer Link', ne: 'नयाँ फुटर लिंक' },
      href: '#/about',
      action: 'link',
      external: false,
    }
    updateFooterColumn(cIdx, {
      ...col,
      links: [...(col.links || []), nextLink],
    })
  }

  // --- Social Link Helpers ---
  const addSocialLink = () => {
    const nextSocial: SocialLink = {
      id: makeId('soc'),
      platform: 'facebook',
      label: 'Heifer International Nepal',
      url: 'https://www.facebook.com/heifernepal',
      enabled: true,
    }
    updateLayout((prev) => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: [...(prev.footer.socialLinks || []), nextSocial],
      },
    }))
  }

  const SUB_TABS: { id: LayoutSubTab; label: string; count?: number }[] = [
    {
      id: 'header',
      label: 'Header Menu & CTA',
      count: layout.header.navLinks?.length || 0,
    },
    { id: 'footer-banner', label: 'Footer Banner & Bio' },
    {
      id: 'footer-columns',
      label: 'Footer Columns & Links',
      count: layout.footer.columns?.length || 0,
    },
    {
      id: 'social-copyright',
      label: 'Social Icons & Copyright',
      count: layout.footer.socialLinks?.filter((s) => s.enabled).length || 0,
    },
  ]

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <EditorHeader
        eyebrow="Global Navigation & Footer"
        title="Header & Footer Customization"
        description="Customize top navigation links, the Explore dropdown, header CTA button, footer initiative banner, multi-column footer menus, social media profiles, and copyright text."
        status={layoutDoc.status}
        isDirty={isDirty}
        updatedAt={layoutDoc.updatedAt}
        updatedBy={layoutDoc.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        extraActions={
          <a
            href={publicSiteHref}
            target={isStandaloneAdmin ? '_blank' : undefined}
            rel={isStandaloneAdmin ? 'noreferrer' : undefined}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
          >
            Preview Site <ExternalIcon size={13} />
          </a>
        }
      />

      {/* Sub-navigation tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-card p-2 shadow-soft">
        {SUB_TABS.map((t) => {
          const active = activeSubTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
                active
                  ? 'bg-primary-900 text-white shadow-soft'
                  : 'text-ink-2 hover:bg-subtle hover:text-ink'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.68rem] ${
                    active ? 'bg-white/20 text-white' : 'bg-subtle text-ink-2'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* TAB 1: HEADER MENU & CTA */}
      {activeSubTab === 'header' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Top Navigation Bar"
            title="Explore Courses Dropdown & Menu Links"
            description="Manage the links displayed in both the desktop top navigation bar and mobile menu drawer."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={addNavLink}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Menu Link
                </button>
              ) : undefined
            }
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-4">
                <input
                  type="checkbox"
                  disabled={!isEditor}
                  checked={layout.header.showExploreDropdown}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      header: { ...prev.header, showExploreDropdown: e.target.checked },
                    }))
                  }
                  className="mt-0.5 size-4 rounded border-line-strong accent-primary-900"
                />
                <div>
                  <span className="block text-sm font-bold text-ink">
                    Show &ldquo;Explore&rdquo; Topic Categories Dropdown
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-2">
                    Displays a mega-dropdown with all active course categories and live course counts in the header.
                  </span>
                </div>
              </label>

              {(layout.header.navLinks || []).length === 0 && (
                <p className="py-4 text-center text-sm text-ink-3">
                  No custom header links yet. Click &ldquo;Add Menu Link&rdquo; above to add one.
                </p>
              )}

              {(layout.header.navLinks || []).map((nav, idx) => (
                <div
                  key={nav.id || idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-brand">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold tracking-wider text-brand uppercase">
                        {nav.label.en || `Menu Link #${idx + 1}`}
                      </span>
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-semibold text-ink-2">
                        <input
                          type="checkbox"
                          disabled={!isEditor}
                          checked={nav.enabled}
                          onChange={(e) => updateNavLink(idx, { enabled: e.target.checked })}
                          className="size-3.5 accent-primary-900"
                        />
                        {nav.enabled ? 'Visible' : 'Hidden'}
                      </label>
                    </div>

                    {isEditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updateLayout((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                navLinks: moveItem(prev.header.navLinks, idx, -1),
                              },
                            }))
                          }
                          title="Move link left/up"
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === layout.header.navLinks.length - 1}
                          onClick={() =>
                            updateLayout((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                navLinks: moveItem(prev.header.navLinks, idx, 1),
                              },
                            }))
                          }
                          title="Move link right/down"
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateLayout((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                navLinks: prev.header.navLinks.filter((_, i) => i !== idx),
                              },
                            }))
                          }
                          title="Remove link"
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <BilingualField
                    label="Menu Label"
                    value={nav.label}
                    disabled={!isEditor}
                    onChange={(label) => updateNavLink(idx, { label })}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Click Behavior
                      </label>
                      <select
                        disabled={!isEditor}
                        value={nav.action || 'link'}
                        onChange={(e) =>
                          updateNavLink(idx, {
                            action: e.target.value as 'link' | 'faq' | 'pulse',
                          })
                        }
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      >
                        <option value="link">Navigate to Page / URL</option>
                        <option value="faq">Scroll to Homepage FAQ</option>
                        <option value="pulse">Open Learner Feedback Survey</option>
                      </select>
                    </div>

                    {(!nav.action || nav.action === 'link') && (
                      <>
                        <div>
                          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                            Quick Page Preset
                          </label>
                          <select
                            disabled={!isEditor}
                            value={
                              routePresets.some((p) => p.href === nav.href) ? nav.href : '__custom__'
                            }
                            onChange={(e) => {
                              if (e.target.value !== '__custom__') {
                                updateNavLink(idx, { href: e.target.value, external: false })
                              }
                            }}
                            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          >
                            {routePresets.map((rp) => (
                              <option key={rp.href} value={rp.href}>
                                {rp.label}
                              </option>
                            ))}
                            <option value="__custom__">Custom Route or External URL...</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                            Target Route or URL
                          </label>
                          <input
                            type="text"
                            disabled={!isEditor}
                            value={nav.href}
                            placeholder="#/resources or https://..."
                            onChange={(e) => updateNavLink(idx, { href: e.target.value })}
                            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          />
                          <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-xs text-ink-2">
                            <input
                              type="checkbox"
                              disabled={!isEditor}
                              checked={Boolean(nav.external)}
                              onChange={(e) => updateNavLink(idx, { external: e.target.checked })}
                              className="size-3.5 accent-primary-900"
                            />
                            Open in new browser tab
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Primary Header Button"
            title="Header Call-To-Action (CTA) Button"
            description="Highlighted pill button on the right side of the navigation bar (e.g. 'Start learning')."
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
                <input
                  type="checkbox"
                  disabled={!isEditor}
                  checked={layout.header.ctaButton.enabled}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      header: {
                        ...prev.header,
                        ctaButton: { ...prev.header.ctaButton, enabled: e.target.checked },
                      },
                    }))
                  }
                  className="size-4 rounded border-line-strong accent-primary-900"
                />
                <span className="text-sm font-bold text-ink">
                  Show Primary CTA Button in Header
                </span>
              </label>

              {layout.header.ctaButton.enabled && (
                <>
                  <BilingualField
                    label="Button Label"
                    value={layout.header.ctaButton.label}
                    disabled={!isEditor}
                    onChange={(label) =>
                      updateLayout((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          ctaButton: { ...prev.header.ctaButton, label },
                        },
                      }))
                    }
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Quick Destination Preset
                      </label>
                      <select
                        disabled={!isEditor}
                        value={
                          routePresets.some((p) => p.href === layout.header.ctaButton.href)
                            ? layout.header.ctaButton.href
                            : '__custom__'
                        }
                        onChange={(e) => {
                          if (e.target.value !== '__custom__') {
                            updateLayout((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                ctaButton: { ...prev.header.ctaButton, href: e.target.value },
                              },
                            }))
                          }
                        }}
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      >
                        {routePresets.map((rp) => (
                          <option key={rp.href} value={rp.href}>
                            {rp.label}
                          </option>
                        ))}
                        <option value="__custom__">Custom URL...</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Destination Route or URL
                      </label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={layout.header.ctaButton.href}
                        onChange={(e) =>
                          updateLayout((prev) => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              ctaButton: { ...prev.header.ctaButton, href: e.target.value },
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB 2: FOOTER TOP BANNER & BIO */}
      {activeSubTab === 'footer-banner' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Footer Top Initiative Band"
            title="Passing on the Gift Banner"
            description="Dark-blue contoured banner at the top of the website footer."
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
                <input
                  type="checkbox"
                  disabled={!isEditor}
                  checked={layout.footer.showTopBanner}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, showTopBanner: e.target.checked },
                    }))
                  }
                  className="size-4 rounded border-line-strong accent-primary-900"
                />
                <span className="text-sm font-bold text-ink">
                  Display Top Initiative Banner in Footer
                </span>
              </label>

              {layout.footer.showTopBanner && (
                <>
                  <BilingualField
                    label="Eyebrow Initiative Label"
                    value={layout.footer.initiativeLabel}
                    disabled={!isEditor}
                    onChange={(initiativeLabel) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, initiativeLabel },
                      }))
                    }
                  />
                  <BilingualField
                    label="Banner Headline / Tagline"
                    value={layout.footer.tagline}
                    disabled={!isEditor}
                    onChange={(tagline) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, tagline },
                      }))
                    }
                  />
                  <BilingualField
                    label="Banner Supporting Subtitle"
                    multiline
                    rows={2}
                    value={layout.footer.subtitle}
                    disabled={!isEditor}
                    onChange={(subtitle) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: { ...prev.footer, subtitle },
                      }))
                    }
                  />
                </>
              )}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Footer Left Brand Column"
            title="Organization Bio & Summary"
            description="Displayed underneath the Heifer International Nepal logo in the left column of the footer. Contact details (address, phone, email) can also be edited in Branding & Settings."
          >
            <BilingualField
              label="Footer Organization Description (Optional)"
              hint="Leave blank to use the default organization summary from Branding & Settings"
              multiline
              rows={3}
              value={layout.footer.description || { en: '', ne: '' }}
              disabled={!isEditor}
              onChange={(description) =>
                updateLayout((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, description },
                }))
              }
            />
          </SectionCard>
        </div>
      )}

      {/* TAB 3: FOOTER COLUMNS & LINKS */}
      {activeSubTab === 'footer-columns' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Dynamic Topic Column"
            title="Course Categories Column"
            description="Automatically lists all active course categories in the first link column of the footer."
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
                <input
                  type="checkbox"
                  disabled={!isEditor}
                  checked={layout.footer.showCategoriesColumn}
                  onChange={(e) =>
                    updateLayout((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, showCategoriesColumn: e.target.checked },
                    }))
                  }
                  className="size-4 rounded border-line-strong accent-primary-900"
                />
                <span className="text-sm font-bold text-ink">
                  Show Auto-Synced Course Categories Column in Footer
                </span>
              </label>

              {layout.footer.showCategoriesColumn && (
                <BilingualField
                  label="Categories Column Heading"
                  value={layout.footer.categoriesColumnTitle}
                  disabled={!isEditor}
                  onChange={(categoriesColumnTitle) =>
                    updateLayout((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, categoriesColumnTitle },
                    }))
                  }
                />
              )}
            </div>
          </SectionCard>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5 shadow-soft">
            <div>
              <h2 className="text-base font-bold text-ink">
                Custom Footer Link Columns ({layout.footer.columns?.length || 0})
              </h2>
              <p className="text-xs text-ink-2">
                Add, rename, or reorder columns (such as Organisation, Resources, Support) and customize every link inside them.
              </p>
            </div>
            {isEditor && (
              <button
                type="button"
                onClick={addFooterColumn}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
              >
                <PlusIcon size={15} />
                Add Footer Column
              </button>
            )}
          </div>

          {(layout.footer.columns || []).map((col, cIdx) => (
            <SectionCard
              key={col.id || cIdx}
              eyebrow={`Footer Column #${cIdx + 1}`}
              title={col.title.en || `Column #${cIdx + 1}`}
              actions={
                isEditor ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={cIdx === 0}
                      onClick={() =>
                        updateLayout((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            columns: moveItem(prev.footer.columns, cIdx, -1),
                          },
                        }))
                      }
                      title="Move column up"
                      className="rounded-lg border border-line p-2 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUpIcon size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={cIdx === layout.footer.columns.length - 1}
                      onClick={() =>
                        updateLayout((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            columns: moveItem(prev.footer.columns, cIdx, 1),
                          },
                        }))
                      }
                      title="Move column down"
                      className="rounded-lg border border-line p-2 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDownIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => addFooterLink(cIdx)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary-700/30 bg-primary-100 px-3.5 text-xs font-bold text-brand hover:bg-primary-100/70"
                    >
                      <PlusIcon size={14} />
                      Add Link
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateLayout((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            columns: prev.footer.columns.filter((_, i) => i !== cIdx),
                          },
                        }))
                      }
                      title="Delete column"
                      className="rounded-lg border border-line p-2 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <TrashIcon size={14} />
                    </button>
                  </div>
                ) : undefined
              }
            >
              <div className="space-y-5">
                <BilingualField
                  label="Column Heading"
                  value={col.title}
                  disabled={!isEditor}
                  onChange={(title) => updateFooterColumn(cIdx, { ...col, title })}
                />

                <div className="space-y-4">
                  {(col.links || []).length === 0 && (
                    <p className="py-3 text-center text-xs text-ink-3">
                      No links in this column yet. Click &ldquo;Add Link&rdquo; above.
                    </p>
                  )}

                  {(col.links || []).map((lnk, lIdx) => (
                    <div
                      key={lnk.id || lIdx}
                      className="space-y-4 rounded-xl border border-line bg-canvas p-4"
                    >
                      <div className="flex items-center justify-between border-b border-line pb-2.5">
                        <span className="text-xs font-bold tracking-wider text-brand uppercase">
                          Link #{lIdx + 1}: {lnk.label.en || 'Untitled'}
                        </span>

                        {isEditor && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={lIdx === 0}
                              onClick={() =>
                                updateFooterColumn(cIdx, {
                                  ...col,
                                  links: moveItem(col.links, lIdx, -1),
                                })
                              }
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                            >
                              <ArrowUpIcon size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={lIdx === col.links.length - 1}
                              onClick={() =>
                                updateFooterColumn(cIdx, {
                                  ...col,
                                  links: moveItem(col.links, lIdx, 1),
                                })
                              }
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                            >
                              <ArrowDownIcon size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateFooterColumn(cIdx, {
                                  ...col,
                                  links: col.links.filter((_, k) => k !== lIdx),
                                })
                              }
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      <BilingualField
                        label="Link Label"
                        value={lnk.label}
                        disabled={!isEditor}
                        compact
                        onChange={(label) =>
                          updateFooterColumn(cIdx, {
                            ...col,
                            links: col.links.map((item, k) =>
                              k === lIdx ? { ...item, label } : item
                            ),
                          })
                        }
                      />

                      <div className="grid gap-3 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-bold tracking-wide text-ink uppercase">
                            Action
                          </label>
                          <select
                            disabled={!isEditor}
                            value={lnk.action || 'link'}
                            onChange={(e) =>
                              updateFooterColumn(cIdx, {
                                ...col,
                                links: col.links.map((item, k) =>
                                  k === lIdx
                                    ? {
                                        ...item,
                                        action: e.target.value as 'link' | 'pulse' | 'faq',
                                      }
                                    : item
                                ),
                              })
                            }
                            className="w-full rounded-xl border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          >
                            <option value="link">Navigate to Page / URL</option>
                            <option value="pulse">Open Learner Feedback Survey</option>
                            <option value="faq">Scroll to Homepage FAQ</option>
                          </select>
                        </div>

                        {(!lnk.action || lnk.action === 'link') && (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-bold tracking-wide text-ink uppercase">
                                Quick Page Preset
                              </label>
                              <select
                                disabled={!isEditor}
                                value={
                                  routePresets.some((p) => p.href === lnk.href)
                                    ? lnk.href
                                    : '__custom__'
                                }
                                onChange={(e) => {
                                  if (e.target.value !== '__custom__') {
                                    updateFooterColumn(cIdx, {
                                      ...col,
                                      links: col.links.map((item, k) =>
                                        k === lIdx
                                          ? { ...item, href: e.target.value, external: false }
                                          : item
                                      ),
                                    })
                                  }
                                }}
                                className="w-full rounded-xl border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                              >
                                {routePresets.map((rp) => (
                                  <option key={rp.href} value={rp.href}>
                                    {rp.label}
                                  </option>
                                ))}
                                <option value="__custom__">Custom or External URL...</option>
                              </select>
                            </div>

                            <div>
                              <label className="mb-1 block text-xs font-bold tracking-wide text-ink uppercase">
                                URL / Route
                              </label>
                              <input
                                type="text"
                                disabled={!isEditor}
                                value={lnk.href}
                                placeholder="#/about or https://www.heifernepal.org"
                                onChange={(e) =>
                                  updateFooterColumn(cIdx, {
                                    ...col,
                                    links: col.links.map((item, k) =>
                                      k === lIdx ? { ...item, href: e.target.value } : item
                                    ),
                                  })
                                }
                                className="w-full rounded-xl border border-line-strong bg-card px-3 py-2 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                              />
                              <label className="mt-1.5 inline-flex cursor-pointer items-center gap-2 text-xs text-ink-2">
                                <input
                                  type="checkbox"
                                  disabled={!isEditor}
                                  checked={Boolean(lnk.external)}
                                  onChange={(e) =>
                                    updateFooterColumn(cIdx, {
                                      ...col,
                                      links: col.links.map((item, k) =>
                                        k === lIdx ? { ...item, external: e.target.checked } : item
                                      ),
                                    })
                                  }
                                  className="size-3.5 accent-primary-900"
                                />
                                Open in new tab (external link icon)
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* TAB 4: SOCIAL ICONS & COPYRIGHT */}
      {activeSubTab === 'social-copyright' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Official Channels"
            title="Footer Social Media Icons"
            description="Social icon buttons shown under the Heifer Nepal contact details in the footer."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Social Link
                </button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {(layout.footer.socialLinks || []).length === 0 && (
                <p className="py-4 text-center text-sm text-ink-3">
                  No social links added yet.
                </p>
              )}

              {(layout.footer.socialLinks || []).map((soc, idx) => (
                <div
                  key={soc.id || idx}
                  className="grid gap-3 rounded-xl border border-line bg-canvas p-4 md:grid-cols-[auto_11rem_1fr_1.4fr_auto] md:items-center"
                >
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-ink">
                    <input
                      type="checkbox"
                      disabled={!isEditor}
                      checked={soc.enabled}
                      onChange={(e) =>
                        updateLayout((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            socialLinks: prev.footer.socialLinks.map((s, i) =>
                              i === idx ? { ...s, enabled: e.target.checked } : s
                            ),
                          },
                        }))
                      }
                      className="size-4 accent-primary-900"
                    />
                    <span className="md:sr-only">Enabled</span>
                  </label>

                  <select
                    disabled={!isEditor}
                    value={soc.platform}
                    onChange={(e) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          socialLinks: prev.footer.socialLinks.map((s, i) =>
                            i === idx
                              ? { ...s, platform: e.target.value as SocialPlatform }
                              : s
                          ),
                        },
                      }))
                    }
                    className="rounded-xl border border-line-strong bg-card px-3 py-2 text-sm font-semibold text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                  >
                    {SOCIAL_PLATFORMS.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    disabled={!isEditor}
                    value={soc.label}
                    placeholder="Accessible label (e.g. Facebook)"
                    onChange={(e) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          socialLinks: prev.footer.socialLinks.map((s, i) =>
                            i === idx ? { ...s, label: e.target.value } : s
                          ),
                        },
                      }))
                    }
                    className="rounded-xl border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                  />

                  <input
                    type="url"
                    disabled={!isEditor}
                    value={soc.url}
                    placeholder="https://..."
                    onChange={(e) =>
                      updateLayout((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          socialLinks: prev.footer.socialLinks.map((s, i) =>
                            i === idx ? { ...s, url: e.target.value } : s
                          ),
                        },
                      }))
                    }
                    className="rounded-xl border border-line-strong bg-card px-3 py-2 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                  />

                  {isEditor && (
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateLayout((prev) => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              socialLinks: moveItem(prev.footer.socialLinks, idx, -1),
                            },
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUpIcon size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === layout.footer.socialLinks.length - 1}
                        onClick={() =>
                          updateLayout((prev) => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              socialLinks: moveItem(prev.footer.socialLinks, idx, 1),
                            },
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDownIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateLayout((prev) => ({
                            ...prev,
                            footer: {
                              ...prev.footer,
                              socialLinks: prev.footer.socialLinks.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Bottom Legal Strip"
            title="Copyright & Attribution Bar"
            description="Displayed along the very bottom bar of the website footer."
          >
            <div className="space-y-5">
              <BilingualField
                label="Left Copyright Notice"
                value={layout.footer.copyrightText}
                disabled={!isEditor}
                onChange={(copyrightText) =>
                  updateLayout((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, copyrightText },
                  }))
                }
              />
              <BilingualField
                label="Right Dedication / Attribution Line"
                value={layout.footer.madeForText}
                disabled={!isEditor}
                onChange={(madeForText) =>
                  updateLayout((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, madeForText },
                  }))
                }
              />
            </div>
          </SectionCard>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-3.5 text-xs text-ink-2">
        <span>
          Active document ID: <code>page_layout</code>
        </span>
        <StatusBadge status={layoutDoc.status} isDirty={isDirty} />
      </div>
    </div>
  )
}

