import { useAuth } from '../context/AuthContext'
import { useCms } from '../context/CmsContext'
import type { AdminTab } from '../components/AdminLayout'
import { StatusBadge, ToastBanner, useToast } from '../components/CmsUi'
import {
  CategoriesIcon,
  ChatIcon,
  CoursesIcon,
  EditIcon,
  FolderIcon,
  HomeIcon,
  LanguagesIcon,
  LayoutIcon,
  PagesIcon,
  PlayIcon,
  PlusIcon,
  RefreshIcon,
  SettingsIcon,
  SparklesIcon,
  UndoIcon,
  UploadIcon,
  UsersIcon,
} from '../components/icons'

export function DashboardPage({
  onNavigate,
}: {
  onNavigate: (tab: AdminTab, courseId?: string) => void
}) {
  const { profile, isEditor, isSuperAdmin } = useAuth()
  const {
    getCourses,
    getCategories,
    getResourcesPage,
    getPendingItems,
    pendingChangesCount,
    isDatabaseSeeded,
    publishDoc,
    discardDraft,
    publishAll,
    seedDefaults,
    saving,
    publishing,
  } = useCms()
  const { toast, showToast, clearToast } = useToast()

  const courses = getCourses()
  const categories = getCategories()
  const resourcesPage = getResourcesPage()
  const pendingItems = getPendingItems()

  const publishedCourses = courses.filter((c) => c.status === 'published').length
  const totalLessons = courses.reduce(
    (sum, c) =>
      sum + (c.data.modules || []).reduce((mSum, m) => mSum + (m.lessons?.length || 0), 0),
    0
  )
  const totalMaterials =
    (resourcesPage.data.resourcesData?.items?.length || 0) +
    courses.reduce((sum, c) => sum + (c.data.materials?.length || 0), 0)

  const handleSeed = async () => {
    try {
      await seedDefaults()
      showToast('All website courses, pages, translations, and settings have been synced live.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to sync default content.', 'error')
    }
  }

  const handlePublishItem = async (docId: string, label: string) => {
    try {
      await publishDoc(docId)
      showToast(`Published "${label}" to the live website.`)
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Publish failed.', 'error')
    }
  }

  const handleDiscardItem = async (docId: string, label: string) => {
    try {
      await discardDraft(docId)
      showToast(`Discarded draft changes for "${label}".`, 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Discard failed.', 'error')
    }
  }

  const handlePublishAll = async () => {
    try {
      await publishAll()
      showToast('Published all pending drafts to the live website.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish all.', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      {/* Welcome Editorial Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-primary-950 p-7 text-white shadow-card md:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_24rem_at_95%_0%,rgb(47_125_184/0.4),transparent_70%)]"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.14em] text-accent-500 uppercase">
              Heifer Academy Editorial Studio
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] md:text-3xl">
              Namaste, {profile?.name || 'Administrator'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/78 md:text-base">
              Update courses, YouTube lessons, homepage sections, legal &amp; about pages,
              bilingual UI labels, branding, and learner survey options — with instant live sync to
              the main website.
            </p>
          </div>

          {isEditor && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('course-edit', 'new')}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-5 text-xs font-extrabold text-primary-950 shadow-soft transition hover:bg-[#f09324]"
              >
                <PlusIcon size={16} />
                New Course
              </button>
              <button
                type="button"
                onClick={() => onNavigate('homepage')}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-xs font-bold text-white transition hover:bg-white/18"
              >
                <HomeIcon size={15} />
                Edit Homepage
              </button>
            </div>
          )}
        </div>

        {!isDatabaseSeeded && isEditor && (
          <div className="relative mt-6 flex flex-col gap-4 rounded-xl border border-accent-500/40 bg-white/8 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <SparklesIcon size={20} className="mt-0.5 shrink-0 text-accent-500" />
              <div>
                <p className="text-sm font-bold text-white">
                  Initialize Firestore with Website Content
                </p>
                <p className="mt-0.5 text-xs text-white/75">
                  Your Firestore collections are currently empty. Click once to populate all 6
                  courses, categories, homepage copy, pages, and translations into Firestore.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSeed}
              disabled={saving}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-xs font-extrabold text-primary-950 shadow-soft hover:bg-accent-100 disabled:opacity-50"
            >
              {saving ? <RefreshIcon size={14} className="animate-spin" /> : <UploadIcon size={14} />}
              Sync Defaults Now
            </button>
          </div>
        )}
      </section>

      {/* 4 Key Metrics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-ink-2 uppercase">
              Total Courses
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-brand">
              <CoursesIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{courses.length}</p>
          <p className="mt-1 text-xs text-ink-3">
            {publishedCourses} published live &middot; {courses.length - publishedCourses} draft/default
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-ink-2 uppercase">
              Video Lessons
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-brand">
              <PlayIcon size={16} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">{totalLessons}</p>
          <p className="mt-1 text-xs text-ink-3">Bilingual YouTube training modules</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-ink-2 uppercase">
              Pending Drafts
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent-100 text-ochre">
              <UploadIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
            {pendingChangesCount}
          </p>
          <p className="mt-1 text-xs text-ink-3">
            {pendingChangesCount === 0
              ? 'All saved edits are live'
              : 'Ready to review and publish'}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-ink-2 uppercase">
              Materials &amp; Guides
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-brand">
              <FolderIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-ink">
            {totalMaterials}
          </p>
          <p className="mt-1 text-xs text-ink-3">
            Field guides, posters &amp; handouts across {categories.data.filter((c) => c.id !== 'all').length} topics
          </p>
        </div>
      </section>

      {/* Pending Drafts Queue (across ALL content types) */}
      {pendingItems.length > 0 && (
        <section className="rounded-2xl border border-amber-300/80 bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ochre uppercase">
                Publishing Queue
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-ink">
                Unpublished Draft Changes ({pendingItems.length})
              </h2>
            </div>
            {isEditor && (
              <button
                type="button"
                onClick={handlePublishAll}
                disabled={publishing}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {publishing ? (
                  <RefreshIcon size={14} className="animate-spin" />
                ) : (
                  <UploadIcon size={14} />
                )}
                Publish All Changes
              </button>
            )}
          </div>

          <div className="mt-4 divide-y divide-line">
            {pendingItems.map((item) => (
              <div
                key={item.docId}
                className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-bold text-ink">{item.title}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-ink-2">
                    {item.subtitle} &middot; Saved{' '}
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'recently'} by{' '}
                    {item.updatedByLabel}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.navTab, item.courseId)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                  >
                    <EditIcon size={13} />
                    Review
                  </button>
                  {isEditor && (item.type !== 'settings' || isSuperAdmin) && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleDiscardItem(item.docId, item.title)}
                        disabled={saving || publishing}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-xs font-semibold text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <UndoIcon size={13} />
                        Discard
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishItem(item.docId, item.title)}
                        disabled={saving || publishing}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary-900 px-3.5 text-xs font-bold text-white hover:bg-primary-700"
                      >
                        <UploadIcon size={13} />
                        Publish
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Complete Website Content Map */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-bold tracking-[0.14em] text-ochre uppercase">
            Manage Website Content
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-ink">
            Every Section of Heifer Academy
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              tab: 'homepage' as AdminTab,
              icon: <HomeIcon size={20} />,
              title: 'Homepage Sections',
              desc: 'Hero banner, featured course, 3 value pillars, 25-year video & stats, testimonials, FAQs, partner marquee & bottom CTA.',
            },
            {
              tab: 'header-footer' as AdminTab,
              icon: <LayoutIcon size={20} />,
              title: 'Header & Footer Navigation',
              desc: 'Customize top menu links, CTA button, footer initiative banner, multi-column footer links, social icons & copyright.',
            },
            {
              tab: 'courses' as AdminTab,
              icon: <CoursesIcon size={20} />,
              title: 'Courses, Lessons & Handouts',
              desc: 'Create or edit courses, modules, YouTube videos, lesson notes, printable course handouts, checklists & glossaries.',
            },
            {
              tab: 'materials' as AdminTab,
              icon: <FolderIcon size={20} />,
              title: 'Materials & Field Guides',
              desc: 'Publish bilingual PDFs, posters, worksheets, toolkits, and audio guides to #/resources and the Homepage spotlight.',
            },
            {
              tab: 'pages' as AdminTab,
              icon: <PagesIcon size={20} />,
              title: 'Custom, About & Legal Pages',
              desc: 'Create brand-new custom pages (#/page/...) with rich blocks, or edit About, Explore, Privacy, Terms & Accessibility.',
            },
            {
              tab: 'categories' as AdminTab,
              icon: <CategoriesIcon size={20} />,
              title: 'Topic Categories',
              desc: 'Add, rename, or reorder bilingual topic filter tabs shown on the Homepage, Explore catalog, and Materials library.',
            },
            {
              tab: 'strings' as AdminTab,
              icon: <LanguagesIcon size={20} />,
              title: 'Bilingual UI Translations',
              desc: 'Customize 90+ interface labels, buttons, player controls, resource filters & accessibility text in English and Nepali.',
            },
            {
              tab: 'feedback' as AdminTab,
              icon: <ChatIcon size={20} />,
              title: 'Learner Feedback & Suggestions',
              desc: 'Live real-time store of feedback, questions, and course suggestions submitted by learners across Nepal.',
            },
            {
              tab: 'settings' as AdminTab,
              icon: <SettingsIcon size={20} />,
              title: 'Branding, Banner & Survey',
              desc: 'Toggle top announcement bar, update logo & organization links, footer contact details, and learner survey options.',
            },
            ...(isSuperAdmin
              ? [
                  {
                    tab: 'users' as AdminTab,
                    icon: <UsersIcon size={20} />,
                    title: 'Team & Email Invitations',
                    desc: 'Invite staff on any email address (Gmail, Outlook, Yahoo, or organization domain) with real inbox password-setup links.',
                  },
                ]
              : []),
          ].map((card) => (
            <button
              key={card.tab}
              type="button"
              onClick={() => onNavigate(card.tab)}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-6 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary-700/40 hover:shadow-card"
            >
              <div>
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-100 text-brand transition group-hover:bg-primary-900 group-hover:text-white">
                  {card.icon}
                </span>
                <h3 className="mt-4 text-base font-bold text-ink group-hover:text-brand">
                  {card.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-2">{card.desc}</p>
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-brand">
                Open Editor &rarr;
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Course Catalog Quick Table */}
      <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-ink">Course Catalog Overview</h2>
            <p className="text-xs text-ink-2">Click any course to edit modules, videos, and field notes</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold text-brand hover:underline"
          >
            Manage All Courses &rarr;
          </button>
        </div>

        <div className="divide-y divide-line">
          {courses.map((c) => {
            const lessonCount = (c.data.modules || []).reduce(
              (acc, m) => acc + (m.lessons?.length || 0),
              0
            )
            return (
              <div
                key={c.id}
                className="flex flex-col gap-3 px-6 py-4 transition hover:bg-subtle/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <img
                    src={c.data.image}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-lg border border-line bg-subtle object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{c.data.title.en}</p>
                    <p className="ne-font truncate text-xs text-ink-2">{c.data.title.ne}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <span className="text-xs text-ink-3">
                    {c.data.modules?.length || 0} modules &middot; {lessonCount} lessons
                  </span>
                  <StatusBadge status={c.status} />
                  <button
                    type="button"
                    onClick={() => onNavigate('course-edit', c.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
                  >
                    <EditIcon size={13} />
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
