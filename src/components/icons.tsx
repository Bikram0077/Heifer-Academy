import type { ReactNode, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function make(paths: ReactNode) {
  return function Icon({ size = 20, strokeWidth = 1.75, ...p }: P) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>
        {paths}
      </svg>
    )
  }
}

export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const CheckIcon = make(<path d="m5 12.5 4.5 4.5L19 7.5" />)
export const CircleIcon = make(<circle cx="12" cy="12" r="9.25" />)
export const ChevronLeft = make(<path d="m15 18-6-6 6-6" />)
export const ChevronRight = make(<path d="m9 18 6-6-6-6" />)
export const ChevronDown = make(<path d="m6 9 6 6 6-6" />)
export const ArrowRight = make(<path d="M5 12h14M13 6l6 6-6 6" />)
export const ArrowLeft = make(<path d="M19 12H5M11 6l-6 6 6 6" />)
export const MenuIcon = make(<path d="M4 7h16M4 12h16M4 17h16" />)
export const XIcon = make(<path d="M18 6 6 18M6 6l12 12" />)
export const ClockIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const ListIcon = make(<><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>)
export const ChatIcon = make(<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />)
export const GlobeIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" /></>)
export const MaximizeIcon = make(<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />)
export const MinimizeIcon = make(<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />)
export const TheaterIcon = make(<><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10v4M18 10v4" /></>)
export const ReplayIcon = make(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>)
export const BookIcon = make(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></>)
export const VideoIcon = make(<><rect x="2.5" y="5" width="14" height="14" rx="2" /><path d="m16.5 10 5-3v10l-5-3" /></>)
export const ChecklistIcon = make(<><path d="M10 6h10M10 12h10M10 18h10" /><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5" /></>)
export const LanguagesIcon = make(<><path d="M4 5h8M8 3v2M5.5 5c.8 3 3 5.5 6 7M10.5 5c-.8 3.2-3 6-6.5 7.5" /><path d="m13 21 4-9 4 9M14.5 18h5" /></>)
export const UsersIcon = make(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" /></>)
export const SproutIcon = make(<><path d="M12 21v-9" /><path d="M12 12c0-4 3-7 8-7 0 4.5-3 7-8 7Z" /><path d="M12 14c0-3.3-2.5-6-6.5-6 0 3.7 2.5 6 6.5 6Z" /></>)
export const TrendIcon = make(<><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>)
export const HandsIcon = make(<><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></>)
export const MailIcon = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6 8.5 7 8.5-7" /></>)
export const PhoneIcon = make(<path d="M5 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 12l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 5a2 2 0 0 1 2-2Z" />)
export const PinIcon = make(<><path d="M12 21s-7-6-7-11.5a7 7 0 0 1 14 0C19 15 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>)
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />)
export const MinusIcon = make(<path d="M5 12h14" />)
export const ExternalIcon = make(<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />)
export const AccessibilityIcon = make(<><circle cx="12" cy="4.5" r="1.8" /><path d="M4.5 8.5 12 10l7.5-1.5M12 10v4.5M9 21l3-6.5 3 6.5" /></>)
export const ContrastIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" /></>)
export const MoonIcon = make(<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />)
export const ReadingLineIcon = make(<><path d="M4 6h16M4 18h16" /><path d="M2 12h20" strokeWidth={2.5} /></>)
export const SpeakerIcon = make(<><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></>)
export const ResetIcon = make(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>)
export const FileTextIcon = make(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>)
export const PrinterIcon = make(<><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" rx="1" /></>)
export const DownloadIcon = make(<><path d="M12 3v12m0 0-4-4m4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>)
export const LinkIcon = make(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>)
export const FolderIcon = make(<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />)
export const FacebookIcon = make(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />)
export const YoutubeIcon = make(<><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9.5 5 2.5-5 2.5v-5Z" fill="currentColor" stroke="none" /></>)
export const InstagramIcon = make(<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></>)
export const LinkedinIcon = make(<><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2Z" /><circle cx="4" cy="4" r="2" /></>)
export const TwitterIcon = make(<path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L19.5 4h-2l-5 6.2L8 4H4Z" />)
export const QuoteIcon = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M9.5 6C6.5 6.8 4.5 9.3 4.5 12.8V18h5.2v-5.2H7.2c0-2 1-3.4 2.9-4.1L9.5 6Zm9 0c-3 .8-5 3.3-5 6.8V18h5.2v-5.2h-2.5c0-2 1-3.4 2.9-4.1L18.5 6Z" />
  </svg>
)
export const PlayIcon = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
  </svg>
)
export const StarIcon = ({ size = 16, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}>
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
  </svg>
)
export const CheckCircle = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...p}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="m7.5 12.5 3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
