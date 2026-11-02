import type { Course, CourseMaterial, ResourceItem } from './schema'

const LEGACY_COURSE_ID_MAP: Record<string, string> = {
  'goat-farming': 'febl',
  'climate-ag': 'climate',
  'coop-finance': 'pearls',
}

const LEGACY_PLACEHOLDER_URLS = new Set([
  '#',
  '#/',
  '#/resources',
  '#/materials',
  '#/course/goat-farming',
  '#/course/climate-ag',
  '#/course/coop-finance',
])

const DANGEROUS_SCHEME_RE = /^(?:javascript|vbscript|data|file):/i
const PROTOCOL_RELATIVE_RE = /^\/\//
const BARE_DOMAIN_RE = /^(?:www\.[a-z0-9-]+(?:\.[a-z0-9-]+)+|[a-z0-9-]+(?:\.[a-z0-9-]+)+\/(?:[^\s]*)?)$/i
const SAFE_DATA_IMAGE_RE = /^data:image\/(?:png|jpe?g|webp|gif|svg\+xml);base64,[a-z0-9+/=\s]+$/i
const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/

/**
 * Sanitizes any CMS-authored or user-supplied href to prevent protocol XSS (`javascript:`, `data:`)
 * and normalizes bare domains (`www.heifernepal.org`) or bare internal routes (`/courses`).
 */
export function sanitizeHref(raw: string | undefined | null, fallback = '#/'): string {
  if (!raw) return fallback
  // Strip ASCII control characters and whitespace
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!cleaned) return fallback

  if (DANGEROUS_SCHEME_RE.test(cleaned) || PROTOCOL_RELATIVE_RE.test(cleaned)) {
    return fallback
  }

  if (/^(?:https?:\/\/|mailto:|tel:)/i.test(cleaned)) {
    return cleaned
  }

  if (cleaned.startsWith('#')) {
    if (cleaned === '#') return fallback
    // Heal legacy broken course routes if entered manually
    const legacyMatch = cleaned.match(/^#\/course\/([\w-]+)\/?$/)
    if (legacyMatch && LEGACY_COURSE_ID_MAP[legacyMatch[1]]) {
      return `#/course/${LEGACY_COURSE_ID_MAP[legacyMatch[1]]}`
    }
    return cleaned
  }

  if (cleaned.startsWith('/')) {
    return `#${cleaned}`
  }

  if (BARE_DOMAIN_RE.test(cleaned)) {
    return `https://${cleaned}`
  }

  return fallback
}

/**
 * Returns true if the sanitized href opens an external http(s) URL in a new tab.
 */
export function isExternalHttpUrl(raw: string | undefined | null): boolean {
  if (!raw) return false
  const s = sanitizeHref(raw, '')
  return /^https?:\/\//i.test(s)
}

/**
 * Sanitizes image URLs (`course.image`, `resource.image`, custom logos, page images).
 */
export function sanitizeImageSrc(raw: string | undefined | null, fallback = ''): string {
  if (!raw) return fallback
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!cleaned) return fallback

  if (SAFE_DATA_IMAGE_RE.test(cleaned)) return cleaned
  if (DANGEROUS_SCHEME_RE.test(cleaned) || PROTOCOL_RELATIVE_RE.test(cleaned)) {
    return fallback
  }
  if (/^https?:\/\//i.test(cleaned)) return cleaned
  if (cleaned.startsWith('/') || cleaned.startsWith('./') || cleaned.startsWith('../') || cleaned.startsWith('blob:')) {
    return cleaned
  }
  if (BARE_DOMAIN_RE.test(cleaned)) {
    return `https://${cleaned}`
  }
  return fallback
}

/**
 * Safely extracts an 11-character YouTube video ID from either a raw ID or a full YouTube URL.
 * Returns empty string if invalid, preventing iframe URL injection.
 */
export function extractYouTubeId(raw: string | undefined | null): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (YT_ID_RE.test(trimmed)) return trimmed

  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const u = new URL(withProto)
    const host = u.hostname.replace(/^www\./i, '').toLowerCase()
    if (host === 'youtu.be') {
      const seg = u.pathname.split('/').filter(Boolean)[0] || ''
      if (YT_ID_RE.test(seg)) return seg
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const v = u.searchParams.get('v')
      if (v && YT_ID_RE.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if ((parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') && parts[1]) {
        if (YT_ID_RE.test(parts[1])) return parts[1]
      }
    }
  } catch {
    // Ignore malformed URLs
  }

  return ''
}

/**
 * Maps legacy course IDs (`goat-farming` -> `febl`, `climate-ag` -> `climate`, `coop-finance` -> `pearls`).
 */
export function healCourseId(rawId: string | undefined | null): string {
  if (!rawId) return ''
  const trimmed = rawId.trim()
  return LEGACY_COURSE_ID_MAP[trimmed] || trimmed
}

/**
 * Normalizes a material's optional external/custom URL so legacy placeholder values
 * (`#/course/goat-farming`, `#/resources`, etc.) don't hijack or break navigation.
 */
export function healMaterialUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) return ''
  const trimmed = rawUrl.trim()
  if (!trimmed || LEGACY_PLACEHOLDER_URLS.has(trimmed)) return ''
  const safe = sanitizeHref(trimmed, '')
  if (!safe || LEGACY_PLACEHOLDER_URLS.has(safe)) return ''
  return safe
}

/**
 * Normalizes a list of ResourceItems from Firestore or local state, healing legacy course IDs,
 * cleaning placeholder URLs, and backfilling rich reader content from bundled defaults when absent.
 */
export function normalizeResourceItems(
  items: ResourceItem[] | undefined,
  defaultItems: ResourceItem[]
): ResourceItem[] {
  const source = items ?? defaultItems
  const defaultMap = new Map(defaultItems.map((d) => [d.id, d]))

  return source.map((item, idx) => {
    const def = defaultMap.get(item.id)
    const healedCourseId = healCourseId(item.courseId ?? def?.courseId)
    const healedUrl = healMaterialUrl(item.url)
    return {
      ...def,
      ...item,
      courseId: healedCourseId,
      url: healedUrl,
      body:
        item.body?.en || item.body?.ne
          ? item.body
          : def?.body,
      keyPoints:
        item.keyPoints && item.keyPoints.length > 0
          ? item.keyPoints
          : def?.keyPoints,
      facilitatorTip:
        item.facilitatorTip?.en || item.facilitatorTip?.ne
          ? item.facilitatorTip
          : def?.facilitatorTip,
      order: item.order ?? idx,
    }
  })
}

/**
 * Normalizes course-attached materials (`course.materials`) and backfills rich reader fields from defaults.
 */
export function normalizeCourseMaterials(
  materials: CourseMaterial[] | undefined,
  defaultCourse?: Course
): CourseMaterial[] {
  if (!materials) return defaultCourse?.materials ? [...defaultCourse.materials] : []
  const defMap = new Map((defaultCourse?.materials || []).map((m) => [m.id, m]))
  return materials.map((mat) => {
    const def = defMap.get(mat.id)
    return {
      ...def,
      ...mat,
      url: healMaterialUrl(mat.url),
      body:
        mat.body?.en || mat.body?.ne
          ? mat.body
          : def?.body,
      keyPoints:
        mat.keyPoints && mat.keyPoints.length > 0
          ? mat.keyPoints
          : def?.keyPoints,
      facilitatorTip:
        mat.facilitatorTip?.en || mat.facilitatorTip?.ne
          ? mat.facilitatorTip
          : def?.facilitatorTip,
    }
  })
}

