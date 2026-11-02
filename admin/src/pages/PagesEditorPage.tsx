import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type {
  AboutPillar,
  Bi,
  MaterialFormat,
  PageContent,
  PageSection,
  PageSectionKind,
} from '@shared/schema'
import { MATERIAL_FORMATS } from './MaterialsPage'
import {
  BilingualField,
  ConfirmModal,
  EditorHeader,
  PillarIconPicker,
  SectionCard,
  StatusBadge,
  ToastBanner,
  YouTubeField,
  useSyncedFormState,
  useToast,
} from '../components/CmsUi'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExternalIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '../components/icons'

type BuiltInSlug = 'about' | 'explore' | 'privacy' | 'terms' | 'accessibility'

const BUILTIN_TABS: { slug: BuiltInSlug; label: string; route: string }[] = [
  { slug: 'about', label: 'About Heifer Academy', route: '#/about' },
  { slug: 'explore', label: 'Explore Courses Header', route: '#/courses' },
  { slug: 'privacy', label: 'Privacy Policy', route: '#/privacy' },
  { slug: 'terms', label: 'Terms of Use', route: '#/terms' },
  { slug: 'accessibility', label: 'Accessibility Statement', route: '#/accessibility' },
]

const SECTION_KINDS: { id: PageSectionKind; label: string }[] = [
  { id: 'text', label: 'Text Section' },
  { id: 'callout', label: 'Highlighted Callout Box' },
  { id: 'bullets', label: 'Checkmark Bullet List' },
  { id: 'image', label: 'Image + Caption' },
  { id: 'video', label: 'Embedded YouTube Video' },
  { id: 'download', label: 'Download / File Attachment Card' },
]

function slugifySlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^custom_/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PagesEditorPage() {
  const {
    getPage,
    getCustomPages,
    createCustomPage,
    deleteCustomPage,
    saveDraft,
    saveAndPublish,
    discardDraft,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [selectedSlug, setSelectedSlug] = useState<string>('about')
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState<Bi>({ en: '', ne: '' })
  const [newSlug, setNewSlug] = useState('')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const customPages = getCustomPages()
  const pageDoc = getPage(selectedSlug)
  const isCustomPage =
    selectedSlug.startsWith('custom_') || Boolean(pageDoc?.data?.isCustom)
  const cleanCustomSlug = selectedSlug.replace(/^custom_/, '')

  const fallbackPage: PageContent = pageDoc?.data || {
    slug: selectedSlug,
    isCustom: isCustomPage,
    title: { en: '', ne: '' },
    subtitle: { en: '', ne: '' },
    sections: [],
  }

  const versionKey = `${pageDoc?.updatedAt || ''}:${pageDoc?.status || 'unpublished'}`

  const [page, updatePage, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<PageContent>(fallbackPage, `page_${selectedSlug}`, versionKey)

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const activeRoute = isCustomPage
    ? `#/page/${cleanCustomSlug}`
    : BUILTIN_TABS.find((p) => p.slug === selectedSlug)?.route || '#/'
  const previewHref = isStandaloneAdmin
    ? `http://localhost:8443/${activeRoute}`
    : activeRoute

  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir
    if (target < 0 || target >= arr.length) return arr
    const next = [...arr]
    const [picked] = next.splice(idx, 1)
    next.splice(target, 0, picked)
    return next
  }

  const buildPagePayload = (): PageContent => {
    const next: PageContent = { ...page, slug: selectedSlug }
    if (isCustomPage) {
      next.isCustom = true
    } else {
      delete next.isCustom
    }
    return next
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft(`page_${selectedSlug}`, 'page', buildPagePayload(), 0)
      markClean()
      showToast(`Saved "${page.title.en || selectedSlug}" as draft.`)
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save page draft.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish(`page_${selectedSlug}`, 'page', buildPagePayload(), 0)
      markClean()
      showToast(`Published "${page.title.en || selectedSlug}" live at ${activeRoute}!`)
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish page.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (pageDoc?.status === 'draft_changes' || pageDoc?.status === 'draft_only') {
        markClean()
        await discardDraft(`page_${selectedSlug}`)
      } else {
        resetToRemote()
      }
      showToast('Reverted page to last published version.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard changes.', 'error')
    }
  }

  const handleCreateCustomPage = async (e: React.FormEvent) => {
    e.preventDefault()
    const clean = slugifySlug(newSlug || newTitle.en)
    if (!clean) {
      showToast('Please enter a page title or URL slug.', 'error')
      return
    }
    try {
      const createdFullSlug = await createCustomPage(newTitle, clean)
      setNewModalOpen(false)
      setNewTitle({ en: '', ne: '' })
      setNewSlug('')
      setSlugManuallyEdited(false)
      setSelectedSlug(createdFullSlug)
      showToast(
        `Created custom page "#/page/${clean}". Publish it when ready, and link to it from Header & Footer!`
      )
    } catch (err: unknown) {
      const er = err as { message?: string }
      showToast(er.message || 'Failed to create custom page.', 'error')
    }
  }

  const handleConfirmDeleteCustom = async () => {
    try {
      const removedLabel = page.title.en || cleanCustomSlug
      await deleteCustomPage(selectedSlug)
      setDeleteConfirmOpen(false)
      setSelectedSlug('about')
      showToast(`Deleted custom page "${removedLabel}".`, 'info')
    } catch (err: unknown) {
      const er = err as { message?: string }
      showToast(er.message || 'Failed to delete custom page.', 'error')
    }
  }

  const addSectionBlock = (kind: PageSectionKind = 'text') => {
    const base: PageSection = {
      kind,
      h: { en: '', ne: '' },
      p: { en: '', ne: '' },
    }
    if (kind === 'bullets') {
      base.items = [{ en: '', ne: '' }]
    } else if (kind === 'image') {
      base.imageUrl = ''
      base.imageCaption = { en: '', ne: '' }
    } else if (kind === 'video') {
      base.videoId = ''
      base.videoSeconds = 240
    } else if (kind === 'download') {
      base.format = 'pdf'
      base.linkUrl = ''
      base.linkLabel = { en: 'Download PDF', ne: 'पीडीएफ डाउनलोड गर्नुहोस्' }
    }
    updatePage((p) => ({
      ...p,
      sections: [...(p.sections || []), base],
    }))
  }

  const updateSectionAt = (idx: number, patch: Partial<PageSection>) => {
    updatePage((p) => ({
      ...p,
      sections: (p.sections || []).map((item, k) =>
        k === idx ? { ...item, ...patch } : item
      ),
    }))
  }

  const aboutData = page.aboutData || {}
  const aboutParagraphs: Bi[] = aboutData.paragraphs || []
  const aboutPillars: AboutPillar[] = aboutData.pillars || []
  const aboutStats = aboutData.stats || []
  const exploreData = page.exploreData || {}
  const sections: PageSection[] = page.sections || []

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      {/* Page Selector Pills + Create Custom Page */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-card p-2.5 shadow-soft">
        <div className="no-scrollbar flex flex-wrap gap-1.5 overflow-x-auto">
          {BUILTIN_TABS.map((tab) => {
            const docInfo = getPage(tab.slug)
            const active = selectedSlug === tab.slug
            const hasDraft =
              docInfo?.status === 'draft_changes' || docInfo?.status === 'draft_only'
            return (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setSelectedSlug(tab.slug)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${active
                  ? 'bg-primary-900 text-white shadow-soft'
                  : 'text-ink-2 hover:bg-subtle hover:text-ink'
                  }`}
              >
                <span>{tab.label}</span>
                {hasDraft && (
                  <span
                    className="size-2 rounded-full bg-accent-500"
                    title="Has unpublished draft"
                  />
                )}
              </button>
            )
          })}

          {customPages.map((cp) => {
            const active = selectedSlug === cp.id
            const clean = cp.id.replace(/^custom_/, '')
            const hasDraft =
              cp.status === 'draft_changes' || cp.status === 'draft_only'
            return (
              <button
                key={cp.id}
                type="button"
                onClick={() => setSelectedSlug(cp.id)}
                className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition ${active
                  ? 'border-primary-900 bg-primary-900 text-white shadow-soft'
                  : 'border-primary-700/20 bg-primary-100/50 text-brand hover:bg-primary-100'
                  }`}
              >
                <span>{cp.data.title.en || clean}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-[0.62rem] uppercase ${active ? 'bg-white/20 text-white' : 'bg-white text-ink-3'
                    }`}
                >
                  Custom
                </span>
                {hasDraft && (
                  <span
                    className="size-2 rounded-full bg-accent-500"
                    title="Has unpublished draft"
                  />
                )}
              </button>
            )
          })}
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-accent-500 px-4 text-xs font-extrabold text-primary-950 shadow-soft hover:bg-[#f09324]"
          >
            <PlusIcon size={14} />
            New Custom Page
          </button>
        )}
      </div>

      <EditorHeader
        eyebrow={`${isCustomPage ? 'Custom Public Page' : 'Public Page'} · ${activeRoute}`}
        title={
          page.title.en ||
          BUILTIN_TABS.find((t) => t.slug === selectedSlug)?.label ||
          cleanCustomSlug
        }
        description="Edit page headings, structured content blocks (text, callouts, bullet lists, images, YouTube videos, file downloads), and bilingual copy."
        status={pageDoc?.status || 'unpublished'}
        isDirty={isDirty}
        updatedAt={pageDoc?.updatedAt}
        updatedBy={pageDoc?.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        extraActions={
          <div className="flex items-center gap-2">
            {isCustomPage && isEditor && (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3.5 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <TrashIcon size={13} />
                Delete Page
              </button>
            )}
            <a
              href={previewHref}
              target={isStandaloneAdmin ? '_blank' : undefined}
              rel={isStandaloneAdmin ? 'noreferrer' : undefined}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
            >
              Open Page <ExternalIcon size={13} />
            </a>
          </div>
        }
      />

      {/* Page Main Title & Optional Subtitle */}
      {selectedSlug !== 'explore' && (
        <SectionCard
          eyebrow="Page Banner"
          title="Page Title, Subtitle & Breadcrumb"
          description={
            isCustomPage
              ? `Live route: ${activeRoute} — you can link to this route from Header & Footer navigation.`
              : undefined
          }
        >
          <div className="space-y-5">
            <BilingualField
              label="Page Heading"
              value={page.title}
              disabled={!isEditor}
              onChange={(title) => updatePage((p) => ({ ...p, title }))}
            />

            <BilingualField
              label="Hero Subtitle / Lead Line (Optional)"
              multiline
              rows={2}
              value={page.subtitle || { en: '', ne: '' }}
              disabled={!isEditor}
              onChange={(subtitle) => updatePage((p) => ({ ...p, subtitle }))}
            />
          </div>
        </SectionCard>
      )}

      {/* EXPLORE COURSES HEADER EDITOR */}
      {selectedSlug === 'explore' && (
        <SectionCard
          eyebrow="Explore Catalog (#/courses)"
          title="Explore Courses Banner Copy"
          description="Customizes the eyebrow, main heading, and introductory paragraph at the top of the Explore Courses catalog."
        >
          <div className="space-y-6">
            <BilingualField
              label="Eyebrow Label"
              value={exploreData.eyebrow || { en: '', ne: '' }}
              disabled={!isEditor}
              onChange={(eyebrow) =>
                updatePage((p) => ({
                  ...p,
                  exploreData: { ...(p.exploreData || {}), eyebrow },
                }))
              }
            />
            <BilingualField
              label="Catalog Main Heading"
              value={exploreData.heading || { en: '', ne: '' }}
              disabled={!isEditor}
              onChange={(heading) =>
                updatePage((p) => ({
                  ...p,
                  title: heading,
                  exploreData: { ...(p.exploreData || {}), heading },
                }))
              }
            />
            <BilingualField
              label="Catalog Intro Paragraph"
              multiline
              rows={3}
              value={exploreData.intro || { en: '', ne: '' }}
              disabled={!isEditor}
              onChange={(intro) =>
                updatePage((p) => ({
                  ...p,
                  exploreData: { ...(p.exploreData || {}), intro },
                }))
              }
            />
          </div>
        </SectionCard>
      )}

      {/* ABOUT PAGE DEDICATED STRUCTURED EDITOR */}
      {selectedSlug === 'about' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Mission & History"
            title="About Intro & Narrative Paragraphs"
            description="Left-column narrative on the About Heifer Academy page."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updatePage((p) => ({
                      ...p,
                      aboutData: {
                        ...(p.aboutData || {}),
                        paragraphs: [...aboutParagraphs, { en: '', ne: '' }],
                      },
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Paragraph
                </button>
              ) : undefined
            }
          >
            <div className="space-y-6">
              <BilingualField
                label="Eyebrow Label"
                value={aboutData.introEyebrow || { en: '', ne: '' }}
                disabled={!isEditor}
                onChange={(introEyebrow) =>
                  updatePage((p) => ({
                    ...p,
                    aboutData: { ...(p.aboutData || {}), introEyebrow },
                  }))
                }
              />

              <BilingualField
                label="Lead Statement (Large Text)"
                multiline
                rows={4}
                value={aboutData.introBody || { en: '', ne: '' }}
                disabled={!isEditor}
                onChange={(introBody) =>
                  updatePage((p) => ({
                    ...p,
                    aboutData: { ...(p.aboutData || {}), introBody },
                  }))
                }
              />

              {aboutParagraphs.map((para, idx) => (
                <div key={idx} className="rounded-xl border border-line bg-canvas p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand uppercase">
                      Body Paragraph #{idx + 1}
                    </span>
                    {isEditor && (
                      <button
                        type="button"
                        onClick={() =>
                          updatePage((p) => ({
                            ...p,
                            aboutData: {
                              ...(p.aboutData || {}),
                              paragraphs: aboutParagraphs.filter((_, k) => k !== idx),
                            },
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                  <BilingualField
                    multiline
                    rows={4}
                    compact
                    value={para}
                    disabled={!isEditor}
                    onChange={(val) =>
                      updatePage((p) => ({
                        ...p,
                        aboutData: {
                          ...(p.aboutData || {}),
                          paragraphs: aboutParagraphs.map((x, k) => (k === idx ? val : x)),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Right-Column Stat Grid"
            title="Platform Stat Cards"
            description="2x2 stat cards shown next to the About narrative. Each card can auto-calculate live course/lesson counts or display a custom value."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updatePage((p) => ({
                      ...p,
                      aboutData: {
                        ...(p.aboutData || {}),
                        stats: [
                          ...aboutStats,
                          {
                            v: { en: '7', ne: '७' },
                            l: { en: 'Stat label', ne: 'तथ्याङ्क' },
                            useLiveCount: 'none',
                          },
                        ],
                      },
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Stat Card
                </button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {aboutStats.map((st, idx) => (
                <div key={idx} className="space-y-4 rounded-xl border border-line bg-canvas p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-brand uppercase">
                      Stat Card #{idx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <select
                        disabled={!isEditor}
                        value={st.useLiveCount || 'none'}
                        onChange={(e) =>
                          updatePage((p) => ({
                            ...p,
                            aboutData: {
                              ...(p.aboutData || {}),
                              stats: aboutStats.map((item, k) =>
                                k === idx
                                  ? {
                                    ...item,
                                    useLiveCount: e.target.value as
                                      | 'courses'
                                      | 'lessons'
                                      | 'none',
                                  }
                                  : item
                              ),
                            },
                          }))
                        }
                        className="rounded-lg border border-line-strong bg-card px-2.5 py-1.5 text-xs font-semibold text-ink"
                      >
                        <option value="none">Custom Number / Text</option>
                        <option value="courses">Auto: Live Course Count</option>
                        <option value="lessons">Auto: Live Video Lesson Count</option>
                      </select>

                      {isEditor && (
                        <button
                          type="button"
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              aboutData: {
                                ...(p.aboutData || {}),
                                stats: aboutStats.filter((_, k) => k !== idx),
                              },
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {(!st.useLiveCount || st.useLiveCount === 'none') && (
                    <BilingualField
                      label="Displayed Value"
                      value={st.v}
                      disabled={!isEditor}
                      onChange={(v) =>
                        updatePage((p) => ({
                          ...p,
                          aboutData: {
                            ...(p.aboutData || {}),
                            stats: aboutStats.map((item, k) =>
                              k === idx ? { ...item, v } : item
                            ),
                          },
                        }))
                      }
                    />
                  )}

                  <BilingualField
                    label="Card Label"
                    value={st.l}
                    disabled={!isEditor}
                    onChange={(l) =>
                      updatePage((p) => ({
                        ...p,
                        aboutData: {
                          ...(p.aboutData || {}),
                          stats: aboutStats.map((item, k) =>
                            k === idx ? { ...item, l } : item
                          ),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Four Core Principles"
            title={`About Page Feature Pillars (${aboutPillars.length})`}
            description="Four cards displayed across the bottom of the About page."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updatePage((p) => ({
                      ...p,
                      aboutData: {
                        ...(p.aboutData || {}),
                        pillars: [
                          ...aboutPillars,
                          { icon: 'sprout', t: { en: '', ne: '' }, d: { en: '', ne: '' } },
                        ],
                      },
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Pillar
                </button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {aboutPillars.map((pillar, idx) => (
                <div key={idx} className="space-y-4 rounded-xl border border-line bg-canvas p-5">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="text-xs font-bold text-brand uppercase">
                      Pillar #{idx + 1}
                    </span>
                    {isEditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              aboutData: {
                                ...(p.aboutData || {}),
                                pillars: moveItem(aboutPillars, idx, -1),
                              },
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === aboutPillars.length - 1}
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              aboutData: {
                                ...(p.aboutData || {}),
                                pillars: moveItem(aboutPillars, idx, 1),
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
                            updatePage((p) => ({
                              ...p,
                              aboutData: {
                                ...(p.aboutData || {}),
                                pillars: aboutPillars.filter((_, k) => k !== idx),
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

                  <PillarIconPicker
                    value={pillar.icon}
                    disabled={!isEditor}
                    onChange={(icon) =>
                      updatePage((p) => ({
                        ...p,
                        aboutData: {
                          ...(p.aboutData || {}),
                          pillars: aboutPillars.map((item, k) =>
                            k === idx ? { ...item, icon } : item
                          ),
                        },
                      }))
                    }
                  />

                  <BilingualField
                    label="Card Title"
                    value={pillar.t}
                    disabled={!isEditor}
                    onChange={(t) =>
                      updatePage((p) => ({
                        ...p,
                        aboutData: {
                          ...(p.aboutData || {}),
                          pillars: aboutPillars.map((item, k) =>
                            k === idx ? { ...item, t } : item
                          ),
                        },
                      }))
                    }
                  />

                  <BilingualField
                    label="Card Description"
                    multiline
                    rows={2}
                    value={pillar.d}
                    disabled={!isEditor}
                    onChange={(d) =>
                      updatePage((p) => ({
                        ...p,
                        aboutData: {
                          ...(p.aboutData || {}),
                          pillars: aboutPillars.map((item, k) =>
                            k === idx ? { ...item, d } : item
                          ),
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* RICH CONTENT SECTIONS (Custom Pages, Legal Pages & Optional Extra Sections on About) */}
      {selectedSlug !== 'explore' && (
        <SectionCard
          eyebrow={
            selectedSlug === 'about'
              ? 'Optional Rich Content Blocks Below Pillars'
              : 'Rich Content Blocks'
          }
          title={
            selectedSlug === 'about'
              ? `Extra Blocks Below Pillars (${sections.length})`
              : `Page Content Blocks (${sections.length})`
          }
          description="Compose sections with headings, paragraphs, highlighted callout boxes, checkmark bullet lists, images, YouTube videos, or downloadable PDF cards."
          actions={
            isEditor ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => addSectionBlock('text')}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-3.5 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={13} />
                  Text
                </button>
                <button
                  type="button"
                  onClick={() => addSectionBlock('callout')}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                >
                  + Callout
                </button>
                <button
                  type="button"
                  onClick={() => addSectionBlock('bullets')}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                >
                  + Bullets
                </button>
                <button
                  type="button"
                  onClick={() => addSectionBlock('image')}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                >
                  + Image
                </button>
                <button
                  type="button"
                  onClick={() => addSectionBlock('video')}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                >
                  + Video
                </button>
                <button
                  type="button"
                  onClick={() => addSectionBlock('download')}
                  className="inline-flex h-9 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                >
                  + File Card
                </button>
              </div>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {sections.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-3">
                No content blocks added yet. Use the buttons above to add text, callouts, bullet lists, images, videos, or downloadable files.
              </p>
            )}

            {sections.map((sec, idx) => {
              const kind: PageSectionKind = sec.kind || 'text'
              return (
                <div
                  key={idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-brand">
                        {idx + 1}
                      </span>
                      <select
                        disabled={!isEditor}
                        value={kind}
                        onChange={(e) =>
                          updateSectionAt(idx, {
                            kind: e.target.value as PageSectionKind,
                          })
                        }
                        className="rounded-lg border border-line-strong bg-card px-2.5 py-1 text-xs font-bold text-brand focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      >
                        {SECTION_KINDS.map((sk) => (
                          <option key={sk.id} value={sk.id}>
                            {sk.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-semibold text-ink-2">
                        {sec.h.en || `Block #${idx + 1}`}
                      </span>
                    </div>

                    {isEditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              sections: moveItem(sections, idx, -1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === sections.length - 1}
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              sections: moveItem(sections, idx, 1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updatePage((p) => ({
                              ...p,
                              sections: sections.filter((_, k) => k !== idx),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <BilingualField
                    label="Block Heading"
                    value={sec.h}
                    disabled={!isEditor}
                    onChange={(h) => updateSectionAt(idx, { h })}
                  />

                  <BilingualField
                    label={kind === 'callout' ? 'Callout Message' : 'Body / Supporting Text'}
                    multiline
                    rows={kind === 'text' || kind === 'callout' ? 4 : 2}
                    value={sec.p}
                    disabled={!isEditor}
                    onChange={(body) => updateSectionAt(idx, { p: body })}
                  />

                  {/* BULLETS EXTRA FIELDS */}
                  {kind === 'bullets' && (
                    <div className="space-y-3 rounded-xl border border-line bg-card p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wider text-ink uppercase">
                          Bullet Points ({sec.items?.length || 0})
                        </span>
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionAt(idx, {
                                items: [...(sec.items || []), { en: '', ne: '' }],
                              })
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-full bg-primary-100 px-3 text-xs font-bold text-brand hover:bg-primary-100/70"
                          >
                            <PlusIcon size={12} />
                            Add Bullet
                          </button>
                        )}
                      </div>

                      {(sec.items || []).map((bItem, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <div className="flex-1">
                            <BilingualField
                              compact
                              value={bItem}
                              disabled={!isEditor}
                              onChange={(val) =>
                                updateSectionAt(idx, {
                                  items: (sec.items || []).map((x, k) =>
                                    k === bIdx ? val : x
                                  ),
                                })
                              }
                            />
                          </div>
                          {isEditor && (
                            <button
                              type="button"
                              onClick={() =>
                                updateSectionAt(idx, {
                                  items: (sec.items || []).filter((_, k) => k !== bIdx),
                                })
                              }
                              className="mt-6 rounded-lg border border-line p-2 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <TrashIcon size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* IMAGE EXTRA FIELDS */}
                  {kind === 'image' && (
                    <div className="space-y-4 rounded-xl border border-line bg-card p-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_14rem] md:items-start">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                            Image URL
                          </label>
                          <input
                            type="url"
                            disabled={!isEditor}
                            value={sec.imageUrl || ''}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) =>
                              updateSectionAt(idx, { imageUrl: e.target.value })
                            }
                            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          />
                        </div>
                        {sec.imageUrl && (
                          <img
                            src={sec.imageUrl}
                            alt=""
                            className="aspect-video w-full rounded-lg border border-line object-cover"
                          />
                        )}
                      </div>

                      <BilingualField
                        label="Image Caption (Optional)"
                        value={sec.imageCaption || { en: '', ne: '' }}
                        disabled={!isEditor}
                        onChange={(imageCaption) =>
                          updateSectionAt(idx, { imageCaption })
                        }
                      />
                    </div>
                  )}

                  {/* VIDEO EXTRA FIELDS */}
                  {kind === 'video' && (
                    <div className="rounded-xl border border-line bg-card p-4">
                      <YouTubeField
                        videoId={sec.videoId || ''}
                        seconds={sec.videoSeconds ?? 240}
                        disabled={!isEditor}
                        onChangeVideoId={(videoId) =>
                          updateSectionAt(idx, { videoId })
                        }
                        onChangeSeconds={(videoSeconds) =>
                          updateSectionAt(idx, { videoSeconds })
                        }
                      />
                    </div>
                  )}

                  {/* DOWNLOAD EXTRA FIELDS */}
                  {kind === 'download' && (
                    <div className="space-y-4 rounded-xl border border-line bg-card p-4">
                      <div className="grid gap-4 md:grid-cols-[13rem_1fr]">
                        <div>
                          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                            Material Format
                          </label>
                          <select
                            disabled={!isEditor}
                            value={sec.format || 'pdf'}
                            onChange={(e) =>
                              updateSectionAt(idx, {
                                format: e.target.value as MaterialFormat,
                              })
                            }
                            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          >
                            {MATERIAL_FORMATS.map((fmt) => (
                              <option key={fmt.id} value={fmt.id}>
                                {fmt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                            File / Resource URL
                          </label>
                          <input
                            type="url"
                            disabled={!isEditor}
                            value={sec.linkUrl || ''}
                            placeholder="https://drive.google.com/... or https://...pdf"
                            onChange={(e) =>
                              updateSectionAt(idx, { linkUrl: e.target.value })
                            }
                            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                          />
                        </div>
                      </div>

                      <BilingualField
                        label="Download Button Label"
                        value={sec.linkLabel || { en: '', ne: '' }}
                        disabled={!isEditor}
                        placeholderEn="e.g. Open Field Guide (PDF)"
                        placeholderNe="फिल्ड गाइड खोल्नुहोस् (पीडीएफ)"
                        onChange={(linkLabel) =>
                          updateSectionAt(idx, { linkLabel })
                        }
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </SectionCard>
      )}

      {/* Status Footer Summary */}
      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-3.5 text-xs text-ink-2">
        <span>
          Active document ID: <code>page_{selectedSlug}</code> &middot; Public URL:{' '}
          <code>{activeRoute}</code>
        </span>
        <StatusBadge status={pageDoc?.status || 'unpublished'} isDirty={isDirty} />
      </div>

      {/* Create New Custom Page Modal */}
      {newModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-xs"
        >
          <form
            onSubmit={handleCreateCustomPage}
            className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-modal"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <p className="text-[0.68rem] font-bold tracking-[0.14em] text-ochre uppercase">
                  Custom Website Page
                </p>
                <h3 className="text-lg font-bold text-ink">Create New Public Page</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-3 hover:bg-subtle hover:text-ink"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <BilingualField
                label="Page Title"
                value={newTitle}
                placeholderEn="e.g. Facilitator Training Manual"
                placeholderNe="सहजकर्ता तालिम पुस्तिका"
                onChange={(val) => {
                  setNewTitle(val)
                  if (!slugManuallyEdited) {
                    setNewSlug(slugifySlug(val.en))
                  }
                }}
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={newSlug}
                  placeholder="facilitator-training-manual"
                  onChange={(e) => {
                    setSlugManuallyEdited(true)
                    setNewSlug(slugifySlug(e.target.value))
                  }}
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none"
                />
                <p className="mt-1 text-xs text-ink-3">
                  Public website route:{' '}
                  <code>#/page/{newSlug || slugifySlug(newTitle.en) || '...'}</code>
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="h-10 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink-2 hover:bg-subtle hover:text-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft hover:bg-primary-700 disabled:opacity-50"
              >
                Create Page Draft
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={deleteConfirmOpen}
        title="Delete Custom Page?"
        message={`Are you sure you want to permanently delete "${page.title.en || cleanCustomSlug}" from both Drafts and the Live Website?`}
        confirmLabel="Delete Page"
        tone="danger"
        onConfirm={handleConfirmDeleteCustom}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}
