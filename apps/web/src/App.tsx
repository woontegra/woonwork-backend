import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { CalendarPage } from './pages/CalendarPage';
import { PagesPage } from './pages/PagesPage';
import { PageDetailPage } from './pages/PageDetailPage';
import { SocialPage } from './pages/SocialPage';
import { TeamPage } from './pages/TeamPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/giris" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projeler" element={<ProjectsPage />} />
        <Route path="gorevler" element={<TasksPage />} />
        <Route path="takvim" element={<CalendarPage />} />
        <Route path="notlar" element={<PagesPage />} />
        <Route path="notlar/:id" element={<PageDetailPage />} />
        <Route path="sosyal-medya" element={<SocialPage />} />
        <Route path="ekip" element={<TeamPage />} />
        <Route path="ayarlar" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
