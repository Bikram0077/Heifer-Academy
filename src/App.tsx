import { useCallback, useEffect, useState } from 'react'
import { isExternalHttpUrl, sanitizeHref } from '@shared/url'
import { AppProvider, getPageIdentity, useApp, useRoute } from './lib'
import { ContentProvider, useContent } from './content'
import { Container, Footer, Header, ReadingLine } from './components/Layout'
import { Button } from './components/ui'
import { ArrowLeft, BookIcon, FileTextIcon, SearchIcon } from './components/icons'
import { PulseModal } from './components/PulseModal'
import { lessonsOf } from './data'
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
  const { ui, settings } = useContent()
  const isCourse = kind === 'course'
  const contactEmail = settings?.contact?.email || 'heifer.nepal@heifer.org'

  const heading = isCourse
    ? ui.courseNotFound?.[lang] || (lang === 'en' ? 'Course Not Found' : 'पाठ्यक्रम भेटिएन')
    : lang === 'en'
      ? 'Page Not Found'
      : 'पृष्ठ भेटिएन'

  const sub = isCourse
    ? ui.courseNotFoundSub?.[lang] ||
      (lang === 'en'
        ? 'The course link you followed may have changed, moved, or been archived. Explore all available courses below.'
        : 'तपाईंले खोल्नुभएको पाठ्यक्रमको लिङ्क परिवर्तन, स्थानान्तरण वा अप्रकाशित भएको हुन सक्छ। तल उपलब्ध पाठ्यक्रमहरू हेर्नुहोस्।')
    : lang === 'en'
      ? 'Sorry, we couldn’t find the page you were looking for. The link may be broken or the URL may have been mistyped.'
      : 'माफ गर्नुहोस्, तपाईंले खोज्नुभएको पृष्ठ भेटिएन। लिङ्क बिग्रेको हुन सक्छ वा ठेगाना गलत हुन सक्छ।'

  return (
    <section className="flex min-h-[60vh] items-center justify-center py-16 md:py-24">
      <Container className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-primary-100 text-brand shadow-soft">
          <span className="text-3xl font-black tracking-wider text-brand">404</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          {heading}
        </h1>
        <p className="ne-relaxed mx-auto mt-3 max-w-lg text-base leading-relaxed text-ink-2 sm:text-lg">
          {sub}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="#/" variant="primary" icon={<ArrowLeft size={16} />}>
            {ui.home?.[lang] || (lang === 'en' ? 'Back to Home' : 'गृहपृष्ठ')}
          </Button>
          <Button href="#/courses" variant="outline" icon={<BookIcon size={16} />}>
            {ui.allCourses?.[lang] || (lang === 'en' ? 'Explore Courses' : 'सबै पाठ्यक्रमहरू')}
          </Button>
          <Button href="#/resources" variant="outline" icon={<FileTextIcon size={16} />}>
            {ui.resources?.[lang] || (lang === 'en' ? 'Field Materials' : 'सिकाइ सामग्री')}
          </Button>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-ink-3">
          <span>{lang === 'en' ? 'Need help? Contact us at ' : 'मद्दत चाहिन्छ? हामीलाई सम्पर्क गर्नुहोस्: '}</span>
          <a href={`mailto:${contactEmail}`} className="font-semibold text-brand underline hover:text-primary-700">
            {contactEmail}
          </a>
        </div>
      </Container>
    </section>
  )
}

function Shell() {
  const route = useRoute()
  const { lang } = useApp()
  const { courses, allMaterials, pages, customPages } = useContent()
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

  // Dynamic SEO title & meta description updates
  useEffect(() => {
    let title = 'Heifer Academy'
    let description =
      lang === 'en'
        ? 'Practical bilingual online learning for Nepal’s smallholder farming families, self-help groups, and cooperatives.'
        : 'नेपालका साना किसान परिवार, स्वावलम्बन समूह र सहकारीका लागि व्यावहारिक द्विभाषी अनलाइन सिकाइ प्लेटफर्म।'

    if (route.name === 'home') {
      title =
        lang === 'en'
          ? 'Heifer Academy — Practical Online Learning for Nepal’s Farmers & Cooperatives'
          : 'हेफर एकेडेमी — नेपालका किसान र सहकारीका लागि अनलाइन सिकाइ'
    } else if (route.name === 'courses') {
      title = lang === 'en' ? 'Courses & Training Modules | Heifer Academy' : 'पाठ्यक्रमहरू | हेफर एकेडेमी'
      description =
        lang === 'en'
          ? 'Explore video courses on social capital, livestock, agribusiness, climate resilience, and cooperatives.'
          : 'सामाजिक पुँजी, पशुपालन, कृषि व्यवसाय, जलवायु उत्थानशीलता र सहकारीका भिडियो पाठ्यक्रमहरू हेर्नुहोस्।'
    } else if (route.name === 'resources') {
      title = lang === 'en' ? 'Field Materials & Guides | Heifer Academy' : 'सिकाइ सामग्री तथा पुस्तिकाहरू | हेफर एकेडेमी'
      description =
        lang === 'en'
          ? 'Download practical field manuals, checklists, discussion guides, and agricultural resources.'
          : 'व्यावहारिक फिल्ड पुस्तिका, चेकलिस्ट र कृषि सन्दर्भ सामग्रीहरू डाउनलोड गर्नुहोस्।'
    } else if (route.name === 'material') {
      const mat = allMaterials.find((m) => m.id === route.id)
      if (mat) {
        title = `${mat.title[lang] || mat.title.en} | Materials | Heifer Academy`
        description = mat.description?.[lang] || mat.description?.en || description
      } else {
        title = lang === 'en' ? 'Material Not Found | Heifer Academy' : 'सामग्री भेटिएन | हेफर एकेडेमी'
      }
    } else if (route.name === 'course' && course) {
      title = `${course.title[lang] || course.title.en} | Heifer Academy`
      description = course.description?.[lang] || course.description?.en || description
    } else if (route.name === 'learn' && course) {
      const lessons = lessonsOf(course)
      const currentLesson = lessons[route.n] || lessons[0]
      const lessonTitle = currentLesson?.title?.[lang] || currentLesson?.title?.en || ''
      title = `${lessonTitle ? `${lessonTitle} · ` : ''}${course.title[lang] || course.title.en} | Heifer Academy`
      description = currentLesson?.notes?.[lang] || currentLesson?.notes?.en || description
    } else if (route.name === 'page' || route.name === 'customPage') {
      const pg = (route.name === 'page' ? pages[route.slug] : customPages[route.slug]) || pages[route.slug]
      if (pg) {
        title = `${pg.title[lang] || pg.title.en} | Heifer Academy`
        description = pg.subtitle?.[lang] || pg.subtitle?.en || description
      }
    } else if (route.name === 'notFound') {
      title = lang === 'en' ? '404: Page Not Found | Heifer Academy' : '४०४: पृष्ठ भेटिएन | हेफर एकेडेमी'
    }

    document.title = title
    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) {
      metaDesc.setAttribute('content', description)
    }
  }, [route, lang, course, allMaterials, pages, customPages])

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
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {page}
      </main>
      <Footer />
    </div>
  )
}
