import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/shared/LoadingSpinner';
import Toaster from './components/shared/Toaster';
import ErrorBoundary from './components/shared/ErrorBoundary';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AgentRegistry = lazy(() => import('./pages/AgentRegistry'));
const AgentRegistrationForm = lazy(() => import('./pages/AgentRegistrationForm'));
const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const ReviewHistory = lazy(() => import('./pages/ReviewHistory'));
const ReviewReportDetail = lazy(() => import('./pages/ReviewReportDetail'));
const ApiSimulator = lazy(() => import('./pages/ApiSimulator'));
const AuditLog = lazy(() => import('./pages/AuditLog'));

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/agents" element={<AgentRegistry />} />
                <Route path="/agents/new" element={<AgentRegistrationForm />} />
                <Route path="/agents/:agentId" element={<AgentDetail />} />
                <Route path="/reviews" element={<ReviewHistory />} />
                <Route path="/reviews/:reviewId" element={<ReviewReportDetail />} />
                <Route path="/simulator" element={<ApiSimulator />} />
                <Route path="/audit-log" element={<AuditLog />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <Toaster />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
