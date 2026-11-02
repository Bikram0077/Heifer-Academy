import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { extractYouTubeId, isExternalHttpUrl, sanitizeHref } from '@shared/url'
import { clock, lessonsOf, num, type Course, type CourseMaterial, type Lang } from '../data'
import { go, useApp, useStored } from '../lib'
import { useContent } from '../content'
import { Container } from '../components/Layout'
import { VideoPlayer } from '../components/VideoPlayer'
import { formatLabel } from './Resources'
import {
  ArrowLeft, ArrowRight, ChatIcon, CheckCircle, CheckIcon, ChevronDown, ChevronLeft, ChevronRight, DownloadIcon, ExternalIcon, FileTextIcon, ListIcon, PlayIcon, QuoteIcon, ReplayIcon,
} from '../components/icons'

type Tab = 'overview' | 'materials' | 'discussion' | 'glossary' | 'content'

export function Learn({ course, n }: { course: Course; n: number }) {
  const { lang, progress, setLesson } = useApp()
  const { ui, resourcesData } = useContent()
  const lessons = lessonsOf(course)
  const index = lessons.length > 0 ? Math.min(Math.max(0, n), lessons.length - 1) : 0
  const lesson = lessons[index]
  const doneIds = progress[course.id] ?? []
  const isDone = lesson ? doneIds.includes(lesson.id) : false
  const doneCount = lessons.filter((l) => doneIds.includes(l.id)).length
  const pct = lessons.length > 0 ? Math.round((doneCount / lessons.length) * 100) : 0
  const prev = index > 0 ? index - 1 : null
  const next = index < lessons.length - 1 ? index + 1 : null
  const other: Lang = lang === 'en' ? 'ne' : 'en'

  const courseMaterials = useMemo<CourseMaterial[]>(() => {
    const list: CourseMaterial[] = [...(course.materials || [])]
    const seen = new Set(list.map((m) => m.id))
      ; (resourcesData.items || []).forEach((item) => {
        if (item.courseId === course.id && !seen.has(item.id)) {
          seen.add(item.id)
          list.push({
            id: item.id,
            title: item.title,
            description: item.description,
            format: item.format,
            url: item.url,
            meta: item.meta,
          })
        }
      })
    return list
  }, [course.id, course.materials, resourcesData.items])

  const [tab, setTab] = useState<Tab>('overview')
  const [theater, setTheater] = useStored('ha-theater', false)
  const [ended, setEnded] = useState(false)
  const autoRef = useRef(false)
  const autoStart = autoRef.current

  useEffect(() => {
    window.scrollTo({ top: 0 })
    setEnded(false)
    autoRef.current = false
  }, [course.id, index])

  if (!lesson) {
    return (
      <Container className="py-16 text-center">
        <p className="text-lg font-semibold text-ink">{course.title[lang]}</p>
        <p className="mt-2 text-sm text-ink-2">
          {ui.noLessonsYet?.[lang] ||
            (lang === 'en'
              ? 'No video lessons have been published in this course yet.'
              : 'यस पाठ्यक्रममा अझै कुनै भिडियो पाठ राखिएको छैन।')}
        </p>
        <a href={`#/course/${course.id}`} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-6 text-sm font-semibold text-white hover:bg-primary-700">
          <ArrowLeft size={16} /> {ui.backToCourse[lang]}
        </a>
      </Container>
    )
  }

  const goLesson = (i: number, autoplay = false) => {
    autoRef.current = autoplay
    go(`/learn/${course.id}/${i}`)
  }

  const onEnded = () => {
    setLesson(course.id, lesson.id, true)
    setEnded(true)
  }

  const overlay = ended ? (
    next !== null ? (
      <UpNext lang={lang} title={lessons[next].title[lang]} videoId={lessons[next].id} onPlay={() => goLesson(next, true)} onCancel={() => setEnded(false)} />
    ) : (
      <div className="absolute inset-0 z-10 flex animate-fade flex-col items-center justify-center bg-black/85 p-6 text-center">
        <CheckCircle size={52} className="text-primary-500" />
        <p className="mt-4 text-xl font-semibold md:text-2xl">{ui.courseDone[lang]}</p>
        <p className="ne-relaxed mt-2 max-w-md text-sm text-white/75 md:text-base">{ui.courseDoneSub[lang]}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => goLesson(0, true)} className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold hover:bg-white/10"><ReplayIcon size={16} /> {ui.replay[lang]}</button>
          <a href="#/courses" className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0d416b]">{ui.browseMore[lang]} <ArrowRight size={16} /></a>
        </div>
      </div>
    )
  ) : null

  const lessonNoteText = lesson.notes?.[lang]?.trim() || ''
  const rawHandoutUrl = lesson.materialUrl?.trim() || ''
  const lessonHandoutUrl = rawHandoutUrl ? sanitizeHref(rawHandoutUrl, '') : ''
  const lessonHandoutExternal = isExternalHttpUrl(lessonHandoutUrl)
  const lessonHandoutLabel =
    lesson.materialLabel?.[lang]?.trim() ||
    lesson.materialLabel?.en?.trim() ||
    ui.openResource?.[lang] ||
    (lang === 'en' ? 'Open lesson handout' : 'पाठ सामग्री खोल्नुहोस्')

  return (
    <div className="pb-24 lg:pb-16">
      {/* Course bar */}
      <div className="border-b border-line bg-card">
        <Container className="flex h-14 items-center gap-4">
          <a href={`#/course/${course.id}`} className="inline-flex shrink-0 items-center gap-2 rounded-md text-sm font-medium text-ink-2 hover:text-brand">
            <ArrowLeft size={18} /> <span className="hidden sm:inline">{ui.backToCourse[lang]}</span>
          </a>
          <span className="h-6 w-px bg-line" aria-hidden />
          <p className="min-w-0 flex-1 truncate font-semibold text-ink">{course.title[lang]}</p>
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <div className="h-2 w-32 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-medium text-ink-2 tabular-nums">{num(pct, lang)}%</span>
          </div>
        </Container>
      </div>

      <Container className={`grid gap-8 pt-0 md:pt-8 ${theater ? '' : 'lg:grid-cols-[minmax(0,1fr)_23rem]'}`}>
        <div className="min-w-0">
          <div className="sticky top-16 z-30 -mx-5 overflow-hidden md:static md:mx-0 md:rounded-lg">
            <VideoPlayer
              key={lesson.id}
              videoId={lesson.id}
              seconds={lesson.seconds}
              title={lesson.title[lang]}
              label={`${ui.lessonOf[lang]} ${num(index + 1, lang)}`}
              autoStart={autoStart}
              onEnded={onEnded}
              overlay={overlay}
              theater={theater}
              onTheater={() => setTheater(!theater)}
              rounded={false}
            />
          </div>

          {/* Lesson header */}
          <div className="mt-6">
            <p className="text-xs font-bold tracking-[0.12em] text-ochre uppercase">
              {ui.module[lang]} {num(lesson.module + 1, lang)} · {course.modules[lesson.module].title[lang]}
            </p>
            <div className="mt-2 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl leading-tight font-bold tracking-[-0.01em] text-ink md:text-[1.75rem]">{lesson.title[lang]}</h1>
                <p className="mt-1 text-ink-2">{lesson.title[other]}</p>
              </div>
              <button
                type="button"
                aria-pressed={isDone}
                onClick={() => setLesson(course.id, lesson.id, !isDone)}
                className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors ${isDone ? 'border-primary-700/40 bg-primary-100 text-brand' : 'border-line-strong bg-card text-ink hover:border-primary-700 hover:text-brand'
                  }`}
              >
                {isDone ? <CheckCircle size={20} className="text-primary-700" /> : <span className="size-5 rounded-full border-2 border-line-strong" aria-hidden />}
                {isDone ? ui.done[lang] : ui.markDone[lang]}
              </button>
            </div>

            {(lessonNoteText || lessonHandoutUrl) && (
              <div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-line bg-subtle/60 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-bold tracking-[0.1em] text-ochre uppercase">
                    {ui.lessonNotes?.[lang] || (lang === 'en' ? 'Lesson note' : 'पाठ टिपोट')}
                  </p>
                  {lessonNoteText && <p className="ne-relaxed mt-1 text-sm leading-relaxed text-ink">{lessonNoteText}</p>}
                </div>
                {lessonHandoutUrl && (
                  <a
                    href={lessonHandoutUrl}
                    target={lessonHandoutExternal ? '_blank' : undefined}
                    rel={lessonHandoutExternal ? 'noopener noreferrer' : undefined}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-primary-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    <DownloadIcon size={14} />
                    <span>{lessonHandoutLabel}</span>
                    {lessonHandoutExternal && <ExternalIcon size={12} />}
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 hidden grid-cols-2 gap-3 border-y border-line py-4 md:grid">
              <LessonNav dir="prev" lang={lang} disabled={prev === null} title={prev !== null ? lessons[prev].title[lang] : ''} onClick={() => prev !== null && goLesson(prev)} />
              <LessonNav dir="next" lang={lang} disabled={next === null} title={next !== null ? lessons[next].title[lang] : ''} onClick={() => next !== null && goLesson(next)} />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <Tabs lang={lang} tab={tab} setTab={setTab} showContent={!theater} materialsCount={courseMaterials.length} />
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="pt-8">
              {tab === 'overview' && <Overview course={course} lessonId={lesson.id} lang={lang} />}
              {tab === 'materials' && <CourseMaterialsPanel materials={courseMaterials} lang={lang} />}
              {tab === 'discussion' && <Discussion course={course} lessonId={lesson.id} lang={lang} />}
              {tab === 'glossary' && <Glossary course={course} lang={lang} />}
              {tab === 'content' && <ContentList course={course} current={index} onPick={(i) => goLesson(i)} />}
            </div>
            <p className="mt-10 text-xs text-ink-2">{ui.source[lang]}</p>
          </div>
        </div>

        {!theater && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-line bg-card">
              <div className="border-b border-line p-5">
                <p className="font-semibold text-ink">{ui.courseContent[lang]}</p>
                <p className="mt-1 text-sm text-ink-2">{num(doneCount, lang)}/{num(lessons.length, lang)} {ui.lessons[lang]} · {num(pct, lang)}% {ui.complete[lang]}</p>
              </div>
              <div className="max-h-[calc(100vh-13rem)] overflow-y-auto">
                <ContentList course={course} current={index} onPick={(i) => goLesson(i)} compact />
              </div>
            </div>
          </aside>
        )}
      </Container>

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setTab('content'); document.getElementById('tab-content')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} aria-label={ui.courseContent[lang]} className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink">
            <ListIcon size={20} />
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[0.7rem] font-semibold text-white">{num(doneCount, lang)}</span>
          </button>
          <button type="button" disabled={prev === null} onClick={() => prev !== null && goLesson(prev)} aria-label={ui.prevLesson[lang]} className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong text-ink disabled:opacity-40">
            <ChevronLeft size={20} />
          </button>
          {next !== null ? (
            <button type="button" onClick={() => goLesson(next)} className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-900 font-semibold text-white active:bg-primary-700">
              {ui.nextLesson[lang]} <ChevronRight size={18} />
            </button>
          ) : (
            <a href="#/courses" className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary-900 font-semibold text-white">{ui.browseMore[lang]}</a>
          )}
        </div>
      </div>
    </div>
  )
}

function UpNext({ lang, title, videoId, onPlay, onCancel }: { lang: Lang; title: string; videoId: string; onPlay: () => void; onCancel: () => void }) {
  const { ui } = useContent()
  const [left, setLeft] = useState(8)
  const playRef = useRef(onPlay)
  playRef.current = onPlay
  useEffect(() => {
    if (left <= 0) { playRef.current(); return }
    const t = setTimeout(() => setLeft((x) => x - 1), 1000)
    return () => clearTimeout(t)
  }, [left])
  return (
    <div className="absolute inset-0 z-10 flex animate-fade items-center justify-center bg-black/85 p-4">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-xs font-semibold tracking-[0.12em] text-white/70 uppercase">{ui.upNext[lang]}</p>
        {extractYouTubeId(videoId) && (
          <div className="mt-3 hidden w-48 overflow-hidden rounded-md sm:block"><img src={`https://i.ytimg.com/vi/${extractYouTubeId(videoId)}/mqdefault.jpg`} alt="" className="aspect-video w-full object-cover" /></div>
        )}
        <p className="mt-3 line-clamp-2 text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-white/70" aria-live="polite">{ui.playingIn[lang]} {num(left, lang)}s</p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="h-10 rounded-full border border-white/30 px-5 text-sm font-semibold hover:bg-white/10">{ui.cancel[lang]}</button>
          <button type="button" onClick={onPlay} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#0d416b]"><PlayIcon size={14} /> {ui.playNow[lang]}</button>
        </div>
      </div>
    </div>
  )
}

