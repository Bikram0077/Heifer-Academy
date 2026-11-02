import { useCallback, useEffect, useMemo, useState } from 'react'
import { isExternalHttpUrl, sanitizeHref, sanitizeImageSrc } from '@shared/url'
import { num, type CategoryId, type Lang, type MaterialFormat, type ResourceItem } from '../data'
import { useApp } from '../lib'
import { useContent } from '../content'
import { Container, Eyebrow } from '../components/Layout'
import {
  ArrowRight, BookIcon, ChevronRight, DownloadIcon, FileTextIcon, SearchIcon, VideoIcon, XIcon,
} from '../components/icons'

export const FORMAT_LABELS: Record<MaterialFormat, { en: string; ne: string }> = {
  guide: { en: 'Field Guide', ne: 'फिल्ड पुस्तिका' },
  pdf: { en: 'PDF Document', ne: 'पीडीएफ दस्तावेज' },
  poster: { en: 'Visual Poster', ne: 'फिल्ड पोस्टर' },
  toolkit: { en: 'Group Toolkit', ne: 'समूह टुलकिट' },
  worksheet: { en: 'Worksheet', ne: 'कार्यपत्र / फारम' },
  audio: { en: 'Audio', ne: 'अडियो सामग्री' },
  video: { en: 'Video Resource', ne: 'भिडियो सामग्री' },
  article: { en: 'Reference Note', ne: 'सन्दर्भ सामग्री' },
}

export function formatLabel(format: MaterialFormat | undefined, lang: Lang): string {
  const f = (format && FORMAT_LABELS[format]) || FORMAT_LABELS.guide
  return f[lang]
}

