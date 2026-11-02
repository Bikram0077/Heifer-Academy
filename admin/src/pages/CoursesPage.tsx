import { useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type { AdminTab } from '../components/AdminLayout'
import {
  ConfirmModal,
  StatusBadge,
  ToastBanner,
  formatSeconds,
  useToast,
} from '../components/CmsUi'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  CoursesIcon,
  EditIcon,
  ExternalIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UndoIcon,
  UploadIcon,
} from '../components/icons'

export function CoursesPage({
  onNavigate,
}: {
  onNavigate: (tab: AdminTab, courseId?: string) => void
}) {
  const {
    getCourses,
    getCategories,
    getResourcesPage,
    publishDoc,
    unpublishDoc,
    discardDraft,
    deleteItem,
    reorderCourses,
    duplicateCourse,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deleteTarget, setDeleteTarget] = useState<{ docId: string; title: string } | null>(null)

  const courses = getCourses()
  const categories = getCategories().data
  const resourceItems = getResourcesPage().data.resourcesData?.items || []

  const isFiltered =
    search.trim() !== '' || catFilter !== 'all' || statusFilter !== 'all'

  const filtered = courses.filter((c) => {
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      c.data.title.en.toLowerCase().includes(q) ||
      c.data.title.ne.includes(q) ||
      c.id.toLowerCase().includes(q)
    const matchesCat = catFilter === 'all' || c.data.category === catFilter
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'published'
          ? c.status === 'published'
          : c.status !== 'published'
    return matchesSearch && matchesCat && matchesStatus
  })

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const coursePublicHref = (id: string) =>
    isStandaloneAdmin ? `http://localhost:8443/#/course/${id}` : `#/course/${id}`

  const handleMove = async (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= courses.length) return
    const ids = courses.map((c) => c.id)
    const [moved] = ids.splice(index, 1)
    ids.splice(target, 0, moved)
    try {
      await reorderCourses(ids)
      showToast('Course display order updated.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to reorder courses.', 'error')
    }
  }

  const handleDuplicate = async (courseId: string) => {
    try {
      const newId = await duplicateCourse(courseId)
      showToast('Course duplicated as a new draft.')
      onNavigate('course-edit', newId)
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to duplicate course.', 'error')
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteItem(deleteTarget.docId)
      showToast(`Deleted "${deleteTarget.title}".`, 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to delete course.', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Course Permanently?"
        message={`Are you sure you want to delete "${deleteTarget?.title}" from both drafts and the live website? This action cannot be undone.`}
        confirmLabel="Delete Course"
        tone="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between md:p-7">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-ochre uppercase">
            Learning Catalog
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink">
            Courses &amp; Video Curriculum ({courses.length})
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Manage modules, YouTube lessons, learning outcomes, checklists, discussion prompts, and
            bilingual glossaries.
          </p>
        </div>

        {isEditor && (
          <button
            type="button"
            onClick={() => onNavigate('course-edit', 'new')}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft transition hover:bg-primary-700"
          >
            <PlusIcon size={16} />
            Create New Course
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-soft lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <SearchIcon
            size={17}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by English title, नेपाली title, or slug..."
            className="h-10 w-full rounded-xl border border-line-strong bg-canvas pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:bg-card focus:ring-4 focus:ring-primary-100 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-10 rounded-xl border border-line-strong bg-card px-3.5 text-xs font-semibold text-ink focus:border-primary-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories
              .filter((c) => c.id !== 'all')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label.en}
                </option>
              ))}
          </select>

          <div className="inline-flex rounded-xl border border-line bg-subtle p-1">
            {(
              [
                ['all', 'All'],
                ['published', 'Live'],
                ['draft', 'Drafts'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setStatusFilter(val)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  statusFilter === val
                    ? 'bg-card text-brand shadow-soft'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-14 text-center shadow-soft">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-100 text-brand">
            <CoursesIcon size={22} />
          </span>
          <p className="mt-4 text-base font-bold text-ink">No matching courses found</p>
          <p className="mt-1 text-sm text-ink-2">
            Try clearing your search filter or create a new course.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c, idx) => {
            const catObj = categories.find((cat) => cat.id === c.data.category)
            const lessons = (c.data.modules || []).flatMap((m) => m.lessons || [])
            const totalSecs = lessons.reduce((s, l) => s + (l.seconds || 0), 0)

            return (
              <article
                key={c.docId}
                className="flex flex-col gap-5 rounded-2xl border border-line bg-card p-5 shadow-soft transition hover:border-primary-700/35 lg:flex-row lg:items-center"
              >
                {/* Order Controls */}
                {!isFiltered && isEditor && (
                  <div className="flex items-center gap-1 lg:flex-col">
                    <button
                      type="button"
                      disabled={idx === 0 || saving}
                      onClick={() => handleMove(idx, -1)}
                      title="Move course up"
                      className="rounded-lg border border-line p-1.5 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUpIcon size={14} />
                    </button>
                    <span className="px-1 text-[0.7rem] font-bold text-ink-3 tabular-nums">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === filtered.length - 1 || saving}
                      onClick={() => handleMove(idx, 1)}
                      title="Move course down"
                      className="rounded-lg border border-line p-1.5 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDownIcon size={14} />
                    </button>
                  </div>
                )}

                {/* Thumbnail */}
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-line bg-subtle sm:w-52">
                  {c.data.image ? (
                    <img
                      src={c.data.image}
                      alt={c.data.imageAlt || c.data.title.en}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-ink-3">
                      No cover image
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 rounded-md bg-primary-950/85 px-2 py-0.5 text-[0.68rem] font-bold text-white">
                    {catObj?.label.en || c.data.category}
                  </span>
                </div>

                {/* Metadata */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={c.status} />
                    <span className="font-mono text-xs text-ink-3">slug: {c.id}</span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-ink">{c.data.title.en}</h2>
                  <p className="ne-font text-sm font-medium text-ink-2">{c.data.title.ne}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-2">
                    {c.data.subtitle?.en || c.data.description?.en}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-2">
                    <span>{c.data.modules?.length || 0} Modules</span>
                    <span className="inline-flex items-center gap-1">
                      <PlayIcon size={11} className="text-brand" />
                      {lessons.length} Videos ({formatSeconds(totalSecs)})
                    </span>
                    <span>
                      {(c.data.materials?.length || 0) +
                        resourceItems.filter(
                          (r) =>
                            r.courseId === c.id &&
                            !(c.data.materials || []).some((m) => m.id === r.id)
                        ).length}{' '}
                      Materials
                    </span>
                    <span>{c.data.outcomes?.length || 0} Outcomes</span>
                    <span>{c.data.discussion?.length || 0} Prompts</span>
                    <span>{c.data.glossary?.length || 0} Terms</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4 lg:w-56 lg:shrink-0 lg:flex-col lg:items-stretch lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5">
                  <button
                    type="button"
                    onClick={() => onNavigate('course-edit', c.id)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white transition hover:bg-primary-700"
                  >
                    <EditIcon size={13} />
                    {isEditor ? 'Edit Course' : 'Inspect Course'}
                  </button>

                  {(c.status === 'draft_changes' || c.status === 'draft_only') && isEditor && (
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={async () => {
                        try {
                          await publishDoc(c.docId)
                          showToast(`Published "${c.data.title.en}" live.`)
                        } catch (err: unknown) {
                          const e = err as { message?: string }
                          showToast(e.message || 'Publish failed.', 'error')
                        }
                      }}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-accent-500 px-4 text-xs font-extrabold text-primary-950 hover:bg-[#f09324] disabled:opacity-50"
                    >
                      {publishing ? (
                        <RefreshIcon size={13} className="animate-spin" />
                      ) : (
                        <UploadIcon size={13} />
                      )}
                      Publish Draft
                    </button>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <a
                      href={coursePublicHref(c.id)}
                      target={isStandaloneAdmin ? '_blank' : undefined}
                      rel={isStandaloneAdmin ? 'noreferrer' : undefined}
                      title="Open on website"
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-line-strong px-3 text-xs font-semibold text-ink-2 hover:border-primary-700 hover:text-brand"
                    >
                      View <ExternalIcon size={12} />
                    </a>

                    {isEditor && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(c.id)}
                          disabled={saving}
                          title="Duplicate course"
                          className="inline-flex h-8 items-center gap-1 rounded-full border border-line-strong px-3 text-xs font-semibold text-ink-2 hover:border-primary-700 hover:text-brand"
                        >
                          <CopyIcon size={12} />
                          Copy
                        </button>

                        {c.status === 'draft_changes' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await discardDraft(c.docId)
                              showToast('Reverted draft changes to live version.', 'info')
                            }}
                            title="Discard draft edits"
                            className="inline-flex h-8 items-center rounded-full border border-line px-2.5 text-xs font-semibold text-ink-2 hover:border-amber-400 hover:text-ochre"
                          >
                            <UndoIcon size={12} />
                          </button>
                        )}

                        {c.status === 'published' && (
                          <button
                            type="button"
                            onClick={async () => {
                              await unpublishDoc(c.docId)
                              showToast(`Unpublished "${c.data.title.en}" from live site.`, 'info')
                            }}
                            className="inline-flex h-8 items-center rounded-full border border-line px-2.5 text-xs font-semibold text-ink-2 hover:border-amber-400 hover:text-ochre"
                          >
                            Unpublish
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({ docId: c.docId, title: c.data.title.en })
                          }
                          title="Delete course"
                          className="inline-flex h-8 items-center rounded-full border border-line px-2.5 text-xs font-semibold text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
