import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

/**
 * Lightweight in-memory TypeScript ESM loader so tests execute the real
 * source modules (`shared/url.ts`, `shared/routing.ts`, `src/data.ts`) directly.
 */
const moduleCache = new Map()

async function loadTsModule(relPath) {
  const absPath = path.resolve(ROOT, relPath)
  if (moduleCache.has(absPath)) return moduleCache.get(absPath)

  let source = fs.readFileSync(absPath, 'utf8')

  // Rewrite local & alias imports inside transpiled source so data URLs resolve cleanly
  const resolveImport = (specifier) => {
    let targetAbs = null
    if (specifier.startsWith('@shared/')) {
      targetAbs = path.resolve(ROOT, 'shared', specifier.slice('@shared/'.length))
    } else if (specifier.startsWith('./') || specifier.startsWith('../')) {
      targetAbs = path.resolve(path.dirname(absPath), specifier)
    }
    if (!targetAbs) return specifier
    for (const candidate of [targetAbs, `${targetAbs}.ts`, `${targetAbs}.tsx`]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return path.relative(ROOT, candidate).replace(/\\/g, '/')
      }
    }
    return specifier
  }

  // Pre-load dependencies recursively
  const importRegex = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
  let match
  const deps = new Set()
  while ((match = importRegex.exec(source)) !== null) {
    const spec = match[1]
    const resolvedRel = resolveImport(spec)
    if (resolvedRel !== spec) deps.add(resolvedRel)
  }

  const depDataUrls = new Map()
  for (const depRel of deps) {
    await loadTsModule(depRel)
    depDataUrls.set(depRel, moduleCache.get(`${path.resolve(ROOT, depRel)}:url`))
  }

  // Transpile TypeScript -> ES2022
  const transpiled = ts.transpileModule(source, {
    fileName: absPath,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      verbatimModuleSyntax: false,
    },
  }).outputText

  const rewritten = transpiled.replace(
    /((?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"])([^'"]+)(['"])/g,
    (full, pre, spec, post) => {
      const resolvedRel = resolveImport(spec)
      const dataUrl = depDataUrls.get(resolvedRel)
      return dataUrl ? `${pre}${dataUrl}${post}` : full
    }
  )

  const dataUrl = `data:text/javascript;base64,${Buffer.from(rewritten, 'utf8').toString('base64')}`
  moduleCache.set(`${absPath}:url`, dataUrl)
  const mod = await import(dataUrl)
  moduleCache.set(absPath, mod)
  return mod
}

function collectSourceFiles(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      results.push(...collectSourceFiles(full))
    } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
      results.push(full)
    }
  }
  return results
}

let passed = 0
let failed = 0

