import { useEffect, useMemo, useState } from 'react'
import { extractYouTubeId, isExternalHttpUrl, sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { clock, duration, lessonsOf, num, totalSeconds, type Course, type CourseMaterial } from '../data'
import { useApp } from '../lib'
import { useContent } from '../content'
import { CourseCard } from '../components/CourseCard'
import { Container } from '../components/Layout'
import { VideoPlayer } from '../components/VideoPlayer'
import { formatLabel } from './Resources'
import heiferLogoLight from '../assets/heifer-academy-logo-light.png'
import heiferLogoDark from '../assets/heifer-academy-logo-dark.png'
import {
  ArrowRight, BookIcon, CheckCircle, CheckIcon, ChecklistIcon, ChevronDown, ChevronRight, ClockIcon, DownloadIcon, ExternalIcon, FileTextIcon, LanguagesIcon, PlayIcon, UsersIcon, VideoIcon,
} from '../components/icons'

export function CourseOutline({ course }: { course: Course }) {
  const { lang, progress } = useApp()
  const { courses, categories, resourcesData, settings, ui } = useContent()
  const lessons = lessonsOf(course)
  const firstLesson = lessons[0]
  const doneIds = progress[course.id] ?? []
  const done = lessons.filter((l) => doneIds.includes(l.id)).length
  const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0
  const unpaidIdx = lessons.findIndex((l) => !doneIds.includes(l.id))
  const resumeAt = Math.max(0, unpaidIdx)
  const cta = done === 0 ? ui.startCourse : done === lessons.length ? ui.reviewCourse : ui.continueCourse
  const ctaHref = lessons.length > 0 ? `#/learn/${course.id}/${done === lessons.length ? 0 : resumeAt}` : `#/course/${course.id}`
  const [open, setOpen] = useState<boolean[]>(() => course.modules.map((_, i) => i === 0))
  useEffect(() => {
    setOpen((prev) =>
      prev.length === course.modules.length
        ? prev
        : course.modules.map((_, i) => prev[i] ?? i === 0)
    )
  }, [course.modules.length])
  const allOpen = open.length > 0 && open.every(Boolean)
  const related = courses.filter((c) => c.id !== course.id).sort((a, b) => Number(b.category === course.category) - Number(a.category === course.category)).slice(0, 3)
  const catLabel = categories.find((c) => c.id === course.category)?.label || { en: course.category, ne: course.category }
  const lightLogoSrc = sanitizeImageSrc(settings.brand?.logoUrl, heiferLogoLight)
  const darkLogoSrc = sanitizeImageSrc(settings.brand?.logoDarkUrl, heiferLogoDark)
  const orgName = settings.brand?.orgName?.[lang] || 'Heifer International Nepal'
  const devDesc =
    settings.brand?.developedByDesc?.[lang] ||
    ui.developedByDesc?.[lang] ||
    (lang === 'en'
      ? 'Video lessons are produced by Heifer International and its partners. Field notes and checklists are prepared by Heifer Nepal’s community development team.'
      : 'भिडियो पाठहरू हेफर इन्टरनेसनल र साझेदारहरूद्वारा निर्मित हुन्। फिल्ड टिपोट र चेकलिस्ट हेफर नेपालको सामुदायिक विकास टोलीले तयार पारेको हो।')

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

  const metaRows: [string, string][] = [
    [ui.languageLabel?.[lang] || 'Language', ui.languageValue?.[lang] || 'English / नेपाली'],
    [ui.format?.[lang] || 'Format', ui.formatValue?.[lang] || 'Video lessons with field notes'],
    [ui.requirements?.[lang] || 'Requirements', ui.requirementsValue?.[lang] || 'No prior requirements'],
  ]
  if (course.level?.[lang]) {
    metaRows.push([ui.levelLabel?.[lang] || (lang === 'en' ? 'Level' : 'स्तर'), course.level[lang]])
  }
  if (course.instructor?.[lang]) {
    metaRows.push([ui.instructorLabel?.[lang] || (lang === 'en' ? 'Prepared by' : 'तयारकर्ता'), course.instructor[lang]])
  }

  return (
    <>
      {/* Hero band */}
      <section className="relative overflow-hidden bg-primary-950 text-white">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(40rem_30rem_at_90%_0%,rgb(45_106_79/0.55),transparent_70%)]" />
        <Container className="relative pt-8 pb-12 md:pt-10 lg:pb-20">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-white/70">
            <a href="#/" className="hover:text-white hover:underline">{ui.home[lang]}</a>
            <ChevronRight size={14} />
            <a href={`#/courses?cat=${course.category}`} className="hover:text-white hover:underline">{catLabel[lang]}</a>
            <ChevronRight size={14} />
            <span aria-current="page" className="text-white">{course.title[lang]}</span>
          </nav>
          <div className="lg:max-w-[calc(100%-26rem)]">
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <p className="text-xs font-semibold tracking-[0.12em] text-accent-500 uppercase">{catLabel[lang]}</p>
              {course.badge?.[lang] && (
                <span className="inline-flex items-center rounded-full bg-accent-500 px-2.5 py-0.5 text-xs font-bold text-slate-900">
                  {course.badge[lang]}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-[2rem] leading-tight font-bold tracking-[-0.02em] text-balance md:text-5xl md:leading-[1.1]">{course.title[lang]}</h1>
            <p className="mt-3 text-lg font-medium text-white/85">{course.subtitle[lang]}</p>
            <p className="ne-relaxed mt-5 max-w-2xl leading-relaxed text-white/75">{course.description[lang]}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                { icon: <VideoIcon size={16} />, t: `${num(lessons.length, lang)} ${ui.lessons[lang]}` },
                { icon: <BookIcon size={16} />, t: `${num(course.modules.length, lang)} ${ui.modules[lang]}` },
                { icon: <ClockIcon size={16} />, t: duration(totalSeconds(course), lang) },
                ...(courseMaterials.length > 0
                  ? [{ icon: <FileTextIcon size={16} />, t: `${num(courseMaterials.length, lang)} ${ui.resources?.[lang]?.toLowerCase() || 'materials'}` }]
                  : []),
                { icon: <UsersIcon size={16} />, t: ui.selfPaced[lang] },
              ].map((x) => (
                <span key={x.t} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 text-sm font-medium">{x.icon}{x.t}</span>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="relative grid gap-10 pb-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
        {/* Sticky enrol card */}
        <aside className="-mt-6 lg:order-2 lg:-mt-64">
          <div className="overflow-hidden rounded-xl border border-line bg-card shadow-card lg:sticky lg:top-24">
            {firstLesson ? (
              <VideoPlayer videoId={firstLesson.id} seconds={firstLesson.seconds} title={firstLesson.title[lang]} label={ui.watchPreview[lang]} rounded={false} />
            ) : (
              <div className="aspect-video w-full overflow-hidden bg-subtle">
                <img src={course.image} alt={course.imageAlt} className="size-full object-cover" />
              </div>
            )}
            <div className="p-6">
              {done > 0 && (
                <div className="mb-5">
                  <div className="mb-2 flex justify-between text-sm"><span className="text-ink-2">{num(done, lang)}/{num(lessons.length, lang)} {ui.lessons[lang]}</span><span className="font-semibold text-ink">{num(pct, lang)}% {ui.complete[lang]}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-subtle"><div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} /></div>
                </div>
              )}
              <a href={ctaHref} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-900 font-semibold text-white transition-colors hover:bg-primary-700">
                {cta[lang]} <ArrowRight size={18} />
              </a>
              <p className="mt-6 text-sm font-semibold text-ink">{ui.includes[lang]}</p>
              <ul className="mt-3 space-y-3 text-sm text-ink-2">
                <li className="flex items-center gap-3"><VideoIcon size={18} className="text-brand" />{num(lessons.length, lang)} {ui.incVideos[lang]} · {duration(totalSeconds(course), lang)}</li>
                {courseMaterials.length > 0 && (
                  <li className="flex items-center gap-3"><FileTextIcon size={18} className="text-brand" />{num(courseMaterials.length, lang)} {ui.courseMaterials?.[lang]?.toLowerCase() || 'field guides & handouts'}</li>
                )}
                <li className="flex items-center gap-3"><ChecklistIcon size={18} className="text-brand" />{ui.incChecklists[lang]}</li>
                <li className="flex items-center gap-3"><LanguagesIcon size={18} className="text-brand" />{ui.incGlossary[lang]}</li>
                <li className="flex items-center gap-3"><UsersIcon size={18} className="text-brand" />{ui.incFacilitator[lang]}</li>
              </ul>
              <dl className="mt-6 grid grid-cols-1 gap-3 border-t border-line pt-6 text-sm">
                {metaRows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-ink-2">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:order-1 lg:pt-12">
          {/* What you will learn */}
          <section className="rounded-xl border border-line bg-card p-6 md:p-8">
            <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink">{ui.whatLearn[lang]}</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {course.outcomes.map((o, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-brand"><CheckIcon size={14} strokeWidth={2.5} /></span>
                  <span className="ne-relaxed leading-relaxed text-ink">{o[lang]}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Outline */}
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink">{ui.courseOutline[lang]}</h2>
                <p className="mt-1 text-sm text-ink-2">
                  {num(course.modules.length, lang)} {ui.modules[lang]} · {num(lessons.length, lang)} {ui.videos[lang]} · {duration(totalSeconds(course), lang)}
                </p>
              </div>
              <button type="button" onClick={() => setOpen(course.modules.map(() => !allOpen))} className="text-sm font-semibold text-brand hover:underline">
                {allOpen ? ui.collapseAll[lang] : ui.expandAll[lang]}
              </button>
            </div>
            <div className="mt-6 divide-y divide-line overflow-hidden rounded-xl border border-line bg-card">
              {course.modules.map((m, mi) => {
                const isOpen = open[mi]
                const start = course.modules.slice(0, mi).reduce((s, x) => s + x.lessons.length, 0)
                const mSecs = m.lessons.reduce((s, x) => s + x.seconds, 0)
                const mDone = m.lessons.filter((l) => doneIds.includes(l.id)).length
                return (
                  <div key={mi}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpen(open.map((v, k) => (k === mi ? !v : v)))}
                      className="flex w-full items-center gap-4 bg-subtle/50 px-5 py-5 text-left hover:bg-subtle md:px-6"
                    >
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${mDone === m.lessons.length ? 'bg-primary-700 text-white' : 'bg-card text-brand ring-1 ring-line'}`}>
                        {mDone === m.lessons.length ? <CheckIcon size={18} strokeWidth={2.5} /> : num(mi + 1, lang)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold tracking-[0.1em] text-ink-2 uppercase">{ui.module[lang]} {num(mi + 1, lang)}</span>
                        <span className="mt-0.5 block font-semibold text-ink">{m.title[lang]}</span>
                      </span>
                      <span className="hidden shrink-0 text-sm text-ink-2 sm:block">{num(m.lessons.length, lang)} {ui.videos[lang]} · {duration(mSecs, lang)}</span>
                      <ChevronDown size={20} className={`shrink-0 text-ink-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <ol className="divide-y divide-line">
                        {m.lessons.map((l, li) => {
                          const isDone = doneIds.includes(l.id)
                          return (
                            <li key={l.id}>
                              <a href={`#/learn/${course.id}/${start + li}`} className="group flex items-center gap-4 px-5 py-4 hover:bg-subtle/60 md:px-6">
                                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-subtle sm:h-12 sm:w-20">
                                  {extractYouTubeId(l.id) && (
                                    <img src={`https://i.ytimg.com/vi/${extractYouTubeId(l.id)}/mqdefault.jpg`} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                                  )}
                                  <span className="absolute inset-0 flex items-center justify-center bg-black/30 text-white opacity-90 group-hover:bg-black/45"><PlayIcon size={16} /></span>
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block font-medium text-ink group-hover:text-brand">{l.title[lang]}</span>
                                  <span className="mt-0.5 block text-sm text-ink-2">{l.title[lang === 'en' ? 'ne' : 'en']}</span>
                                </span>
                                <span className="shrink-0 text-sm text-ink-2 tabular-nums">{clock(l.seconds, lang)}</span>
                                {isDone ? <CheckCircle size={22} className="shrink-0 text-primary-700" /> : <span className="size-[22px] shrink-0 rounded-full border-2 border-line-strong" />}
                              </a>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Course Materials & Handouts */}
          {courseMaterials.length > 0 && (
            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink">
                    {ui.courseMaterials?.[lang] || (lang === 'en' ? 'Field Guides & Handouts' : 'फिल्ड पुस्तिका र सामग्री')}
                  </h2>
                  <p className="mt-1 text-sm text-ink-2">
                    {ui.courseMaterialsSub?.[lang] ||
                      (lang === 'en'
                        ? 'Reference guides, worksheets and group handouts accompanying this course.'
                        : 'यस पाठ्यक्रमसँग सम्बन्धित सन्दर्भ पुस्तिका, कार्यपत्र र समूह सामग्रीहरू।')}
                  </p>
                </div>
                <a href="#/resources" className="text-sm font-semibold text-brand hover:underline">
                  {ui.viewAllMaterials?.[lang] || ui.resources?.[lang]}
                </a>
              </div>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {courseMaterials.map((mat) => {
                  const detailHref = `#/material/${encodeURIComponent(mat.id)}`
                  const safeExtUrl = mat.url ? sanitizeHref(mat.url, '') : ''
                  const hasExt = Boolean(safeExtUrl) && isExternalHttpUrl(safeExtUrl)
                  return (
                    <li key={mat.id} className="flex flex-col justify-between rounded-xl border border-line bg-card p-5 shadow-soft transition-colors hover:border-line-strong">
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
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {/* Developed by */}
          <section className="mt-12 flex flex-col gap-5 rounded-xl border border-line bg-card p-6 sm:flex-row sm:items-center md:p-8">
            <img src={lightLogoSrc} alt={orgName} width={917} height={223} className="block h-10 w-auto shrink-0 sm:h-11 dark:hidden" />
            <img src={darkLogoSrc} alt={orgName} width={917} height={223} className="hidden h-10 w-auto shrink-0 sm:h-11 dark:block" />
            <div>
              <p className="text-xs font-semibold tracking-[0.12em] text-ink-2 uppercase">{ui.developedWith[lang]}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{orgName}</p>
              <p className="ne-relaxed mt-1 text-sm text-ink-2">
                {devDesc}
              </p>
            </div>
          </section>
        </div>
      </Container>

      <section className="border-t border-line bg-card py-16">
        <Container>
          <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink md:text-3xl">{ui.related[lang]}</h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => <li key={c.id}><CourseCard course={c} /></li>)}
          </ul>
        </Container>
      </section>
    </>
  )
}
