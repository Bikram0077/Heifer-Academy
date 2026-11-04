import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import type {
  Course,
  CategoryId,
  Bi,
  Testimonial,
  FaqItem,
  PartnerItem,
  PageContent,
  HomePageData,
  LayoutConfig,
  ResourceItem,
  ResourcesPageData,
  SiteSettings,
  SurveyOption,
  ProvinceItem,
} from '@shared/schema'
import { normalizeResourceItems } from '@shared/url'
import {
  courses as defaultCourses,
  categories as defaultCategories,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  partners as defaultPartners,
  defaultPages,
  defaultResourcesData,
  defaultSettings,
  roles as defaultRoles,
  genders as defaultGenders,
  provinces as defaultProvinces,
  ui as defaultUi,
} from './data'
import { getFirebaseDb } from './services/firebase'
import {
  parseLiveSnapshot,
  resolveHomeData,
  resolveLayoutConfig,
  resolveAllMaterials,
  pickBi,
} from './services/contentService'

export interface ContentContextValue {
  courses: Course[]
  categories: { id: CategoryId; label: Bi }[]
  testimonials: Testimonial[]
  faqs: FaqItem[]
  partners: PartnerItem[]
  pages: Record<string, PageContent>
  customPages: Record<string, PageContent>
  homeData: HomePageData
  layout: LayoutConfig
  resourcesData: ResourcesPageData
  allMaterials: ResourceItem[]
  settings: SiteSettings
  roles: SurveyOption[]
  genders: SurveyOption[]
  provinces: ProvinceItem[]
  ui: Record<string, Bi>
  isLiveConnected: boolean
  lastLiveUpdate: Date | null
}

const ContentContext = createContext<ContentContextValue | null>(null)

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext)
  if (!ctx) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return ctx
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<Course[]>(defaultCourses)
  const [categories, setCategories] = useState<{ id: CategoryId; label: Bi }[]>(defaultCategories)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials)
  const [faqs, setFaqs] = useState<FaqItem[]>(defaultFaqs)
  const [partners, setPartners] = useState<PartnerItem[]>(defaultPartners)
  const [pages, setPages] = useState<Record<string, PageContent>>(defaultPages)
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [uiStrings, setUiStrings] = useState<Record<string, Bi>>(defaultUi)
  const [isLiveConnected, setIsLiveConnected] = useState(false)
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null)

  useEffect(() => {
    const db = getFirebaseDb()
    if (!db) return

    const liveCol = collection(db, 'live')
    const unsub = onSnapshot(
      liveCol,
      (snapshot) => {
        setIsLiveConnected(true)
        const parsed = parseLiveSnapshot(snapshot.docs)
        setCourses(parsed.courses)
        setCategories(parsed.categories)
        setTestimonials(parsed.testimonials)
        setFaqs(parsed.faqs)
        setPartners(parsed.partners)
        setPages(parsed.pages)
        setSettings(parsed.settings)
        setUiStrings(parsed.uiStrings)
        setLastLiveUpdate(new Date())
      },
      (err) => {
        console.warn('Real-time live content subscription error (falling back to bundle):', err)
        setIsLiveConnected(false)
      }
    )

    return () => unsub()
  }, [])

  const homeData = useMemo(
    () => resolveHomeData(pages, settings, uiStrings),
    [pages, settings, uiStrings]
  )

  const layout = useMemo(
    () => resolveLayoutConfig(pages, uiStrings),
    [pages, uiStrings]
  )

  const rawRes = pages.resources?.resourcesData
  const normalizedCatalogItems = useMemo(
    () =>
      normalizeResourceItems(rawRes?.items, defaultResourcesData.items).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    [rawRes?.items]
  )

  const resourcesData: ResourcesPageData = useMemo(
    () => ({
      ...defaultResourcesData,
      ...(rawRes || {}),
      eyebrow: pickBi(rawRes?.eyebrow, defaultResourcesData.eyebrow, uiStrings.materialsEyebrow),
      heading: pickBi(rawRes?.heading, defaultResourcesData.heading, uiStrings.materialsTitle),
      items: normalizedCatalogItems,
    }),
    [rawRes, uiStrings.materialsEyebrow, uiStrings.materialsTitle, normalizedCatalogItems]
  )

  const allMaterials = useMemo(
    () => resolveAllMaterials(normalizedCatalogItems, courses),
    [normalizedCatalogItems, courses]
  )

  const resolvedPages = useMemo(
    () => ({
      ...pages,
      explore: {
        ...(pages.explore || defaultPages.explore),
        exploreData: {
          eyebrow: pickBi(
            pages.explore?.exploreData?.eyebrow,
            defaultUi.exploreSub,
            uiStrings.exploreSub
          ),
          heading: pickBi(
            pages.explore?.exploreData?.heading,
            defaultUi.exploreHeading,
            uiStrings.exploreHeading
          ),
          intro: pickBi(
            pages.explore?.exploreData?.intro,
            defaultUi.exploreIntro,
            uiStrings.exploreIntro
          ),
        },
      },
    }),
    [pages, uiStrings.exploreSub, uiStrings.exploreHeading, uiStrings.exploreIntro]
  )

  const customPages = useMemo(() => {
    const map: Record<string, PageContent> = {}
    Object.values(resolvedPages).forEach((pg) => {
      if (pg && (pg.isCustom || pg.slug.startsWith('custom_'))) {
        const clean = pg.slug.replace(/^custom_/, '')
        map[clean] = pg
      }
    })
    return map
  }, [resolvedPages])

  const value: ContentContextValue = useMemo(
    () => ({
      courses,
      categories,
      testimonials,
      faqs,
      partners,
      pages: resolvedPages,
      customPages,
      homeData,
      layout,
      resourcesData,
      allMaterials,
      settings,
      roles: settings.survey?.roles?.length ? settings.survey.roles : defaultRoles,
      genders: settings.survey?.genders?.length ? settings.survey.genders : defaultGenders,
      provinces: settings.survey?.provinces?.length ? settings.survey.provinces : defaultProvinces,
      ui: uiStrings,
      isLiveConnected,
      lastLiveUpdate,
    }),
    [
      courses,
      categories,
      testimonials,
      faqs,
      partners,
      resolvedPages,
      customPages,
      homeData,
      layout,
      resourcesData,
      allMaterials,
      settings,
      uiStrings,
      isLiveConnected,
      lastLiveUpdate,
    ]
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
