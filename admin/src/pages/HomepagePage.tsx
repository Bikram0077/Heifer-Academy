import { useMemo, useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type {
  FaqItem,
  HomePageData,
  PageContent,
  Testimonial,
  ValuePillar,
} from '@shared/schema'
import {
  BilingualField,
  EditorHeader,
  PillarIconPicker,
  SectionCard,
  ToastBanner,
  YouTubeField,
  useSyncedFormState,
  useToast,
} from '../components/CmsUi'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from '../components/icons'

type HomeSectionTab =
  | 'hero'
  | 'pillars'
  | 'intro'
  | 'voices'
  | 'faqs'
  | 'partners'
  | 'cta'

type CombinedHomepageState = {
  homeData: HomePageData
  testimonials: Testimonial[]
  faqs: FaqItem[]
  partners: string[]
}

export function HomepagePage() {
  const {
    getHomePage,
    getCourses,
    getTestimonials,
    getFaqs,
    getPartners,
    saveDraft,
    saveAndPublish,
    discardDraft,
    saving,
    publishing,
  } = useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const homeDoc = getHomePage()
  const testDoc = getTestimonials()
  const faqDoc = getFaqs()
  const partDoc = getPartners()
  const courses = getCourses()

  const combinedRemote = useMemo<CombinedHomepageState>(
    () => ({
      homeData: homeDoc.data.homeData || {},
      testimonials: testDoc.data,
      faqs: faqDoc.data,
      partners: partDoc.data,
    }),
    [homeDoc.data.homeData, testDoc.data, faqDoc.data, partDoc.data]
  )

  const versionKey = [
    homeDoc.updatedAt,
    homeDoc.status,
    testDoc.updatedAt,
    testDoc.status,
    faqDoc.updatedAt,
    faqDoc.status,
    partDoc.updatedAt,
    partDoc.status,
  ].join('|')

  const [form, updateForm, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<CombinedHomepageState>(combinedRemote, 'homepage_all', versionKey)

  const [sectionTab, setSectionTab] = useState<HomeSectionTab>('hero')
  const [newPartner, setNewPartner] = useState('')

  const hasDraft =
    homeDoc.status === 'draft_changes' ||
    homeDoc.status === 'draft_only' ||
    testDoc.status === 'draft_changes' ||
    testDoc.status === 'draft_only' ||
    faqDoc.status === 'draft_changes' ||
    faqDoc.status === 'draft_only' ||
    partDoc.status === 'draft_changes' ||
    partDoc.status === 'draft_only'

  const aggregateStatus = hasDraft
    ? 'draft_changes'
    : homeDoc.status === 'published'
      ? 'published'
      : 'unpublished'

  const moveItem = <T,>(arr: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir
    if (target < 0 || target >= arr.length) return arr
    const next = [...arr]
    const [picked] = next.splice(idx, 1)
    next.splice(target, 0, picked)
    return next
  }

  const buildPagePayload = (): PageContent => ({
    slug: 'home',
    title: homeDoc.data.title || { en: 'Homepage', ne: 'गृहपृष्ठ' },
    homeData: form.homeData,
  })

  const handleSaveDraft = async () => {
    try {
      await Promise.all([
        saveDraft('page_home', 'page', buildPagePayload(), 0),
        saveDraft(
          'testimonials',
          'testimonial',
          form.testimonials.map((t, i) => ({ ...t, order: i })),
          0
        ),
        saveDraft(
          'faqs',
          'faq',
          form.faqs.map((f, i) => ({ ...f, order: i })),
          0
        ),
        saveDraft('partners', 'partner', form.partners.filter((p) => p.trim() !== ''), 0),
      ])
      markClean()
      showToast('All homepage sections saved as drafts.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save homepage drafts.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await Promise.all([
        saveAndPublish('page_home', 'page', buildPagePayload(), 0),
        saveAndPublish(
          'testimonials',
          'testimonial',
          form.testimonials.map((t, i) => ({ ...t, order: i })),
          0
        ),
        saveAndPublish(
          'faqs',
          'faq',
          form.faqs.map((f, i) => ({ ...f, order: i })),
          0
        ),
        saveAndPublish('partners', 'partner', form.partners.filter((p) => p.trim() !== ''), 0),
      ])
      markClean()
      showToast('Homepage published live! Every updated section is now visible on the main website.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish homepage.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      markClean()
      const tasks: Promise<void>[] = []
      if (homeDoc.status === 'draft_changes' || homeDoc.status === 'draft_only') {
        tasks.push(discardDraft('page_home'))
      }
      if (testDoc.status === 'draft_changes' || testDoc.status === 'draft_only') {
        tasks.push(discardDraft('testimonials'))
      }
      if (faqDoc.status === 'draft_changes' || faqDoc.status === 'draft_only') {
        tasks.push(discardDraft('faqs'))
      }
      if (partDoc.status === 'draft_changes' || partDoc.status === 'draft_only') {
        tasks.push(discardDraft('partners'))
      }
      if (tasks.length > 0) {
        await Promise.all(tasks)
      } else {
        resetToRemote()
      }
      showToast('Reverted homepage sections to last published version.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard drafts.', 'error')
    }
  }

  const hero = form.homeData.hero || {
    title: { en: '', ne: '' },
    subtitle: { en: '', ne: '' },
    featuredCourseId: courses[0]?.id || '',
  }

  const valueProps: ValuePillar[] = form.homeData.valueProps || []

  const intro = form.homeData.intro || {
    videoId: 'wK2v3tNnjAA',
    seconds: 120,
    title: { en: '', ne: '' },
    label: { en: '', ne: '' },
    eyebrow: { en: '', ne: '' },
    heading: { en: '', ne: '' },
    body: { en: '', ne: '' },
    stats: [],
    sourceNote: { en: '', ne: '' },
  }

  const coursesHeader = form.homeData.coursesHeader || {
    eyebrow: { en: '', ne: '' },
    title: { en: '', ne: '' },
  }

  const voicesHeader = form.homeData.voicesHeader || {
    eyebrow: { en: '', ne: '' },
    title: { en: '', ne: '' },
  }

  const faqHeader = form.homeData.faqHeader || {
    eyebrow: { en: '', ne: '' },
    title: { en: '', ne: '' },
    prompt: { en: '', ne: '' },
  }

  const partnersHeader = form.homeData.partnersHeader || {
    eyebrow: { en: '', ne: '' },
  }

  const cta = form.homeData.cta || {
    title: { en: '', ne: '' },
    subtitle: { en: '', ne: '' },
  }

  const TABS: { id: HomeSectionTab; label: string; count?: number }[] = [
    { id: 'hero', label: 'Hero & Courses Header' },
    { id: 'pillars', label: 'Value Pillars', count: valueProps.length },
    { id: 'intro', label: '25-Yr Video & Stats', count: intro.stats?.length || 0 },
    { id: 'voices', label: 'Testimonials', count: form.testimonials.length },
    { id: 'faqs', label: 'FAQs', count: form.faqs.length },
    { id: 'partners', label: 'Partners Strip', count: form.partners.length },
    { id: 'cta', label: 'Bottom CTA' },
  ]

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <EditorHeader
        eyebrow="Website Content"
        title="Homepage Sections Editor"
        description="Customize all 8 sections on the Heifer Academy homepage in English and Nepali."
        status={aggregateStatus}
        isDirty={isDirty}
        updatedAt={homeDoc.updatedAt}
        updatedBy={homeDoc.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />

      {/* Section Selector */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-2xl border border-line bg-card p-2 shadow-soft">
        {TABS.map((t) => {
          const active = sectionTab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSectionTab(t.id)}
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

      {/* 1. HERO & COURSES HEADER */}
      {sectionTab === 'hero' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Top Hero Band"
            title="Hero Headline, Subtitle & Featured Course"
            description="Main navy hero banner at the top of the homepage alongside the Featured Course spotlight card."
          >
            <div className="space-y-6">
              <BilingualField
                label="Hero Main Headline"
                multiline
                rows={2}
                value={hero.title}
                disabled={!isEditor}
                onChange={(title) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, hero: { ...hero, title } },
                  }))
                }
              />

              <BilingualField
                label="Hero Supporting Subtitle"
                multiline
                rows={3}
                value={hero.subtitle}
                disabled={!isEditor}
                onChange={(subtitle) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, hero: { ...hero, subtitle } },
                  }))
                }
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Featured Course Spotlight Card (Right Side of Hero)
                </label>
                <select
                  disabled={!isEditor}
                  value={hero.featuredCourseId || courses[0]?.id || ''}
                  onChange={(e) =>
                    updateForm((p) => ({
                      ...p,
                      homeData: {
                        ...p.homeData,
                        hero: { ...hero, featuredCourseId: e.target.value },
                      },
                    }))
                  }
                  className="w-full max-w-lg rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.data.title.en} ({c.data.title.ne})
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-ink-3">
                  Tip: Hero button labels (&ldquo;Explore courses&rdquo;, &ldquo;Watch 2-min overview&rdquo;) can be edited in Bilingual UI Labels.
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Courses Carousel Section"
            title="Courses Section Eyebrow & Heading"
            description="Header shown above the filterable courses carousel on the homepage."
          >
            <div className="space-y-5">
              <BilingualField
                label="Section Eyebrow"
                value={coursesHeader.eyebrow}
                disabled={!isEditor}
                onChange={(eyebrow) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: {
                      ...p.homeData,
                      coursesHeader: { ...coursesHeader, eyebrow },
                    },
                  }))
                }
              />
              <BilingualField
                label="Section Heading"
                value={coursesHeader.title}
                disabled={!isEditor}
                onChange={(title) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: {
                      ...p.homeData,
                      coursesHeader: { ...coursesHeader, title },
                    },
                  }))
                }
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* 2. VALUE PILLARS */}
      {sectionTab === 'pillars' && (
        <SectionCard
          eyebrow="Below Hero Strip"
          title="Three Core Value Pillars"
          description="Highlight strip directly below the hero banner (e.g. Grounded in real farms, Built for thriving livelihoods, Passing on the Gift)."
          actions={
            isEditor ? (
              <button
                type="button"
                onClick={() =>
                  updateForm((p) => ({
                    ...p,
                    homeData: {
                      ...p.homeData,
                      valueProps: [
                        ...valueProps,
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
            {valueProps.map((pillar, idx) => (
              <div
                key={idx}
                className="space-y-4 rounded-xl border border-line bg-canvas p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <span className="text-xs font-bold tracking-wider text-brand uppercase">
                    Value Pillar #{idx + 1}
                  </span>
                  {isEditor && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            homeData: {
                              ...p.homeData,
                              valueProps: moveItem(valueProps, idx, -1),
                            },
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUpIcon size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === valueProps.length - 1}
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            homeData: {
                              ...p.homeData,
                              valueProps: moveItem(valueProps, idx, 1),
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
                          updateForm((p) => ({
                            ...p,
                            homeData: {
                              ...p.homeData,
                              valueProps: valueProps.filter((_, k) => k !== idx),
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

                <div>
                  <label className="mb-2 block text-xs font-bold tracking-wide text-ink uppercase">
                    Icon
                  </label>
                  <PillarIconPicker
                    value={pillar.icon}
                    disabled={!isEditor}
                    onChange={(icon) =>
                      updateForm((p) => ({
                        ...p,
                        homeData: {
                          ...p.homeData,
                          valueProps: valueProps.map((item, k) =>
                            k === idx ? { ...item, icon } : item
                          ),
                        },
                      }))
                    }
                  />
                </div>

                <BilingualField
                  label="Pillar Title"
                  value={pillar.t}
                  disabled={!isEditor}
                  onChange={(t) =>
                    updateForm((p) => ({
                      ...p,
                      homeData: {
                        ...p.homeData,
                        valueProps: valueProps.map((item, k) =>
                          k === idx ? { ...item, t } : item
                        ),
                      },
                    }))
                  }
                />

                <BilingualField
                  label="Pillar Description"
                  multiline
                  rows={2}
                  value={pillar.d}
                  disabled={!isEditor}
                  onChange={(d) =>
                    updateForm((p) => ({
                      ...p,
                      homeData: {
                        ...p.homeData,
                        valueProps: valueProps.map((item, k) =>
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
      )}

      {/* 3. 25-YEAR VIDEO & IMPACT STATS */}
      {sectionTab === 'intro' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Intro Video & Narrative"
            title="25-Year Journey Video & Story"
            description="Video player and story block featured below the Value Pillars."
          >
            <div className="space-y-6">
              <YouTubeField
                label="Overview YouTube Video ID or URL"
                videoId={intro.videoId}
                seconds={intro.seconds}
                disabled={!isEditor}
                onChangeVideoId={(videoId) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, videoId } },
                  }))
                }
                onChangeSeconds={(seconds) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, seconds } },
                  }))
                }
              />

              <BilingualField
                label="Video Player Title"
                value={intro.title}
                disabled={!isEditor}
                onChange={(title) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, title } },
                  }))
                }
              />

              <BilingualField
                label="Video Top-Left Badge Label"
                value={intro.label}
                disabled={!isEditor}
                onChange={(label) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, label } },
                  }))
                }
              />

              <BilingualField
                label="Section Eyebrow"
                value={intro.eyebrow}
                disabled={!isEditor}
                onChange={(eyebrow) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, eyebrow } },
                  }))
                }
              />

              <BilingualField
                label="Section Heading"
                value={intro.heading}
                disabled={!isEditor}
                onChange={(heading) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, heading } },
                  }))
                }
              />

              <BilingualField
                label="Narrative Paragraph"
                multiline
                rows={4}
                value={intro.body}
                disabled={!isEditor}
                onChange={(body) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, body } },
                  }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Impact Metrics"
            title="Key Impact Numbers & Attribution Note"
            description="Metric figures displayed beneath the 25-Year narrative (e.g. 1.7M+ Families, 277 Cooperatives, 29 Districts)."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updateForm((p) => ({
                      ...p,
                      homeData: {
                        ...p.homeData,
                        intro: {
                          ...intro,
                          stats: [
                            ...(intro.stats || []),
                            { v: { en: '', ne: '' }, l: { en: '', ne: '' } },
                          ],
                        },
                      },
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Stat
                </button>
              ) : undefined
            }
          >
            <div className="space-y-5">
              {(intro.stats || []).map((st, idx) => (
                <div
                  key={idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand uppercase">
                      Metric #{idx + 1}
                    </span>
                    {isEditor && (
                      <button
                        type="button"
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            homeData: {
                              ...p.homeData,
                              intro: {
                                ...intro,
                                stats: intro.stats.filter((_, k) => k !== idx),
                              },
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
                    label="Figure / Number (e.g. 1.7M+ / १७ लाख+)"
                    value={st.v}
                    disabled={!isEditor}
                    onChange={(v) =>
                      updateForm((p) => ({
                        ...p,
                        homeData: {
                          ...p.homeData,
                          intro: {
                            ...intro,
                            stats: intro.stats.map((item, k) =>
                              k === idx ? { ...item, v } : item
                            ),
                          },
                        },
                      }))
                    }
                  />
                  <BilingualField
                    label="Metric Caption"
                    value={st.l}
                    disabled={!isEditor}
                    onChange={(l) =>
                      updateForm((p) => ({
                        ...p,
                        homeData: {
                          ...p.homeData,
                          intro: {
                            ...intro,
                            stats: intro.stats.map((item, k) =>
                              k === idx ? { ...item, l } : item
                            ),
                          },
                        },
                      }))
                    }
                  />
                </div>
              ))}

              <BilingualField
                label="Figures Source Footnote"
                value={intro.sourceNote}
                disabled={!isEditor}
                onChange={(sourceNote) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, intro: { ...intro, sourceNote } },
                  }))
                }
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* 4. VOICES FROM THE FIELD (TESTIMONIALS) */}
      {sectionTab === 'voices' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Testimonials Header"
            title="Voices From the Field Heading"
          >
            <div className="space-y-5">
              <BilingualField
                label="Section Eyebrow"
                value={voicesHeader.eyebrow}
                disabled={!isEditor}
                onChange={(eyebrow) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, voicesHeader: { ...voicesHeader, eyebrow } },
                  }))
                }
              />
              <BilingualField
                label="Section Heading"
                value={voicesHeader.title}
                disabled={!isEditor}
                onChange={(title) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, voicesHeader: { ...voicesHeader, title } },
                  }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Community Stories"
            title={`Testimonials (${form.testimonials.length})`}
            description="Quotes from farmers, cooperative leaders, and community facilitators."
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updateForm((p) => ({
                      ...p,
                      testimonials: [
                        ...p.testimonials,
                        {
                          id: `test_${Date.now()}`,
                          name: '',
                          source: 'Heifer International Nepal',
                          role: { en: '', ne: '' },
                          quote: { en: '', ne: '' },
                        },
                      ],
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Testimonial
                </button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {form.testimonials.map((t, idx) => (
                <div
                  key={t.id || idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-5"
                >
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="text-xs font-bold tracking-wider text-brand uppercase">
                      Testimonial #{idx + 1}: {t.name || 'New Story'}
                    </span>
                    {isEditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updateForm((p) => ({
                              ...p,
                              testimonials: moveItem(p.testimonials, idx, -1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.testimonials.length - 1}
                          onClick={() =>
                            updateForm((p) => ({
                              ...p,
                              testimonials: moveItem(p.testimonials, idx, 1),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateForm((p) => ({
                              ...p,
                              testimonials: p.testimonials.filter((_, k) => k !== idx),
                            }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Person Name
                      </label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={t.name}
                        placeholder="e.g. Gita Kumari Chaudhary"
                        onChange={(e) =>
                          updateForm((p) => ({
                            ...p,
                            testimonials: p.testimonials.map((item, k) =>
                              k === idx ? { ...item, name: e.target.value } : item
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Source Attribution
                      </label>
                      <input
                        type="text"
                        disabled={!isEditor}
                        value={t.source}
                        placeholder="e.g. Heifer Nepal Annual Report"
                        onChange={(e) =>
                          updateForm((p) => ({
                            ...p,
                            testimonials: p.testimonials.map((item, k) =>
                              k === idx ? { ...item, source: e.target.value } : item
                            ),
                          }))
                        }
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                      />
                    </div>
                  </div>

                  <BilingualField
                    label="Role & Location"
                    value={t.role}
                    disabled={!isEditor}
                    onChange={(role) =>
                      updateForm((p) => ({
                        ...p,
                        testimonials: p.testimonials.map((item, k) =>
                          k === idx ? { ...item, role } : item
                        ),
                      }))
                    }
                  />

                  <BilingualField
                    label="Quote"
                    multiline
                    rows={3}
                    value={t.quote}
                    disabled={!isEditor}
                    onChange={(quote) =>
                      updateForm((p) => ({
                        ...p,
                        testimonials: p.testimonials.map((item, k) =>
                          k === idx ? { ...item, quote } : item
                        ),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* 5. FAQS */}
      {sectionTab === 'faqs' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="FAQ Section Header"
            title="FAQ Eyebrow, Heading & Intro Paragraph"
          >
            <div className="space-y-5">
              <BilingualField
                label="Section Eyebrow"
                value={faqHeader.eyebrow}
                disabled={!isEditor}
                onChange={(eyebrow) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, faqHeader: { ...faqHeader, eyebrow } },
                  }))
                }
              />
              <BilingualField
                label="Section Heading"
                value={faqHeader.title}
                disabled={!isEditor}
                onChange={(title) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, faqHeader: { ...faqHeader, title } },
                  }))
                }
              />
              <BilingualField
                label="Left Column Intro Paragraph"
                multiline
                rows={2}
                value={faqHeader.prompt}
                disabled={!isEditor}
                onChange={(prompt) =>
                  updateForm((p) => ({
                    ...p,
                    homeData: { ...p.homeData, faqHeader: { ...faqHeader, prompt } },
                  }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            eyebrow="Accordion Items"
            title={`Frequently Asked Questions (${form.faqs.length})`}
            actions={
              isEditor ? (
                <button
                  type="button"
                  onClick={() =>
                    updateForm((p) => ({
                      ...p,
                      faqs: [
                        ...p.faqs,
                        { id: `faq_${Date.now()}`, q: { en: '', ne: '' }, a: { en: '', ne: '' } },
                      ],
                    }))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={14} />
                  Add Question
                </button>
              ) : undefined
            }
          >
            <div className="space-y-4">
              {form.faqs.map((f, idx) => (
                <div
                  key={f.id || idx}
                  className="space-y-4 rounded-xl border border-line bg-canvas p-5"
                >
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="text-xs font-bold tracking-wider text-brand uppercase">
                      Question #{idx + 1}
                    </span>
                    {isEditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() =>
                            updateForm((p) => ({ ...p, faqs: moveItem(p.faqs, idx, -1) }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowUpIcon size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.faqs.length - 1}
                          onClick={() =>
                            updateForm((p) => ({ ...p, faqs: moveItem(p.faqs, idx, 1) }))
                          }
                          className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                        >
                          <ArrowDownIcon size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateForm((p) => ({
                              ...p,
                              faqs: p.faqs.filter((_, k) => k !== idx),
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
                    label="Question"
                    value={f.q}
                    disabled={!isEditor}
                    onChange={(q) =>
                      updateForm((p) => ({
                        ...p,
                        faqs: p.faqs.map((item, k) => (k === idx ? { ...item, q } : item)),
                      }))
                    }
                  />

                  <BilingualField
                    label="Answer"
                    multiline
                    rows={3}
                    value={f.a}
                    disabled={!isEditor}
                    onChange={(a) =>
                      updateForm((p) => ({
                        ...p,
                        faqs: p.faqs.map((item, k) => (k === idx ? { ...item, a } : item)),
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* 6. PARTNERS MARQUEE */}
      {sectionTab === 'partners' && (
        <div className="space-y-6">
          <SectionCard
            eyebrow="Partners Strip Header"
            title="Partners Section Eyebrow"
          >
            <BilingualField
              label="Eyebrow Label"
              value={partnersHeader.eyebrow}
              disabled={!isEditor}
              onChange={(eyebrow) =>
                updateForm((p) => ({
                  ...p,
                  homeData: { ...p.homeData, partnersHeader: { eyebrow } },
                }))
              }
            />
          </SectionCard>

          <SectionCard
            eyebrow="Scrolling Marquee"
            title={`Partner Organizations (${form.partners.length})`}
            description="Organizations displayed in the continuous partner marquee strip above the bottom CTA."
          >
            {isEditor && (
              <div className="mb-5 flex flex-col gap-2.5 sm:flex-row">
                <input
                  type="text"
                  value={newPartner}
                  onChange={(e) => setNewPartner(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPartner.trim()) {
                      e.preventDefault()
                      updateForm((p) => ({
                        ...p,
                        partners: [...p.partners, newPartner.trim()],
                      }))
                      setNewPartner('')
                    }
                  }}
                  placeholder="Enter partner organization name (e.g. SEWA Cooperative Network)..."
                  className="flex-1 rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPartner.trim()) return
                    updateForm((p) => ({
                      ...p,
                      partners: [...p.partners, newPartner.trim()],
                    }))
                    setNewPartner('')
                  }}
                  className="inline-flex h-10.5 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary-900 px-5 text-xs font-bold text-white hover:bg-primary-700"
                >
                  <PlusIcon size={15} />
                  Add Partner
                </button>
              </div>
            )}

            <div className="space-y-2.5">
              {form.partners.map((partner, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 rounded-xl border border-line bg-canvas p-2.5"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-extrabold text-brand">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    disabled={!isEditor}
                    value={partner}
                    onChange={(e) =>
                      updateForm((p) => ({
                        ...p,
                        partners: p.partners.map((x, k) => (k === idx ? e.target.value : x)),
                      }))
                    }
                    className="flex-1 rounded-lg border border-transparent bg-transparent px-2.5 py-1.5 text-sm font-medium text-ink focus:border-primary-700 focus:bg-card focus:outline-none"
                  />
                  {isEditor && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            partners: moveItem(p.partners, idx, -1),
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowUpIcon size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === form.partners.length - 1}
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            partners: moveItem(p.partners, idx, 1),
                          }))
                        }
                        className="rounded-lg border border-line bg-card p-1.5 text-ink-2 hover:text-ink disabled:opacity-30"
                      >
                        <ArrowDownIcon size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateForm((p) => ({
                            ...p,
                            partners: p.partners.filter((_, k) => k !== idx),
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
        </div>
      )}

      {/* 7. BOTTOM CTA */}
      {sectionTab === 'cta' && (
        <SectionCard
          eyebrow="Closing Banner"
          title="Bottom Call-to-Action Band"
          description="Deep Heifer Navy closing section above the website footer encouraging visitors to start learning."
        >
          <div className="space-y-6">
            <BilingualField
              label="CTA Heading"
              multiline
              rows={2}
              value={cta.title}
              disabled={!isEditor}
              onChange={(title) =>
                updateForm((p) => ({
                  ...p,
                  homeData: { ...p.homeData, cta: { ...cta, title } },
                }))
              }
            />
            <BilingualField
              label="CTA Supporting Text"
              multiline
              rows={3}
              value={cta.subtitle}
              disabled={!isEditor}
              onChange={(subtitle) =>
                updateForm((p) => ({
                  ...p,
                  homeData: { ...p.homeData, cta: { ...cta, subtitle } },
                }))
              }
            />
          </div>
        </SectionCard>
      )}
    </div>
  )
}
