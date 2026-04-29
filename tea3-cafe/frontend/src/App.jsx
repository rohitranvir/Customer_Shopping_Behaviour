import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

import PageLoader from './components/PageLoader'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CartSidebar from './components/CartSidebar'

import Home from './pages/Home'
import Menu from './pages/Menu'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Booking from './pages/Booking'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('tea3_token')
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  return children
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <PageLoader />
        
        <Routes>
          {/* Admin Routes - without standard Navbar/Footer layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Public Routes - with layout */}
          <Route path="*" element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/booking" element={<Booking />} />
                </Routes>
              </div>
              <Footer />
              <CartSidebar />
              <WhatsAppButton />
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
