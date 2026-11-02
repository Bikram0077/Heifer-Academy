import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import { normalizeCourseMaterials, normalizeResourceItems } from '@shared/url'
import type {
  Course,
  Category,
  Testimonial,
  FaqItem,
  PageContent,
  HomePageData,
  LayoutConfig,
  ResourcesPageData,
  SiteSettings,
  Bi,
  ContentDoc,
  ContentType,
} from '@shared/schema'

import {
  courses as defaultCourses,
  categories as defaultCategories,
  testimonials as defaultTestimonials,
  faqs as defaultFaqs,
  partners as defaultPartners,
  defaultPages,
  defaultHomeData,
  defaultLayoutConfig,
  defaultResourcesData,
  defaultSettings,
  ui as defaultUi,
} from '@siteData'

export type DocStatus = 'published' | 'draft_changes' | 'draft_only' | 'unpublished'

export type ItemWithStatus<T> = {
  id: string
  docId: string
  data: T
  status: DocStatus
  updatedAt: string
  updatedBy: string
  updatedByLabel: string
  publishedAt?: string
}

export type PendingChangeItem = {
  docId: string
  type: ContentType
  title: string
  subtitle: string
  status: DocStatus
  updatedAt: string
  updatedByLabel: string
  navTab:
    | 'courses'
    | 'course-edit'
    | 'categories'
    | 'materials'
    | 'homepage'
    | 'header-footer'
    | 'pages'
    | 'strings'
    | 'settings'
  courseId?: string
}

type CmsContextType = {
  loading: boolean
  saving: boolean
  publishing: boolean
  lastSync: Date | null
  isDatabaseSeeded: boolean
  pendingChangesCount: number

  // Entities
  getCourses: () => ItemWithStatus<Course>[]
  getCourse: (id: string) => ItemWithStatus<Course> | null
  getCategories: () => ItemWithStatus<Category[]>
  getTestimonials: () => ItemWithStatus<Testimonial[]>
  getFaqs: () => ItemWithStatus<FaqItem[]>
  getPartners: () => ItemWithStatus<string[]>
  getHomePage: () => ItemWithStatus<PageContent>
  getLayoutPage: () => ItemWithStatus<PageContent>
  getResourcesPage: () => ItemWithStatus<PageContent>
  getCustomPages: () => ItemWithStatus<PageContent>[]
  getPage: (slug: string) => ItemWithStatus<PageContent> | null
  getSettings: () => ItemWithStatus<SiteSettings>
  getUiStrings: () => ItemWithStatus<Record<string, Bi>>
  getPendingItems: () => PendingChangeItem[]

  // Mutations
  saveDraft: (docId: string, type: ContentType, data: unknown, order?: number) => Promise<void>
  saveAndPublish: (docId: string, type: ContentType, data: unknown, order?: number) => Promise<void>
  publishDoc: (docId: string) => Promise<void>
  discardDraft: (docId: string) => Promise<void>
  unpublishDoc: (docId: string) => Promise<void>
  deleteItem: (docId: string) => Promise<void>
  createCustomPage: (title: Bi, rawSlug: string) => Promise<string>
  deleteCustomPage: (slug: string) => Promise<void>
  reorderCourses: (orderedIds: string[]) => Promise<void>
  duplicateCourse: (courseId: string) => Promise<string>
  publishAll: () => Promise<void>
  seedDefaults: () => Promise<void>
  exportAllJson: () => string
}

const CmsContext = createContext<CmsContextType | undefined>(undefined)

function sanitizeForFirestore(val: unknown): unknown {
  if (val === undefined) return undefined
  if (val === null || typeof val !== 'object') return val
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item))
  }
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (v === undefined) continue
    const cleaned = sanitizeForFirestore(v)
    if (cleaned !== undefined) {
      out[k] = cleaned
    }
  }
  return out
}

// Firestore rules require d.data is map (never a bare JS Array)
function wrapFirestorePayload(data: unknown): Record<string, unknown> {
  const clean = sanitizeForFirestore(data)
  if (Array.isArray(clean)) {
    return { items: clean }
  }
  if (clean && typeof clean === 'object') {
    return clean as Record<string, unknown>
  }
  return { value: clean ?? null }
}

function isLegacyShardDoc(docId: string, docObj?: ContentDoc): boolean {
  if (!docObj) return false
  if (docObj.type === 'category' && docId !== 'categories') return true
  if (docObj.type === 'testimonial' && docId !== 'testimonials') return true
  if (docObj.type === 'faq' && docId !== 'faqs') return true
  if (docObj.type === 'partner' && docId !== 'partners') return true
  return false
}

function unwrapArrayPayload<T>(raw: unknown, fallback: T[]): T[] {
  if (Array.isArray(raw)) return raw as T[]
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)) {
    return (raw as { items: T[] }).items
  }
  return fallback
}

