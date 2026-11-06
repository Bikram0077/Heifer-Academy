import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type { ProvinceItem, SiteSettings, SurveyOption } from '@shared/schema'
import heiferLogoLight from '@siteAssets/heifer-academy-logo-light.png'
import heiferLogoDark from '@siteAssets/heifer-academy-logo-dark.png'
import {
  BilingualField,
  ConfirmModal,
  EditorHeader,
  SectionCard,
  ToastBanner,
  useSyncedFormState,
  useToast,
} from '../components/CmsUi'
import {
  DownloadIcon,
  LockIcon,
  MegaphoneIcon,
  PlusIcon,
  RefreshIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TrashIcon,
} from '../components/icons'
import { MfaModal } from '../components/MfaModal'

type SettingsTab = 'banner' | 'brand' | 'contact' | 'survey' | 'backup' | 'security'

export function SettingsPage() {
  const {
    getSettings,
    saveDraft,
    saveAndPublish,
    discardDraft,
    seedDefaults,
    exportAllJson,
    saving,
    publishing,
  } = useCms()
  const { isSuperAdmin, profile } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const settingsDoc = getSettings()
  const versionKey = `${settingsDoc.updatedAt}:${settingsDoc.status}`

  const [settings, updateSettings, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<SiteSettings>(settingsDoc.data, 'site_settings', versionKey)

  const [tab, setTab] = useState<SettingsTab>('banner')
  const [confirmSeed, setConfirmSeed] = useState(false)
  const [showMfaModal, setShowMfaModal] = useState(false)

  const handleSaveDraft = async () => {
    try {
      await saveDraft('settings', 'settings', settings, 0)
      markClean()
      showToast('Site settings saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save settings.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish('settings', 'settings', settings, 0)
      markClean()
      showToast('Site settings published live!')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish settings.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (settingsDoc.status === 'draft_changes' || settingsDoc.status === 'draft_only') {
        markClean()
        await discardDraft('settings')
      } else {
        resetToRemote()
      }
      showToast('Reverted settings to last published state.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard changes.', 'error')
    }
  }

  const handleConfirmSeed = async () => {
    setConfirmSeed(false)
    try {
      await seedDefaults()
      markClean()
      showToast('All bundled website defaults have been synced to Firestore.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to sync defaults.', 'error')
    }
  }

  const handleDownloadBackup = () => {
    const json = exportAllJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heifer-academy-cms-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Downloaded full CMS JSON backup.')
  }

  const announcement = settings.announcement || {
    enabled: false,
    text: { en: '', ne: '' },
    link: '',
  }

  const brand = settings.brand || {
    siteTitle: { en: '', ne: '' },
    orgName: { en: '', ne: '' },
    orgUrl: 'https://heifernepal.org/',
    logoUrl: '',
    logoDarkUrl: '',
    wordmark: 'Academy',
    cornerstonesUrl: '',
    developedByDesc: { en: '', ne: '' },
  }

  const contact = settings.contact || {
    email: '',
    phone: '',
    address: { en: '', ne: '' },
  }

  const roles: SurveyOption[] = settings.survey?.roles || []
  const genders: SurveyOption[] = settings.survey?.genders || []
  const provinces: ProvinceItem[] = settings.survey?.provinces || []

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'banner', label: 'Announcement Banner' },
    { id: 'brand', label: 'Brand & Logo' },
    { id: 'contact', label: 'Footer Contact' },
    { id: 'survey', label: 'Learner Survey Options' },
    { id: 'security', label: 'Security & 2FA' },
    { id: 'backup', label: 'Sync & Backup' },
  ]

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <ConfirmModal
        open={confirmSeed}
        title="Sync All Bundled Website Defaults?"
        message="This will overwrite existing courses, categories, pages, UI strings, and site settings in Firestore with the bundled defaults from src/data.ts. Continue?"
        confirmLabel="Yes, Sync Defaults"
        tone="primary"
        onConfirm={handleConfirmSeed}
        onCancel={() => setConfirmSeed(false)}
      />

      {!isSuperAdmin && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-accent-100 p-4 text-xs text-ochre">
          <LockIcon size={17} className="mt-0.5 shrink-0 text-accent-500" />
          <div>
            <p className="font-bold">Super Admin Permission Required</p>
            <p className="mt-0.5 leading-relaxed">
              Firestore security rules restrict Global Site Settings to Super Admins. You can view
              current settings and download backups below, or edit Homepage, Courses, Categories,
              Pages, and UI Labels with your Editor account.
            </p>
          </div>
        </div>
      )}

      <EditorHeader
        eyebrow="Administration"
        title="Branding, Announcement & Survey Settings"
        description="Configure the top announcement strip, organization branding & links, footer contact details, and learner pulse survey options."
        status={settingsDoc.status}
        isDirty={isDirty}
        updatedAt={settingsDoc.updatedAt}
        updatedBy={settingsDoc.updatedByLabel}
        canEdit={isSuperAdmin}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />

      {/* Sub-navigation */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-card p-2 shadow-soft">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`h-10 shrink-0 rounded-xl px-4 text-xs font-bold transition ${active
                  ? 'bg-primary-900 text-white shadow-soft'
                  : 'text-ink-2 hover:bg-subtle hover:text-ink'
                }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 1. ANNOUNCEMENT BANNER */}
      {tab === 'banner' && (
        <SectionCard
          eyebrow="Top Sitewide Strip"
          title="Announcement Banner"
          description="Optional warm amber/navy strip displayed above the header across every page of the public website."
        >
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-canvas p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-accent-100 text-ochre">
                  <MegaphoneIcon size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">Display Announcement Banner</p>
                  <p className="text-xs text-ink-2">
                    When enabled, visitors see this banner at the very top of the site.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={!isSuperAdmin}
                role="switch"
                aria-checked={announcement.enabled}
                onClick={() =>
                  updateSettings((p) => ({
                    ...p,
                    announcement: { ...announcement, enabled: !announcement.enabled },
                  }))
                }
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${announcement.enabled ? 'bg-primary-900' : 'bg-line-strong'
                  } disabled:opacity-50`}
              >
                <span
                  className={`inline-block size-5 transform rounded-full bg-white shadow transition-transform ${announcement.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>

            {/* Live Visual Preview */}
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-ink-2 uppercase">
                Live Banner Preview
              </p>
              <div className="overflow-hidden rounded-xl border border-line">
                <div className="bg-primary-900 px-4 py-2.5 text-center text-sm font-medium text-white">
                  <span>
                    {announcement.text.en ||
                      'New course available: Climate-Smart Livestock Practices'}
                  </span>
                  {announcement.link && (
                    <span className="ml-2 font-bold text-accent-500 underline">
                      Learn more &rarr;
                    </span>
                  )}
                </div>
              </div>
            </div>

            <BilingualField
              label="Banner Message"
              value={announcement.text}
              disabled={!isSuperAdmin}
              placeholderEn="e.g. New course live: Financial Literacy for Women Cooperatives"
              placeholderNe="नयाँ पाठ्यक्रम सुरु: महिला सहकारीका लागि वित्तीय साक्षरता"
              onChange={(text) =>
                updateSettings((p) => ({
                  ...p,
                  announcement: { ...announcement, text },
                }))
              }
            />

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                Optional Target Link (Hash Route or Full URL)
              </label>
              <input
                type="text"
                disabled={!isSuperAdmin}
                value={announcement.link || ''}
                placeholder="e.g. #/courses or https://heifernepal.org/"
                onChange={(e) =>
                  updateSettings((p) => ({
                    ...p,
                    announcement: { ...announcement, link: e.target.value },
                  }))
                }
                className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
              />
            </div>
          </div>
        </SectionCard>
      )}

      {/* 2. BRAND & LOGO */}
      {tab === 'brand' && (
        <SectionCard
          eyebrow="Identity & Attribution"
          title="Logo, Wordmark & Organization Links"
          description="Controls browser tab title, header/footer logo lockup, external Heifer Nepal links, and course attribution note."
        >
          <div className="space-y-6">
            <BilingualField
              label="Browser Document Title"
              value={brand.siteTitle || { en: '', ne: '' }}
              disabled={!isSuperAdmin}
              onChange={(siteTitle) =>
                updateSettings((p) => ({ ...p, brand: { ...brand, siteTitle } }))
              }
            />

            <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Custom Light-Theme Logo URL (Leave blank for bundled Heifer Academy Light Logo)
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={brand.logoUrl || ''}
                    placeholder="Leave empty to use official bundled light-theme logo"
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        brand: { ...brand, logoUrl: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Custom Dark-Theme / Footer Logo URL (Leave blank for bundled Heifer Academy Dark Logo)
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={brand.logoDarkUrl || ''}
                    placeholder="Leave empty to use official bundled dark-theme white logo"
                    onChange={(e) =>
                      updateSettings((p) => ({
                        ...p,
                        brand: { ...brand, logoDarkUrl: e.target.value },
                      }))
                    }
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-line bg-canvas p-4">
                <div>
                  <p className="mb-1.5 text-[0.68rem] font-bold tracking-wider text-ink-3 uppercase">
                    Light Theme Logo Preview
                  </p>
                  <div className="flex items-center justify-center rounded-lg border border-line bg-white px-4 py-3 shadow-soft">
                    <img
                      src={brand.logoUrl?.trim() ? brand.logoUrl : heiferLogoLight}
                      alt="Light theme logo preview"
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[0.68rem] font-bold tracking-wider text-ink-3 uppercase">
                    Dark Theme &amp; Footer Preview
                  </p>
                  <div className="flex items-center justify-center rounded-lg bg-primary-950 px-4 py-3 shadow-soft">
                    <img
                      src={brand.logoDarkUrl?.trim() ? brand.logoDarkUrl : heiferLogoDark}
                      alt="Dark theme logo preview"
                      className="h-8 w-auto"
                    />
                  </div>
                </div>
              </div>
            </div>

            <BilingualField
              label="Organization Full Name"
              value={brand.orgName || { en: '', ne: '' }}
              disabled={!isSuperAdmin}
              onChange={(orgName) =>
                updateSettings((p) => ({ ...p, brand: { ...brand, orgName } }))
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Main Organization Website URL
                </label>
                <input
                  type="url"
                  disabled={!isSuperAdmin}
                  value={brand.orgUrl || ''}
                  placeholder="https://heifernepal.org/"
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      brand: { ...brand, orgUrl: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  12 Cornerstones Footer Link URL
                </label>
                <input
                  type="url"
                  disabled={!isSuperAdmin}
                  value={brand.cornerstonesUrl || ''}
                  placeholder="https://www.heifer.org/about-us/our-principles.html"
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      brand: { ...brand, cornerstonesUrl: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                />
              </div>
            </div>

            <BilingualField
              label="Course Outline 'Developed With' Description"
              multiline
              rows={3}
              value={brand.developedByDesc || { en: '', ne: '' }}
              disabled={!isSuperAdmin}
              onChange={(developedByDesc) =>
                updateSettings((p) => ({
                  ...p,
                  brand: { ...brand, developedByDesc },
                }))
              }
            />
          </div>
        </SectionCard>
      )}

      {/* 3. FOOTER CONTACT */}
      {tab === 'contact' && (
        <SectionCard
          eyebrow="Website Footer"
          title="Organization Contact Details"
          description="Displayed in the Contact column of the public website footer."
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Contact Email Address
                </label>
                <input
                  type="email"
                  disabled={!isSuperAdmin}
                  value={contact.email}
                  placeholder="heifer.nepal@heifer.org"
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      contact: { ...contact, email: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Office Telephone Number
                </label>
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={contact.phone}
                  placeholder="+977-1-5432554"
                  onChange={(e) =>
                    updateSettings((p) => ({
                      ...p,
                      contact: { ...contact, phone: e.target.value },
                    }))
                  }
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                />
              </div>
            </div>

            <BilingualField
              label="Office Street Address"
              value={contact.address}
              disabled={!isSuperAdmin}
              onChange={(address) =>
                updateSettings((p) => ({
                  ...p,
                  contact: { ...contact, address },
                }))
              }
            />
          </div>
        </SectionCard>
      )}

      {/* 4. LEARNER SURVEY OPTIONS */}
      {tab === 'survey' && (
        <div className="space-y-6">
          <SurveyOptionsCard
            eyebrow="Pulse Modal · Step 1"
            title={`Learner Roles (${roles.length})`}
            description="Role choices presented in the optional pre-video learner survey modal."
            options={roles}
            canEdit={isSuperAdmin}
            onChange={(nextRoles) =>
              updateSettings((p) => ({
                ...p,
                survey: { ...(p.survey || {}), roles: nextRoles },
              }))
            }
          />

          <SurveyOptionsCard
            eyebrow="Pulse Modal · Step 2"
            title={`Gender Options (${genders.length})`}
            description="Gender options presented in the optional pre-video learner survey modal."
            options={genders}
            canEdit={isSuperAdmin}
            onChange={(nextGenders) =>
              updateSettings((p) => ({
                ...p,
                survey: { ...(p.survey || {}), genders: nextGenders },
              }))
            }
          />

          <SectionCard
            eyebrow="Pulse Modal · Location"
            title={`Provinces & Districts (${provinces.length})`}
            description="Provinces and district dropdown options used in the learner survey."
          >
            <div className="space-y-4">
              {provinces.map((prov, idx) => (
                <div
                  key={idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-4"
                >
                  <BilingualField
                    label={`Province #${idx + 1} Name`}
                    value={prov.name}
                    disabled={!isSuperAdmin}
                    onChange={(name) =>
                      updateSettings((p) => ({
                        ...p,
                        survey: {
                          ...(p.survey || {}),
                          provinces: provinces.map((item, k) =>
                            k === idx ? { ...item, name } : item
                          ),
                        },
                      }))
                    }
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                      Districts (Comma-Separated)
                    </label>
                    <textarea
                      rows={2}
                      disabled={!isSuperAdmin}
                      value={prov.districts.join(', ')}
                      onChange={(e) => {
                        const districts = e.target.value
                          .split(',')
                          .map((d) => d.trim())
                          .filter(Boolean)
                        updateSettings((p) => ({
                          ...p,
                          survey: {
                            ...(p.survey || {}),
                            provinces: provinces.map((item, k) =>
                              k === idx ? { ...item, districts } : item
                            ),
                          },
                        }))
                      }}
                      className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-xs leading-relaxed text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* 5. DATABASE SYNC & BACKUP */}
      {tab === 'backup' && (
        <div className="grid gap-6 md:grid-cols-2">
          <SectionCard
            eyebrow="Portable Snapshot"
            title="Export Complete CMS Backup"
            description="Download a single JSON file containing all courses, categories, homepage copy, info pages, settings, and bilingual UI strings."
          >
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft hover:bg-primary-700"
            >
              <DownloadIcon size={15} />
              Download JSON Backup
            </button>
          </SectionCard>

          <SectionCard
            eyebrow="Reset / Seed Database"
            title="Sync Bundled Website Defaults"
            description="Populate or restore Firestore with the complete default content bundled inside src/data.ts."
          >
            <button
              type="button"
              disabled={!isSuperAdmin || saving}
              onClick={() => setConfirmSeed(true)}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-amber-400 bg-accent-100 px-5 text-xs font-bold text-ochre hover:bg-accent-500/25 disabled:opacity-50"
            >
              {saving ? (
                <RefreshIcon size={15} className="animate-spin" />
              ) : (
                <SparklesIcon size={15} />
              )}
              Sync Bundled Content to Live
            </button>
          </SectionCard>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Authentication & Protection"
            title="Two-Factor Authentication (2FA / TOTP)"
            description="Manage mobile authenticator app verification for your Super Admin and Editor accounts."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      profile?.mfaEnabled
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <ShieldCheckIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink">
                        {profile?.mfaEnabled
                          ? 'Two-Factor Authentication is Active'
                          : 'Two-Factor Authentication is Disabled'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold uppercase ${
                          profile?.mfaEnabled
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {profile?.mfaEnabled ? 'Protected' : 'Off'}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-2">
                      {profile?.mfaEnabled
                        ? `Enrolled with Google Authenticator / TOTP. Last updated: ${
                            profile.mfaEnrolledAt
                              ? new Date(profile.mfaEnrolledAt).toLocaleDateString()
                              : 'Active'
                          }`
                        : 'Recommended for Super Admin & Editor accounts to prevent unauthorized access.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowMfaModal(true)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white transition hover:bg-primary-700"
                >
                  <ShieldCheckIcon size={14} />
                  <span>{profile?.mfaEnabled ? 'Manage / Test 2FA' : 'Set Up 2FA Now'}</span>
                </button>
              </div>

              <div className="grid gap-3 pt-2 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-line bg-card p-3.5 space-y-1">
                  <p className="font-bold text-ink">Google &amp; Microsoft Authenticator</p>
                  <p className="text-ink-2 leading-relaxed">
                    Uses standard RFC 6238 TOTP algorithm with 30-second rotating codes.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-card p-3.5 space-y-1">
                  <p className="font-bold text-ink">Browser-Session Persistence</p>
                  <p className="text-ink-2 leading-relaxed">
                    Credentials and tokens automatically purge upon browser or tab close.
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-card p-3.5 space-y-1">
                  <p className="font-bold text-ink">15-Min Inactivity Auto-Logout</p>
                  <p className="text-ink-2 leading-relaxed">
                    Automatic session termination on idle mouse, keyboard, and scroll state.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Two-Factor Authentication Modal */}
      <MfaModal isOpen={showMfaModal} onClose={() => setShowMfaModal(false)} />
    </div>
  )
}

function SurveyOptionsCard({
  eyebrow,
  title,
  description,
  options,
  canEdit,
  onChange,
}: {
  eyebrow: string
  title: string
  description: string
  options: SurveyOption[]
  canEdit: boolean
  onChange: (next: SurveyOption[]) => void
}) {
  return (
    <SectionCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={
        canEdit ? (
          <button
            type="button"
            onClick={() =>
              onChange([
                ...options,
                { id: `opt_${options.length + 1}`, label: { en: '', ne: '' } },
              ])
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
          >
            <PlusIcon size={14} />
            Add Option
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {options.map((opt, idx) => (
          <div key={idx} className="rounded-xl border border-line bg-canvas p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-2 uppercase">Key:</span>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={opt.id}
                  onChange={(e) =>
                    onChange(
                      options.map((item, k) =>
                        k === idx ? { ...item, id: e.target.value.trim() } : item
                      )
                    )
                  }
                  className="w-36 rounded-lg border border-line-strong bg-card px-2.5 py-1 font-mono text-xs text-ink"
                />
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onChange(options.filter((_, k) => k !== idx))}
                  className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  <TrashIcon size={13} />
                </button>
              )}
            </div>
            <BilingualField
              compact
              value={opt.label}
              disabled={!canEdit}
              onChange={(label) =>
                onChange(
                  options.map((item, k) => (k === idx ? { ...item, label } : item))
                )
              }
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
