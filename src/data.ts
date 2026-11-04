/**
 * @file src/data.ts
 * Domain barrel export module.
 * 
 * Re-exports modularized data domains with 100% backward compatibility:
 * - categories: src/data/categories.ts
 * - courses: src/data/courses.ts
 * - helpers: src/data/helpers.ts (lessonsOf, totalSeconds, thumb, num, clock, duration, categoryLabel)
 * - ui: src/data/ui.ts
 * - testimonials: src/data/testimonials.ts
 * - faqs: src/data/faq.ts
 * - partners: src/data/partners.ts
 * - demographics: src/data/demographics.ts (roles, genders, provinces)
 * - homeData: src/data/homeData.ts
 * - pages: src/data/pages.ts
 * - layoutConfig: src/data/layoutConfig.ts
 * - resourcesData: src/data/resourcesData.ts
 * - settings: src/data/settings.ts
 */

export type {
  Lang,
  Bi,
  CategoryId,
  Lesson,
  Module,
  Course,
  CourseMaterial,
  MaterialFormat,
  ResourceItem,
  ResourcesPageData,
  LayoutConfig,
} from '@shared/schema'

export * from './data/categories'
export * from './data/courses'
export * from './data/helpers'
export * from './data/ui'
export * from './data/testimonials'
export * from './data/faq'
export * from './data/partners'
export * from './data/demographics'
export * from './data/homeData'
export * from './data/pages'
export * from './data/layoutConfig'
export * from './data/resourcesData'
export * from './data/settings'
