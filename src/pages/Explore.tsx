import { useCallback, useEffect, useMemo, useState } from 'react'
import { lessonsOf, num, type CategoryId } from '../data'
import { useApp } from '../lib'
import { useContent } from '../content'
import { CourseCard } from '../components/CourseCard'
import { Container, Eyebrow } from '../components/Layout'
import { ChevronRight, SearchIcon, XIcon } from '../components/icons'

export function Explore({ cat: initial }: { cat?: string }) {
  const { lang } = useApp()
  const { categories, courses, pages, ui } = useContent()
  const exploreData = pages.explore?.exploreData
  const eyebrow = exploreData?.eyebrow?.[lang] || ui.exploreSub?.[lang]
  const heading = exploreData?.heading?.[lang] || ui.exploreHeading?.[lang]
  const intro = exploreData?.intro?.[lang] || ui.exploreIntro?.[lang]

  const resolveCat = useCallback(
    (raw?: string): CategoryId =>
      raw && categories.some((c) => c.id === raw) ? (raw as CategoryId) : 'all',
    [categories]
  )

  const [cat, setCatState] = useState<CategoryId>(() => resolveCat(initial))
  const [query, setQuery] = useState('')

  useEffect(() => {
    setCatState(resolveCat(initial))
  }, [initial, resolveCat])

  const setCat = useCallback((c: CategoryId) => {
    setCatState(c)
    const nextHash = c === 'all' ? '#/courses' : `#/courses?cat=${c}`
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash)
    }
  }, [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((c) => {
      if (cat !== 'all' && c.category !== cat) return false
      if (!q) return true
      return [c.title.en, c.title.ne, c.subtitle.en, c.subtitle.ne, c.description.en, c.description.ne, ...lessonsOf(c).flatMap((x) => [x.title.en, x.title.ne])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [query, cat, courses])

  return (
    <>
      <section className="border-b border-line bg-card">
        <Container className="py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-ink-2">
            <a href="#/" className="hover:text-brand hover:underline">{ui.home?.[lang]}</a>
            <ChevronRight size={14} className="text-ink-3" />
            <span aria-current="page" className="text-ink">{ui.allCourses?.[lang]}</span>
          </nav>
          <Eyebrow className="mt-6">{eyebrow}</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-ink md:text-[2.75rem] md:leading-tight">{heading}</h1>
          <p className="ne-relaxed mt-3 max-w-2xl text-lg text-ink-2">{intro}</p>

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
                    className={`h-11 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                      active ? 'border-primary-900 bg-primary-900 text-white' : 'border-line bg-card text-ink-2 hover:border-line-strong hover:text-ink'
                    }`}
                  >
                    {c.label[lang]}
                  </button>
                )
              })}
            </div>
            <label className="relative block w-full lg:w-80">
              <span className="sr-only">{ui.search?.[lang]}</span>
              <SearchIcon size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={ui.search?.[lang]}
                className="h-12 w-full rounded-full border border-line-strong bg-card pr-4 pl-11 text-[0.95rem] text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              />
            </label>
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <p className="mb-6 text-sm text-ink-2" aria-live="polite">
            {num(list.length, lang)} {ui.results?.[lang]}
          </p>
          {list.length ? (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => <li key={c.id}><CourseCard course={c} /></li>)}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong bg-card px-6 py-20 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-subtle text-ink-2"><SearchIcon size={24} /></span>
              <p className="mt-4 text-lg font-medium text-ink">{ui.noResults?.[lang]}</p>
              <button type="button" onClick={() => { setQuery(''); setCat('all') }} className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-5 font-semibold text-ink hover:border-primary-700 hover:text-brand">
                <XIcon size={16} /> {ui.clear?.[lang]}
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