async function runTest(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  PASS  ${name}`)
  } catch (err) {
    failed++
    console.error(`  FAIL  ${name}`)
    console.error(`        ${err instanceof Error ? err.message : String(err)}`)
  }
}

console.log('\n============================================================')
console.log(' Heifer Academy — Comprehensive Automated Test Suite')
console.log('============================================================\n')

const urlMod = await loadTsModule('shared/url.ts')
const routingMod = await loadTsModule('shared/routing.ts')
const dataMod = await loadTsModule('src/data.ts')

console.log('[1/4] Routing & Navigation Integrity')

await runTest('Resolves home and in-page anchors (#main, #faq) to Home without hijacking navigation', () => {
  assert.deepEqual(routingMod.parseRoute(''), { name: 'home' })
  assert.deepEqual(routingMod.parseRoute('#'), { name: 'home' })
  assert.deepEqual(routingMod.parseRoute('#/'), { name: 'home' })
  assert.deepEqual(routingMod.parseRoute('#main'), { name: 'home' })
  assert.deepEqual(routingMod.parseRoute('#faq'), { name: 'home' })
})

await runTest('Parses #/courses and #/resources with category query filters and trailing slashes', () => {
  assert.deepEqual(routingMod.parseRoute('#/courses'), { name: 'courses', cat: undefined })
  assert.deepEqual(routingMod.parseRoute('#/courses/'), { name: 'courses', cat: undefined })
  assert.deepEqual(routingMod.parseRoute('#/courses?cat=livestock'), { name: 'courses', cat: 'livestock' })
  assert.deepEqual(routingMod.parseRoute('#/resources'), { name: 'resources', cat: undefined })
  assert.deepEqual(routingMod.parseRoute('#/materials?cat=cooperatives'), { name: 'resources', cat: 'cooperatives' })
})

await runTest('Routes #/material/:id, #/materials/:id, and #/resources/:id to MaterialDetail', () => {
  assert.deepEqual(routingMod.parseRoute('#/material/res-cornerstones-guide'), {
    name: 'material',
    id: 'res-cornerstones-guide',
  })
  assert.deepEqual(routingMod.parseRoute('#/materials/pog-ceremony-checklist/'), {
    name: 'material',
    id: 'pog-ceremony-checklist',
  })
  assert.deepEqual(routingMod.parseRoute('#/resources/sc-shg-action-sheet'), {
    name: 'material',
    id: 'sc-shg-action-sheet',
  })
})

await runTest('Automatically heals legacy broken course slugs (goat-farming, climate-ag, coop-finance)', () => {
  assert.deepEqual(routingMod.parseRoute('#/course/goat-farming'), { name: 'course', id: 'febl' })
  assert.deepEqual(routingMod.parseRoute('#/course/climate-ag'), { name: 'course', id: 'climate' })
  assert.deepEqual(routingMod.parseRoute('#/course/coop-finance'), { name: 'course', id: 'pearls' })
  assert.deepEqual(routingMod.parseRoute('#/learn/climate-ag/2'), { name: 'learn', id: 'climate', n: 2 })
})

await runTest('Routes unknown hash paths to explicit notFound instead of silently dropping onto Home', () => {
  assert.deepEqual(routingMod.parseRoute('#/nonexistent-route'), {
    name: 'notFound',
    path: '/nonexistent-route',
  })
})

await runTest('Keeps stable page identity across ?cat= filter taps to prevent scroll-jump lag on mobile', () => {
  const r1 = routingMod.parseRoute('#/resources')
  const r2 = routingMod.parseRoute('#/resources?cat=livestock')
  assert.equal(routingMod.getPageIdentity(r1), routingMod.getPageIdentity(r2))

  const c1 = routingMod.parseRoute('#/courses')
  const c2 = routingMod.parseRoute('#/courses?cat=agriculture')
  assert.equal(routingMod.getPageIdentity(c1), routingMod.getPageIdentity(c2))
})

console.log('\n[2/4] URL, Image & YouTube Security Sanitization')

await runTest('Blocks XSS and dangerous schemes in sanitizeHref while normalizing valid links', () => {
  assert.equal(urlMod.sanitizeHref('javascript:alert(1)', '#/'), '#/')
  assert.equal(urlMod.sanitizeHref('  JavaScript:confirm(document.cookie)', '#/'), '#/')
  assert.equal(urlMod.sanitizeHref('\u0000javascript:alert(1)', '#/'), '#/')
  assert.equal(urlMod.sanitizeHref('vbscript:msgbox(1)', '#/'), '#/')
  assert.equal(urlMod.sanitizeHref('data:text/html,<script>alert(1)</script>', '#/'), '#/')
  assert.equal(urlMod.sanitizeHref('//evil.example.com/phish', '#/'), '#/')

  assert.equal(urlMod.sanitizeHref('https://heifernepal.org/'), 'https://heifernepal.org/')
  assert.equal(urlMod.sanitizeHref('www.heifernepal.org'), 'https://www.heifernepal.org')
  assert.equal(urlMod.sanitizeHref('/resources'), '#/resources')
  assert.equal(urlMod.sanitizeHref('#/course/goat-farming'), '#/course/febl')
})

await runTest('Blocks dangerous image sources while allowing HTTPS, relative assets, and base64 raster/svg images', () => {
  assert.equal(urlMod.sanitizeImageSrc('javascript:alert(1)', '/fallback.png'), '/fallback.png')
  assert.equal(urlMod.sanitizeImageSrc('data:text/html,<h1>x</h1>', '/fallback.png'), '/fallback.png')
  assert.equal(urlMod.sanitizeImageSrc('//attacker.tld/img.png', '/fallback.png'), '/fallback.png')
  assert.equal(
    urlMod.sanitizeImageSrc('https://images.unsplash.com/photo-123'),
    'https://images.unsplash.com/photo-123'
  )
  assert.equal(
    urlMod.sanitizeImageSrc('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'),
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
  )
})

await runTest('Strictly validates 11-char YouTube IDs across watch, short, shorts, and embed URLs', () => {
  assert.equal(urlMod.extractYouTubeId('toDpDvi1k60'), 'toDpDvi1k60')
  assert.equal(urlMod.extractYouTubeId('https://www.youtube.com/watch?v=toDpDvi1k60&t=12s'), 'toDpDvi1k60')
  assert.equal(urlMod.extractYouTubeId('https://youtu.be/toDpDvi1k60?si=xyz'), 'toDpDvi1k60')
  assert.equal(urlMod.extractYouTubeId('https://www.youtube.com/shorts/toDpDvi1k60'), 'toDpDvi1k60')
  assert.equal(urlMod.extractYouTubeId('https://www.youtube-nocookie.com/embed/toDpDvi1k60'), 'toDpDvi1k60')
  assert.equal(urlMod.extractYouTubeId('toDpDvi1k60" onload="alert(1)'), '')
  assert.equal(urlMod.extractYouTubeId('https://evil.com/watch?v=toDpDvi1k60'), '')
})

console.log('\n[3/4] Materials, Courses & CMS Real-Time Sync Data Integrity')

await runTest('All bundled courses have valid categories, bilingual content, and valid 11-char YouTube lesson IDs', () => {
  const validCats = new Set(dataMod.categories.map((c) => c.id))
  const courseIds = new Set()
  assert.ok(dataMod.courses.length >= 6, 'Expected at least 6 bundled courses')

  for (const c of dataMod.courses) {
    assert.ok(c.id && !courseIds.has(c.id), `Duplicate or empty course id: ${c.id}`)
    courseIds.add(c.id)
    assert.ok(validCats.has(c.category), `Invalid category ${c.category} on course ${c.id}`)
    assert.ok(c.title.en.trim() && c.title.ne.trim(), `Missing bilingual title on ${c.id}`)
    assert.ok(c.subtitle.en.trim() && c.subtitle.ne.trim(), `Missing bilingual subtitle on ${c.id}`)
    assert.ok(c.description.en.trim() && c.description.ne.trim(), `Missing bilingual description on ${c.id}`)
    assert.ok(c.modules.length > 0, `Course ${c.id} has no modules`)
    for (const m of c.modules) {
      assert.ok(m.lessons.length > 0, `Empty module in ${c.id}`)
      for (const l of m.lessons) {
        assert.equal(urlMod.extractYouTubeId(l.id), l.id, `Invalid YouTube ID ${l.id} in ${c.id}`)
      }
    }
  }
})

await runTest('Every material in #/resources and courses resolves to a valid course and has rich bilingual reader content', () => {
  const courseIds = new Set(dataMod.courses.map((c) => c.id))
  const seenIds = new Set()
  const allMaterials = [
    ...dataMod.defaultResourcesData.items,
    ...dataMod.courses.flatMap((c) =>
      (c.materials || []).map((m) => ({ ...m, courseId: c.id, category: c.category }))
    ),
  ]

  assert.ok(allMaterials.length >= 7, 'Expected at least 7 bundled learning materials')

  for (const mat of allMaterials) {
    assert.ok(mat.id && !seenIds.has(mat.id), `Duplicate or missing material ID: ${mat.id}`)
    seenIds.add(mat.id)
    assert.ok(mat.title.en.trim() && mat.title.ne.trim(), `Material ${mat.id} missing bilingual title`)
    assert.ok(mat.body?.en?.trim() && mat.body?.ne?.trim(), `Material ${mat.id} missing bilingual reader body`)
    assert.ok((mat.keyPoints?.length || 0) >= 3, `Material ${mat.id} should have at least 3 checklist steps`)
    if (mat.courseId) {
      assert.ok(
        courseIds.has(mat.courseId),
        `Material ${mat.id} points to non-existent courseId "${mat.courseId}"`
      )
    }
    // Detail route must parse cleanly to { name: 'material', id: mat.id }
    assert.deepEqual(routingMod.parseRoute(`#/material/${encodeURIComponent(mat.id)}`), {
      name: 'material',
      id: mat.id,
    })
  }
})

