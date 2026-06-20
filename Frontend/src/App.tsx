import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { fetchImpactSummary } from './api/client';
import { AuthProvider } from './contexts/AuthContext';
import AdminLayout, { ProtectedRoute } from './components/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgramsPage from './pages/ProgramsPage';
import ImpactPage from './pages/ImpactPage';
import ResourcesPage from './pages/ResourcesPage';
import DonatePage from './pages/DonatePage';
import ActionPage from './pages/ActionPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ContactPage from './pages/ContactPage';

// Admin Pages
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPledges from './pages/AdminPledges';
import AdminCertificates from './pages/AdminCertificates';
import AdminApplications from './pages/AdminApplications';
import AdminContacts from './pages/AdminContacts';
import AdminDistricts from './pages/AdminDistricts';
import AdminOpportunities from './pages/AdminOpportunities';
import AdminWeeklyChallenges from './pages/AdminWeeklyChallenges';
import AdminWebinars from './pages/AdminWebinars';
import AdminImpact from './pages/AdminImpact';

export default function App() {
  const [treesPledgedTotal, setTreesPledgedTotal] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on every route transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Read total trees from API first, then fall back to pledges cache
  useEffect(() => {
    const load = async () => {
      const summary = await fetchImpactSummary();
      if (summary && summary.total_trees_planted > 0) {
        setTreesPledgedTotal(summary.total_trees_planted);
        return;
      }
      // Fallback to localStorage
      const cached = localStorage.getItem('we4climate_pledges');
      if (cached) {
        try {
          const list = JSON.parse(cached);
          const sum = list.reduce((acc: number, item: any) => acc + (item.treesCount || 0), 0);
          setTreesPledgedTotal(sum);
        } catch {
          /* ignore */
        }
      } else {
        setTreesPledgedTotal(90);
      }
    };
    load();
  }, []);

  // Update total synchronizing across pages
  const handlePledgeAdded = (count: number) => {
    setTreesPledgedTotal(prev => prev + count);
  };

  // Maps legacy button-scroll commands to explicit page navigations
  const handleScrollToSection = (id: string) => {
    if (id === 'hero') navigate('/');
    else if (id === 'about') navigate('/about');
    else if (id === 'programs') navigate('/programs');
    else if (id === 'dashboard') navigate('/impact');
    else if (id === 'resources') navigate('/resources');
    else if (id === 'donate') navigate('/donate');
    else if (id === 'interactive') navigate('/action');
    else if (id === 'opportunities') navigate('/opportunities');
    else if (id === 'contact') navigate('/contact');
    else navigate('/');
  };

  return (
    <AuthProvider>
      <Routes>
        {/* ──── Public Frontend Routes ──── */}
        <Route
          path="/admin/login"
          element={
            <div className="min-h-screen flex flex-col font-sans antialiased text-gray-800 bg-brand-50">
              <AdminLogin />
            </div>
          }
        />

        {/* ──── Admin Routes (protected, no navbar/footer) ──── */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pledges"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminPledges />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/certificates"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminCertificates />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminApplications />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminContacts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminOpportunities />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/districts"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDistricts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/weekly-challenges"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminWeeklyChallenges />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/webinars"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminWebinars />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/impact"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminImpact />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* ──── Public Site Routes ──── */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col font-sans antialiased text-gray-800 bg-brand-50">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <HomePage
                        treesPledgedTotal={treesPledgedTotal}
                        handleScrollToSection={handleScrollToSection}
                      />
                    }
                  />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/impact" element={<ImpactPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route
                    path="/action"
                    element={<ActionPage handlePledgeAdded={handlePledgeAdded} />}
                  />
                  <Route path="/opportunities" element={<OpportunitiesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  {/* Fallback route redirection */}
                  <Route
                    path="*"
                    element={
                      <HomePage
                        treesPledgedTotal={treesPledgedTotal}
                        handleScrollToSection={handleScrollToSection}
                      />
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
