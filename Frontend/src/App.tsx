import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

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

export default function App() {
  const [treesPledgedTotal, setTreesPledgedTotal] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on every route transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Read existing total trees from pledges cache
  useEffect(() => {
    const cached = localStorage.getItem('we4climate_pledges');
    if (cached) {
      try {
        const list = JSON.parse(cached);
        const sum = list.reduce((acc: number, item: any) => acc + (item.treesCount || 0), 0);
        setTreesPledgedTotal(sum);
      } catch (e) {
        // Fallback robust
      }
    } else {
      setTreesPledgedTotal(90); // default starting pledge visual offsets
    }
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
    <div className="min-h-screen flex flex-col font-sans antialiased text-gray-800 bg-brand-50">
      {/* Route-Aware Glassmorphic Navbar */}
      <Navbar />

      {/* Main Content Areas rendering discrete pages */}
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

      {/* Structured Site Footer */}
      <Footer />
    </div>
  );
}