export function ResourceCard({ item }: { item: ResourceItem }) {
  const { lang } = useApp()
  const { categories, courses, ui } = useContent()
  const catLabel = categories.find((c) => c.id === item.category)?.label || { en: item.category, ne: item.category }
  const linkedCourse = item.courseId ? courses.find((c) => c.id === item.courseId) : undefined
  const detailHref = `#/material/${encodeURIComponent(item.id)}`
  const safeExternalUrl = item.url ? sanitizeHref(item.url, '') : ''
  const hasExternalUrl =
    Boolean(safeExternalUrl) &&
    isExternalHttpUrl(safeExternalUrl)
  const safeCover = sanitizeImageSrc(item.image)
  const titleText = item.title[lang] || item.title.en

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-card shadow-soft transition duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:border-line-strong [@media(hover:hover)]:hover:shadow-card">
      {safeCover ? (
        <a href={detailHref} className="relative block aspect-[16/9] overflow-hidden bg-subtle">
          <img
            src={safeCover}
            alt={titleText}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition duration-500 [@media(hover:hover)]:group-hover:scale-[1.04]"
          />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[0.72rem] font-semibold text-[#0d416b] shadow-soft">
            {item.format === 'video' ? <VideoIcon size={13} /> : <FileTextIcon size={13} />}
            {formatLabel(item.format, lang)}
          </span>
        </a>
      ) : (
        <div className="flex items-center justify-between border-b border-line bg-subtle/60 px-5 py-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-[0.72rem] font-semibold text-brand">
            {item.format === 'video' ? <VideoIcon size={13} /> : <FileTextIcon size={13} />}
            {formatLabel(item.format, lang)}
          </span>
          {item.meta?.[lang] && <span className="text-xs text-ink-2">{item.meta[lang]}</span>}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-[0.12em] text-ochre uppercase">{catLabel[lang]}</p>
          {safeCover && item.meta?.[lang] && (
            <span className="text-xs font-medium text-ink-3">{item.meta[lang]}</span>
          )}
        </div>

        <h3 className="mt-2 text-lg leading-snug font-semibold text-ink">
          <a href={detailHref} className="transition-colors hover:text-brand">
            {titleText}
          </a>
        </h3>
        <p className="ne-relaxed mt-2 text-sm leading-relaxed text-ink-2">{item.description[lang] || item.description.en}</p>

        {linkedCourse && (
          <a
            href={`#/course/${encodeURIComponent(linkedCourse.id)}`}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-2 transition-colors hover:text-brand"
          >
            <BookIcon size={14} className="shrink-0 text-brand" />
            <span className="truncate">{linkedCourse.title[lang]}</span>
          </a>
        )}

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
            <a
              href={detailHref}
              className="inline-flex min-w-0 flex-1 items-center justify-between gap-2 text-sm font-semibold text-brand"
            >
              <span className="inline-flex items-center gap-1.5">
                {ui.openResource?.[lang] || (lang === 'en' ? 'Open resource' : 'सामग्री खोल्नुहोस्')}
              </span>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-brand transition [@media(hover:hover)]:group-hover:bg-primary-900 [@media(hover:hover)]:group-hover:text-white">
                <ArrowRight size={16} />
              </span>
            </a>

            {hasExternalUrl && (
              <a
                href={safeExternalUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${ui.downloadExternal?.[lang] || 'Open external file'} — ${titleText}`}
                title={ui.downloadExternal?.[lang] || 'Open external file'}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-primary-700 hover:bg-subtle hover:text-brand"
              >
                <DownloadIcon size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function Resources({ cat: initial }: { cat?: string }) {
  const { lang } = useApp()
  const { allMaterials, categories, resourcesData, ui } = useContent()

  const resolveCat = useCallback(
    (raw?: string): CategoryId =>
      raw && categories.some((c) => c.id === raw) ? (raw as CategoryId) : 'all',
    [categories]
  )

  const [cat, setCatState] = useState<CategoryId>(() => resolveCat(initial))
  const [format, setFormat] = useState<'all' | MaterialFormat>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    setCatState(resolveCat(initial))
  }, [initial, resolveCat])

  const setCat = useCallback((c: CategoryId) => {
    setCatState(c)
    const nextHash = c === 'all' ? '#/resources' : `#/resources?cat=${c}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [])

  const availableFormats = useMemo(() => {
    const set = new Set<MaterialFormat>()
    allMaterials.forEach((item) => {
      if (item.format) set.add(item.format)
    })
    return Array.from(set)
  }, [allMaterials])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allMaterials.filter((item) => {
      if (cat !== 'all' && item.category !== cat) return false
      if (format !== 'all' && item.format !== format) return false
      if (!q) return true
      return [
        item.title?.en,
        item.title?.ne,
        item.description?.en,
        item.description?.ne,
        item.meta?.en,
        item.meta?.ne,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [allMaterials, cat, format, query])

  const eyebrow = resourcesData.eyebrow?.[lang] || ui.materialsEyebrow?.[lang]
  const heading = resourcesData.heading?.[lang] || ui.materialsTitle?.[lang]
  const intro = resourcesData.intro?.[lang] || ''

  return (
    <>
      <section className="border-b border-line bg-card">
        <Container className="py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-2">
            <a href="#/" className="hover:text-brand hover:underline">{ui.home?.[lang]}</a>
            <ChevronRight size={14} className="text-ink-3" />
            <span aria-current="page" className="text-ink">{ui.resources?.[lang] || heading}</span>
          </nav>
          <Eyebrow className="mt-6">{eyebrow}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-ink md:text-[2.75rem] md:leading-tight">{heading}</h1>
          {intro && <p className="ne-relaxed mt-3 max-w-2xl text-lg text-ink-2">{intro}</p>}

          <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label={ui.browseTopics?.[lang]} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
              {categories.map((c) => {
                const active = cat === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCat(c.id)}
                    className={`h-11 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors ${active ? 'border-primary-900 bg-primary-900 text-white' : 'border-line bg-card text-ink-2 hover:border-line-strong hover:text-ink'
                      }`}
                  >
                    {c.label[lang]}
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
              {availableFormats.length > 1 && (
                <select
                  aria-label={ui.format?.[lang] || 'Format'}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'all' | MaterialFormat)}
                  className="h-12 rounded-full border border-line-strong bg-card px-4 text-sm font-medium text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                >
                  <option value="all">{ui.allFormats?.[lang] || (lang === 'en' ? 'All formats' : 'सबै ढाँचा')}</option>
                  {availableFormats.map((f) => (
                    <option key={f} value={f}>{formatLabel(f, lang)}</option>
                  ))}
                </select>
              )}

              <label className="relative block w-full sm:w-72">
                <span className="sr-only">{ui.searchResources?.[lang]}</span>
                <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={ui.searchResources?.[lang] || ui.search?.[lang]}
                  className="h-12 w-full rounded-full border border-line-strong bg-card pr-4 pl-11 text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                />
              </label>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <p className="mb-6 text-sm text-ink-2" aria-live="polite">
            {num(list.length, lang)} {ui.resources?.[lang]?.toLowerCase() || (lang === 'en' ? 'materials' : 'सामग्रीहरू')}
          </p>
          {list.length ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((item) => (
                <li key={item.id}><ResourceCard item={item} /></li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-card px-6 py-20 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-subtle text-ink-2"><SearchIcon size={24} /></span>
              <p className="mt-4 text-lg font-medium text-ink">
                {ui.noMaterials?.[lang] ||
                  (lang === 'en'
                    ? 'No learning materials match your filter.'
                    : 'तपाईंको खोजसँग मिल्ने सिकाइ सामग्री भेटिएन।')}
              </p>
              <button
                type="button"
                onClick={() => { setQuery(''); setFormat('all'); setCat('all') }}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 font-semibold text-ink hover:border-primary-700 hover:text-brand"
              >
                <XIcon size={16} /> {ui.clear?.[lang]}
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}

