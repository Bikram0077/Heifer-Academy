import { useMemo, useState } from 'react'
import { useCms } from '../context/CmsContext'
import { useAuth } from '../context/AuthContext'
import type { Bi } from '@shared/schema'
import { ui as rawDefaultUi } from '@siteData'
import {
  BilingualField,
  EditorHeader,
  ToastBanner,
  useSyncedFormState,
  useToast,
} from '../components/CmsUi'
import { SearchIcon, UndoIcon } from '../components/icons'

const defaultUi: Record<string, Bi> = rawDefaultUi

type StringGroup =
  | 'all'
  | 'nav'
  | 'home'
  | 'materials'
  | 'player'
  | 'a11y_footer'
  | 'survey'

const GROUP_MAP: Record<Exclude<StringGroup, 'all'>, string[]> = {
  nav: [
    'skipToContent',
    'home',
    'explore',
    'allCourses',
    'resources',
    'about',
    'faq',
    'feedback',
    'startLearning',
    'browseTopics',
    'menu',
    'close',
    'language',
  ],
  home: [
    'heroTitle',
    'heroSub',
    'featured',
    'multiLang',
    'exploreCourses',
    'previous',
    'next',
    'v1t',
    'v1d',
    'v2t',
    'v2d',
    'v3t',
    'v3d',
    'introEyebrow',
    'introTitle',
    'introBody',
    'statHouseholds',
    'statCoops',
    'statYears',
    'statSource',
    'exploreTitle',
    'exploreSub',
    'viewCourse',
    'viewAll',
    'lessons',
    'modules',
    'videos',
    'voicesEyebrow',
    'voicesTitle',
    'faqEyebrow',
    'faqTitle',
    'faqPrompt',
    'partnersTitle',
    'ctaTitle',
    'ctaSub',
    'exploreHeading',
    'exploreIntro',
    'search',
    'results',
    'noResults',
    'clear',
    'pageNotFound',
    'pageNotFoundSub',
  ],
  materials: [
    'materialsEyebrow',
    'materialsTitle',
    'viewAllMaterials',
    'courseMaterials',
    'courseMaterialsSub',
    'tabMaterials',
    'openResource',
    'lessonNotes',
    'searchResources',
    'allFormats',
    'noMaterials',
  ],
  player: [
    'startCourse',
    'continueCourse',
    'reviewCourse',
    'selfPaced',
    'languageLabel',
    'languageValue',
    'format',
    'formatValue',
    'requirements',
    'requirementsValue',
    'levelLabel',
    'instructorLabel',
    'whatLearn',
    'courseOutline',
    'includes',
    'incVideos',
    'incChecklists',
    'incGlossary',
    'incFacilitator',
    'developedWith',
    'developedByDesc',
    'related',
    'watchPreview',
    'expandAll',
    'collapseAll',
    'module',
    'completedLabel',
    'complete',
    'courseContent',
    'tabOverview',
    'tabDiscussion',
    'tabGlossary',
    'meaning',
    'markDone',
    'done',
    'prevLesson',
    'nextLesson',
    'upNext',
    'playingIn',
    'playNow',
    'cancel',
    'replay',
    'play',
    'fullscreen',
    'exitFullscreen',
    'theater',
    'defaultView',
    'summary',
    'actions',
    'forFacilitators',
    'discussIntro',
    'notesLabel',
    'notesHint',
    'notesPlaceholder',
    'backToCourse',
    'lessonOf',
    'of',
    'courseDone',
    'courseDoneSub',
    'browseMore',
    'source',
    'noLessonsYet',
  ],
  a11y_footer: [
    'a11y',
    'highContrast',
    'darkMode',
    'increaseFont',
    'originalFont',
    'decreaseFont',
    'readingLine',
    'tts',
    'ttsStop',
    'reset',
    'initiativeOf',
    'footerTagline',
    'footerSub',
    'learn',
    'organisation',
    'support',
    'heiferNepal',
    'cornerstonesLink',
    'contact',
    'address',
    'privacy',
    'terms',
    'accessibilityStatement',
    'copyright',
    'footerMadeFor',
  ],
  survey: [
    'pulseTitle',
    'optional',
    'pulseSub',
    'district',
    'selectDistrict',
    'role',
    'selectRole',
    'gender',
    'submit',
    'skip',
    'thanks',
    'continue',
  ],
}

const KNOWN_GROUP_KEYS = new Set(Object.values(GROUP_MAP).flat())

const GROUPS: { id: StringGroup; label: string }[] = [
  { id: 'all', label: 'All Labels' },
  { id: 'nav', label: 'Header & Navigation' },
  { id: 'home', label: 'Homepage & Catalog' },
  { id: 'materials', label: 'Materials & Handouts' },
  { id: 'player', label: 'Course & Lesson Player' },
  { id: 'a11y_footer', label: 'Accessibility & Footer' },
  { id: 'survey', label: 'Learner Survey' },
]

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (c) => c.toUpperCase())
}

