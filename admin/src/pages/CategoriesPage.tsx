import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type { Category } from '@shared/schema'
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
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons'

function slugifyId(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function CategoriesPage() {
  const {
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

  const catDoc = getCategories()
  const courses = getCourses()
  const versionKey = `${catDoc.updatedAt}:${catDoc.status}`

  const [list, updateList, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<Category[]>(catDoc.data, 'categories', versionKey)

  const [newSlug, setNewSlug] = useState('')
  const [newLabelEn, setNewLabelEn] = useState('')
  const [newLabelNe, setNewLabelNe] = useState('')
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null)

  const normalizeOrdered = (items: Category[]) =>
    items.map((c, idx) => ({ ...c, order: idx }))

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    const id = slugifyId(newSlug || newLabelEn)
    if (!id) {
      showToast('Please enter a category name or ID.', 'error')
      return
    }
    if (list.some((c) => c.id === id)) {
      showToast(`Category ID "${id}" already exists.`, 'error')
      return
    }
    const nextItem: Category = {
      id,
      label: {
        en: newLabelEn.trim() || id,
        ne: newLabelNe.trim() || newLabelEn.trim() || id,
      },
      order: list.length,
    }
    updateList((prev) => normalizeOrdered([...prev, nextItem]))
    setNewSlug('')
    setNewLabelEn('')
    setNewLabelNe('')
    showToast(`Added category "${nextItem.label.en}". Click Publish Live to apply on website.`, 'info')
  }

  const moveCategory = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= list.length) return
    if (list[idx]?.id === 'all' || list[target]?.id === 'all') return
    updateList((prev) => {
      const next = [...prev]
      const [moved] = next.splice(idx, 1)
      next.splice(target, 0, moved)
      return normalizeOrdered(next)
    })
  }

  const handleSaveDraft = async () => {
    try {
      await saveDraft('categories', 'category', normalizeOrdered(list), 0)
      markClean()
      showToast('Categories saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save categories.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish('categories', 'category', normalizeOrdered(list), 0)
      markClean()
      showToast('Categories published live to the website.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish categories.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (catDoc.status === 'draft_changes' || catDoc.status === 'draft_only') {
        markClean()
        await discardDraft('categories')
      } else {
        resetToRemote()
      }
      showToast('Reverted categories to last published state.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard changes.', 'error')
    }
  }

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <ConfirmModal
        open={deleteIdx !== null}
        title="Remove Topic Category?"
        message={`Remove "${deleteIdx !== null ? list[deleteIdx]?.label.en : ''}" from the category filter tabs? Existing courses using this category can be reassigned in the Course Editor.`}
        confirmLabel="Remove Category"
        tone="danger"
        onConfirm={() => {
          if (deleteIdx !== null) {
            updateList((prev) => normalizeOrdered(prev.filter((_, i) => i !== deleteIdx)))
          }
          setDeleteIdx(null)
        }}
        onCancel={() => setDeleteIdx(null)}
      />

      <EditorHeader
        eyebrow="Learning Catalog"
        title="Course Topic Categories"
        description="Manage the bilingual filter tabs shown on the Homepage course carousel and the Explore Courses catalog."
        status={catDoc.status}
        isDirty={isDirty}
        updatedAt={catDoc.updatedAt}
        updatedBy={catDoc.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />

      {/* Inline Add New Category Card */}
      {isEditor && (
        <SectionCard
          eyebrow="New Topic Filter"
          title="Add a Topic Category"
          description="Create a new bilingual topic filter pill for organizing courses."
        >
          <form onSubmit={handleAddCategory} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                English Label
              </label>
              <input
                type="text"
                required
                value={newLabelEn}
                onChange={(e) => setNewLabelEn(e.target.value)}
                placeholder="e.g. Poultry & Nutrition"
                className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                नेपाली Label
              </label>
              <input
                type="text"
                required
                value={newLabelNe}
                onChange={(e) => setNewLabelNe(e.target.value)}
                placeholder="कुखुरा पालन तथा पोषण"
                className="ne-font w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                Slug ID (Optional)
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(slugifyId(e.target.value))}
                placeholder={slugifyId(newLabelEn) || 'auto-generated'}
                className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10.5 items-center justify-center gap-1.5 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft hover:bg-primary-700"
            >
              <PlusIcon size={15} />
              Add Category
            </button>
          </form>
        </SectionCard>
      )}

      {/* Existing Categories */}
      <SectionCard
        eyebrow="Active Filter Tabs"
        title={`Categories (${list.length})`}
        description="The 'all' tab always stays first as the default 'All Courses' filter, while its English and Nepali labels remain editable."
      >
        <div className="space-y-4">
          {list.map((cat, idx) => {
            const isAll = cat.id === 'all'
            const usedCount = isAll
              ? courses.length
              : courses.filter((c) => c.data.category === cat.id).length

            return (
              <div
                key={cat.id}
                className="rounded-xl border border-line bg-canvas p-4 sm:p-5"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-primary-100 px-2.5 py-1 font-mono text-xs font-bold text-brand">
                      id: {cat.id}
                    </span>
                    <span className="text-xs font-medium text-ink-2">
                      {usedCount} {usedCount === 1 ? 'course' : 'courses'}
                    </span>
                    {isAll && (
                      <span className="rounded-full bg-subtle px-2.5 py-0.5 text-[0.68rem] font-bold text-ink-2 uppercase">
                        Default Tab
                      </span>
                    )}
                  </div>

                  {isEditor && !isAll && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx <= 1}
                        onClick={() => moveCategory(idx, -1)}
                        title="Move up"
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUpIcon size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === list.length - 1}
                        onClick={() => moveCategory(idx, 1)}
                        title="Move down"
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDownIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteIdx(idx)}
                        title="Delete category"
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <TrashIcon size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <BilingualField
                  value={cat.label}
                  disabled={!isEditor}
                  compact
                  onChange={(label) =>
                    updateList((prev) =>
                      prev.map((item, k) => (k === idx ? { ...item, label } : item))
                    )
                  }
                />
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
