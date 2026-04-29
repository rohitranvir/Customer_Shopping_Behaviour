import { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { cartCount, toggleCart } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Link to="/" className="nav-logo" onClick={() => setMobileOpen(false)}>
            <img src="/logo.png" alt="Tea3 Logo" style={{ width: 32, height: 32, objectFit:'contain' }} />
            Tea3
          </Link>

          {/* Desktop Nav */}
          <nav className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>
            <NavLink to="/booking">Book a Table</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>

          <div className="nav-right">
            <button className="cart-btn" onClick={toggleCart} aria-label="Open cart">
              <i className="fa-solid fa-bag-shopping" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <Link to="/booking" className="btn-reserve">Reserve Now</Link>
            <button className="hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" onClick={() => setMobileOpen(false)}>Home</NavLink>
        <NavLink to="/menu" onClick={() => setMobileOpen(false)}>Menu</NavLink>
        <NavLink to="/about" onClick={() => setMobileOpen(false)}>About</NavLink>
        <NavLink to="/gallery" onClick={() => setMobileOpen(false)}>Gallery</NavLink>
        <NavLink to="/booking" onClick={() => setMobileOpen(false)}>Book a Table</NavLink>
        <NavLink to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
        <Link to="/booking" className="btn-reserve-mobile" onClick={() => setMobileOpen(false)}>Reserve Now</Link>
      </div>

      <style>{`
        .navbar {
          position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;
          background: rgba(28, 10, 0, 0); padding: 1.2rem 0;
          transition: all 0.3s ease; border-bottom: 1px solid transparent;
        }
        .navbar.scrolled {
          background: rgba(28, 10, 0, 0.95); backdrop-filter: blur(10px);
          padding: 0.7rem 0; border-bottom: 1px solid rgba(201, 168, 76, 0.15);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
        }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .nav-logo {
          display: flex; align-items: center; gap: 0.6rem;
          font-family: var(--font-heading); font-size: 1.6rem;
          color: var(--gold); font-weight: 700;
        }
        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-links a {
          font-size: 0.85rem; font-weight: 500; text-transform: uppercase;
          letter-spacing: 1px; color: var(--cream); position: relative;
          padding-bottom: 4px;
        }
        .nav-links a::after {
          content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
          background: var(--gold); transition: width 0.3s ease;
        }
        .nav-links a:hover, .nav-links a.active { color: var(--gold); }
        .nav-links a:hover::after, .nav-links a.active::after { width: 100%; }

        .nav-right { display: flex; align-items: center; gap: 1.5rem; }
        .cart-btn {
          position: relative; color: var(--cream); font-size: 1.25rem;
          transition: color 0.3s ease;
        }
        .cart-btn:hover { color: var(--gold); }
        .cart-badge {
          position: absolute; top: -6px; right: -8px; background: var(--gold);
          color: var(--espresso); font-size: 0.65rem; font-weight: 800;
          min-width: 18px; height: 18px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; padding: 0 4px;
        }
        .btn-reserve {
          background: var(--gold); color: var(--espresso); font-size: 0.8rem;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
          padding: 0.6rem 1.6rem; border-radius: 999px; transition: all 0.3s;
        }
        .btn-reserve:hover { background: var(--gold-hover); transform: translateY(-2px); box-shadow: var(--shadow-gold); }
        .hamburger { display: none; color: var(--gold); font-size: 1.4rem; }

        .mobile-drawer {
          position: fixed; top: 0; right: -100%; width: 100%; height: 100vh;
          background: rgba(28, 10, 0, 0.98); backdrop-filter: blur(10px);
          z-index: 999; display: flex; flex-direction: column;
          justify-content: center; align-items: center; gap: 2rem;
          transition: right 0.4s ease;
        }
        .mobile-drawer.open { right: 0; }
        .mobile-drawer a {
          font-family: var(--font-heading); font-size: 1.5rem; color: var(--cream);
          transition: color 0.3s;
        }
        .mobile-drawer a:hover, .mobile-drawer a.active { color: var(--gold); }
        .btn-reserve-mobile {
          background: var(--gold); color: var(--espresso) !important;
          padding: 1rem 3rem; border-radius: 999px; font-size: 1rem;
          text-transform: uppercase; letter-spacing: 1px; font-family: var(--font-body) !important;
          font-weight: 700; margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .btn-reserve { display: none; }
          .hamburger { display: block; }
        }
      `}</style>
    </>
  )
}