export function UIStringsPage() {
  const { getUiStrings, saveDraft, saveAndPublish, discardDraft, saving, publishing } =
    useCms()
  const { isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const uiDoc = getUiStrings()
  const versionKey = `${uiDoc.updatedAt}:${uiDoc.status}`

  const [strings, updateStrings, { isDirty, markClean, resetToRemote }] =
    useSyncedFormState<Record<string, Bi>>(uiDoc.data, 'ui_strings', versionKey)

  const [group, setGroup] = useState<StringGroup>('all')
  const [search, setSearch] = useState('')
  const [modifiedOnly, setModifiedOnly] = useState(false)

  const allKeys = useMemo(() => {
    const merged = new Set([...Object.keys(defaultUi), ...Object.keys(strings)])
    return Array.from(merged)
  }, [strings])

  const isKeyModified = (k: string): boolean => {
    const cur = strings[k]
    const def = defaultUi[k]
    if (!def) return true
    if (!cur) return false
    return cur.en !== def.en || cur.ne !== def.ne
  }

  const filteredKeys = allKeys.filter((k) => {
    if (group !== 'all') {
      const allowed = GROUP_MAP[group] || []
      const isUncategorizedInHome = group === 'home' && !KNOWN_GROUP_KEYS.has(k)
      if (!allowed.includes(k) && !isUncategorizedInHome) return false
    }
    if (modifiedOnly && !isKeyModified(k)) return false
    const q = search.trim().toLowerCase()
    if (!q) return true
    const val = strings[k] || defaultUi[k] || { en: '', ne: '' }
    return (
      k.toLowerCase().includes(q) ||
      val.en.toLowerCase().includes(q) ||
      val.ne.includes(q)
    )
  })

  const modifiedCount = allKeys.filter(isKeyModified).length

  const handleSaveDraft = async () => {
    try {
      await saveDraft('strings', 'strings', strings, 0)
      markClean()
      showToast('UI translations saved as draft.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to save translations.', 'error')
    }
  }

  const handlePublish = async () => {
    try {
      await saveAndPublish('strings', 'strings', strings, 0)
      markClean()
      showToast('UI translations published live to the website.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to publish translations.', 'error')
    }
  }

  const handleDiscard = async () => {
    try {
      if (uiDoc.status === 'draft_changes' || uiDoc.status === 'draft_only') {
        markClean()
        await discardDraft('strings')
      } else {
        resetToRemote()
      }
      showToast('Reverted UI translations to last published state.', 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to discard changes.', 'error')
    }
  }

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <EditorHeader
        eyebrow="Website Content"
        title={`Bilingual UI Labels (${allKeys.length})`}
        description="Edit every button label, navigation item, video player control, accessibility toggle, and footer string across English and नेपाली."
        status={uiDoc.status}
        isDirty={isDirty}
        updatedAt={uiDoc.updatedAt}
        updatedBy={uiDoc.updatedByLabel}
        canEdit={isEditor}
        saving={saving}
        publishing={publishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onDiscard={handleDiscard}
      />

      {/* Category Pills & Search */}
      <div className="space-y-3 rounded-2xl border border-line bg-card p-4 shadow-soft">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {GROUPS.map((g) => {
            const active = group === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                className={`h-9 shrink-0 rounded-xl px-3.5 text-xs font-bold transition ${
                  active
                    ? 'bg-primary-900 text-white shadow-soft'
                    : 'bg-subtle text-ink-2 hover:text-ink'
                }`}
              >
                {g.label}
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <SearchIcon
              size={17}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by key, English text, or नेपाली translation..."
              className="h-10 w-full rounded-xl border border-line-strong bg-canvas pr-4 pl-10 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:bg-card focus:ring-4 focus:ring-primary-100 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setModifiedOnly((v) => !v)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition ${
              modifiedOnly
                ? 'border-accent-500 bg-accent-100 text-ochre'
                : 'border-line-strong bg-card text-ink-2 hover:text-ink'
            }`}
          >
            <span>Customized Only ({modifiedCount})</span>
          </button>
        </div>
      </div>

      {/* String Entries */}
      <div className="space-y-3">
        {filteredKeys.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-12 text-center text-sm text-ink-3">
            No UI translation keys match your current filter.
          </div>
        ) : (
          filteredKeys.map((key) => {
            const val = strings[key] || defaultUi[key] || { en: '', ne: '' }
            const modified = isKeyModified(key)
            const isLong = val.en.length > 75 || val.ne.length > 75

            return (
              <div
                key={key}
                className="rounded-2xl border border-line bg-card p-5 shadow-soft"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-sm font-bold text-ink">{humanizeKey(key)}</span>
                    <code className="rounded bg-subtle px-2 py-0.5 text-xs text-ink-2">
                      ui.{key}
                    </code>
                    {modified && (
                      <span className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[0.68rem] font-bold text-ochre">
                        Customized
                      </span>
                    )}
                  </div>

                  {isEditor && modified && defaultUi[key] && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStrings((prev) => ({
                          ...prev,
                          [key]: { ...defaultUi[key] },
                        }))
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 hover:text-brand"
                    >
                      <UndoIcon size={12} />
                      Reset to default
                    </button>
                  )}
                </div>

                <BilingualField
                  value={val}
                  multiline={isLong}
                  rows={2}
                  disabled={!isEditor}
                  compact
                  onChange={(nextVal) =>
                    updateStrings((prev) => ({
                      ...prev,
                      [key]: nextVal,
                    }))
                  }
                />
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
