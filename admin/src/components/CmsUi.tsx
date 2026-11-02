import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Bi } from '@shared/schema'
import type { DocStatus } from '../context/CmsContext'
import {
  AlertCircleIcon,
  BookIcon,
  CheckCircleIcon,
  ExternalIcon,
  GlobeIcon,
  HandsIcon,
  LanguagesIcon,
  PlayIcon,
  RefreshIcon,
  SaveIcon,
  SproutIcon,
  TrendIcon,
  UndoIcon,
  UploadIcon,
  UsersIcon,
  XIcon,
} from './icons'

export function deepClone<T>(val: T): T {
  return JSON.parse(JSON.stringify(val))
}

/**
 * Syncs remote Firestore document data into local editable state WITHOUT
 * wiping out user keystrokes on background context re-renders.
 */
export function useSyncedFormState<T>(
  remoteData: T,
  entityKey: string,
  versionKey: string
): [
  T,
  (updater: T | ((prev: T) => T)) => void,
  {
    isDirty: boolean
    markClean: () => void
    resetToRemote: (override?: T) => void
  },
] {
  const [state, setState] = useState<T>(() => deepClone(remoteData))
  const [isDirty, setIsDirty] = useState(false)
  const prevEntityRef = useRef(entityKey)
  const prevVersionRef = useRef(versionKey)
  const isDirtyRef = useRef(false)

  useEffect(() => {
    const entityChanged = prevEntityRef.current !== entityKey
    const versionChanged = prevVersionRef.current !== versionKey

    if (entityChanged) {
      prevEntityRef.current = entityKey
      prevVersionRef.current = versionKey
      isDirtyRef.current = false
      setIsDirty(false)
      setState(deepClone(remoteData))
      return
    }

    if (versionChanged && !isDirtyRef.current) {
      prevVersionRef.current = versionKey
      setState(deepClone(remoteData))
    }
  }, [entityKey, versionKey, remoteData])

  const update = useCallback((updater: T | ((prev: T) => T)) => {
    isDirtyRef.current = true
    setIsDirty(true)
    setState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
      return next
    })
  }, [])

  const markClean = useCallback(() => {
    isDirtyRef.current = false
    setIsDirty(false)
    prevVersionRef.current = versionKey
  }, [versionKey])

  const resetToRemote = useCallback(
    (override?: T) => {
      isDirtyRef.current = false
      setIsDirty(false)
      prevVersionRef.current = versionKey
      setState(deepClone(override !== undefined ? override : remoteData))
    },
    [remoteData, versionKey]
  )

  return [state, update, { isDirty, markClean, resetToRemote }]
}

export type ToastMessage = {
  tone: 'success' | 'error' | 'info'
  text: string
} | null

export function useToast(timeoutMs = 4200) {
  const [toast, setToast] = useState<ToastMessage>(null)

  const showToast = useCallback(
    (text: string, tone: 'success' | 'error' | 'info' = 'success') => {
      setToast({ text, tone })
    },
    []
  )

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), timeoutMs)
    return () => clearTimeout(timer)
  }, [toast, timeoutMs])

  return { toast, showToast, clearToast: () => setToast(null) }
}

