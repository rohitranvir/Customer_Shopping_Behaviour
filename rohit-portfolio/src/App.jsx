import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Portfolio Layout
import Preloader from './components/layout/Preloader';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import SmoothScroll from './components/layout/SmoothScroll';
import ScrollProgress from './components/layout/ScrollProgress';
import PageTransition from './components/layout/PageTransition';

// Portfolio Sections
import Hero from './components/sections/Hero';
import Marquee from './components/sections/Marquee';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Experience from './components/sections/Experience';
import Publications from './components/sections/Publications';
import Certifications from './components/sections/Certifications';
import Contact from './components/sections/Contact';

// Utils
import CustomCursor from './components/CustomCursor';

// Admin
import Login from './components/admin/Login';
import AdminLayout from './components/admin/AdminLayout';

function Portfolio() {
  const { data } = useData();
  const [loaded, setLoaded] = useState(false);
  const visibility = data?.settings?.sectionVisibility || {};

  return (
    <PageTransition>
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
        {visibility.about !== false && <About />}
        {visibility.skills !== false && <Skills />}
        {visibility.projects !== false && <Projects />}
        {visibility.experience !== false && <Experience />}
        {visibility.publications !== false && <Publications />}
        {visibility.certifications !== false && <Certifications />}
        {visibility.contact !== false && <Contact />}
      </main>
      <Footer />
    </PageTransition>
  );
}

function AdminPage() {
  const { isAuth } = useAuth();
  return (
    <PageTransition>
      {isAuth ? <AdminLayout /> : <Login />}
    </PageTransition>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <SmoothScroll>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </SmoothScroll>
      </AuthProvider>
    </DataProvider>
  );
}
