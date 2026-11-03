import { healCourseId } from './url'

export type Route =
  | { name: 'home' }
  | { name: 'courses'; cat?: string }
  | { name: 'resources'; cat?: string }
  | { name: 'material'; id: string }
  | { name: 'course'; id: string }
  | { name: 'learn'; id: string; n: number }
  | { name: 'page'; slug: 'about' | 'privacy' | 'terms' | 'accessibility' }
  | { name: 'customPage'; slug: string }
  | { name: 'notFound'; path: string }

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '').trim()
  if (!raw || raw === '/' || !raw.startsWith('/')) return { name: 'home' }

  const qIdx = raw.indexOf('?')
  const rawPath = qIdx >= 0 ? raw.slice(0, qIdx) : raw
  const queryStr = qIdx >= 0 ? raw.slice(qIdx + 1) : ''
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath
  const params = new URLSearchParams(queryStr)
  const catParam = params.get('cat') || undefined

  if (path === '/') return { name: 'home' }
  if (path === '/courses') return { name: 'courses', cat: catParam }
  if (path === '/resources' || path === '/materials') return { name: 'resources', cat: catParam }

  let m: RegExpMatchArray | null
  if ((m = path.match(/^\/(?:material|materials|resources)\/([^\/?#]+)$/))) {
    return { name: 'material', id: safeDecode(m[1]) }
  }
  if ((m = path.match(/^\/course\/([^\/?#]+)$/))) {
    return { name: 'course', id: healCourseId(safeDecode(m[1])) }
  }
  if ((m = path.match(/^\/learn\/([^\/?#]+)(?:\/(\d+))?$/))) {
    return { name: 'learn', id: healCourseId(safeDecode(m[1])), n: Number(m[2] ?? 0) }
  }
  if ((m = path.match(/^\/(about|privacy|terms|accessibility)$/))) {
    return { name: 'page', slug: m[1] as 'about' }
  }
  if ((m = path.match(/^\/page\/([^\/?#]+)$/))) {
    return { name: 'customPage', slug: safeDecode(m[1]) }
  }
  return { name: 'notFound', path }
}

export function getPageIdentity(route: Route): string {
  switch (route.name) {
    case 'home':
      return 'home'
    case 'courses':
      return 'courses'
    case 'resources':
      return 'resources'
    case 'material':
      return `material:${route.id}`
    case 'course':
      return `course:${route.id}`
    case 'learn':
      return `learn:${route.id}`
    case 'page':
      return `page:${route.slug}`
    case 'customPage':
      return `customPage:${route.slug}`
    case 'notFound':
      return `notFound:${route.path}`
  }
}

