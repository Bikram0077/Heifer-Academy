import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { CmsProvider } from './context/CmsContext'
import { AdminLayout, type AdminTab } from './components/AdminLayout'
import { AdminRouteGuard } from './components/AdminRouteGuard'
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

function AdminApp() {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard')
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>()

  const handleNavigate = (tab: AdminTab, courseId?: string) => {
    setSelectedCourseId(courseId)
    setCurrentTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <AdminRouteGuard currentTab={currentTab}>
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
    </AdminRouteGuard>
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
