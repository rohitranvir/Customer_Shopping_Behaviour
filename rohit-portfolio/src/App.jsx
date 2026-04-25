import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Portfolio Layout (critical — loaded eagerly)
import Preloader from './components/layout/Preloader';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SmoothScroll from './components/layout/SmoothScroll';
import ScrollProgress from './components/layout/ScrollProgress';
import PageTransition from './components/layout/PageTransition';
import SEO from './components/SEO';
import GoldSkeleton from './components/GoldSkeleton';

// Above-fold (eagerly loaded — visible immediately)
import Hero from './components/sections/Hero';
import Marquee from './components/sections/Marquee';

// Below-fold sections (lazy loaded — user scrolls to them)
const About = lazy(() => import('./components/sections/About'));
const Skills = lazy(() => import('./components/sections/Skills'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Experience = lazy(() => import('./components/sections/Experience'));
const Publications = lazy(() => import('./components/sections/Publications'));
const Certifications = lazy(() => import('./components/sections/Certifications'));
const Contact = lazy(() => import('./components/sections/Contact'));

// Utils
import CustomCursor from './components/CustomCursor';

// Lazy-loaded routes
const CaseStudy = lazy(() => import('./components/pages/CaseStudy'));
const Login = lazy(() => import('./components/admin/Login'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

function Portfolio() {
  const { data } = useData();
  const [loaded, setLoaded] = useState(false);
  const visibility = data?.settings?.sectionVisibility || {};

  return (
    <PageTransition>
      <SEO />
      <AnimatePresence mode="wait">
        {!loaded && <Preloader key="preloader" onFinish={() => setLoaded(true)} />}
      </AnimatePresence>
      <CustomCursor />
      <div className="noise-overlay" />
      <ScrollProgress />
      <Navbar />
      <main>
        {visibility.hero !== false && <Hero />}
        {visibility.marquee !== false && <Marquee />}
        <Suspense fallback={<GoldSkeleton type="cards" />}>
          {visibility.about !== false && <About />}
          {visibility.skills !== false && <Skills />}
          {visibility.projects !== false && <Projects />}
          {visibility.experience !== false && <Experience />}
          {visibility.publications !== false && <Publications />}
          {visibility.certifications !== false && <Certifications />}
          {visibility.contact !== false && <Contact />}
        </Suspense>
      </main>
      <Footer />
    </PageTransition>
  );
}

function AdminPage() {
  const { isAuth } = useAuth();
  return (
    <PageTransition>
      <SEO title="Admin Panel — Rohit Ranvir Portfolio" />
      <Suspense fallback={<GoldSkeleton type="section-header" />}>
        {isAuth ? <AdminLayout /> : <Login />}
      </Suspense>
    </PageTransition>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Portfolio />} />
        <Route
          path="/projects/:slug"
          element={
            <Suspense fallback={<GoldSkeleton type="hero" />}>
              <CaseStudy />
            </Suspense>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AuthProvider>
          <SmoothScroll>
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </SmoothScroll>
        </AuthProvider>
      </DataProvider>
    </ErrorBoundary>
  );
}
