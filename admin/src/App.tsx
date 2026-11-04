import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CmsProvider } from './context/CmsContext'
import { AdminLayout, type AdminTab } from './components/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseEditPage } from './pages/CourseEditPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { HomepagePage } from './pages/HomepagePage'
import { HeaderFooterPage } from './pages/HeaderFooterPage'
import { PagesEditorPage } from './pages/PagesEditorPage'
import { UIStringsPage } from './pages/UIStringsPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsersPage } from './pages/UsersPage'
import { FeedbackPage } from './pages/FeedbackPage'
import { RefreshIcon } from './components/icons'
import heiferLogoLight from '@siteAssets/heifer-academy-logo-light.png'

function AdminApp() {
  const { user, profile, loading, isBootstrapped } = useAuth()
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()

  const handleNavigate = (tab: AdminTab, courseId?: string) => {
    setSelectedCourseId(courseId)
    setCurrentTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading || isBootstrapped === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-card">
          <img
            src={heiferLogoLight}
            alt="Heifer Academy"
            className="mx-auto h-10 w-auto"
          />
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-brand uppercase">
            <RefreshIcon size={15} className="animate-spin text-accent-500" />
            Connecting to Heifer Academy CMS...
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <LoginPage />
  }

  return (
    <AdminLayout currentTab={currentTab} onSelectTab={(t) => handleNavigate(t)}>
      {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentTab === 'courses' && <CoursesPage onNavigate={handleNavigate} />}
      {currentTab === 'course-edit' && (
        <CourseEditPage courseId={selectedCourseId} onNavigate={(t) => handleNavigate(t)} />
      )}
      {currentTab === 'materials' && <MaterialsPage />}
      {currentTab === 'categories' && <CategoriesPage />}
      {currentTab === 'homepage' && <HomepagePage />}
      {currentTab === 'header-footer' && <HeaderFooterPage />}
      {currentTab === 'pages' && <PagesEditorPage />}
      {currentTab === 'strings' && <UIStringsPage />}
      {currentTab === 'feedback' && <FeedbackPage />}
      {currentTab === 'settings' && <SettingsPage />}
      {currentTab === 'users' && <UsersPage />}
    </AdminLayout>
  )
}

export function App() {
  return (
    <AuthProvider>
      <CmsProvider>
        <AdminApp />
      </CmsProvider>
    </AuthProvider>
  )
}

export default App
