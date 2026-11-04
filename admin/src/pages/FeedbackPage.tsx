import { useEffect, useMemo, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import type { FeedbackItem, FeedbackStatus } from '@shared/schema'
import { ConfirmModal, ToastBanner, useToast } from '../components/CmsUi'
import {
  AlertCircleIcon,
  ChatIcon,
  CheckCircleIcon,
  CheckIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  RefreshIcon,
  SearchIcon,
  TrashIcon,
  UsersIcon,
  XIcon,
} from '../components/icons'

export function FeedbackPage() {
  const { profile, isSuperAdmin, isEditor } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [items, setItems] = useState<(FeedbackItem & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | FeedbackStatus>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [districtFilter, setDistrictFilter] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  // Modals & Action States
  const [activeDetailItem, setActiveDetailItem] = useState<(FeedbackItem & { id: string }) | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<(FeedbackItem & { id: string }) | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'feedback'),
      (snapshot) => {
        const loaded: (FeedbackItem & { id: string })[] = []
        snapshot.forEach((d) => {
          loaded.push({ id: d.id, ...(d.data() as FeedbackItem) })
        })
        setItems(loaded)
        setLoading(false)
        setLastSync(new Date())
      },
      (err) => {
        console.error('Real-time feedback listener error:', err)
        showToast('Unable to connect to live feedback stream. Please check permissions.', 'error')
        setLoading(false)
      }
    )

    return () => unsub()
  }, [])

  // Available unique roles and districts from actual items
  const uniqueDistricts = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.district) set.add(item.district)
    })
    return Array.from(set).sort()
  }, [items])

  const uniqueRoles = useMemo(() => {
    const set = new Set<string>()
    items.forEach((item) => {
      if (item.role) set.add(item.role)
    })
    return Array.from(set).sort()
  }, [items])

  // Filtered and sorted feedback list
  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    return items
      .filter((item) => {
        if (statusFilter !== 'all') {
          const itemStatus = item.status || 'new'
          if (itemStatus !== statusFilter) return false
        }
        if (roleFilter !== 'all' && item.role !== roleFilter) {
          return false
        }
        if (districtFilter !== 'all' && item.district !== districtFilter) {
          return false
        }
        if (q) {
          const matchText = [
            item.fullName,
            item.email,
            item.phone,
            item.district,
            item.municipality,
            item.role,
            item.otherRoleText,
            item.suggestions,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          if (!matchText.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime()
        const timeB = new Date(b.createdAt || 0).getTime()
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB
      })
  }, [items, searchTerm, statusFilter, roleFilter, districtFilter, sortOrder])

  // Statistics
  const newCount = useMemo(
    () => items.filter((i) => !i.status || i.status === 'new').length,
    [items]
  )
  const reviewedCount = useMemo(
    () => items.filter((i) => i.status === 'reviewed').length,
    [items]
  )

  // Status toggle handler
  const handleToggleStatus = async (item: FeedbackItem & { id: string }) => {
    if (!isEditor) return
    const nextStatus: FeedbackStatus =
      item.status === 'reviewed' ? 'new' : 'reviewed'
    setUpdatingId(item.id)
    try {
      await updateDoc(doc(db, 'feedback', item.id), {
        status: nextStatus,
        reviewedAt: nextStatus === 'reviewed' ? new Date().toISOString() : '',
        reviewedBy: nextStatus === 'reviewed' ? profile?.email || 'admin' : '',
      })
      showToast(
        nextStatus === 'reviewed'
          ? 'Marked suggestion as reviewed.'
          : 'Reopened suggestion as new.',
        'info'
      )
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to update review status.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  // Deletion handler
  const handleDelete = async () => {
    if (!deleteTarget || !isSuperAdmin) return
    setDeleting(true)
    try {
      await deleteDoc(doc(db, 'feedback', deleteTarget.id))
      showToast('Feedback entry deleted successfully.')
      if (activeDetailItem?.id === deleteTarget.id) {
        setActiveDetailItem(null)
      }
      setDeleteTarget(null)
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to delete feedback entry.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // CSV Export with UTF-8 BOM
  const handleExportCsv = () => {
    if (filteredItems.length === 0) {
      showToast('No feedback entries to export with current filters.', 'error')
      return
    }

    const headers = [
      'Document ID',
      'Created At',
      'Status',
      'Full Name',
      'Email',
      'Phone',
      'Province',
      'District',
      'Municipality',
      'Role',
      'Other Role Specification',
      'Gender',
      'Suggestions & Feedback',
      'Reviewed At',
      'Reviewed By',
    ]

    const escapeCsv = (str?: string) => {
      if (!str) return '""'
      const sanitized = str.replace(/"/g, '""')
      return `"${sanitized}"`
    }

    const rows = filteredItems.map((i) => [
      escapeCsv(i.id),
      escapeCsv(i.createdAt),
      escapeCsv(i.status || 'new'),
      escapeCsv(i.fullName),
      escapeCsv(i.email),
      escapeCsv(i.phone),
      escapeCsv(i.province),
      escapeCsv(i.district),
      escapeCsv(i.municipality),
      escapeCsv(i.role),
      escapeCsv(i.otherRoleText),
      escapeCsv(i.gender),
      escapeCsv(i.suggestions),
      escapeCsv(i.reviewedAt),
      escapeCsv(i.reviewedBy),
    ])

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `heifer-academy-feedback-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast(`Exported ${filteredItems.length} feedback entries to CSV.`)
  }

  const formatRoleLabel = (role?: string, otherText?: string) => {
    if (!role) return 'Not Specified'
    const roleMap: Record<string, string> = {
      farmer: 'Farmer (किसान)',
      shg: 'SHG Member (समूह सदस्य)',
      facilitator: 'Community Facilitator (सहजकर्ता)',
      student: 'Student (विद्यार्थी)',
      other: otherText ? `Other: ${otherText}` : 'Other (अन्य)',
    }
    return roleMap[role] || (otherText ? `${role}: ${otherText}` : role)
  }

  const formatGenderLabel = (gender?: string) => {
    if (!gender) return 'Unspecified'
    const genderMap: Record<string, string> = {
      woman: 'Woman (महिला)',
      man: 'Man (पुरुष)',
      other: 'Other (अन्य)',
      na: 'Prefer not to say',
    }
    return genderMap[gender] || gender
  }

  const formatDateTime = (iso?: string) => {
    if (!iso) return 'Unknown date'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-6">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      {/* Header with Live Real-time Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-6 shadow-soft">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold tracking-wider text-emerald-800 uppercase">
              Real-Time Firestore Listener Active
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Learner Feedback & Suggestions Store
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Live stream of questions, course requests, and feedback submitted by community learners across Nepal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {lastSync && (
            <span className="text-xs text-ink-3">
              Last synced: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredItems.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs font-bold text-ink shadow-soft transition hover:bg-subtle disabled:opacity-50"
          >
            <DownloadIcon size={16} />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-2 uppercase">Total Suggestions</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-brand">
              <ChatIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{items.length}</p>
          <p className="mt-1 text-xs text-ink-3">Lifetime responses received</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">New / Unreviewed</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <AlertCircleIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-800">{newCount}</p>
          <p className="mt-1 text-xs text-ink-3">Awaiting editorial review</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Reviewed</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircleIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-emerald-800">{reviewedCount}</p>
          <p className="mt-1 text-xs text-ink-3">Marked as addressed</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-2 uppercase">Districts Active</span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-100 text-brand">
              <MapPinIcon size={18} />
            </span>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{uniqueDistricts.length}</p>
          <p className="mt-1 text-xs text-ink-3">Geographic reach</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-line bg-card p-5 shadow-soft space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          {/* Search */}
          <div className="relative md:col-span-5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, location, suggestions..."
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas pr-10 pl-10 text-xs font-medium text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-3 focus:ring-primary-100 focus:outline-none"
            />
            <SearchIcon
              size={18}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-3 hover:text-ink"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {/* District Filter */}
          <div className="md:col-span-3">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3 text-xs font-medium text-ink focus:border-primary-700 focus:outline-none"
            >
              <option value="all">All Districts ({uniqueDistricts.length})</option>
              {uniqueDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3 text-xs font-medium text-ink focus:border-primary-700 focus:outline-none"
            >
              <option value="all">All Roles</option>
              {uniqueRoles.map((r) => (
                <option key={r} value={r}>
                  {formatRoleLabel(r)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="md:col-span-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3 text-xs font-medium text-ink focus:border-primary-700 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="text-xs font-bold text-ink-2 uppercase mr-1">Status:</span>
          {(['all', 'new', 'reviewed'] as const).map((st) => {
            const count =
              st === 'all'
                ? items.length
                : st === 'new'
                  ? newCount
                  : reviewedCount
            const active = statusFilter === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? 'bg-primary-900 text-white shadow-soft'
                    : 'bg-canvas text-ink-2 hover:bg-subtle hover:text-ink'
                }`}
              >
                <span className="capitalize">{st === 'all' ? 'All Feedback' : st}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${
                    active ? 'bg-white/20 text-white' : 'bg-subtle text-ink-3'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card py-16 text-center shadow-soft">
          <RefreshIcon size={24} className="animate-spin text-accent-500" />
          <p className="mt-3 text-sm font-semibold text-ink">Streaming feedback from Firestore...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-card py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-100 text-brand">
            <ChatIcon size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-ink">No suggestions found</h3>
          <p className="mt-1 max-w-sm text-xs text-ink-2">
            {searchTerm || statusFilter !== 'all' || districtFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your search terms or active filters to see matching responses.'
              : 'As learners on the public site submit feedback & suggestions, they will automatically appear here in real time.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isReviewed = item.status === 'reviewed'
            return (
              <div
                key={item.id}
                className={`group rounded-2xl border transition bg-card p-5 sm:p-6 shadow-soft hover:shadow-card ${
                  isReviewed ? 'border-line opacity-90' : 'border-line-strong hover:border-primary-500/50'
                }`}
              >
                {/* Top Row: Submitter, Badges, Timestamp */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-ink">
                        {item.fullName?.trim() || 'Anonymous Learner (अज्ञात शिक्षार्थी)'}
                      </span>
                      {isReviewed ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-emerald-800">
                          <CheckIcon size={12} />
                          Reviewed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-amber-900">
                          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                          New Suggestion
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-ink-2">
                      <span className="font-medium text-brand">
                        Role: {formatRoleLabel(item.role, item.otherRoleText)}
                      </span>
                      <span>&bull;</span>
                      <span>Gender: {formatGenderLabel(item.gender)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-ink-2">
                      {formatDateTime(item.createdAt)}
                    </div>
                    {item.reviewedBy && (
                      <div className="mt-0.5 text-[0.7rem] text-ink-3">
                        Reviewed by {item.reviewedBy}
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Row: Contact & Address Info */}
                {(item.email || item.phone || item.district || item.municipality) && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-ink-2">
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1.5 text-brand hover:underline"
                      >
                        <MailIcon size={14} className="shrink-0" />
                        {item.email}
                      </a>
                    )}
                    {item.phone && (
                      <a
                        href={`tel:${item.phone}`}
                        className="inline-flex items-center gap-1.5 text-ink-2 hover:text-brand"
                      >
                        <PhoneIcon size={14} className="shrink-0" />
                        {item.phone}
                      </a>
                    )}
                    {(item.district || item.municipality) && (
                      <span className="inline-flex items-center gap-1.5 text-ink-2">
                        <MapPinIcon size={14} className="shrink-0 text-accent-500" />
                        {[item.municipality, item.district, item.province]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Suggestions Body */}
                <div className="mt-4 rounded-xl border border-line bg-canvas p-4 text-sm leading-relaxed text-ink shadow-inner">
                  <p className="whitespace-pre-wrap">{item.suggestions}</p>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleToggleStatus(item)}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                        isReviewed
                          ? 'border-line bg-card text-ink-2 hover:bg-subtle'
                          : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircleIcon size={14} />
                      {isReviewed ? 'Mark as New (Unreviewed)' : 'Mark as Reviewed'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDetailItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-bold text-ink hover:bg-subtle"
                    >
                      <EyeIcon size={14} />
                      Full View
                    </button>
                  </div>

                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      aria-label="Delete feedback item"
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      <TrashIcon size={14} />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full Detail Reader Modal */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setActiveDetailItem(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-modal">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs font-bold tracking-wider text-brand uppercase">
                  Learner Feedback Detail
                </span>
                <h3 className="mt-1 text-xl font-bold text-ink">
                  {activeDetailItem.fullName?.trim() || 'Anonymous Learner'}
                </h3>
                <p className="text-xs text-ink-2">
                  Submitted {formatDateTime(activeDetailItem.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailItem(null)}
                aria-label="Close detail modal"
                className="rounded-lg p-1.5 text-ink-2 hover:bg-subtle hover:text-ink"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-canvas p-4 sm:grid-cols-3">
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Role</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {formatRoleLabel(activeDetailItem.role, activeDetailItem.otherRoleText)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Gender</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {formatGenderLabel(activeDetailItem.gender)}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Status</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {activeDetailItem.status === 'reviewed' ? 'Reviewed' : 'New'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Email</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {activeDetailItem.email || 'None'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Phone</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {activeDetailItem.phone || 'None'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-ink-3 uppercase text-[0.68rem]">Location</span>
                  <p className="mt-0.5 font-bold text-ink">
                    {[
                      activeDetailItem.municipality,
                      activeDetailItem.district,
                      activeDetailItem.province,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'None'}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-ink text-sm">Full Suggestions & Feedback:</span>
                <div className="mt-2 rounded-xl border border-line bg-canvas p-4 text-sm leading-relaxed text-ink shadow-inner whitespace-pre-wrap">
                  {activeDetailItem.suggestions}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
              <button
                type="button"
                onClick={() => handleToggleStatus(activeDetailItem)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-900 px-4 py-2 text-xs font-bold text-white hover:bg-primary-700"
              >
                <CheckCircleIcon size={16} />
                {activeDetailItem.status === 'reviewed'
                  ? 'Reopen as New'
                  : 'Mark as Reviewed'}
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailItem(null)}
                className="rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-semibold text-ink hover:bg-subtle"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {deleteTarget && (
        <ConfirmModal
          open={Boolean(deleteTarget)}
          title="Delete Feedback Entry"
          message={`Are you sure you want to permanently delete feedback submitted by "${
            deleteTarget.fullName || 'Anonymous'
          }" on ${formatDateTime(deleteTarget.createdAt)}? This action cannot be undone.`}
          confirmLabel={deleting ? 'Deleting...' : 'Delete Permanently'}
          tone="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
