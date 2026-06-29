import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Toaster } from 'react-hot-toast';
import { CardSkeleton } from './components/Skeleton';
import { OnboardingModal } from './components/OnboardingModal';

// Lazy loading all pages for optimal bundle splitting and performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const MapPage = React.lazy(() => import('./pages/MapPage'));
const ReportPage = React.lazy(() => import('./pages/ReportPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const IssueDetailPage = React.lazy(() => import('./pages/IssueDetailPage'));
const InsightsPage = React.lazy(() => import('./pages/InsightsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));

// Generic suspense loading wrapper
const PageLoader: React.FC = () => (
  <div 
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px', 
      maxWidth: '1200px', 
      margin: '40px auto', 
      padding: '0 24px' 
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div className="shimmer" style={{ width: '200px', height: '32px' }} />
      <div className="shimmer" style={{ width: '400px', height: '16px' }} />
    </div>
    <div className="grid-cols-2">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();
  const isMapPage = location.pathname === '/map';

  return (
    <div className="app-container">
      <Navbar />
      <OnboardingModal />
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/issue/:id" element={<IssueDetailPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </main>

      {/* Swiss minimalist design responsive footer - Hidden on Map Page */}
      {!isMapPage && (
        <footer className="app-footer">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5px' }}>
            <span className="text-mono" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '0.05em' }}>
              CIVICPULSE
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
              © {new Date().getFullYear()} Municipal Ward Infrastructure Ledger.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/map" className="text-muted" style={{ textDecoration: 'none' }}>Map</Link>
            <Link to="/dashboard" className="text-muted" style={{ textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/insights" className="text-muted" style={{ textDecoration: 'none' }}>Insights Analyst</Link>
            <Link to="/report" className="text-muted" style={{ textDecoration: 'none' }}>Report Hazard</Link>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--surface-2)',
                color: 'var(--text-1)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                borderRadius: '6px'
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: '#FFFFFF'
                }
              },
              error: {
                iconTheme: {
                  primary: 'var(--danger)',
                  secondary: '#FFFFFF'
                }
              }
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
