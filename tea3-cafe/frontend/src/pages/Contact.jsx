import { useEffect, useState } from 'react'
import AOS from 'aos'
import toast, { Toaster } from 'react-hot-toast'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

  useEffect(() => {
    AOS.init()
    window.scrollTo(0, 0)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form Submitted:", formData)
    toast.success('✅ Message sent! We\'ll reply within 24 hours.', {
      style: { background: '#2C1500', color: '#F5E6C8', border: '1px solid #C9A84C' }
    })
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const inputStyle = {
    width: '100%',
    background: '#1C0A00',
    border: '1px solid #C9A84C',
    color: '#F5E6C8',
    padding: '16px',
    borderRadius: '4px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'all 0.3s',
    fontSize: '15px'
  }

  const handleInputFocus = (e) => {
    e.target.style.boxShadow = '0 0 15px rgba(201,168,76,0.2)'
  }
  const handleInputBlur = (e) => {
    e.target.style.boxShadow = 'none'
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1C0A00', paddingBottom: '0' }}>
      <Toaster position="bottom-center" />
      
      {/* ── HERO ── */}
      <section style={{ 
        height: '40vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', 
        position: 'relative', textAlign: 'center', overflow: 'hidden',
        borderBottom: '1px solid rgba(201,168,76,0.2)' 
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px' }}>Find Us</h1>
          <p style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>We'd love to hear from you</p>
        </div>
      </section>

      {/* ── TWO COLUMN SECTION ── */}
      <section style={{ padding: '100px 5%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', maxWidth: '1200px', margin: '0 auto' }}>
           
           {/* Left column */}
           <div data-aos="fade-right" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '36px', marginBottom: '16px' }}>Visit Our Café</h2>
             <p style={{ color: '#F5E6C8', opacity: 0.8, lineHeight: 1.8, marginBottom: '16px', fontFamily: 'DM Sans, sans-serif' }}>
               Located in the heart of Hyderabad, Tea3 offers a serene escape from the city bustle. Drop by for a fresh cup of artisan tea or a weekend brunch with friends.
             </p>
             {[
               { icon: '📍', text: '123 Brew Street, Banjara Hills, Hyderabad 500034' },
               { icon: '📞', text: '+91 90000 00000' },
               { icon: '📧', text: 'hello@tea3.in' }
             ].map((info, i) => (
                <div key={i} style={{ background: '#2C1500', padding: '24px', borderRadius: '8px', display: 'flex', gap: '24px', alignItems: 'center', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <span style={{ fontSize: '32px' }}>{info.icon}</span>
                  <span style={{ color: '#F5E6C8', fontSize: '16px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>{info.text}</span>
                </div>
             ))}
             <div style={{ background: '#2C1500', padding: '24px', borderRadius: '8px', display: 'flex', gap: '24px', border: '1px solid rgba(201,168,76,0.1)' }}>
                <span style={{ fontSize: '32px' }}>🕐</span>
                <div style={{ color: '#F5E6C8', fontSize: '15px', lineHeight: 2, fontFamily: 'DM Sans, sans-serif' }}>
                  <strong style={{ color: '#C9A84C', letterSpacing: '1px', textTransform: 'uppercase' }}>Hours</strong><br/>
                  Mon–Fri: 8AM–10PM<br/>
                  Sat–Sun: 8AM–11PM<br/>
                  Holidays: 9AM–9PM
                </div>
             </div>
           </div>

           {/* Right column (Map) */}
           <div data-aos="fade-left">
             <iframe
                src="https://maps.google.com/maps?q=Banjara+Hills+Hyderabad&output=embed"
                width="100%" height="100%" style={{ minHeight: '500px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.4)', filter: 'invert(90%) hue-rotate(180deg)', opacity: 0.85 }}
                title="Tea3 Location"
                loading="lazy"
              />
           </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section style={{ padding: '80px 5%', background: '#150800' }}>
        <div data-aos="fade-up" style={{ maxWidth: '800px', margin: '0 auto', background: '#2C1500', padding: '60px 5%', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.2)' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '42px', marginBottom: '40px', textAlign: 'center' }}>Send Us a Message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
               <input 
                 style={inputStyle} type="text" placeholder="Full Name *" required 
                 value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                 onFocus={handleInputFocus} onBlur={handleInputBlur}
               />
               <input 
                 style={inputStyle} type="email" placeholder="Email Address *" required 
                 value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                 onFocus={handleInputFocus} onBlur={handleInputBlur}
               />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
               <input 
                 style={inputStyle} type="tel" placeholder="Phone Number" 
                 value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} 
                 onFocus={handleInputFocus} onBlur={handleInputBlur}
               />
               <input 
                 style={inputStyle} type="text" placeholder="Subject" 
                 value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} 
                 onFocus={handleInputFocus} onBlur={handleInputBlur}
               />
            </div>

            <textarea 
              style={{ ...inputStyle, resize: 'vertical' }} rows={6} placeholder="Your Message *" required 
              value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} 
              onFocus={handleInputFocus} onBlur={handleInputBlur}
            />

            <button 
              type="submit" 
              style={{ 
                background: '#C9A84C', color: '#1C0A00', padding: '16px', 
                borderRadius: '4px', border: 'none', fontWeight: 'bold', 
                fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s',
                marginTop: '16px', fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '2px', textTransform: 'uppercase'
              }}
              onMouseEnter={e => {
                e.target.style.opacity = '0.9'
                e.target.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.target.style.opacity = '1'
                e.target.style.transform = 'translateY(0)'
              }}
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* ── QUICK CONTACT BAR (BOTTOM) ── */}
      <section style={{ padding: '80px 5%', background: '#1C0A00' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '📞', t: 'Call Us', link: 'tel:+919000000000', label: '+91 90000 00000' },
            { icon: '💬', t: 'WhatsApp', link: 'https://wa.me/919000000000', label: 'Message Us' },
            { icon: '📧', t: 'Email', link: 'mailto:hello@tea3.in', label: 'hello@tea3.in' }
          ].map((c, i) => (
             <a 
               href={c.link} 
               key={i} 
               data-aos="fade-up" 
               data-aos-delay={i*100} 
               style={{ 
                 background: '#2C1500', display: 'flex', alignItems: 'center', 
                 justifyContent: 'center', gap: '16px', padding: '32px', 
                 borderRadius: '8px', border: '1px solid rgba(201,168,76,0.15)', 
                 transition: 'all 0.4s ease', textDecoration: 'none',
                 cursor: 'pointer'
               }}
               onMouseEnter={e => {
                 e.currentTarget.style.borderColor = '#C9A84C'
                 e.currentTarget.style.transform = 'translateY(-8px)'
               }}
               onMouseLeave={e => {
                 e.currentTarget.style.borderColor = 'rgba(201,168,76,0.15)'
                 e.currentTarget.style.transform = 'translateY(0)'
               }}
             >
                <span style={{ fontSize: '40px' }}>{c.icon}</span>
                <div>
                  <div style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>{c.t}</div>
                  <div style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '14px', fontFamily: 'DM Sans, sans-serif', marginTop: '4px' }}>{c.label}</div>
                </div>
             </a>
          ))}
        </div>
      </section>

    </main>
  )
}
