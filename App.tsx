import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { VanguardProvider } from './context/VanguardContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Layout/Sidebar';
import { TopBar } from './components/Layout/TopBar';
import { LoadingSpinner } from './components/ui';

// Lazy Load Pages
const LoginModule = React.lazy(() => import('./pages/Login').then(module => ({ default: module.LoginModule })));
const SignupModule = React.lazy(() => import('./pages/Signup').then(module => ({ default: module.SignupModule })));
const HomeModule = React.lazy(() => import('./pages/Home').then(module => ({ default: module.HomeModule })));
const CRMModule = React.lazy(() => import('./pages/CRM').then(module => ({ default: module.CRMModule })));
const ClientsModule = React.lazy(() => import('./pages/Clients').then(module => ({ default: module.ClientsModule })));
const ProjectsModule = React.lazy(() => import('./pages/Projects').then(module => ({ default: module.ProjectsModule })));
const PerformanceModule = React.lazy(() => import('./pages/Performance').then(module => ({ default: module.PerformanceModule })));
const MediaModule = React.lazy(() => import('./pages/Media').then(module => ({ default: module.MediaModule })));
const SOPModule = React.lazy(() => import('./pages/SOP').then(module => ({ default: module.SOPModule })));
const AgendaModule = React.lazy(() => import('./pages/Agenda').then(module => ({ default: module.AgendaModule })));
const SettingsModule = React.lazy(() => import('./pages/Settings').then(module => ({ default: module.SettingsModule })));

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <AuthProvider>
      <VanguardProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginModule />} />
              <Route path="/signup" element={<SignupModule />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="flex h-screen overflow-hidden bg-vgray">
                      <Sidebar
                        isCollapsed={isSidebarCollapsed}
                        setIsCollapsed={setIsSidebarCollapsed}
                        isMobileOpen={isMobileOpen}
                        setIsMobileOpen={setIsMobileOpen}
                      />
                      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 bg-vgray ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                        <TopBar onMenuClick={() => setIsMobileOpen(true)} />
                        <main className="flex-1 overflow-auto custom-scrollbar transition-colors duration-500 p-4 lg:p-8 bg-vgray">
                          <div className="max-w-7xl mx-auto animate-fadeIn">
                            <Routes>
                              <Route path="/" element={<HomeModule />} />
                              <Route path="/crm" element={<CRMModule />} />
                              <Route path="/clients" element={<ClientsModule />} />
                              <Route path="/projects" element={<ProjectsModule />} />
                              <Route path="/performance" element={<PerformanceModule />} />
                              <Route path="/media" element={<MediaModule />} />
                              <Route path="/sop" element={<SOPModule />} />
                              <Route path="/agenda" element={<AgendaModule />} />
                              <Route path="/settings" element={<SettingsModule />} />
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </div>
                        </main>
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </VanguardProvider>
    </AuthProvider>
  );
};

export default App;