export function ToastBanner({
  toast,
  onDismiss,
}: {
  toast: ToastMessage
  onDismiss: () => void
}) {
  if (!toast) return null

  const styles =
    toast.tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-900'
      : toast.tone === 'info'
        ? 'border-primary-500/30 bg-primary-100 text-brand'
        : 'border-emerald-200 bg-emerald-50 text-emerald-900'

  return (
    <div
      role="status"
      aria-live="polite"
      className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-soft ${styles}`}
    >
      <div className="flex items-center gap-2.5">
        {toast.tone === 'error' ? (
          <AlertCircleIcon size={18} className="shrink-0 text-red-600" />
        ) : (
          <CheckCircleIcon size={18} className="shrink-0 text-emerald-700" />
        )}
        <span>{toast.text}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 opacity-70 hover:opacity-100"
      >
        <XIcon size={15} />
      </button>
    </div>
  )
}

export function StatusBadge({
  status,
  isDirty,
}: {
  status: DocStatus
  isDirty?: boolean
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      {status === 'published' && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="size-1.5 rounded-full bg-emerald-600" />
          Published Live
        </span>
      )}
      {status === 'draft_changes' && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-accent-100 px-3 py-1 text-xs font-semibold text-ochre">
          <span className="size-1.5 rounded-full bg-accent-500" />
          Unpublished Draft Edits
        </span>
      )}
      {status === 'draft_only' && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/25 bg-primary-100 px-3 py-1 text-xs font-semibold text-brand">
          <span className="size-1.5 rounded-full bg-primary-700" />
          Draft Only (Not Live)
        </span>
      )}
      {status === 'unpublished' && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-subtle px-3 py-1 text-xs font-semibold text-ink-2">
          <span className="size-1.5 rounded-full bg-ink-3" />
          Bundled Default
        </span>
      )}
      {isDirty && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/50 bg-accent-500/15 px-3 py-1 text-xs font-bold text-ochre">
          Unsaved Form Edits
        </span>
      )}
    </div>
  )
}

export function EditorHeader({
  eyebrow,
  title,
  description,
  status,
  isDirty,
  updatedAt,
  updatedBy,
  canEdit,
  saving,
  publishing,
  onSaveDraft,
  onPublish,
  onDiscard,
  backLabel,
  onBack,
  extraActions,
}: {
  eyebrow?: string
  title: string
  description?: string
  status: DocStatus
  isDirty?: boolean
  updatedAt?: string
  updatedBy?: string
  canEdit: boolean
  saving?: boolean
  publishing?: boolean
  onSaveDraft?: () => void
  onPublish?: () => void
  onDiscard?: () => void
  backLabel?: string
  onBack?: () => void
  extraActions?: ReactNode
}) {
  const canDiscard = Boolean(
    onDiscard && (isDirty || status === 'draft_changes' || status === 'draft_only')
  )

  return (
    <div className="mb-8 rounded-2xl border border-line bg-card p-6 shadow-soft md:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand uppercase hover:underline"
            >
              &larr; {backLabel || 'Back'}
            </button>
          )}
          {eyebrow && (
            <p className="text-xs font-bold tracking-[0.14em] text-ochre uppercase">{eyebrow}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-ink md:text-[1.75rem]">
              {title}
            </h1>
            <StatusBadge status={status} isDirty={isDirty} />
          </div>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-2">{description}</p>
          )}
          {updatedAt && (
            <p className="mt-2.5 text-xs text-ink-3">
              Last saved {new Date(updatedAt).toLocaleString()}
              {updatedBy ? ` by ${updatedBy}` : ''}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {extraActions}
          {canEdit && canDiscard && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving || publishing}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink-2 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <UndoIcon size={14} />
              {isDirty && status === 'published' ? 'Revert Edits' : 'Discard Draft'}
            </button>
          )}
          {canEdit && onSaveDraft && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={saving || publishing}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-primary-900/25 bg-primary-100/70 px-4 text-xs font-bold text-brand transition-colors hover:bg-primary-100 disabled:opacity-50"
            >
              {saving ? <RefreshIcon size={14} className="animate-spin" /> : <SaveIcon size={14} />}
              Save Draft
            </button>
          )}
          {canEdit && onPublish && (
            <button
              type="button"
              onClick={onPublish}
              disabled={saving || publishing}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {publishing ? (
                <RefreshIcon size={14} className="animate-spin" />
              ) : (
                <UploadIcon size={14} />
              )}
              Publish Live
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SectionCard({
  eyebrow,
  title,
  description,
  actions,
  children,
  className = '',
}: {
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-line bg-card p-6 shadow-soft md:p-7 ${className}`}>
      {(eyebrow || title || description || actions) && (
        <div className="mb-6 flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {eyebrow && (
              <p className="text-[0.7rem] font-bold tracking-[0.14em] text-ochre uppercase">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="mt-0.5 text-lg font-bold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-2">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function BilingualField({
  label,
  hint,
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholderEn = 'English text...',
  placeholderNe = 'नेपाली पाठ...',
  disabled = false,
  compact = false,
}: {
  label?: string
  hint?: string
  value: Bi
  onChange: (next: Bi) => void
  multiline?: boolean
  rows?: number
  placeholderEn?: string
  placeholderNe?: string
  disabled?: boolean
  compact?: boolean
}) {
  const safeVal: Bi = {
    en: value?.en ?? '',
    ne: value?.ne ?? '',
  }

  const inputCls =
    'w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle disabled:text-ink-2'

  return (
    <div className={compact ? '' : 'space-y-2'}>
      {(label || hint) && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {label && <label className="text-xs font-bold tracking-wide text-ink uppercase">{label}</label>}
          {hint && <span className="text-xs text-ink-3">{hint}</span>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="inline-flex h-5 items-center rounded bg-primary-100 px-1.5 text-[0.65rem] font-extrabold tracking-wider text-brand uppercase">
              EN
            </span>
            <span className="text-xs font-medium text-ink-2">English</span>
          </div>
          {multiline ? (
            <textarea
              rows={rows}
              value={safeVal.en}
              disabled={disabled}
              placeholder={placeholderEn}
              onChange={(e) => onChange({ ...safeVal, en: e.target.value })}
              className={`${inputCls} resize-y leading-relaxed`}
            />
          ) : (
            <input
              type="text"
              value={safeVal.en}
              disabled={disabled}
              placeholder={placeholderEn}
              onChange={(e) => onChange({ ...safeVal, en: e.target.value })}
              className={inputCls}
            />
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="inline-flex h-5 items-center rounded bg-accent-100 px-1.5 text-[0.65rem] font-extrabold tracking-wider text-ochre">
              ने
            </span>
            <span className="text-xs font-medium text-ink-2">नेपाली (Nepali)</span>
          </div>
          {multiline ? (
            <textarea
              rows={rows}
              value={safeVal.ne}
              disabled={disabled}
              placeholder={placeholderNe}
              onChange={(e) => onChange({ ...safeVal, ne: e.target.value })}
              className={`${inputCls} ne-font resize-y`}
            />
          ) : (
            <input
              type="text"
              value={safeVal.ne}
              disabled={disabled}
              placeholder={placeholderNe}
              onChange={(e) => onChange({ ...safeVal, ne: e.target.value })}
              className={`${inputCls} ne-font`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Extracts an 11-character YouTube video ID from a full URL or raw ID string.
 */
export function extractYouTubeId(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) {
      const seg = url.pathname.split('/').filter(Boolean)[0]
      if (seg) return seg.slice(0, 11)
    }
    const vParam = url.searchParams.get('v')
    if (vParam) return vParam.slice(0, 11)
    const parts = url.pathname.split('/').filter(Boolean)
    const idx = parts.findIndex((p) => p === 'embed' || p === 'shorts' || p === 'v')
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1].slice(0, 11)
    }
  } catch {
    // Not a full URL; return raw string so user can continue typing
  }
  return trimmed
}

export function formatSeconds(secs: number): string {
  if (!secs || secs < 0) return '0:00'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function YouTubeField({
  label = 'YouTube Video ID or URL',
  videoId,
  seconds,
  onChangeVideoId,
  onChangeSeconds,
  disabled = false,
}: {
  label?: string
  videoId: string
  seconds?: number
  onChangeVideoId: (id: string) => void
  onChangeSeconds?: (secs: number) => void
  disabled?: boolean
}) {
  const validThumb = /^[a-zA-Z0-9_-]{11}$/.test(videoId.trim())

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
            {label}
          </label>
          <input
            type="text"
            value={videoId}
            disabled={disabled}
            placeholder="Paste full YouTube link or 11-char ID (e.g. wK2v3tNnjAA)"
            onChange={(e) => onChangeVideoId(extractYouTubeId(e.target.value))}
            className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
          />
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
            <span>Paste any youtube.com or youtu.be link and the ID is extracted automatically.</span>
            {validThumb && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
              >
                Verify on YouTube <ExternalIcon size={12} />
              </a>
            )}
          </div>
        </div>

        {onChangeSeconds !== undefined && (
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold tracking-wide text-ink uppercase">
                Duration (Seconds)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={seconds ?? 0}
                  disabled={disabled}
                  onChange={(e) => onChangeSeconds(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-28 rounded-xl border border-line-strong bg-card px-3 py-2 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none disabled:bg-subtle"
                />
                <span className="rounded-lg bg-subtle px-2.5 py-1.5 text-xs font-semibold text-ink-2 tabular-nums">
                  {formatSeconds(seconds ?? 0)} min
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-line bg-subtle sm:w-44">
        {validThumb ? (
          <div className="relative aspect-video w-full">
            <img
              src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
              alt="Video thumbnail preview"
              className="size-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary-900/90 shadow-soft">
                <PlayIcon size={14} />
              </span>
            </span>
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center px-3 text-center text-xs text-ink-3">
            Enter valid 11-char ID for preview
          </div>
        )}
      </div>
    </div>
  )
}

export const PILLAR_ICONS = [
  { id: 'sprout', label: 'Sprout / Field', icon: SproutIcon },
  { id: 'trend', label: 'Growth / Market', icon: TrendIcon },
  { id: 'hands', label: 'Values / Gift', icon: HandsIcon },
  { id: 'users', label: 'Community / SHG', icon: UsersIcon },
  { id: 'languages', label: 'Bilingual', icon: LanguagesIcon },
  { id: 'book', label: 'Curriculum', icon: BookIcon },
  { id: 'globe', label: 'Reach / Global', icon: GlobeIcon },
] as const

export function PillarIconPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PILLAR_ICONS.map((opt) => {
        const IconComp = opt.icon
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.id)}
            title={opt.label}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              active
                ? 'border-primary-700 bg-primary-100 text-brand'
                : 'border-line bg-card text-ink-2 hover:border-line-strong hover:text-ink'
            } disabled:opacity-50`}
          >
            <IconComp size={15} />
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  tone = 'danger',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-modal">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">{message}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-full border border-line-strong bg-card px-4 text-xs font-semibold text-ink-2 hover:bg-subtle hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 rounded-full px-5 text-xs font-bold text-white shadow-soft ${
              tone === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-primary-900 hover:bg-primary-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

