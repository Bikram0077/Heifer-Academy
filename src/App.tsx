import { useCallback, useEffect, useState } from 'react'
import { isExternalHttpUrl, sanitizeHref } from '@shared/url'
import { AppProvider, getPageIdentity, useApp, useRoute } from './lib'
import { ContentProvider, useContent } from './content'
import { Container, Footer, Header, ReadingLine } from './components/Layout'
import { ArrowLeft, BookIcon, SearchIcon } from './components/icons'
import { PulseModal } from './components/PulseModal'
import { Home } from './pages/Home'
import { Explore } from './pages/Explore'
import { Resources } from './pages/Resources'
import { MaterialDetail } from './pages/MaterialDetail'
import { CourseOutline } from './pages/CourseOutline'
import { Learn } from './pages/Learn'
import { Info } from './pages/Info'

export default function App() {
  const [pulse, setPulse] = useState(false)
  const triggerPulse = useCallback(() => setPulse(true), [])
  const closePulse = useCallback(() => setPulse(false), [])
  return (
    <ContentProvider>
      <AppProvider onFirstCompletion={triggerPulse} openPulse={triggerPulse}>
        <AnnouncementBar />
        <Shell />
        <PulseModal open={pulse} onClose={closePulse} />
        <ReadingLine />
      </AppProvider>
    </ContentProvider>
  )
}

function AnnouncementBar() {
  const { settings } = useContent()
  const { lang } = useApp()
  if (!settings?.announcement?.enabled) return null
  const text = settings.announcement.text?.[lang] || settings.announcement.text?.en
  if (!text) return null
  const rawLink = settings.announcement.link?.trim() || ''
  const linkHref = rawLink ? sanitizeHref(rawLink, '') : ''
  const isExt = isExternalHttpUrl(linkHref)

  return (
    <aside
      aria-label="Announcement"
      className="relative z-50 border-b border-white/10 bg-primary-950 px-4 py-2.5 text-center text-xs font-medium text-white sm:text-sm print:hidden"
    >
      {linkHref ? (
        <a
          href={linkHref}
          target={isExt ? '_blank' : undefined}
          rel={isExt ? 'noopener noreferrer' : undefined}
          className="inline-flex items-center justify-center gap-2 transition-colors hover:text-accent-500"
        >
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent-500" />
          <span>{text}</span>
          <span aria-hidden className="font-bold text-accent-500">→</span>
        </a>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-accent-500" />
          <span>{text}</span>
        </span>
      )}
    </aside>
  )
}

function NotFoundView({ kind }: { kind: 'course' | 'page' }) {
  const { lang } = useApp()
  const { ui } = useContent()
  const isCourse = kind === 'course'
  const heading = isCourse
    ? ui.courseNotFound?.[lang] || (lang === 'en' ? 'Course not found' : 'पाठ्यक्रम भेटिएन')
    : lang === 'en'
      ? 'Page not found'
      : 'यो पृष्ठ भेटिएन'
  const sub = isCourse
    ? ui.courseNotFoundSub?.[lang] ||
      (lang === 'en'
        ? 'The course link may have changed or been unpublished. Explore all active courses below.'
        : 'यो पाठ्यक्रमको लिङ्क परिवर्तन वा अप्रकाशित भएको हुन सक्छ। तल उपलब्ध पाठ्यक्रमहरू हेर्नुहोस्।')
    : lang === 'en'
      ? 'The address you followed does not match an active page on Heifer Academy.'
      : 'तपाईंले खोल्नुभएको ठेगाना हेफर एकेडेमीको कुनै सक्रिय पृष्ठसँग मिलेन।'

  return (
    <Container className="py-20 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-subtle text-brand">
        {isCourse ? <BookIcon size={24} /> : <SearchIcon size={24} />}
      </span>
      <h1 className="mt-4 text-2xl font-bold text-ink md:text-3xl">{heading}</h1>
      <p className="ne-relaxed mx-auto mt-2 max-w-md text-ink-2">{sub}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#/courses"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          {ui.allCourses?.[lang] || 'All Courses'}
        </a>
        <a
          href="#/resources"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong bg-card px-5 text-sm font-semibold text-ink transition-colors hover:border-primary-700 hover:text-brand"
        >
          {ui.resources?.[lang] || 'Materials'}
        </a>
        <a
          href="#/"
          className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft size={15} />
          {ui.home?.[lang] || 'Home'}
        </a>
      </div>
    </Container>
  )
}

function Shell() {
  const route = useRoute()
  const { courses } = useContent()
  const pageKey = getPageIdentity(route)

  useEffect(() => {
    if (route.name !== 'learn') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [pageKey, route.name])

  const course =
    route.name === 'course' || route.name === 'learn'
      ? courses.find((c) => c.id === route.id)
      : undefined

  let page
  if (route.name === 'home') page = <Home />
  else if (route.name === 'courses') page = <Explore cat={route.cat} />
  else if (route.name === 'resources') page = <Resources cat={route.cat} />
  else if (route.name === 'material') page = <MaterialDetail key={route.id} id={route.id} />
  else if (route.name === 'course') {
    page = course ? <CourseOutline key={course.id} course={course} /> : <NotFoundView kind="course" />
  } else if (route.name === 'learn') {
    page = course ? <Learn key={course.id} course={course} n={route.n} /> : <NotFoundView kind="course" />
  } else if (route.name === 'page') page = <Info slug={route.slug} />
  else if (route.name === 'customPage') page = <Info slug={route.slug} isCustom />
  else page = <NotFoundView kind="page" />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {page}
      </main>
      <Footer />
    </div>
  )
}