await runTest('normalizeResourceItems & normalizeCourseMaterials heal legacy Firestore records automatically', () => {
  const staleFirestoreItems = [
    {
      id: 'res-goat-biosecurity-poster',
      title: { en: 'Custom Edited Title', ne: 'सम्पादित शीर्षक' },
      description: { en: 'Desc', ne: 'विवरण' },
      format: 'poster',
      category: 'livestock',
      url: '#/course/goat-farming',
      courseId: 'goat-farming',
    },
  ]

  const healed = urlMod.normalizeResourceItems(staleFirestoreItems, dataMod.defaultResourcesData.items)
  assert.equal(healed[0].title.en, 'Custom Edited Title', 'Preserves CMS user edits')
  assert.equal(healed[0].courseId, 'febl', 'Heals goat-farming -> febl')
  assert.equal(healed[0].url, '', 'Clears broken legacy course URL')
  assert.ok(healed[0].body?.en, 'Backfills rich reader body from defaults')

  const staleCourseMats = [
    {
      id: 'sc-shg-action-sheet',
      title: { en: 'Worksheet', ne: 'कार्यपत्र' },
      description: { en: 'Desc', ne: 'विवरण' },
      format: 'worksheet',
      url: '#/resources',
    },
  ]
  const socialCapCourse = dataMod.courses.find((c) => c.id === 'social-capital')
  const healedCourseMats = urlMod.normalizeCourseMaterials(staleCourseMats, socialCapCourse)
  assert.equal(healedCourseMats[0].url, '', 'Clears circular #/resources URL')
  assert.ok(healedCourseMats[0].body?.en, 'Backfills course material reader body from defaults')
})

