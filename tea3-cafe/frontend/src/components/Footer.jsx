import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Column 1: Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <img src="/logo.png" alt="Tea3 Logo" style={{ width: 40, height: 40, objectFit:'contain' }} />
              <span style={{ fontFamily:'var(--font-heading)', color:'var(--gold)', fontSize:'1.4rem', fontWeight:700 }}>Tea3</span>
            </Link>
            <p className="footer-tagline">Handcrafted teas, soulful bites, timeless moments.</p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f" /></a>
              <a href="#" aria-label="Twitter"><i className="fa-brands fa-x-twitter" /></a>
              <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="footer-links">
            <h4 className="footer-title">Quick Links</h4>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/menu">Menu</Link>
              <Link to="/about">About Us</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/booking">Book a Table</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          {/* Column 3: Contact */}
          <div className="footer-contact">
            <h4 className="footer-title">Visit Us</h4>
            <ul>
              <li><i className="fa-solid fa-location-dot" /> 123 Brew Street, Banjara Hills, Hyderabad</li>
              <li><i className="fa-solid fa-phone" /> +91 90000 00000</li>
              <li><i className="fa-solid fa-envelope" /> hello@tea3.in</li>
            </ul>
            <h4 className="footer-title" style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Hours</h4>
            <ul className="footer-hours">
              <li><span>Mon - Fri</span> <span>8AM - 9PM</span></li>
              <li><span>Saturday</span> <span>8AM - 10PM</span></li>
              <li><span>Sunday</span> <span>8AM - 8PM</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Tea3. All Rights Reserved.</p>
          <p>Made with ☕ for Tea3</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--charcoal); padding: 5rem 0 2rem;
          border-top: 1px solid rgba(201, 168, 76, 0.1);
        }
        .footer-grid {
          display: grid; grid-template-columns: 1.5fr 1fr 1.2fr; gap: 4rem;
          margin-bottom: 4rem;
        }
        .footer-logo { display: flex; align-items: center; gap: 0.8rem; margin-bottom: 1rem; }
        .footer-tagline { color: var(--muted); line-height: 1.6; margin-bottom: 1.5rem; max-width: 300px; }
        
        .social-icons { display: flex; gap: 0.8rem; }
        .social-icons a {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(201, 168, 76, 0.3); color: var(--gold);
          transition: all 0.3s ease;
        }
        .social-icons a:hover { background: var(--gold); color: var(--espresso); transform: translateY(-3px); }

        .footer-title {
          font-family: var(--font-heading); color: var(--gold); font-size: 1.1rem;
          margin-bottom: 1.2rem;
        }
        .footer-links nav { display: flex; flex-direction: column; gap: 0.8rem; }
        .footer-links a {
          color: var(--muted); transition: color 0.3s; width: fit-content;
        }
        .footer-links a:hover { color: var(--gold); padding-left: 5px; }

        .footer-contact ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem; }
        .footer-contact li { color: var(--muted); display: flex; gap: 0.8rem; align-items: flex-start; line-height: 1.5; }
        .footer-contact i { color: var(--gold); margin-top: 4px; }
        
        .footer-hours li { justify-content: space-between; border-bottom: 1px solid rgba(201, 168, 76, 0.1); padding-bottom: 0.4rem; gap: 2rem; }
        .footer-hours li span:last-child { color: var(--cream); font-weight: 500; }

        .footer-bottom {
          border-top: 1px solid rgba(201, 168, 76, 0.1); padding-top: 2rem;
          display: flex; justify-content: space-between; align-items: center;
          color: rgba(245, 230, 200, 0.4); font-size: 0.85rem;
        }

        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 3rem; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>
    </footer>
  )
}