function formatActor(docObj?: ContentDoc): string {
  if (!docObj) return 'System Default'
  return docObj.updatedByName || docObj.updatedByEmail || docObj.updatedBy || 'Staff'
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const { user, profile, isSuperAdmin, isEditor } = useAuth()
  const [draftDocs, setDraftDocs] = useState<Record<string, ContentDoc>>({})
  const [liveDocs, setLiveDocs] = useState<Record<string, ContentDoc>>({})
  const [draftsLoaded, setDraftsLoaded] = useState(false)
  const [liveLoaded, setLiveLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const autoSeedAttempted = useRef(false)
  const backfillAttempted = useRef(false)

  useEffect(() => {
    if (!user || !profile) {
      setDraftDocs({})
      setLiveDocs({})
      setDraftsLoaded(false)
      setLiveLoaded(false)
      return
    }

    const unsubDrafts = onSnapshot(
      collection(db, 'drafts'),
      (snap) => {
        const next: Record<string, ContentDoc> = {}
        snap.forEach((d) => {
          next[d.id] = d.data() as ContentDoc
        })
        setDraftDocs(next)
        setLastSync(new Date())
        setDraftsLoaded(true)
      },
      (err) => {
        console.warn('Error fetching drafts:', err)
        setDraftsLoaded(true)
      }
    )

    const unsubLive = onSnapshot(
      collection(db, 'live'),
      (snap) => {
        const next: Record<string, ContentDoc> = {}
        snap.forEach((d) => {
          next[d.id] = d.data() as ContentDoc
        })
        setLiveDocs(next)
        setLastSync(new Date())
        setLiveLoaded(true)
      },
      (err) => {
        console.warn('Error fetching live:', err)
        setLiveLoaded(true)
      }
    )

    return () => {
      unsubDrafts()
      unsubLive()
    }
  }, [user, profile])

  const loading = Boolean(user && profile && (!draftsLoaded || !liveLoaded))
  const isDatabaseSeeded = Object.keys(liveDocs).length > 0 || Object.keys(draftDocs).length > 0

  const getDocStatus = (docId: string): DocStatus => {
    const draft = draftDocs[docId]
    const live = liveDocs[docId]

    if (!draft && !live) return 'unpublished'
    if (draft && !live) return 'draft_only'
    if (!draft && live) return 'published'

    if (draft && live) {
      if (!draft.updatedAt || !live.publishedAt) return 'draft_changes'
      const draftTime = new Date(draft.updatedAt).getTime()
      const liveTime = new Date(live.publishedAt).getTime()
      return draftTime > liveTime ? 'draft_changes' : 'published'
    }

    return 'unpublished'
  }

  const buildDocEnvelope = (
    type: ContentType,
    data: unknown,
    order = 0,
    now = new Date().toISOString(),
    publishedAt?: string
  ): ContentDoc => {
    if (!user?.uid) {
      throw new Error('You must be signed in to modify CMS content.')
    }
    if (type === 'settings' && !isSuperAdmin) {
      throw new Error('Only Super Admins can modify global site settings.')
    }
    const base: ContentDoc = {
      type,
      order,
      data: wrapFirestorePayload(data),
      updatedBy: user.uid, // Required by firestore.rules: d.updatedBy == request.auth.uid
      updatedByEmail: profile?.email || user.email || '',
      updatedByName: profile?.name || '',
      updatedAt: now,
    }
    if (publishedAt) {
      base.publishedAt = publishedAt
    }
    return base
  }

  const saveDraft = async (docId: string, type: ContentType, data: unknown, order = 0) => {
    setSaving(true)
    try {
      const now = new Date().toISOString()
      const docData = buildDocEnvelope(type, data, order, now)
      await setDoc(doc(db, 'drafts', docId), docData)
    } finally {
      setSaving(false)
    }
  }

  const saveAndPublish = async (docId: string, type: ContentType, data: unknown, order = 0) => {
    setPublishing(true)
    try {
      const now = new Date().toISOString()
      const docData = buildDocEnvelope(type, data, order, now, now)
      const batch = writeBatch(db)
      batch.set(doc(db, 'drafts', docId), docData)
      batch.set(doc(db, 'live', docId), docData)
      await batch.commit()
    } finally {
      setPublishing(false)
    }
  }

  const publishDoc = async (docId: string) => {
    if (!user?.uid) throw new Error('You must be signed in to publish content.')
    setPublishing(true)
    try {
      const draft = draftDocs[docId]
      if (!draft) return
      if (draft.type === 'settings' && !isSuperAdmin) {
        throw new Error('Only Super Admins can publish global site settings.')
      }
      const now = new Date().toISOString()
      const syncedDoc = buildDocEnvelope(draft.type, draft.data, draft.order ?? 0, now, now)
      const batch = writeBatch(db)
      batch.set(doc(db, 'drafts', docId), syncedDoc)
      batch.set(doc(db, 'live', docId), syncedDoc)
      await batch.commit()
    } finally {
      setPublishing(false)
    }
  }

  const discardDraft = async (docId: string) => {
    if (!user?.uid) throw new Error('You must be signed in.')
    setSaving(true)
    try {
      const live = liveDocs[docId]
      if (live) {
        // Restore draft copy to match live snapshot while keeping updatedBy == user.uid
        const livePublishedTime = live.publishedAt || live.updatedAt || new Date().toISOString()
        const restored = buildDocEnvelope(
          live.type,
          live.data,
          live.order ?? 0,
          livePublishedTime,
          livePublishedTime
        )
        await setDoc(doc(db, 'drafts', docId), restored)
      } else {
        await deleteDoc(doc(db, 'drafts', docId))
      }
    } finally {
      setSaving(false)
    }
  }

  const unpublishDoc = async (docId: string) => {
    setPublishing(true)
    try {
      await deleteDoc(doc(db, 'live', docId))
    } finally {
      setPublishing(false)
    }
  }

  const deleteItem = async (docId: string) => {
    setSaving(true)
    try {
      const batch = writeBatch(db)
      if (draftDocs[docId]) batch.delete(doc(db, 'drafts', docId))
      if (liveDocs[docId]) batch.delete(doc(db, 'live', docId))
      await batch.commit()
    } finally {
      setSaving(false)
    }
  }

  const publishAll = async () => {
    if (!user?.uid) throw new Error('You must be signed in to publish.')
    setPublishing(true)
    try {
      const batch = writeBatch(db)
      const now = new Date().toISOString()
      let count = 0

      for (const [docId, draft] of Object.entries(draftDocs)) {
        if (isLegacyShardDoc(docId, draft)) continue
        if (draft.type === 'settings' && !isSuperAdmin) continue
        const status = getDocStatus(docId)
        if (status === 'draft_changes' || status === 'draft_only') {
          const syncedDoc = buildDocEnvelope(draft.type, draft.data, draft.order ?? 0, now, now)
          batch.set(doc(db, 'drafts', docId), syncedDoc)
          batch.set(doc(db, 'live', docId), syncedDoc)
          count++
        }
      }

      if (count > 0) {
        await batch.commit()
      }
    } finally {
      setPublishing(false)
    }
  }

  const seedDefaults = async () => {
    if (!user?.uid || !isEditor) {
      throw new Error('Editor or Super Admin access is required to seed defaults.')
    }
    setSaving(true)
    try {
      const batch = writeBatch(db)
      const now = new Date().toISOString()

      // 1. Courses
      defaultCourses.forEach((c, idx) => {
        const docId = `course_${c.id}`
        const contentDoc = buildDocEnvelope('course', { ...c, order: idx }, idx, now, now)
        batch.set(doc(db, 'drafts', docId), contentDoc)
        batch.set(doc(db, 'live', docId), contentDoc)
      })

      // 2. Categories (wrapped in { items: [...] } map)
      const categoriesDoc = buildDocEnvelope(
        'category',
        { items: defaultCategories.map((c, idx) => ({ id: c.id, label: c.label, order: idx })) },
        0,
        now,
        now
      )
      batch.set(doc(db, 'drafts', 'categories'), categoriesDoc)
      batch.set(doc(db, 'live', 'categories'), categoriesDoc)

      // 3. Testimonials (wrapped in { items: [...] } map)
      const testimonialsDoc = buildDocEnvelope(
        'testimonial',
        { items: defaultTestimonials.map((t, idx) => ({ ...t, id: `test_${idx + 1}`, order: idx })) },
        0,
        now,
        now
      )
      batch.set(doc(db, 'drafts', 'testimonials'), testimonialsDoc)
      batch.set(doc(db, 'live', 'testimonials'), testimonialsDoc)

      // 4. FAQs (wrapped in { items: [...] } map)
      const faqsDoc = buildDocEnvelope(
        'faq',
        { items: defaultFaqs.map((f, idx) => ({ ...f, id: `faq_${idx + 1}`, order: idx })) },
        0,
        now,
        now
      )
      batch.set(doc(db, 'drafts', 'faqs'), faqsDoc)
      batch.set(doc(db, 'live', 'faqs'), faqsDoc)

      // 5. Partners (wrapped in { items: [...] } map)
      const partnersDoc = buildDocEnvelope(
        'partner',
        { items: defaultPartners },
        0,
        now,
        now
      )
      batch.set(doc(db, 'drafts', 'partners'), partnersDoc)
      batch.set(doc(db, 'live', 'partners'), partnersDoc)

      // 6. All Pages (home, explore, about, privacy, terms, accessibility)
      for (const [slug, pageContent] of Object.entries(defaultPages)) {
        const docId = `page_${slug}`
        const pageDoc = buildDocEnvelope('page', pageContent, 0, now, now)
        batch.set(doc(db, 'drafts', docId), pageDoc)
        batch.set(doc(db, 'live', docId), pageDoc)
      }

      // 7. Site Settings (Super Admin only per firestore.rules)
      if (isSuperAdmin) {
        const settingsDoc = buildDocEnvelope('settings', defaultSettings, 0, now, now)
        batch.set(doc(db, 'drafts', 'settings'), settingsDoc)
        batch.set(doc(db, 'live', 'settings'), settingsDoc)
      }

      // 8. UI Strings
      const stringsDoc = buildDocEnvelope('strings', defaultUi, 0, now, now)
      batch.set(doc(db, 'drafts', 'strings'), stringsDoc)
      batch.set(doc(db, 'live', 'strings'), stringsDoc)

      // Clean up any legacy per-item shard docs from earlier prototypes
      Object.entries(draftDocs).forEach(([docId, d]) => {
        if (isLegacyShardDoc(docId, d)) batch.delete(doc(db, 'drafts', docId))
      })
      Object.entries(liveDocs).forEach(([docId, d]) => {
        if (isLegacyShardDoc(docId, d)) batch.delete(doc(db, 'live', docId))
      })

      await batch.commit()
    } finally {
      setSaving(false)
    }
  }

  // Automatically seed defaults the very first time a Super Admin opens an empty database
  useEffect(() => {
    if (
      draftsLoaded &&
      liveLoaded &&
      !isDatabaseSeeded &&
      isSuperAdmin &&
      user?.uid &&
      !autoSeedAttempted.current
    ) {
      autoSeedAttempted.current = true
      seedDefaults().catch((err) => {
        console.warn('Auto-seed skipped:', err)
      })
    }
  }, [draftsLoaded, liveLoaded, isDatabaseSeeded, isSuperAdmin, user?.uid])

  // Non-destructively backfill any newly introduced CMS singleton documents & clean legacy shards
  useEffect(() => {
    if (
      !draftsLoaded ||
      !liveLoaded ||
      !isDatabaseSeeded ||
      !isEditor ||
      !user?.uid ||
      backfillAttempted.current
    ) {
      return
    }
    backfillAttempted.current = true

    const now = new Date().toISOString()
    const batch = writeBatch(db)
    let ops = 0

    const ensureSingleton = (docId: string, type: ContentType, payload: unknown, order = 0) => {
      if (type === 'settings' && !isSuperAdmin) return
      if (!draftDocs[docId] && !liveDocs[docId]) {
        const env = buildDocEnvelope(type, payload, order, now, now)
        batch.set(doc(db, 'drafts', docId), env)
        batch.set(doc(db, 'live', docId), env)
        ops += 2
      }
    }

    const hasAnyCourse =
      Object.keys(draftDocs).some((id) => id.startsWith('course_')) ||
      Object.keys(liveDocs).some((id) => id.startsWith('course_'))
    if (!hasAnyCourse) {
      defaultCourses.forEach((c, idx) => {
        ensureSingleton(`course_${c.id}`, 'course', { ...c, order: idx }, idx)
      })
    }

    ensureSingleton('categories', 'category', {
      items: defaultCategories.map((c, idx) => ({ id: c.id, label: c.label, order: idx })),
    })
    ensureSingleton('testimonials', 'testimonial', {
      items: defaultTestimonials.map((t, idx) => ({ ...t, id: `test_${idx + 1}`, order: idx })),
    })
    ensureSingleton('faqs', 'faq', {
      items: defaultFaqs.map((f, idx) => ({ ...f, id: `faq_${idx + 1}`, order: idx })),
    })
    ensureSingleton('partners', 'partner', { items: defaultPartners })

    for (const [slug, pageContent] of Object.entries(defaultPages)) {
      ensureSingleton(`page_${slug}`, 'page', pageContent)
    }

    ensureSingleton('strings', 'strings', defaultUi)
    if (isSuperAdmin) {
      ensureSingleton('settings', 'settings', defaultSettings)
    }

    Object.entries(draftDocs).forEach(([docId, d]) => {
      if (isLegacyShardDoc(docId, d)) {
        batch.delete(doc(db, 'drafts', docId))
        ops++
      }
    })
    Object.entries(liveDocs).forEach(([docId, d]) => {
      if (isLegacyShardDoc(docId, d)) {
        batch.delete(doc(db, 'live', docId))
        ops++
      }
    })

    if (ops > 0) {
      batch.commit().catch((err) => {
        console.warn('Backfill missing CMS docs skipped:', err)
      })
    }
  }, [draftsLoaded, liveLoaded, isDatabaseSeeded, isEditor, isSuperAdmin, user?.uid, draftDocs, liveDocs])

  // --- Entity Getters ---

  const getCourses = (): ItemWithStatus<Course>[] => {
    const courseIds = new Set<string>()
    Object.keys(draftDocs).forEach((id) => {
      if (id.startsWith('course_')) courseIds.add(id)
    })
    Object.keys(liveDocs).forEach((id) => {
      if (id.startsWith('course_')) courseIds.add(id)
    })

    // Fallback to bundled courses if Firestore has no course documents yet
    if (courseIds.size === 0) {
      return defaultCourses.map((c, idx) => ({
        id: c.id,
        docId: `course_${c.id}`,
        data: { ...c, order: idx },
        status: 'unpublished' as DocStatus,
        updatedAt: '',
        updatedBy: '',
        updatedByLabel: 'Bundled Default',
      }))
    }

    const result: ItemWithStatus<Course>[] = []
    courseIds.forEach((docId) => {
      const draft = draftDocs[docId]
      const live = liveDocs[docId]
      const status = getDocStatus(docId)
      const base = (draft || live) as ContentDoc<Course>

      if (base && base.data) {
        const cid = base.data.id || docId.replace('course_', '')
        const defCourse = defaultCourses.find((dc) => dc.id === cid)
        result.push({
          id: cid,
          docId,
          data: {
            ...base.data,
            materials: normalizeCourseMaterials(base.data.materials, defCourse),
            order: base.data.order ?? base.order ?? 0,
          },
          status,
          updatedAt: draft?.updatedAt || live?.updatedAt || '',
          updatedBy: draft?.updatedBy || live?.updatedBy || '',
          updatedByLabel: formatActor(draft || live),
          publishedAt: live?.publishedAt,
        })
      }
    })

    return result.sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
  }

  const getCourse = (id: string): ItemWithStatus<Course> | null => {
    const docId = `course_${id}`
    const draft = draftDocs[docId]
    const live = liveDocs[docId]

    if (!draft && !live) {
      const bundledIdx = defaultCourses.findIndex((c) => c.id === id)
      if (bundledIdx >= 0) {
        const bundled = defaultCourses[bundledIdx]
        return {
          id,
          docId,
          data: { ...bundled, order: bundledIdx },
          status: 'unpublished',
          updatedAt: '',
          updatedBy: '',
          updatedByLabel: 'Bundled Default',
        }
      }
      return null
    }

    const base = (draft || live) as ContentDoc<Course>
    const defCourse = defaultCourses.find((dc) => dc.id === id)
    return {
      id,
      docId,
      data: {
        ...base.data,
        materials: normalizeCourseMaterials(base.data.materials, defCourse),
        order: base.data.order ?? base.order ?? 0,
      },
      status: getDocStatus(docId),
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(draft || live),
      publishedAt: live?.publishedAt,
    }
  }

  const reorderCourses = async (orderedIds: string[]) => {
    if (!user?.uid) throw new Error('You must be signed in.')
    setSaving(true)
    try {
      const courses = getCourses()
      const byId = new Map(courses.map((c) => [c.id, c]))
      const batch = writeBatch(db)
      const now = new Date().toISOString()

      orderedIds.forEach((id, idx) => {
        const item = byId.get(id)
        if (!item) return
        const nextCourse: Course = { ...item.data, order: idx }
        const wasPublished = item.status === 'published' && Boolean(liveDocs[item.docId])
        if (wasPublished) {
          const env = buildDocEnvelope('course', nextCourse, idx, now, now)
          batch.set(doc(db, 'drafts', item.docId), env)
          batch.set(doc(db, 'live', item.docId), env)
        } else {
          const env = buildDocEnvelope('course', nextCourse, idx, now)
          batch.set(doc(db, 'drafts', item.docId), env)
        }
      })

      await batch.commit()
    } finally {
      setSaving(false)
    }
  }

  const duplicateCourse = async (courseId: string): Promise<string> => {
    const existing = getCourse(courseId)
    if (!existing) throw new Error('Course not found.')
    const all = getCourses()
    const suffix = Math.random().toString(36).slice(2, 6)
    const newId = `${existing.data.id}-copy-${suffix}`
    const cloned: Course = JSON.parse(JSON.stringify(existing.data))
    cloned.id = newId
    cloned.title = {
      en: `${cloned.title.en} (Copy)`,
      ne: `${cloned.title.ne} (प्रतिलिपि)`,
    }
    cloned.order = all.length
    await saveDraft(`course_${newId}`, 'course', cloned, all.length)
    return newId
  }

  const getCategories = (): ItemWithStatus<Category[]> => {
    const docId = 'categories'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = draft || live
    const fallback = defaultCategories.map((c, i) => ({ id: c.id, label: c.label, order: i }))
    const data = unwrapArrayPayload<Category>(base?.data, fallback)

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getTestimonials = (): ItemWithStatus<Testimonial[]> => {
    const docId = 'testimonials'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = draft || live
    const fallback = defaultTestimonials.map((t, idx) => ({ ...t, id: `test_${idx + 1}`, order: idx }))
    const data = unwrapArrayPayload<Testimonial>(base?.data, fallback)

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getFaqs = (): ItemWithStatus<FaqItem[]> => {
    const docId = 'faqs'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = draft || live
    const fallback = defaultFaqs.map((f, idx) => ({ ...f, id: `faq_${idx + 1}`, order: idx }))
    const data = unwrapArrayPayload<FaqItem>(base?.data, fallback)

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getPartners = (): ItemWithStatus<string[]> => {
    const docId = 'partners'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = draft || live
    const rawItems = unwrapArrayPayload<string | { name: string }>(base?.data, defaultPartners)
    const data = rawItems.map((x) => (typeof x === 'string' ? x : x.name)).filter(Boolean)

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getHomePage = (): ItemWithStatus<PageContent> => {
    const docId = 'page_home'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<PageContent> | undefined
    const settingsData = getSettings().data

    const fallbackHomeData: HomePageData = {
      ...defaultHomeData,
      hero: settingsData.hero || defaultHomeData.hero,
      valueProps: settingsData.valueProps || defaultHomeData.valueProps,
      intro: settingsData.intro || defaultHomeData.intro,
      cta: settingsData.cta || defaultHomeData.cta,
    }

    const mergedHomeData: HomePageData = {
      ...fallbackHomeData,
      ...(base?.data?.homeData || {}),
      hero: base?.data?.homeData?.hero || fallbackHomeData.hero,
      valueProps: base?.data?.homeData?.valueProps || fallbackHomeData.valueProps,
      intro: base?.data?.homeData?.intro || fallbackHomeData.intro,
      coursesHeader: base?.data?.homeData?.coursesHeader || fallbackHomeData.coursesHeader,
      voicesHeader: base?.data?.homeData?.voicesHeader || fallbackHomeData.voicesHeader,
      faqHeader: base?.data?.homeData?.faqHeader || fallbackHomeData.faqHeader,
      partnersHeader: base?.data?.homeData?.partnersHeader || fallbackHomeData.partnersHeader,
      cta: base?.data?.homeData?.cta || fallbackHomeData.cta,
    }

    const data: PageContent = {
      slug: 'home',
      title: base?.data?.title || defaultPages.home.title,
      homeData: mergedHomeData,
    }

    return {
      id: 'home',
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getLayoutPage = (): ItemWithStatus<PageContent> => {
    const docId = 'page_layout'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<PageContent> | undefined
    const rawLayout = base?.data?.layoutData

    const mergedLayout: LayoutConfig = {
      header: {
        ...defaultLayoutConfig.header,
        ...(rawLayout?.header || {}),
        navLinks: rawLayout?.header?.navLinks ?? defaultLayoutConfig.header.navLinks,
        ctaButton: {
          ...defaultLayoutConfig.header.ctaButton,
          ...(rawLayout?.header?.ctaButton || {}),
        },
      },
      footer: {
        ...defaultLayoutConfig.footer,
        ...(rawLayout?.footer || {}),
        columns: rawLayout?.footer?.columns ?? defaultLayoutConfig.footer.columns,
        socialLinks: rawLayout?.footer?.socialLinks ?? defaultLayoutConfig.footer.socialLinks,
      },
    }

    const data: PageContent = {
      slug: 'layout',
      title: base?.data?.title || defaultPages.layout?.title || {
        en: 'Header & Footer Navigation',
        ne: 'हेडर र फुटर नेभिगेसन',
      },
      layoutData: mergedLayout,
    }

    return {
      id: 'layout',
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getResourcesPage = (): ItemWithStatus<PageContent> => {
    const docId = 'page_resources'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<PageContent> | undefined
    const rawRes = base?.data?.resourcesData

    const mergedRes: ResourcesPageData = {
      ...defaultResourcesData,
      ...(rawRes || {}),
      items: normalizeResourceItems(rawRes?.items, defaultResourcesData.items).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    }

    const data: PageContent = {
      slug: 'resources',
      title: base?.data?.title || defaultPages.resources?.title || {
        en: 'Learning Materials & Field Guides',
        ne: 'सिकाइ सामग्री तथा फिल्ड गाइडहरू',
      },
      resourcesData: mergedRes,
    }

    return {
      id: 'resources',
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getCustomPages = (): ItemWithStatus<PageContent>[] => {
    const docIds = new Set<string>()
    Object.keys(draftDocs).forEach((id) => {
      if (id.startsWith('page_custom_')) docIds.add(id)
    })
    Object.keys(liveDocs).forEach((id) => {
      if (id.startsWith('page_custom_')) docIds.add(id)
    })

    const result: ItemWithStatus<PageContent>[] = []
    docIds.forEach((docId) => {
      const draft = draftDocs[docId]
      const live = liveDocs[docId]
      const base = (draft || live) as ContentDoc<PageContent> | undefined
      if (!base?.data) return
      const slug = base.data.slug || docId.replace(/^page_/, '')
      result.push({
        id: slug,
        docId,
        data: {
          ...base.data,
          slug,
          isCustom: true,
        },
        status: getDocStatus(docId),
        updatedAt: draft?.updatedAt || live?.updatedAt || '',
        updatedBy: draft?.updatedBy || live?.updatedBy || '',
        updatedByLabel: formatActor(base),
        publishedAt: live?.publishedAt,
      })
    })

    return result.sort((a, b) =>
      (a.data.title?.en || a.id).localeCompare(b.data.title?.en || b.id)
    )
  }

  const createCustomPage = async (title: Bi, rawSlug: string): Promise<string> => {
    const clean = rawSlug
      .toLowerCase()
      .trim()
      .replace(/^custom_/, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (!clean) {
      throw new Error('Please provide a valid URL slug (letters and numbers).')
    }

    const fullSlug = `custom_${clean}`
    const docId = `page_${fullSlug}`
    if (draftDocs[docId] || liveDocs[docId]) {
      throw new Error(`A custom page with slug "${clean}" already exists.`)
    }

    const newPage: PageContent = {
      slug: fullSlug,
      isCustom: true,
      title: {
        en: title.en.trim() || clean,
        ne: title.ne.trim() || title.en.trim() || clean,
      },
      subtitle: { en: '', ne: '' },
      sections: [
        {
          kind: 'text',
          h: { en: 'Overview', ne: 'संक्षिप्त विवरण' },
          p: { en: '', ne: '' },
        },
      ],
    }

    await saveDraft(docId, 'page', newPage, 0)
    return fullSlug
  }

  const deleteCustomPage = async (slug: string): Promise<void> => {
    const fullSlug = slug.startsWith('custom_') ? slug : `custom_${slug}`
    await deleteItem(`page_${fullSlug}`)
  }

  const getPage = (slug: string): ItemWithStatus<PageContent> | null => {
    if (slug === 'home') return getHomePage()
    if (slug === 'layout') return getLayoutPage()
    if (slug === 'resources') return getResourcesPage()
    const docId = `page_${slug}`
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<PageContent> | undefined
    const fallback = defaultPages[slug]
    if (!base?.data && !fallback) return null

    const data: PageContent = {
      ...(fallback || { slug: slug as PageContent['slug'], title: { en: slug, ne: slug } }),
      ...(base?.data || {}),
    }

    return {
      id: slug,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getSettings = (): ItemWithStatus<SiteSettings> => {
    const docId = 'settings'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<SiteSettings> | undefined

    const data: SiteSettings = {
      ...defaultSettings,
      ...(base?.data || {}),
      announcement: {
        ...(defaultSettings.announcement || { enabled: false, text: { en: '', ne: '' }, link: '' }),
        ...(base?.data?.announcement || {}),
      },
      brand: {
        ...defaultSettings.brand,
        ...(base?.data?.brand || {}),
      },
      contact: {
        ...(defaultSettings.contact || { email: '', phone: '', address: { en: '', ne: '' } }),
        ...(base?.data?.contact || {}),
      },
      survey: {
        ...defaultSettings.survey,
        ...(base?.data?.survey || {}),
      },
    }

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const getUiStrings = (): ItemWithStatus<Record<string, Bi>> => {
    const docId = 'strings'
    const draft = draftDocs[docId]
    const live = liveDocs[docId]
    const status = getDocStatus(docId)
    const base = (draft || live) as ContentDoc<Record<string, Bi>> | undefined
    const remote = base?.data || {}

    const data: Record<string, Bi> = {}
    const keys = new Set([...Object.keys(defaultUi), ...Object.keys(remote)])
    keys.forEach((k) => {
      const def = (defaultUi as Record<string, Bi>)[k]
      const rem = remote[k]
      data[k] = {
        en: rem?.en !== undefined ? rem.en : def?.en || '',
        ne: rem?.ne !== undefined ? rem.ne : def?.ne || '',
      }
    })

    return {
      id: docId,
      docId,
      data,
      status,
      updatedAt: draft?.updatedAt || live?.updatedAt || '',
      updatedBy: draft?.updatedBy || live?.updatedBy || '',
      updatedByLabel: formatActor(base),
      publishedAt: live?.publishedAt,
    }
  }

  const describeDoc = (docId: string, docObj: ContentDoc): Omit<PendingChangeItem, 'status'> => {
    if (docId.startsWith('course_')) {
      const c = docObj.data as Course
      const cid = c?.id || docId.replace('course_', '')
      return {
        docId,
        type: 'course',
        title: c?.title?.en || cid,
        subtitle: 'Course curriculum, media & field notes',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'course-edit',
        courseId: cid,
      }
    }
    if (docId === 'categories') {
      return {
        docId,
        type: 'category',
        title: 'Course Categories',
        subtitle: 'Filter pills & category taxonomy',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'categories',
      }
    }
    if (docId === 'page_home') {
      return {
        docId,
        type: 'page',
        title: 'Homepage Layout & Copy',
        subtitle: 'Hero, value pillars, 25-year video, stats & CTA',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'homepage',
      }
    }
    if (docId === 'page_layout') {
      return {
        docId,
        type: 'page',
        title: 'Header & Footer Navigation',
        subtitle: 'Menu links, CTA button, footer columns, social links & copyright',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'header-footer',
      }
    }
    if (docId === 'page_resources') {
      return {
        docId,
        type: 'page',
        title: 'Learning Materials & Field Guides',
        subtitle: 'Downloadable PDFs, posters, toolkits & homepage spotlight (#/resources)',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'materials',
      }
    }
    if (docId === 'testimonials') {
      return {
        docId,
        type: 'testimonial',
        title: 'Voices From the Field (Testimonials)',
        subtitle: 'Community quotes on the homepage',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'homepage',
      }
    }
    if (docId === 'faqs') {
      return {
        docId,
        type: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: 'Homepage FAQ accordion items',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'homepage',
      }
    }
    if (docId === 'partners') {
      return {
        docId,
        type: 'partner',
        title: 'Partner Marquee',
        subtitle: 'Partner organizations strip on homepage',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'homepage',
      }
    }
    if (docId.startsWith('page_custom_')) {
      const cleanSlug = docId.replace('page_custom_', '')
      const p = docObj.data as PageContent
      return {
        docId,
        type: 'page',
        title: p?.title?.en || `Custom Page: ${cleanSlug}`,
        subtitle: `Custom page (#/page/${cleanSlug})`,
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'pages',
      }
    }
    if (docId.startsWith('page_')) {
      const slug = docId.replace('page_', '')
      const p = docObj.data as PageContent
      return {
        docId,
        type: 'page',
        title: p?.title?.en || `Page: ${slug}`,
        subtitle: `Public page (#/${slug === 'explore' ? 'courses' : slug})`,
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'pages',
      }
    }
    if (docId === 'strings') {
      return {
        docId,
        type: 'strings',
        title: 'Bilingual UI Translations',
        subtitle: 'Buttons, navigation & player labels (EN / NE)',
        updatedAt: docObj.updatedAt,
        updatedByLabel: formatActor(docObj),
        navTab: 'strings',
      }
    }
    return {
      docId,
      type: 'settings',
      title: 'Global Site Settings',
      subtitle: 'Announcement banner, branding, contact & survey options',
      updatedAt: docObj.updatedAt,
      updatedByLabel: formatActor(docObj),
      navTab: 'settings',
    }
  }

  const getPendingItems = (): PendingChangeItem[] => {
    const items: PendingChangeItem[] = []
    for (const [docId, draft] of Object.entries(draftDocs)) {
      if (isLegacyShardDoc(docId, draft)) continue
      const status = getDocStatus(docId)
      if (status === 'draft_changes' || status === 'draft_only') {
        items.push({
          ...describeDoc(docId, draft),
          status,
        })
      }
    }
    return items.sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    )
  }

  const pendingChangesCount = getPendingItems().length

  const exportAllJson = (): string => {
    const customPagesMap: Record<string, PageContent> = {}
    getCustomPages().forEach((cp) => {
      customPagesMap[cp.id] = cp.data
    })

    const payload = {
      exportedAt: new Date().toISOString(),
      project: 'heifer-academy-cms',
      courses: getCourses().map((c) => c.data),
      categories: getCategories().data,
      homepage: getHomePage().data,
      layout: getLayoutPage().data,
      resources: getResourcesPage().data,
      testimonials: getTestimonials().data,
      faqs: getFaqs().data,
      partners: getPartners().data,
      pages: {
        explore: getPage('explore')?.data,
        about: getPage('about')?.data,
        privacy: getPage('privacy')?.data,
        terms: getPage('terms')?.data,
        accessibility: getPage('accessibility')?.data,
        ...customPagesMap,
      },
      settings: getSettings().data,
      strings: getUiStrings().data,
    }
    return JSON.stringify(payload, null, 2)
  }

  return (
    <CmsContext.Provider
      value={{
        loading,
        saving,
        publishing,
        lastSync,
        isDatabaseSeeded,
        pendingChangesCount,
        getCourses,
        getCourse,
        getCategories,
        getTestimonials,
        getFaqs,
        getPartners,
        getHomePage,
        getLayoutPage,
        getResourcesPage,
        getCustomPages,
        getPage,
        getSettings,
        getUiStrings,
        getPendingItems,
        saveDraft,
        saveAndPublish,
        publishDoc,
        discardDraft,
        unpublishDoc,
        deleteItem,
        createCustomPage,
        deleteCustomPage,
        reorderCourses,
        duplicateCourse,
        publishAll,
        seedDefaults,
        exportAllJson,
      }}
    >
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  const ctx = useContext(CmsContext)
  if (!ctx) throw new Error('useCms must be used inside CmsProvider')
  return ctx
}