await runTest('100% bilingual parity across all UI dictionary keys (en & ne)', () => {
  const entries = Object.entries(dataMod.ui)
  assert.ok(entries.length >= 80, 'Expected full UI dictionary')
  for (const [key, val] of entries) {
    assert.ok(val.en && val.en.trim(), `Missing English UI string for "${key}"`)
    assert.ok(val.ne && val.ne.trim(), `Missing Nepali UI string for "${key}"`)
  }
})

console.log('\n[4/4] Security, RBAC, SEO, Branding & Architecture Invariants')

await runTest('Zero dangerouslySetInnerHTML, eval(), or new Function() in src/, admin/src/, and shared/', () => {
  const files = [
    ...collectSourceFiles(path.join(ROOT, 'src')),
    ...collectSourceFiles(path.join(ROOT, 'admin', 'src')),
    ...collectSourceFiles(path.join(ROOT, 'shared')),
  ]
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8')
    const rel = path.relative(ROOT, file)
    assert.ok(!content.includes('dangerouslySetInnerHTML'), `Forbidden dangerouslySetInnerHTML in ${rel}`)
    assert.ok(!/\beval\s*\(/.test(content), `Forbidden eval() in ${rel}`)
    assert.ok(!/\bnew\s+Function\s*\(/.test(content), `Forbidden new Function() in ${rel}`)
  }
})

await runTest('AuthContext uses Web Crypto CSPRNG (crypto.getRandomValues) and never Math.random()', () => {
  const authSource = fs.readFileSync(path.join(ROOT, 'admin', 'src', 'context', 'AuthContext.tsx'), 'utf8')
  assert.ok(authSource.includes('crypto.getRandomValues'), 'Expected crypto.getRandomValues in AuthContext.tsx')
  assert.ok(!authSource.includes('Math.random('), 'AuthContext.tsx must not use Math.random()')
})

await runTest('Public website remains strictly separated from standalone CMS (zero CMS links in src/)', () => {
  const publicFiles = collectSourceFiles(path.join(ROOT, 'src'))
  for (const file of publicFiles) {
    const content = fs.readFileSync(file, 'utf8')
    const rel = path.relative(ROOT, file)
    assert.ok(!content.includes('5174'), `Public file ${rel} must not reference CMS port 5174`)
    assert.ok(!content.includes('#/admin'), `Public file ${rel} must not expose #/admin route`)
  }
})

await runTest('Light and dark Heifer Academy logo assets exist and are wired in public & admin layouts', () => {
  const lightLogo = path.join(ROOT, 'src', 'assets', 'heifer-academy-logo-light.png')
  const darkLogo = path.join(ROOT, 'src', 'assets', 'heifer-academy-logo-dark.png')
  assert.ok(fs.existsSync(lightLogo) && fs.statSync(lightLogo).size > 1000, 'Missing light logo PNG')
  assert.ok(fs.existsSync(darkLogo) && fs.statSync(darkLogo).size > 1000, 'Missing dark logo PNG')

  const layoutSrc = fs.readFileSync(path.join(ROOT, 'src', 'components', 'Layout.tsx'), 'utf8')
  assert.ok(layoutSrc.includes('heifer-academy-logo-light.png') && layoutSrc.includes('heifer-academy-logo-dark.png'))
})

await runTest('Public SEO & Hosting security configuration (.figma/make/site.json, firebase.json, firestore.rules)', () => {
  const siteJson = JSON.parse(fs.readFileSync(path.join(ROOT, '.figma', 'make', 'site.json'), 'utf8'))
  assert.equal(siteJson.robots?.index, true, 'Public site indexing must be enabled')
  assert.ok(siteJson.title && siteJson.title.includes('Heifer Academy'), 'Site title must be branded')

  const firebaseJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'))
  const headerKeys = (firebaseJson.hosting?.headers?.[0]?.headers || []).map((h) => h.key)
  assert.ok(headerKeys.includes('X-Content-Type-Options'))
  assert.ok(headerKeys.includes('X-Frame-Options'))
  assert.ok(headerKeys.includes('Referrer-Policy'))

  const rules = fs.readFileSync(path.join(ROOT, 'firestore.rules'), 'utf8')
  assert.ok(rules.includes("t != 'settings' || isSuper()"), 'Settings must be restricted to super_admin')
  assert.ok(rules.includes('uid != request.auth.uid'), 'Super admin self-demotion protection required')
  assert.ok(rules.includes('allow read, write: if false;'), 'Default deny rule required')
})

await runTest('Mobile responsiveness & zero-lag CSS invariants (no global smooth scroll, touch-action: manipulation)', () => {
  const css = fs.readFileSync(path.join(ROOT, 'src', 'index.css'), 'utf8')
  assert.ok(!/html\s*\{[^}]*scroll-behavior:\s*smooth/s.test(css), 'Global html smooth scroll causes route jump lag')
  assert.ok(css.includes('touch-action: manipulation'), 'Expected touch-action: manipulation for instant mobile taps')
})

console.log(`\n------------------------------------------------------------`)
console.log(` Results: ${passed} passed, ${failed} failed`)
console.log(`------------------------------------------------------------\n`)

if (failed > 0) {
  process.exit(1)
}
