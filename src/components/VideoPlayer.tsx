import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { extractYouTubeId, sanitizeImageSrc } from '@shared/url'
import { clock, thumb } from '../data'
import { useApp } from '../lib'
import { useContent } from '../content'
import { MaximizeIcon, MinimizeIcon, PlayIcon, TheaterIcon, VideoIcon } from './icons'

/* Minimal typings for the YouTube IFrame Player API */
type YTPlayer = { destroy: () => void; playVideo: () => void }
type YTNamespace = {
  Player: new (el: HTMLElement, opts: Record<string, unknown>) => YTPlayer
  PlayerState: { ENDED: number }
}
declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytPromise: Promise<YTNamespace> | null = null
function loadYT(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!ytPromise) {
    ytPromise = new Promise<YTNamespace>((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT!) }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.onerror = () => { ytPromise = null; reject(new Error('YouTube API failed to load')) }
      document.head.appendChild(s)
    })
  }
  return Promise.race([ytPromise, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))])
}

const fsElement = () => document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement
const fsSupported = () =>
  typeof document !== 'undefined' && !!(document.fullscreenEnabled || (document as Document & { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled)

type Props = {
  videoId: string
  title: string
  seconds?: number
  label?: string
  poster?: string
  autoStart?: boolean
  onEnded?: () => void
  overlay?: ReactNode
  theater?: boolean
  onTheater?: () => void
  rounded?: boolean
}

export function VideoPlayer({ videoId, title, seconds, label, poster, autoStart = false, onEnded, overlay, theater, onTheater, rounded = true }: Props) {
  const { lang } = useApp()
  const { ui } = useContent()
  const safeId = extractYouTubeId(videoId)
  const safePoster = sanitizeImageSrc(poster)
  const [mode, setMode] = useState<'poster' | 'loading' | 'api' | 'iframe'>(autoStart && safeId ? 'loading' : 'poster')
  const [isFs, setIsFs] = useState(false)
  const [posterSrc, setPosterSrc] = useState(safePoster || thumb(safeId, 'maxres'))
  const wrapRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const endedRef = useRef(onEnded)
  endedRef.current = onEnded

  useEffect(() => {
    setPosterSrc(safePoster || thumb(safeId, 'maxres'))
    setMode(autoStart && safeId ? 'loading' : 'poster')
  }, [safeId, safePoster, autoStart])

  // Mount the YouTube player in-page once playback is requested.
  useEffect(() => {
    if (mode !== 'loading' || !safeId) return
    let player: YTPlayer | null = null
    let cancelled = false
    loadYT()
      .then((YT) => {
        if (cancelled || !hostRef.current) return
        const el = document.createElement('div')
        hostRef.current.appendChild(el)
        player = new YT.Player(el, {
          host: 'https://www.youtube-nocookie.com',
          videoId: safeId,
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1, fs: 1, hl: lang === 'ne' ? 'ne' : 'en', cc_lang_pref: lang },
          events: {
            onReady: (e: { target: YTPlayer }) => e.target.playVideo(),
            onStateChange: (e: { data: number }) => { if (e.data === YT.PlayerState.ENDED) endedRef.current?.() },
          },
        })
        setMode('api')
      })
      .catch(() => { if (!cancelled) setMode('iframe') })
    return () => {
      cancelled = true
      player?.destroy()
      if (hostRef.current) hostRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode === 'loading' || mode === 'api', safeId])

  useEffect(() => {
    const on = () => setIsFs(fsElement() === wrapRef.current)
    document.addEventListener('fullscreenchange', on)
    document.addEventListener('webkitfullscreenchange', on)
    return () => {
      document.removeEventListener('fullscreenchange', on)
      document.removeEventListener('webkitfullscreenchange', on)
    }
  }, [])

  const toggleFs = () => {
    const el = wrapRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null
    if (!el) return
    if (fsElement()) {
      const d = document as Document & { webkitExitFullscreen?: () => void }
      ;(document.exitFullscreen ?? d.webkitExitFullscreen)?.call(document)
    } else {
      ;(el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el)
    }
  }

  // "F" toggles full screen when focus is inside the player.
  const onKey = (e: KeyboardEvent) => {
    if ((e.key === 'f' || e.key === 'F') && !(e.target instanceof HTMLInputElement)) { e.preventDefault(); toggleFs() }
  }

  const started = mode !== 'poster'

  return (
    <div
      ref={wrapRef}
      onKeyDown={onKey}
      className={`group/player flex flex-col overflow-hidden bg-[#0b0f0d] text-white ${rounded && !isFs ? 'rounded-lg' : ''} ${isFs ? 'h-screen w-screen' : ''}`}
    >
      <div className={`@container relative w-full ${isFs ? 'flex-1' : 'aspect-video'}`}>
        {/* YouTube player host (React does not render children here) */}
        <div ref={hostRef} className="absolute inset-0 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full" />

        {mode === 'iframe' && safeId && (
          <iframe
            className="absolute inset-0 size-full"
            src={`https://www.youtube-nocookie.com/embed/${safeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        )}

        {!safeId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b0f0d] p-6 text-center text-white/75">
            <VideoIcon size={28} />
            <p className="text-sm font-medium">{title}</p>
          </div>
        )}

        {!started && safeId && (
          <button type="button" onClick={() => setMode('loading')} className="group/poster absolute inset-0 block size-full text-left" aria-label={`${ui.play[lang]}: ${title}`}>
            {posterSrc && (
              <img
                src={posterSrc}
                alt=""
                decoding="async"
                onLoad={(e) => { if (e.currentTarget.naturalWidth <= 120 && !safePoster) setPosterSrc(thumb(safeId, 'hq')) }}
                onError={() => setPosterSrc(thumb(safeId, 'hq'))}
                className="absolute inset-0 size-full object-cover transition duration-500 [@media(hover:hover)]:group-hover/poster:scale-[1.02]"
              />
            )}
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
            <span className="absolute top-1/2 left-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary-900 shadow-[0_10px_40px_-6px_rgba(0,0,0,0.5)] ring-[6px] ring-white/20 transition [@media(hover:hover)]:group-hover/poster:scale-105 @lg:size-[4.5rem] @lg:ring-8 @3xl:size-20">
              <PlayIcon size={28} className="ml-1" />
            </span>
            <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-4 @lg:bottom-4 @3xl:inset-x-6 @3xl:bottom-5">
              <span className="min-w-0">
                {label && <span className="mb-1 hidden text-xs font-semibold tracking-[0.12em] text-white/75 uppercase @lg:block">{label}</span>}
                <span className="line-clamp-1 text-sm font-semibold text-white @lg:line-clamp-2 @lg:text-base @3xl:text-lg">{title}</span>
              </span>
              {seconds ? <span className="shrink-0 rounded-sm bg-black/60 px-2 py-1 text-xs font-semibold tabular-nums backdrop-blur">{clock(seconds, lang)}</span> : null}
            </span>
          </button>
        )}

        {mode === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40" aria-live="polite">
            <span className="size-10 animate-spin rounded-full border-[3px] border-white/25 border-t-white" />
            <span className="sr-only">Loading</span>
          </div>
        )}

        {overlay}
      </div>

      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-[#0b0f0d] px-3 md:px-4">
        <p className="min-w-0 truncate text-[0.8rem] text-white/70">
          {label ? <span className="text-white/90">{label} · </span> : null}
          {title}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {onTheater && !isFs && (
            <button type="button" onClick={onTheater} aria-pressed={theater} className="hidden h-9 items-center gap-2 rounded-md px-2.5 text-[0.8rem] font-medium text-white/80 hover:bg-white/10 hover:text-white lg:inline-flex">
              <TheaterIcon size={18} /> {theater ? ui.defaultView[lang] : ui.theater[lang]}
            </button>
          )}
          {fsSupported() && (
            <button type="button" onClick={toggleFs} className="inline-flex h-9 items-center gap-2 rounded-md px-2.5 text-[0.8rem] font-medium text-white/80 hover:bg-white/10 hover:text-white" aria-label={isFs ? ui.exitFullscreen[lang] : ui.fullscreen[lang]}>
              {isFs ? <MinimizeIcon size={18} /> : <MaximizeIcon size={18} />}
              <span className="hidden sm:inline">{isFs ? ui.exitFullscreen[lang] : ui.fullscreen[lang]}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