function LessonNav({ dir, lang, title, disabled, onClick }: { dir: 'prev' | 'next'; lang: Lang; title: string; disabled: boolean; onClick: () => void }) {
  const { ui } = useContent()
  const isNext = dir === 'next'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-subtle disabled:invisible ${isNext ? 'flex-row-reverse text-right' : 'text-left'}`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isNext ? 'bg-primary-900 text-white group-hover:bg-primary-700' : 'border border-line-strong text-ink'}`}>
        {isNext ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold tracking-[0.1em] text-ink-2 uppercase">{isNext ? ui.nextLesson[lang] : ui.prevLesson[lang]}</span>
        <span className="mt-0.5 hidden truncate text-sm font-medium text-ink sm:block">{title}</span>
      </span>
    </button>
  )
}

function Tabs({
  lang,
  tab,
  setTab,
  showContent,
  materialsCount,
}: {
  lang: Lang
  tab: Tab
  setTab: (t: Tab) => void
  showContent: boolean
  materialsCount: number
}) {
  const { ui } = useContent()
  const tabs: { id: Tab; label: string; mobileOnly?: boolean }[] = [
    { id: 'overview', label: ui.tabOverview[lang] },
    ...(materialsCount > 0
      ? [{ id: 'materials' as Tab, label: `${ui.tabMaterials?.[lang] || (lang === 'en' ? 'Materials' : 'सामग्री')} (${num(materialsCount, lang)})` }]
      : []),
    { id: 'discussion', label: ui.tabDiscussion[lang] },
    { id: 'glossary', label: ui.tabGlossary[lang] },
    { id: 'content', label: ui.courseContent[lang], mobileOnly: showContent },
  ]
  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const t = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length].id
    setTab(t)
    document.getElementById(`tab-${t}`)?.focus()
  }
  return (
    <div role="tablist" aria-label="Lesson notes" className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t, i) => {
        const active = tab === t.id
        return (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active}
            aria-controls={`panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={`relative h-12 shrink-0 px-4 text-[0.95rem] font-semibold whitespace-nowrap transition-colors ${t.mobileOnly ? 'lg:hidden' : ''} ${active ? 'text-brand' : 'text-ink-2 hover:text-ink'}`}
          >
            {t.label}
            {active && <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-t-full bg-primary-900 dark:bg-[#8cc4ec]" aria-hidden />}
          </button>
        )
      })}
    </div>
  )
}

function CourseMaterialsPanel({ materials, lang }: { materials: CourseMaterial[]; lang: Lang }) {
  const { ui } = useContent()
  if (!materials.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {materials.map((mat) => {
        const detailHref = `#/material/${encodeURIComponent(mat.id)}`
        const safeExtUrl = mat.url ? sanitizeHref(mat.url, '') : ''
        const hasExt = Boolean(safeExtUrl) && isExternalHttpUrl(safeExtUrl)
        return (
          <div key={mat.id} className="flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-soft transition-colors hover:border-line-strong">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-brand">
                  <FileTextIcon size={13} />
                  {formatLabel(mat.format, lang)}
                </span>
                {mat.meta?.[lang] && <span className="text-xs text-ink-3">{mat.meta[lang]}</span>}
              </div>
              <h3 className="mt-3 font-semibold text-ink">
                <a href={detailHref} className="hover:text-brand">
                  {mat.title[lang] || mat.title.en}
                </a>
              </h3>
              {mat.description?.[lang] && (
                <p className="ne-relaxed mt-1.5 text-sm leading-relaxed text-ink-2">{mat.description[lang]}</p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <a
                href={detailHref}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <span>{ui.openResource?.[lang] || (lang === 'en' ? 'Open resource' : 'सामग्री खोल्नुहोस्')}</span>
                <ArrowRight size={15} />
              </a>
              {hasExt && (
                <a
                  href={safeExtUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-ink-2 hover:text-brand"
                >
                  <DownloadIcon size={14} />
                  <span>{ui.downloadExternal?.[lang] || 'File'}</span>
                  <ExternalIcon size={12} />
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ContentList({ course, current, onPick, compact = false }: { course: Course; current: number; onPick: (i: number) => void; compact?: boolean }) {
  const { lang, progress } = useApp()
  const { ui } = useContent()
  const doneIds = progress[course.id] ?? []
  const lessons = lessonsOf(course)
  const curModule = lessons[current]?.module ?? 0
  const [open, setOpen] = useState<boolean[]>(() => course.modules.map((_, i) => i === curModule))
  useEffect(() => {
    setOpen((prev) =>
      course.modules.map((_, i) => (prev[i] ?? false) || i === curModule)
    )
  }, [curModule, course.modules.length])

  return (
    <div className={compact ? 'divide-y divide-line' : 'divide-y divide-line overflow-hidden rounded-xl border border-line bg-card'}>
      {course.modules.map((m, mi) => {
        const start = course.modules.slice(0, mi).reduce((s, x) => s + x.lessons.length, 0)
        const mDone = m.lessons.filter((l) => doneIds.includes(l.id)).length
        return (
          <div key={mi}>
            <button type="button" aria-expanded={open[mi]} onClick={() => setOpen(open.map((v, k) => (k === mi ? !v : v)))} className="flex w-full items-center gap-3 bg-subtle/50 px-5 py-4 text-left hover:bg-subtle">
              <span className="min-w-0 flex-1">
                <span className="block text-[0.7rem] font-semibold tracking-[0.1em] text-ink-2 uppercase">{ui.module[lang]} {num(mi + 1, lang)} · {num(mDone, lang)}/{num(m.lessons.length, lang)}</span>
                <span className="mt-0.5 block text-[0.95rem] font-semibold text-ink">{m.title[lang]}</span>
              </span>
              <ChevronDown size={18} className={`shrink-0 text-ink-2 transition-transform ${open[mi] ? 'rotate-180' : ''}`} />
            </button>
            {open[mi] && (
              <ol>
                {m.lessons.map((l, li) => {
                  const i = start + li
                  const active = i === current
                  const done = doneIds.includes(l.id)
                  return (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => onPick(i)}
                        aria-current={active ? 'step' : undefined}
                        className={`flex w-full items-start gap-3 border-l-[3px] px-5 py-3.5 text-left transition-colors ${active ? 'border-primary-700 bg-primary-100' : 'border-transparent hover:bg-subtle/60'}`}
                      >
                        {done ? <CheckCircle size={20} className="mt-0.5 shrink-0 text-primary-700" /> : <span className={`mt-0.5 size-5 shrink-0 rounded-full border-2 ${active ? 'border-primary-700' : 'border-line-strong'}`} />}
                        <span className="min-w-0 flex-1">
                          <span className={`block text-sm leading-snug ${active ? 'font-semibold text-brand' : 'font-medium text-ink'}`}>{num(i + 1, lang)}. {l.title[lang]}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-2"><PlayIcon size={10} /> {clock(l.seconds, lang)}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Overview({ course, lessonId, lang }: { course: Course; lessonId: string; lang: Lang }) {
  const { ui } = useContent()
  const [checked, setChecked] = useStored<number[]>(`ha-check-${course.id}-${lessonId}`, [])
  return (
    <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr]">
      <div>
        <h2 className="text-xl font-bold text-ink">{ui.summary[lang]}</h2>
        <p className="ne-relaxed mt-4 text-[1.05rem] leading-relaxed text-ink">{course.summary[lang]}</p>
        <aside className="mt-8 rounded-lg border-l-4 border-accent-500 bg-accent-100 p-5">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.12em] text-ochre uppercase">
            <QuoteIcon size={16} className="text-accent-500" /> {ui.forFacilitators[lang]}
          </p>
          <p className="ne-relaxed mt-2 leading-relaxed text-ink">{course.facilitator[lang]}</p>
        </aside>
      </div>
      <div>
        <h3 className="text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase">{ui.actions[lang]}</h3>
        <ul className="mt-4 flex flex-col gap-2.5">
          {course.checklist.map((c, i) => {
            const on = checked.includes(i)
            return (
              <li key={i}>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${on ? 'border-primary-700/30 bg-primary-100/60' : 'border-line bg-card hover:border-line-strong'}`}>
                  <input type="checkbox" className="peer sr-only" checked={on} onChange={() => setChecked(on ? checked.filter((x) => x !== i) : [...checked, i])} />
                  <span className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-500 ${on ? 'bg-primary-700 text-white' : 'border-2 border-primary-700/40 text-transparent'}`}>
                    <CheckIcon size={14} strokeWidth={2.5} />
                  </span>
                  <span className={`ne-relaxed text-[0.95rem] leading-relaxed ${on ? 'text-ink-2 line-through decoration-ink-3' : 'text-ink'}`}>{c[lang]}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function Discussion({ course, lessonId, lang }: { course: Course; lessonId: string; lang: Lang }) {
  const { ui } = useContent()
  const [notes, setNotes] = useStored<string>(`ha-notes-${course.id}-${lessonId}`, '')
  return (
    <div className="grid gap-10 xl:grid-cols-[1.2fr_1fr]">
      <div>
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary-100 text-brand"><ChatIcon size={20} /></span>
          <p className="ne-relaxed leading-relaxed text-ink-2">{ui.discussIntro[lang]}</p>
        </div>
        <ol className="mt-6 flex flex-col gap-3">
          {course.discussion.map((q, i) => (
            <li key={i} className="flex gap-4 rounded-lg bg-subtle p-5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-card text-sm font-bold text-brand shadow-soft">{num(i + 1, lang)}</span>
              <span className="ne-relaxed font-medium leading-relaxed text-ink">{q[lang]}</span>
            </li>
          ))}
        </ol>
      </div>
      <label className="block">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-semibold text-ink">{ui.notesLabel[lang]}</span>
          <span className="text-xs text-ink-2">{ui.notesHint[lang]}</span>
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={9}
          placeholder={ui.notesPlaceholder[lang]}
          className="mt-3 w-full resize-y rounded-lg border border-line-strong bg-card p-4 leading-relaxed text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
        />
      </label>
    </div>
  )
}

function Glossary({ course, lang }: { course: Course; lang: Lang }) {
  const { ui } = useContent()
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-card">
      <div className="grid grid-cols-[1fr_1fr] gap-4 bg-subtle px-5 py-3 text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase md:grid-cols-[1fr_1fr_2fr]">
        <span>English</span>
        <span>नेपाली</span>
        <span className="hidden md:block">{ui.meaning?.[lang] || (lang === 'en' ? 'Meaning' : 'अर्थ')}</span>
      </div>
      <dl className="divide-y divide-line">
        {course.glossary.map((g, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr] gap-x-4 gap-y-1 px-5 py-4 md:grid-cols-[1fr_1fr_2fr]">
            <dt lang="en" className="font-semibold text-ink">{g.term.en}</dt>
            <dt lang="ne" className="font-semibold text-ink">{g.term.ne}</dt>
            <dd className="ne-relaxed col-span-2 text-sm leading-relaxed text-ink-2 md:col-span-1">{g.meaning[lang]}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
