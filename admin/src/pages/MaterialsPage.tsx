import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type {
  MaterialFormat,
  PageContent,
  ResourceItem,
  ResourcesPageData,
} from '@shared/schema'
import { defaultResourcesData } from '@siteData'
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
  SearchIcon,
  TrashIcon,
} from '../components/icons'

export const MATERIAL_FORMATS: { id: MaterialFormat; label: string }[] = [
  { id: 'guide', label: 'Field Guide' },
  { id: 'pdf', label: 'PDF Handout' },
  { id: 'poster', label: 'Visual Poster' },
  { id: 'toolkit', label: 'Facilitator Toolkit' },
  { id: 'worksheet', label: 'Worksheet / Ledger' },
  { id: 'audio', label: 'Audio / Radio Episode' },
  { id: 'video', label: 'Video Resource' },
  { id: 'article', label: 'Reading / Reference' },
]

function makeResId(): string {
  return `res_${Math.random().toString(36).slice(2, 8)}`
}

export function MaterialsPage() {
  const {
    getResourcesPage,
    getCategories,
    getCourses,
    saveDraft,
    saveAndPublish,
    discardDraft,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [subTab, setSubTab] = useState<'items' | 'banner'>('items')
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')

  const resDoc = getResourcesPage()
  const categories = getCategories().data.filter((c) => c.id !== 'all')
  const courses = getCourses()

  const initialRes: ResourcesPageData = resDoc.data.resourcesData || defaultResourcesData
  const versionKey = `${resDoc.updatedAt}:${resDoc.status}`

  const [resData, updateResData, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<ResourcesPageData>(initialRes, 'page_resources', versionKey)

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const publicBase = isStandaloneAdmin ? 'http://localhost:8443/' : ''
  const resourcesHref = `${publicBase}#/resources`

  const buildPayload = (): PageContent => {
    const orderedItems = (resData.items || []).map((item, idx) => ({
      ...item,
      order: idx,
    }))
    return {
      slug: 'resources',
      title: resData.heading || resDoc.data.title || {
        en: 'Learning Materials & Field Guides',
        ne: 'सिकाइ सामग्री तथा फिल्ड गाइडहरू',
      },
      resourcesData: {
        ...resData,
        items: orderedItems,
      },
    }
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft('page_resources', 'page', buildPayload(), 0)
      markClean()
      showToast('Learning materials catalog saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save draft.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish('page_resources', 'page', buildPayload(), 0)
      markClean()
      showToast('Learning materials published live! Now synced on #/resources, Homepage, and linked courses.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish materials.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (resDoc.status === 'draft_changes' || resDoc.status === 'draft_only') {
        markClean()
        await discardDraft('page_resources')
      } else {
        resetToRemote()
      }
      showToast('Reverted materials catalog to last published version.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard draft.', 'error')
    }
  }

  const addMaterial = () => {
    const defaultCat = categories[0]?.id || 'livestock'
    const newItem: ResourceItem = {
      id: makeResId(),
      title: { en: 'New Field Guide', ne: 'नयाँ फिल्ड गाइड' },
      description: { en: '', ne: '' },
      format: 'guide',
      category: defaultCat,
      url: '',
      meta: { en: 'Printable Guide · EN / NE', ne: 'प्रिन्ट योग्य गाइड · द्विभाषिक' },
      body: { en: '', ne: '' },
      keyPoints: [{ en: '', ne: '' }],
      facilitatorTip: { en: '', ne: '' },
      courseId: '',
      featuredOnHome: true,
      order: (resData.items || []).length,
    }
    updateResData((prev) => ({
      ...prev,
      items: [newItem, ...(prev.items || [])],
    }))
    setSubTab('items')
    setSearch('')
    setFilterCat('all')
  }

  const updateItem = (id: string, patch: Partial<ResourceItem>) => {
    updateResData((prev) => ({
      ...prev,
      items: (prev.items || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }

  const moveItemById = (id: string, dir: -1 | 1) => {
    updateResData((prev) => {
      const arr = [...(prev.items || [])]
      const idx = arr.findIndex((x) => x.id === id)
      const target = idx + dir
      if (idx < 0 || target < 0 || target >= arr.length) return prev
      const [picked] = arr.splice(idx, 1)
      arr.splice(target, 0, picked)
      return { ...prev, items: arr }
    })
  }

  const removeItemById = (id: string) => {
    updateResData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((x) => x.id !== id),
    }))
  }

  const items = resData.items || []
  const filteredItems = items.filter((it) => {
    if (filterCat !== 'all' && it.category !== filterCat) return false
    if (!search.trim()) return true
    const q = search.trim().toLowerCase()
    return (
      it.title.en.toLowerCase().includes(q) ||
      it.title.ne.toLowerCase().includes(q) ||
      it.description.en.toLowerCase().includes(q) ||
      it.format.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <EditorHeader
        eyebrow="Field Guides, Posters & Toolkits"
        title="Learning Materials & Handouts"
        description="Manage downloadable PDFs, illustrated field posters, facilitator toolkits, worksheets, and audio guides displayed on #/resources, the Homepage spotlight, and linked Course pages."
        status={resDoc.status}
        isDirty={isDirty}
        updatedAt={resDoc.updatedAt}
        updatedBy={resDoc.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        extraActions={
          <a
            href={resourcesHref}
            target={isStandaloneAdmin ? '_blank' : undefined}
            rel={isStandaloneAdmin ? 'noopener noreferrer' : undefined}
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
          >
            Open #/resources <ExternalIcon size={13} />
          </a>
        }
      />

      {/* Sub-tabs + Add Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-2.5 shadow-soft">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setSubTab('items')}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
              subTab === 'items'
                ? 'bg-primary-900 text-white shadow-soft'
                : 'text-ink-2 hover:bg-subtle hover:text-ink'
            }`}
          >
            <span>Materials Library</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.68rem] ${
                subTab === 'items' ? 'bg-white/20 text-white' : 'bg-subtle text-ink-2'
              }`}
            >
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('banner')}
            className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
              subTab === 'banner'
                ? 'bg-primary-900 text-white shadow-soft'
                : 'text-ink-2 hover:bg-subtle hover:text-ink'
            }`}
          >
            Catalog Header &amp; Homepage Spotlight
          </button>
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={addMaterial}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent-500 px-4 text-xs font-extrabold text-primary-950 shadow-soft hover:bg-[#f09324]"
          >
            <PlusIcon size={15} />
            Add Learning Material
          </button>
        )}
      </div>

      {/* SUB-TAB 1: MATERIALS LIST */}
      {subTab === 'items' && (
        <div className="space-y-5">
          {/* Search & Topic Filter */}
          <div className="grid gap-3 rounded-2xl border border-line bg-card p-4 shadow-soft sm:grid-cols-[1fr_14rem]">
            <div className="relative">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search field guides, posters, worksheets..."
                className="w-full rounded-xl border border-line-strong bg-canvas py-2.5 pr-3.5 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:outline-none"
              />
            </div>

            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="rounded-xl border border-line-strong bg-canvas px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none"
            >
              <option value="all">All Categories ({items.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label.en}
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-2xl border border-line bg-card p-10 text-center shadow-soft">
              <p className="text-sm font-semibold text-ink-2">
                No learning materials match your filter.
              </p>
              {isEditor && (
                <button
                  type="button"
                  onClick={addMaterial}
                  className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Create First Material
                </button>
              )}
            </div>
          )}

          {filteredItems.map((item) => {
            const globalIdx = items.findIndex((x) => x.id === item.id)
            return (
              <SectionCard
                key={item.id}
                eyebrow={`${item.format.toUpperCase()} · #${globalIdx + 1}`}
                title={item.title.en || 'Untitled Material'}
                actions={
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`${publicBase}#/material/${encodeURIComponent(item.id)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-brand hover:border-primary-700"
                    >
                      Preview <ExternalIcon size={12} />
                    </a>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-semibold text-ink">
                      <input
                        type="checkbox"
                        disabled={!isEditor}
                        checked={Boolean(item.featuredOnHome)}
                        onChange={(e) =>
                          updateItem(item.id, { featuredOnHome: e.target.checked })
                        }
                        className="size-3.5 accent-primary-900"
                      />
                      Spotlight on Homepage
                    </label>

                    {isEditor && (
                      <>
                        <button
                          type="button"
                          disabled={globalIdx <= 0}
                          onClick={() => moveItemById(item.id, -1)}
                          title="Move up"
                          className="rounded-lg border border-line bg-card p-2 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={globalIdx === items.length - 1}
                          onClick={() => moveItemById(item.id, 1)}
                          title="Move down"
                          className="rounded-lg border border-line bg-card p-2 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItemById(item.id)}
                          title="Delete material"
                          className="rounded-lg border border-line bg-card p-2 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </>
                    )}
                  </div>
                }
              >
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Material Format
                      </label>
                      <select
                        disabled={!isEditor}
                        value={item.format}
                        onChange={(e) =>
                          updateItem(item.id, { format: e.target.value as MaterialFormat })
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
                        Topic Category
                      </label>
                      <select
                        disabled={!isEditor}
                        value={item.category}
                        onChange={(e) => updateItem(item.id, { category: e.target.value })}
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label.en} ({cat.label.ne})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Attach to Course (Optional)
                      </label>
                      <select
                        disabled={!isEditor}
                        value={item.courseId || ''}
                        onChange={(e) =>
                          updateItem(item.id, { courseId: e.target.value || '' })
                        }
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      >
                        <option value="">General Library Only (No specific course)</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.data.title.en}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <BilingualField
                    label="Material Title"
                    value={item.title}
                    disabled={!isEditor}
                    placeholderEn="e.g. Improved Goat Shed Construction Manual"
                    placeholderNe="उन्नत बाख्रा खोर निर्माण पुस्तिका"
                    onChange={(title) => updateItem(item.id, { title })}
                  />

                  <BilingualField
                    label="Summary / Description"
                    multiline
                    rows={2}
                    value={item.description}
                    disabled={!isEditor}
                    onChange={(description) => updateItem(item.id, { description })}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        External File / Download URL (Optional)
                      </label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={item.url}
                        placeholder="https://drive.google.com/... or https://...pdf (optional)"
                        onChange={(e) => updateItem(item.id, { url: e.target.value })}
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      />
                      <p className="mt-1 text-xs text-ink-3">
                        Every material opens its printable bilingual page at <code>#/material/{item.id}</code>. Add an optional PDF or Drive link for external download.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Cover Thumbnail Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        disabled={!isEditor}
                        value={item.image || ''}
                        placeholder="https://images.unsplash.com/..."
                        onChange={(e) => updateItem(item.id, { image: e.target.value })}
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                      />
                    </div>
                  </div>

                  <BilingualField
                    label="File Metadata Badge (Optional)"
                    hint="Short info such as page count, file size, or print size"
                    value={item.meta || { en: '', ne: '' }}
                    disabled={!isEditor}
                    placeholderEn="e.g. 16 pages · Printable A4 PDF"
                    placeholderNe="१६ पृष्ठ · प्रिन्ट योग्य पीडीएफ"
                    onChange={(meta) => updateItem(item.id, { meta })}
                  />

                  <details className="group rounded-xl border border-line bg-canvas p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold tracking-wider text-brand uppercase">
                      <span>
                        On-Platform Guide Content &amp; Checklist (#/material/{item.id})
                      </span>
                      <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[0.7rem] font-semibold text-brand">
                        {(item.keyPoints?.length || 0)} steps
                      </span>
                    </summary>

                    <div className="mt-4 space-y-5 border-t border-line pt-4">
                      <BilingualField
                        label="Full Printable Guide Text"
                        hint="Displayed on the dedicated material reader page and included when printing / saving as PDF"
                        multiline
                        rows={4}
                        value={item.body || { en: '', ne: '' }}
                        disabled={!isEditor}
                        onChange={(body) => updateItem(item.id, { body })}
                      />

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-bold tracking-wide text-ink uppercase">
                            Key Steps / Interactive Field Checklist ({item.keyPoints?.length || 0})
                          </label>
                          {isEditor && (
                            <button
                              type="button"
                              onClick={() =>
                                updateItem(item.id, {
                                  keyPoints: [...(item.keyPoints || []), { en: '', ne: '' }],
                                })
                              }
                              className="inline-flex h-8 items-center gap-1 rounded-full border border-primary-700/30 bg-primary-100 px-3 text-xs font-bold text-brand hover:bg-primary-100/80"
                            >
                              <PlusIcon size={13} /> Add Step
                            </button>
                          )}
                        </div>

                        {(item.keyPoints || []).map((pt, pIdx) => (
                          <div
                            key={pIdx}
                            className="space-y-2 rounded-xl border border-line bg-card p-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-ink-2">
                                Step #{pIdx + 1}
                              </span>
                              {isEditor && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateItem(item.id, {
                                      keyPoints: (item.keyPoints || []).filter(
                                        (_, k) => k !== pIdx
                                      ),
                                    })
                                  }
                                  className="rounded-md p-1 text-ink-3 hover:bg-red-50 hover:text-red-700"
                                  title="Remove step"
                                >
                                  <TrashIcon size={13} />
                                </button>
                              )}
                            </div>
                            <BilingualField
                              value={pt}
                              compact
                              disabled={!isEditor}
                              onChange={(val) =>
                                updateItem(item.id, {
                                  keyPoints: (item.keyPoints || []).map((x, k) =>
                                    k === pIdx ? val : x
                                  ),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <BilingualField
                        label="Facilitator Tip Callout (Optional)"
                        multiline
                        rows={2}
                        value={item.facilitatorTip || { en: '', ne: '' }}
                        disabled={!isEditor}
                        onChange={(facilitatorTip) =>
                          updateItem(item.id, { facilitatorTip })
                        }
                      />
                    </div>
                  </details>
                </div>
              </SectionCard>
            )
          })}
        </div>
      )}

      {/* SUB-TAB 2: CATALOG HEADER & HOMEPAGE SPOTLIGHT */}
      {subTab === 'banner' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Public Catalog (#/resources)"
            title="Materials Page Hero Banner"
            description="Controls the eyebrow, main title, and introductory description at the top of the public Learning Materials page."
          >
            <div className="space-y-5">
              <BilingualField
                label="Eyebrow Label"
                value={resData.eyebrow}
                disabled={!isEditor}
                onChange={(eyebrow) => updateResData((p) => ({ ...p, eyebrow }))}
              />
              <BilingualField
                label="Page Main Heading"
                value={resData.heading}
                disabled={!isEditor}
                onChange={(heading) => updateResData((p) => ({ ...p, heading }))}
              />
              <BilingualField
                label="Introductory Paragraph"
                multiline
                rows={3}
                value={resData.intro}
                disabled={!isEditor}
                onChange={(intro) => updateResData((p) => ({ ...p, intro }))}
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Homepage Spotlight Section"
            title="Featured Field Guides on Homepage"
            description="Controls whether featured materials are highlighted on the main Homepage below the Course Carousel."
          >
            <div className="space-y-5">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-canvas p-4">
                <input
                  type="checkbox"
                  disabled={!isEditor}
                  checked={resData.showOnHome !== false}
                  onChange={(e) =>
                    updateResData((p) => ({ ...p, showOnHome: e.target.checked }))
                  }
                  className="size-4 rounded border-line-strong accent-primary-900"
                />
                <span className="text-sm font-bold text-ink">
                  Show &ldquo;Field Guides &amp; Learning Materials&rdquo; Section on Homepage
                </span>
              </label>

              {resData.showOnHome !== false && (
                <>
                  <BilingualField
                    label="Homepage Section Eyebrow"
                    value={resData.homeEyebrow || { en: '', ne: '' }}
                    disabled={!isEditor}
                    onChange={(homeEyebrow) =>
                      updateResData((p) => ({ ...p, homeEyebrow }))
                    }
                  />
                  <BilingualField
                    label="Homepage Section Heading"
                    value={resData.homeHeading || { en: '', ne: '' }}
                    disabled={!isEditor}
                    onChange={(homeHeading) =>
                      updateResData((p) => ({ ...p, homeHeading }))
                    }
                  />
                </>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-5 py-3.5 text-xs text-ink-2">
        <span>
          Active document ID: <code>page_resources</code> &middot; Note: Course-specific handouts added inside individual Courses also appear automatically on <code>#/resources</code>.
        </span>
        <StatusBadge status={resDoc.status} isDirty={isDirty} />
      </div>
    </div>
  )
}

