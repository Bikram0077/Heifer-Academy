import { useMemo, useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type { Course, CourseMaterial, MaterialFormat, Module, Lesson, Bi } from '@shared/schema'
import type { AdminTab } from '../components/AdminLayout'
import { MATERIAL_FORMATS } from './MaterialsPage'
import {
  BilingualField,
  EditorHeader,
  SectionCard,
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
} from '../components/icons'

const EMPTY_BI: Bi = { en: '', ne: '' }

function createBlankCourse(defaultCategory: string, nextOrder: number): Course {
  return {
    id: '',
    category: defaultCategory || 'livestock',
    title: { en: '', ne: '' },
    subtitle: { en: '', ne: '' },
    description: { en: '', ne: '' },
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
    imageAlt: '',
    outcomes: [{ en: '', ne: '' }],
    modules: [
      {
        title: { en: 'Module 1: Introduction', ne: 'मोड्युल १: परिचय' },
        lessons: [
          {
            id: '',
            seconds: 240,
            title: { en: 'Lesson 1', ne: 'पाठ १' },
          },
        ],
      },
    ],
    summary: { en: '', ne: '' },
    checklist: [{ en: '', ne: '' }],
    facilitator: { en: '', ne: '' },
    discussion: [{ en: '', ne: '' }],
    glossary: [{ term: { en: '', ne: '' }, meaning: { en: '', ne: '' } }],
    order: nextOrder,
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type StudioTab =
  | 'overview'
  | 'curriculum'
  | 'materials'
  | 'outcomes'
  | 'checklist'
  | 'discussion'
  | 'glossary'

export function CourseEditPage({
  courseId,
  onNavigate,
}: {
  courseId?: string
  onNavigate: (tab: AdminTab) => void
}) {
  const {
    getCourse,
    getCourses,
    getCategories,
    saveDraft,
    saveAndPublish,
    discardDraft,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [createdId, setCreatedId] = useState<string | null>(null)
  const effectiveId = createdId || (courseId && courseId !== 'new' ? courseId : undefined)
  const isNew = !effectiveId

  const categories = getCategories().data.filter((c) => c.id !== 'all')
  const existingDoc = effectiveId ? getCourse(effectiveId) : null
  const allCoursesCount = getCourses().length

  const initialCourse = useMemo(
    () =>
      existingDoc?.data ||
      createBlankCourse(categories[0]?.id || 'livestock', allCoursesCount),
    [existingDoc, categories, allCoursesCount]
  )

  const entityKey = effectiveId || 'new_course'
  const versionKey = `${existingDoc?.updatedAt || ''}:${existingDoc?.status || 'unpublished'}`

  const [course, updateCourse, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<Course>(initialCourse, entityKey, versionKey)

  const [activeTab, setActiveTab] = useState<StudioTab>('overview')

  const resolveValidatedCourse = (): Course | null => {
    const finalSlug = slugify(course.id || course.title.en)
    if (!finalSlug) {
      showToast('Please provide an English course title or URL slug first.', 'error')
      return null
    }
    if (!course.title.en.trim()) {
      showToast('Course English title is required.', 'error')
      return null
    }
    return {
      ...course,
      id: finalSlug,
      order: course.order ?? existingDoc?.data.order ?? allCoursesCount,
    }
  }

  const handleSaveDraft = async () => {
    const valid = resolveValidatedCourse()
    if (!valid) return
    try {
      await saveDraft(`course_${valid.id}`, 'course', valid, valid.order)
      markClean()
      if (isNew) setCreatedId(valid.id)
      showToast('Course saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save draft.', 'error')
    }
  }

  const handlePublish = async () => {
    const valid = resolveValidatedCourse()
    if (!valid) return
    try {
      await saveAndPublish(`course_${valid.id}`, 'course', valid, valid.order)
      markClean()
      if (isNew) setCreatedId(valid.id)
      showToast('Course published live! Changes are now visible on the main website.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish course.', 'error')
    }
  }

  const handleDiscard = async () => {
    if (!existingDoc) {
      resetToRemote()
      return
    }
    try {
      if (existingDoc.status === 'draft_changes' || existingDoc.status === 'draft_only') {
        markClean()
        await discardDraft(existingDoc.docId)
        if (existingDoc.status === 'draft_only') {
          onNavigate('courses')
          return
        }
      } else {
        resetToRemote()
      }
      showToast('Reverted course to last published version.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard draft.', 'error')
    }
  }

  // --- Array Helpers ---
  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir
    if (target < 0 || target >= arr.length) return arr
    const next = [...arr]
    const [item] = next.splice(idx, 1)
    next.splice(target, 0, item)
    return next
  }

  // Modules & Lessons helpers
  const addModule = () => {
    const num = (course.modules?.length || 0) + 1
    updateCourse((prev) => ({
      ...prev,
      modules: [
        ...(prev.modules || []),
        {
          title: { en: `Module ${num}`, ne: `मोड्युल ${num}` },
          lessons: [{ id: '', seconds: 240, title: { en: 'New Lesson', ne: 'नयाँ पाठ' } }],
        },
      ],
    }))
  }

  const updateModule = (mIdx: number, nextMod: Module) => {
    updateCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m, i) => (i === mIdx ? nextMod : m)),
    }))
  }

  const removeModule = (mIdx: number) => {
    updateCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== mIdx),
    }))
  }

  const addLesson = (mIdx: number) => {
    const m = course.modules[mIdx]
    const nextLesson: Lesson = {
      id: '',
      seconds: 240,
      title: {
        en: `Lesson ${(m.lessons?.length || 0) + 1}`,
        ne: `पाठ ${(m.lessons?.length || 0) + 1}`,
      },
    }
    updateModule(mIdx, { ...m, lessons: [...(m.lessons || []), nextLesson] })
  }

  const totalLessons = (course.modules || []).reduce(
    (s, m) => s + (m.lessons?.length || 0),
    0
  )

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const publicBase = isStandaloneAdmin ? 'http://localhost:8443/' : ''
  const previewHref = effectiveId
    ? `${publicBase}#/course/${effectiveId}`
    : null

  const STUDIO_TABS: { id: StudioTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview & Notes' },
    { id: 'curriculum', label: 'Modules & Videos', count: totalLessons },
    { id: 'materials', label: 'Materials & Handouts', count: course.materials?.length || 0 },
    { id: 'outcomes', label: 'Learning Outcomes', count: course.outcomes?.length || 0 },
    { id: 'checklist', label: 'Field Checklist', count: course.checklist?.length || 0 },
    { id: 'discussion', label: 'Discussion Prompts', count: course.discussion?.length || 0 },
    { id: 'glossary', label: 'Bilingual Glossary', count: course.glossary?.length || 0 },
  ]

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <EditorHeader
        eyebrow={isNew ? 'New Course Draft' : `Course Studio · ${effectiveId}`}
        title={course.title.en || 'Untitled Course'}
        description="Edit course overview, YouTube video lessons, learning outcomes, field action checklist, group discussion prompts, and bilingual glossary."
        status={existingDoc?.status || 'draft_only'}
        isDirty={isDirty}
        updatedAt={existingDoc?.updatedAt}
        updatedBy={existingDoc?.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        backLabel="All Courses"
        onBack={() => onNavigate('courses')}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
        extraActions={
          previewHref ? (
            <a
              href={previewHref}
              target={isStandaloneAdmin ? '_blank' : undefined}
              rel={isStandaloneAdmin ? 'noreferrer' : undefined}
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink hover:border-primary-700 hover:text-brand"
            >
              View on Site <ExternalIcon size={13} />
            </a>
          ) : undefined
        }
      />

      {/* Section Navigation Tabs */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-card p-2 shadow-soft">
        {STUDIO_TABS.map((t) => {
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
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

      {/* TAB 1: Overview, Cover Media & Lesson Player Summary */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Identity & Taxonomy"
            title="Course Title, Slug & Category"
            description="Shown on Course Cards, the Explore catalog, and the Course Outline hero banner."
          >
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Course URL Slug (ID)
                  </label>
                  <input
                    type="text"
                    disabled={!isNew || !isEditor}
                    value={course.id}
                    placeholder="e.g. sustainable-goat-farming (auto-generated if blank)"
                    onChange={(e) =>
                      updateCourse((p) => ({ ...p, id: slugify(e.target.value) }))
                    }
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle disabled:text-ink-2"
                  />
                  <p className="mt-1 text-xs text-ink-3">
                    Public route: <code>#/course/{course.id || slugify(course.title.en) || '...'}</code>
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Topic Category
                  </label>
                  <select
                    disabled={!isEditor}
                    value={course.category}
                    onChange={(e) =>
                      updateCourse((p) => ({ ...p, category: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label.en} ({cat.label.ne})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <BilingualField
                label="Course Title"
                value={course.title}
                disabled={!isEditor}
                placeholderEn="e.g. Improved Goat & Livestock Management"
                placeholderNe="उन्नत बाख्रा तथा पशुपालन व्यवस्थापन"
                onChange={(val) => updateCourse((p) => ({ ...p, title: val }))}
              />

              <BilingualField
                label="Course Subtitle"
                value={course.subtitle}
                disabled={!isEditor}
                placeholderEn="Short one-line subtitle under the main heading"
                placeholderNe="मुख्य शीर्षक मुनिको छोटो उपशीर्षक"
                onChange={(val) => updateCourse((p) => ({ ...p, subtitle: val }))}
              />

              <BilingualField
                label="Full Course Description"
                multiline
                rows={4}
                value={course.description}
                disabled={!isEditor}
                onChange={(val) => updateCourse((p) => ({ ...p, description: val }))}
              />

              <div className="space-y-5 rounded-xl border border-line bg-canvas p-4 sm:p-5">
                <p className="text-xs font-bold tracking-wider text-ochre uppercase">
                  Optional Metadata Badges (Shown on Cards &amp; Course Outline)
                </p>

                <BilingualField
                  label="Highlight Ribbon Badge (Optional)"
                  hint="e.g. Featured, New, Essential — leave blank for none"
                  value={course.badge || { en: '', ne: '' }}
                  disabled={!isEditor}
                  placeholderEn="e.g. Featured"
                  placeholderNe="विशेष"
                  onChange={(badge) => updateCourse((p) => ({ ...p, badge }))}
                />

                <BilingualField
                  label="Audience / Skill Level (Optional)"
                  value={course.level || { en: '', ne: '' }}
                  disabled={!isEditor}
                  placeholderEn="e.g. Farmers, SHGs & Facilitators"
                  placeholderNe="किसान, स्वावलम्बन समूह र सहजकर्ता"
                  onChange={(level) => updateCourse((p) => ({ ...p, level }))}
                />

                <BilingualField
                  label="Lead Instructor / Technical Team (Optional)"
                  value={course.instructor || { en: '', ne: '' }}
                  disabled={!isEditor}
                  placeholderEn="e.g. Heifer Nepal Livestock & Cooperative Team"
                  placeholderNe="हेफर नेपाल पशु स्वास्थ्य तथा सहकारी टोली"
                  onChange={(instructor) => updateCourse((p) => ({ ...p, instructor }))}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Cover Photography"
            title="Course Card Cover Image"
            description="Displayed on Homepage and Explore course cards (16:10 landscape recommended)."
          >
            <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    disabled={!isEditor}
                    value={course.image}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => updateCourse((p) => ({ ...p, image: e.target.value }))}
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                    Accessible Image Alt Description
                  </label>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={course.imageAlt}
                    placeholder="Describe the photograph for screen-reader users..."
                    onChange={(e) =>
                      updateCourse((p) => ({ ...p, imageAlt: e.target.value }))
                    }
                    className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-line bg-subtle">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.imageAlt || 'Course cover preview'}
                    className="aspect-[16/10] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center text-xs text-ink-3">
                    Cover image preview
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Lesson Player Notes"
            title="Course Summary & Facilitator Guidance"
            description="Shown inside the Lesson Player under the Overview tab alongside the Field Action Checklist."
          >
            <div className="space-y-6">
              <BilingualField
                label="Lesson Player Summary"
                multiline
                rows={4}
                value={course.summary}
                disabled={!isEditor}
                onChange={(val) => updateCourse((p) => ({ ...p, summary: val }))}
              />
              <BilingualField
                label="For Facilitators Callout Box"
                hint="Practical tip for community facilitators leading a group viewing session"
                multiline
                rows={3}
                value={course.facilitator}
                disabled={!isEditor}
                onChange={(val) => updateCourse((p) => ({ ...p, facilitator: val }))}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* TAB 2: Curriculum (Modules & Video Lessons) */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-card p-5 shadow-soft">
            <div>
              <h2 className="text-base font-bold text-ink">
                Modules &amp; YouTube Video Lessons ({course.modules?.length || 0} modules,{' '}
                {totalLessons} videos)
              </h2>
              <p className="text-xs text-ink-2">
                Paste any YouTube watch URL, short link, or 11-character ID — thumbnails preview
                automatically.
              </p>
            </div>
            {isEditor && (
              <button
                type="button"
                onClick={addModule}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
              >
                <PlusIcon size={15} />
                Add Module
              </button>
            )}
          </div>

          {(course.modules || []).map((mod, mIdx) => (
            <SectionCard
              key={mIdx}
              eyebrow={`Module ${mIdx + 1}`}
              title={mod.title.en || `Module ${mIdx + 1}`}
              actions={
                isEditor ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={mIdx === 0}
                      onClick={() =>
                        updateCourse((p) => ({
                          ...p,
                          modules: moveItem(p.modules, mIdx, -1),
                        }))
                      }
                      title="Move module up"
                      className="rounded-lg border border-line p-2 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowUpIcon size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={mIdx === course.modules.length - 1}
                      onClick={() =>
                        updateCourse((p) => ({
                          ...p,
                          modules: moveItem(p.modules, mIdx, 1),
                        }))
                      }
                      title="Move module down"
                      className="rounded-lg border border-line p-2 text-ink-2 hover:bg-subtle hover:text-ink disabled:opacity-30"
                    >
                      <ArrowDownIcon size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => addLesson(mIdx)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary-700/30 bg-primary-100 px-3.5 text-xs font-bold text-brand hover:bg-primary-100/70"
                    >
                      <PlusIcon size={14} />
                      Add Lesson
                    </button>
                    {course.modules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeModule(mIdx)}
                        title="Delete module"
                        className="rounded-lg border border-line p-2 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                ) : undefined
              }
            >
              <div className="space-y-6">
                <BilingualField
                  label="Module Title"
                  value={mod.title}
                  disabled={!isEditor}
                  onChange={(val) => updateModule(mIdx, { ...mod, title: val })}
                />

                <div className="space-y-4">
                  {(mod.lessons || []).map((les, lIdx) => (
                    <div
                      key={lIdx}
                      className="rounded-xl border border-line bg-canvas p-4 sm:p-5"
                    >
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-brand uppercase">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-brand">
                            {lIdx + 1}
                          </span>
                          Lesson {lIdx + 1}: {les.title.en || 'Untitled Lesson'}
                        </span>

                        {isEditor && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={lIdx === 0}
                              onClick={() =>
                                updateModule(mIdx, {
                                  ...mod,
                                  lessons: moveItem(mod.lessons, lIdx, -1),
                                })
                              }
                              title="Move lesson up"
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                            >
                              <ArrowUpIcon size={13} />
                            </button>
                            <button
                              type="button"
                              disabled={lIdx === mod.lessons.length - 1}
                              onClick={() =>
                                updateModule(mIdx, {
                                  ...mod,
                                  lessons: moveItem(mod.lessons, lIdx, 1),
                                })
                              }
                              title="Move lesson down"
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                            >
                              <ArrowDownIcon size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateModule(mIdx, {
                                  ...mod,
                                  lessons: mod.lessons.filter((_, k) => k !== lIdx),
                                })
                              }
                              title="Remove lesson"
                              className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                            >
                              <TrashIcon size={13} />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <BilingualField
                          label="Lesson Title"
                          value={les.title}
                          disabled={!isEditor}
                          onChange={(val) => {
                            const nextLessons = mod.lessons.map((item, k) =>
                              k === lIdx ? { ...item, title: val } : item
                            )
                            updateModule(mIdx, { ...mod, lessons: nextLessons })
                          }}
                        />

                        <YouTubeField
                          videoId={les.id}
                          seconds={les.seconds}
                          disabled={!isEditor}
                          onChangeVideoId={(id) => {
                            const nextLessons = mod.lessons.map((item, k) =>
                              k === lIdx ? { ...item, id } : item
                            )
                            updateModule(mIdx, { ...mod, lessons: nextLessons })
                          }}
                          onChangeSeconds={(secs) => {
                            const nextLessons = mod.lessons.map((item, k) =>
                              k === lIdx ? { ...item, seconds: secs } : item
                            )
                            updateModule(mIdx, { ...mod, lessons: nextLessons })
                          }}
                        />

                        <div className="space-y-4 rounded-xl border border-line bg-card p-4">
                          <p className="text-xs font-bold tracking-wider text-ink-2 uppercase">
                            Lesson Notes &amp; Handout Attachment (Optional)
                          </p>

                          <BilingualField
                            label="Lesson Key Takeaway / Field Note"
                            hint="Displayed directly beneath the video player for this lesson"
                            multiline
                            rows={2}
                            value={les.notes || { en: '', ne: '' }}
                            disabled={!isEditor}
                            onChange={(notes) => {
                              const nextLessons = mod.lessons.map((item, k) =>
                                k === lIdx ? { ...item, notes } : item
                              )
                              updateModule(mIdx, { ...mod, lessons: nextLessons })
                            }}
                          />

                          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                            <BilingualField
                              label="Handout Button Label"
                              value={les.materialLabel || { en: '', ne: '' }}
                              disabled={!isEditor}
                              placeholderEn="e.g. Download Lesson Worksheet (PDF)"
                              placeholderNe="पाठको कार्यपत्र डाउनलोड गर्नुहोस्"
                              onChange={(materialLabel) => {
                                const nextLessons = mod.lessons.map((item, k) =>
                                  k === lIdx ? { ...item, materialLabel } : item
                                )
                                updateModule(mIdx, { ...mod, lessons: nextLessons })
                              }}
                            />

                            <div>
                              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                                Handout / PDF URL
                              </label>
                              <input
                                type="url"
                                disabled={!isEditor}
                                value={les.materialUrl || ''}
                                placeholder="https://drive.google.com/... or https://...pdf"
                                onChange={(e) => {
                                  const nextLessons = mod.lessons.map((item, k) =>
                                    k === lIdx ? { ...item, materialUrl: e.target.value } : item
                                  )
                                  updateModule(mIdx, { ...mod, lessons: nextLessons })
                                }}
                                className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                              />
                              <p className="mt-1 text-xs text-ink-3">
                                Leave blank if this video does not have a dedicated handout.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}

      {/* TAB 2B: Course Materials & Handouts */}
      {activeTab === 'materials' && (
        <SectionCard
          eyebrow="Course Outline & Lesson Player"
          title="Course Field Guides, Posters & Printable Handouts"
          description="Attach PDFs, worksheets, posters, or toolkits to this course. They appear on the Course Outline page, inside the Lesson Player's Materials tab, and in the public #/resources library."
          actions={
            isEditor ? (
              <button
                type="button"
                onClick={() => {
                    const nextMat: CourseMaterial = {
                      id: `mat_${Math.random().toString(36).slice(2, 8)}`,
                      title: { en: '', ne: '' },
                      description: { en: '', ne: '' },
                      format: 'guide',
                      url: '',
                      meta: { en: 'Printable Guide · EN / NE', ne: 'प्रिन्ट योग्य गाइड · द्विभाषिक' },
                      body: { en: '', ne: '' },
                      keyPoints: [{ en: '', ne: '' }],
                      facilitatorTip: { en: '', ne: '' },
                    }
                  updateCourse((p) => ({
                    ...p,
                    materials: [...(p.materials || []), nextMat],
                  }))
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
              >
                <PlusIcon size={14} />
                Add Course Material
              </button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {(course.materials || []).length === 0 && (
              <p className="py-6 text-center text-sm text-ink-3">
                No course materials attached yet. Click &ldquo;Add Course Material&rdquo; above to attach a PDF, poster, or field guide.
              </p>
            )}

            {(course.materials || []).map((mat, idx) => (
              <div
                key={mat.id || idx}
                className="space-y-4 rounded-xl border border-line bg-canvas p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <span className="text-xs font-bold tracking-wider text-brand uppercase">
                    Material #{idx + 1}: {mat.title.en || 'New Handout'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {mat.id && (
                      <a
                        href={`${publicBase}#/material/${encodeURIComponent(mat.id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-semibold text-brand hover:border-primary-700"
                      >
                        Preview <ExternalIcon size={12} />
                      </a>
                    )}
                    {isEditor && (
                      <>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updateCourse((p) => ({
                              ...p,
                              materials: moveItem(p.materials || [], idx, -1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === (course.materials?.length || 1) - 1}
                          onClick={() =>
                            updateCourse((p) => ({
                              ...p,
                              materials: moveItem(p.materials || [], idx, 1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateCourse((p) => ({
                              ...p,
                              materials: (p.materials || []).filter((_, k) => k !== idx),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[14rem_1fr]">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                      Format
                    </label>
                    <select
                      disabled={!isEditor}
                      value={mat.format}
                      onChange={(e) =>
                        updateCourse((p) => ({
                          ...p,
                          materials: (p.materials || []).map((item, k) =>
                            k === idx
                              ? { ...item, format: e.target.value as MaterialFormat }
                              : item
                          ),
                        }))
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
                      External File / Download URL (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditor}
                      value={mat.url}
                      placeholder="https://drive.google.com/... or https://...pdf (optional)"
                      onChange={(e) =>
                        updateCourse((p) => ({
                          ...p,
                          materials: (p.materials || []).map((item, k) =>
                            k === idx ? { ...item, url: e.target.value } : item
                          ),
                        }))
                      }
                      className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink focus:border-primary-700 focus:outline-none disabled:bg-subtle"
                    />
                  </div>
                </div>

                <BilingualField
                  label="Material Title"
                  value={mat.title}
                  disabled={!isEditor}
                  onChange={(title) =>
                    updateCourse((p) => ({
                      ...p,
                      materials: (p.materials || []).map((item, k) =>
                        k === idx ? { ...item, title } : item
                      ),
                    }))
                  }
                />

                <BilingualField
                  label="Short Description (Optional)"
                  multiline
                  rows={2}
                  value={mat.description || { en: '', ne: '' }}
                  disabled={!isEditor}
                  onChange={(description) =>
                    updateCourse((p) => ({
                      ...p,
                      materials: (p.materials || []).map((item, k) =>
                        k === idx ? { ...item, description } : item
                      ),
                    }))
                  }
                />

                <BilingualField
                  label="Metadata Badge (Optional)"
                  value={mat.meta || { en: '', ne: '' }}
                  disabled={!isEditor}
                  placeholderEn="e.g. 8 pages · Printable PDF"
                  placeholderNe="८ पृष्ठ · पीडीएफ"
                  onChange={(meta) =>
                    updateCourse((p) => ({
                      ...p,
                      materials: (p.materials || []).map((item, k) =>
                        k === idx ? { ...item, meta } : item
                      ),
                    }))
                  }
                />

                <details className="rounded-xl border border-line bg-card p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold tracking-wider text-brand uppercase">
                    <span>On-Platform Guide Content &amp; Checklist (#/material/{mat.id})</span>
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-[0.7rem] font-semibold text-brand">
                      {(mat.keyPoints?.length || 0)} steps
                    </span>
                  </summary>
                  <div className="mt-4 space-y-4 border-t border-line pt-4">
                    <BilingualField
                      label="Full Printable Guide Text"
                      multiline
                      rows={4}
                      value={mat.body || { en: '', ne: '' }}
                      disabled={!isEditor}
                      onChange={(body) =>
                        updateCourse((p) => ({
                          ...p,
                          materials: (p.materials || []).map((item, k) =>
                            k === idx ? { ...item, body } : item
                          ),
                        }))
                      }
                    />
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold tracking-wide text-ink uppercase">
                          Key Steps / Checklist ({mat.keyPoints?.length || 0})
                        </span>
                        {isEditor && (
                          <button
                            type="button"
                            onClick={() =>
                              updateCourse((p) => ({
                                ...p,
                                materials: (p.materials || []).map((item, k) =>
                                  k === idx
                                    ? {
                                        ...item,
                                        keyPoints: [
                                          ...(item.keyPoints || []),
                                          { en: '', ne: '' },
                                        ],
                                      }
                                    : item
                                ),
                              }))
                            }
                            className="inline-flex h-8 items-center gap-1 rounded-full border border-primary-700/30 bg-primary-100 px-3 text-xs font-bold text-brand hover:bg-primary-100/80"
                          >
                            <PlusIcon size={13} /> Add Step
                          </button>
                        )}
                      </div>
                      {(mat.keyPoints || []).map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          className="space-y-2 rounded-xl border border-line bg-canvas p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-ink-2">
                              Step #{pIdx + 1}
                            </span>
                            {isEditor && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateCourse((p) => ({
                                    ...p,
                                    materials: (p.materials || []).map((item, k) =>
                                      k === idx
                                        ? {
                                            ...item,
                                            keyPoints: (item.keyPoints || []).filter(
                                              (_, j) => j !== pIdx
                                            ),
                                          }
                                        : item
                                    ),
                                  }))
                                }
                                className="rounded-md p-1 text-ink-3 hover:bg-red-50 hover:text-red-700"
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
                              updateCourse((p) => ({
                                ...p,
                                materials: (p.materials || []).map((item, k) =>
                                  k === idx
                                    ? {
                                        ...item,
                                        keyPoints: (item.keyPoints || []).map((x, j) =>
                                          j === pIdx ? val : x
                                        ),
                                      }
                                    : item
                                ),
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <BilingualField
                      label="Facilitator Tip Callout (Optional)"
                      multiline
                      rows={2}
                      value={mat.facilitatorTip || { en: '', ne: '' }}
                      disabled={!isEditor}
                      onChange={(facilitatorTip) =>
                        updateCourse((p) => ({
                          ...p,
                          materials: (p.materials || []).map((item, k) =>
                            k === idx ? { ...item, facilitatorTip } : item
                          ),
                        }))
                      }
                    />
                  </div>
                </details>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* TAB 3: Learning Outcomes */}
      {activeTab === 'outcomes' && (
        <BilingualListEditor
          eyebrow="Course Outline Page"
          title="What Learners Will Learn (Outcomes)"
          description="Displayed in a two-column checkmark card at the top of the Course Outline page."
          addLabel="Add Outcome"
          items={course.outcomes || []}
          canEdit={isEditor}
          onChange={(next) => updateCourse((p) => ({ ...p, outcomes: next }))}
        />
      )}

      {/* TAB 4: Field Action Checklist */}
      {activeTab === 'checklist' && (
        <BilingualListEditor
          eyebrow="Lesson Player · Overview Tab"
          title="Field Action Checklist"
          description="Interactive tasks learners can check off in the field as they complete the course."
          addLabel="Add Checklist Item"
          items={course.checklist || []}
          canEdit={isEditor}
          onChange={(next) => updateCourse((p) => ({ ...p, checklist: next }))}
        />
      )}

      {/* TAB 5: Group Discussion Prompts */}
      {activeTab === 'discussion' && (
        <BilingualListEditor
          eyebrow="Lesson Player · Discussion Tab"
          title="Group Discussion Prompts"
          description="Numbered reflection questions used by self-help groups and facilitators after watching a lesson."
          addLabel="Add Discussion Prompt"
          items={course.discussion || []}
          canEdit={isEditor}
          multiline
          onChange={(next) => updateCourse((p) => ({ ...p, discussion: next }))}
        />
      )}

      {/* TAB 6: Bilingual Glossary */}
      {activeTab === 'glossary' && (
        <SectionCard
          eyebrow="Lesson Player · Glossary Tab"
          title="Bilingual Technical Glossary"
          description="Key agricultural, cooperative, and social development terms translated and explained in English and Nepali."
          actions={
            isEditor ? (
              <button
                type="button"
                onClick={() =>
                  updateCourse((p) => ({
                    ...p,
                    glossary: [
                      ...(p.glossary || []),
                      { term: { ...EMPTY_BI }, meaning: { ...EMPTY_BI } },
                    ],
                  }))
                }
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
              >
                <PlusIcon size={14} />
                Add Glossary Term
              </button>
            ) : undefined
          }
        >
          <div className="space-y-4">
            {(course.glossary || []).length === 0 && (
              <p className="py-6 text-center text-sm text-ink-3">
                No glossary terms yet. Click &ldquo;Add Glossary Term&rdquo; above to add one.
              </p>
            )}
            {(course.glossary || []).map((g, idx) => (
              <div
                key={idx}
                className="space-y-4 rounded-xl border border-line bg-canvas p-5"
              >
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-bold tracking-wider text-brand uppercase">
                    Term #{idx + 1}: {g.term.en || 'New Term'}
                  </span>
                  {isEditor && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateCourse((p) => ({
                            ...p,
                            glossary: moveItem(p.glossary, idx, -1),
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUpIcon size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === course.glossary.length - 1}
                        onClick={() =>
                          updateCourse((p) => ({
                            ...p,
                            glossary: moveItem(p.glossary, idx, 1),
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDownIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateCourse((p) => ({
                            ...p,
                            glossary: p.glossary.filter((_, k) => k !== idx),
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
                  label="Term"
                  value={g.term}
                  disabled={!isEditor}
                  onChange={(term) =>
                    updateCourse((p) => ({
                      ...p,
                      glossary: p.glossary.map((item, k) =>
                        k === idx ? { ...item, term } : item
                      ),
                    }))
                  }
                />

                <BilingualField
                  label="Definition / Meaning"
                  multiline
                  rows={2}
                  value={g.meaning}
                  disabled={!isEditor}
                  onChange={(meaning) =>
                    updateCourse((p) => ({
                      ...p,
                      glossary: p.glossary.map((item, k) =>
                        k === idx ? { ...item, meaning } : item
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

function BilingualListEditor({
  eyebrow,
  title,
  description,
  addLabel,
  items,
  canEdit,
  multiline = false,
  onChange,
}: {
  eyebrow: string
  title: string
  description: string
  addLabel: string
  items: Bi[]
  canEdit: boolean
  multiline?: boolean
  onChange: (next: Bi[]) => void
}) {
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [picked] = next.splice(idx, 1)
    next.splice(target, 0, picked)
    onChange(next)
  }

  return (
    <SectionCard
      eyebrow={eyebrow}
      title={title}
      description={description}
      actions={
        canEdit ? (
          <button
            type="button"
            onClick={() => onChange([...items, { en: '', ne: '' }])}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
          >
            <PlusIcon size={14} />
            {addLabel}
          </button>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {items.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-3">
            No items yet. Click &ldquo;{addLabel}&rdquo; above to add the first item.
          </p>
        )}
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-line bg-canvas p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-brand uppercase">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary-100 text-xs font-extrabold text-brand">
                  {idx + 1}
                </span>
                Item #{idx + 1}
              </span>
              {canEdit && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => move(idx, -1)}
                    className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                  >
                    <ArrowUpIcon size={13} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => move(idx, 1)}
                    className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                  >
                    <ArrowDownIcon size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(items.filter((_, k) => k !== idx))}
                    className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <TrashIcon size={13} />
                  </button>
                </div>
              )}
            </div>

            <BilingualField
              value={item}
              multiline={multiline}
              rows={2}
              disabled={!canEdit}
              compact
              onChange={(val) =>
                onChange(items.map((x, k) => (k === idx ? val : x)))
              }
            />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
