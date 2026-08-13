import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './queryClient';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/shared/LoadingSpinner';
import Toaster from './components/shared/Toaster';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SupportAgentChat from './components/SupportAgentChat';
import GuidedTour from './components/shared/GuidedTour';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AgentRegistry = lazy(() => import('./pages/AgentRegistry'));
const AgentRegistrationForm = lazy(() => import('./pages/AgentRegistrationForm'));
const AgentDetail = lazy(() => import('./pages/AgentDetail'));
const ReviewHistory = lazy(() => import('./pages/ReviewHistory'));
const ReviewReportDetail = lazy(() => import('./pages/ReviewReportDetail'));
const ApiSimulator = lazy(() => import('./pages/ApiSimulator'));
const AuditLog = lazy(() => import('./pages/AuditLog'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));

export function App() {
 return (
 <ErrorBoundary>
 <BrowserRouter>
 <QueryClientProvider client={queryClient}>
 <Suspense fallback={<LoadingSpinner />}>
 <Routes>
 <Route path="/" element={<LandingPage />} />
 <Route path="/landing" element={<LandingPage />} />
 <Route path="/about" element={<About />} />
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
 <Route path="*" element={<NotFound />} />
 </Routes>
 </Suspense>
 <Toaster />
 <SupportAgentChat />
 <GuidedTour />
 </QueryClientProvider>
 </BrowserRouter>
 </ErrorBoundary>
 );
}

export default App;
