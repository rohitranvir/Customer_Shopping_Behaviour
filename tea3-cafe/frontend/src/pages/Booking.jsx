import { useState, useEffect } from 'react'
import AOS from 'aos'
import confetti from 'canvas-confetti'

export default function Booking() {
  const [formData, setFormData] = useState({ 
    name: '', phone: '', email: '', date: '', time: '', guests: '1', requests: '' 
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})
  const [openIndex, setOpenIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600)

  useEffect(() => {
    AOS.init()
    window.scrollTo(0, 0)
    const handleResize = () => setIsMobile(window.innerWidth < 600)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const validate = () => {
    const newErrors = {}
    if(formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters.'
    if(!/^[0-9]{10}$/.test(formData.phone)) newErrors.phone = '10-digit number required.'
    if(!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email required.'
    
    const selectedDate = new Date(formData.date)
    const today = new Date(); today.setHours(0,0,0,0)
    if(!formData.date) newErrors.date = 'Date is required.'
    else if(selectedDate < today) newErrors.date = 'Date cannot be in the past.'
    
    if(!formData.time) newErrors.time = 'Time is required.'
    if(!formData.guests) newErrors.guests = 'Guests required.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleValidationSuccess = () => {
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      colors: ['#C9A84C','#F5E6C8','#1C0A00'] 
    })
    setSubmitted(true)
  }

  const handleWhatsApp = (e) => {
    e.preventDefault()
    if(validate()) {
       const msg = `Hi Tea3! I'd like to book a table.%0A%0A*Name:* ${formData.name}%0A*Date:* ${formData.date}%0A*Time:* ${formData.time}%0A*Guests:* ${formData.guests}%0A*Special Requests:* ${formData.requests || 'None'}%0A%0APlease confirm.`
       window.open(`https://wa.me/919000000000?text=${msg}`, '_blank')
       handleValidationSuccess()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(validate()) {
       handleValidationSuccess()
    }
  }

  const inputStyle = (field) => ({
    width: '100%',
    background: '#1C0A00',
    border: `1px solid ${errors[field] ? '#ff4d4f' : '#C9A84C'}`,
    color: '#F5E6C8',
    padding: '16px',
    borderRadius: '4px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'all 0.3s',
    fontSize: '15px'
  })

  const handleInputFocus = (e) => {
    e.target.style.boxShadow = '0 0 10px rgba(201,168,76,0.3)'
  }
  const handleInputBlur = (e) => {
    e.target.style.boxShadow = 'none'
  }

  const times = []
  for(let i=8; i<=21; i++) {
    times.push(`${i}:00`); times.push(`${i}:30`);
  }

  const gridStyle = { 
    display: 'grid', 
    gap: '24px', 
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr' 
  }

  return (
    <main style={{ minHeight: '100vh', background: '#1C0A00', paddingBottom: '0' }}>
      
      {/* ── HERO ── */}
      <section style={{ 
        height: '40vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', 
        position: 'relative', textAlign: 'center', overflow: 'hidden',
        borderBottom: '1px solid rgba(201,168,76,0.2)' 
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px' }}>Reserve Your Table</h1>
          <p style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>We'll confirm your booking within 30 minutes</p>
        </div>
      </section>

      {/* ── DYNAMIC FORM / SUCCESS ── */}
      <section style={{ padding: '0 5%', position: 'relative', zIndex: 10, transform: 'translateY(-60px)' }}>
        
        {submitted ? (
          <div data-aos="zoom-in" style={{ 
            maxWidth: '680px', margin: '0 auto', background: '#2C1500', 
            padding: '60px 5%', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)', 
            textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' 
          }}>
            <div style={{ fontSize: '96px', marginBottom: '24px' }}>🎉</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(32px, 5vw, 42px)', marginBottom: '16px' }}>Booking Received!</h2>
            <p style={{ color: '#C9A84C', fontSize: '20px', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 'bold' }}>
              See you on {formData.date} at {formData.time}, {formData.name.split(' ')[0]}!
            </p>
            <p style={{ color: 'rgba(245,230,200,0.7)', marginBottom: '40px', fontFamily: 'DM Sans, sans-serif', fontSize: '16px' }}>
              Check your WhatsApp or Email for final confirmation.
            </p>
            <button 
              onClick={() => { setSubmitted(false); setFormData({ name: '', phone: '', email: '', date: '', time: '', guests: '1', requests: '' })}}
              style={{ 
                background: 'transparent', border: '2px solid #C9A84C', 
                color: '#C9A84C', padding: '14px 32px', borderRadius: '4px', 
                cursor: 'pointer', transition: 'all 0.3s', fontWeight: 'bold',
                fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
              }}
              onMouseEnter={e => {
                e.target.style.background = '#C9A84C'
                e.target.style.color = '#1C0A00'
              }}
              onMouseLeave={e => {
                e.target.style.background = 'transparent'
                e.target.style.color = '#C9A84C'
              }}
            >
              Make Another Booking
            </button>
          </div>
        ) : (
          <div data-aos="fade-up" style={{ 
            maxWidth: '800px', margin: '0 auto', background: '#2C1500', 
            padding: '48px', borderRadius: '8px', border: '1px solid rgba(201,168,76,0.3)', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)' 
          }}>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={gridStyle}>
                <div>
                  <input style={inputStyle('name')} type="text" placeholder="Full Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  {errors.name && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.name}</small>}
                </div>
                <div>
                  <input style={inputStyle('phone')} type="tel" placeholder="Phone Number *" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  {errors.phone && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.phone}</small>}
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <input style={inputStyle('email')} type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  {errors.email && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.email}</small>}
                </div>
                <div>
                  <select style={inputStyle('guests')} value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur}>
                     {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Guests</option>)}
                     <option value="11+">11+ Guests (Call Us)</option>
                  </select>
                  {errors.guests && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.guests}</small>}
                </div>
              </div>

              <div style={gridStyle}>
                <div>
                  <input style={inputStyle('date')} type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur} />
                  {errors.date && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.date}</small>}
                </div>
                <div>
                  <select style={inputStyle('time')} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} onFocus={handleInputFocus} onBlur={handleInputBlur}>
                     <option value="" disabled>Select Time *</option>
                     {times.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.time && <small style={{ color: '#ff4d4f', marginTop: '8px', display: 'block', fontFamily: 'DM Sans' }}>{errors.time}</small>}
                </div>
              </div>

              <textarea 
                style={{ ...inputStyle('requests'), resize: 'vertical' }} 
                rows={4} placeholder="Special Requests (Optional)" 
                value={formData.requests} onChange={e => setFormData({...formData, requests: e.target.value})} 
                onFocus={handleInputFocus} onBlur={handleInputBlur}
              />

              <div style={{ ...gridStyle, marginTop: '8px' }}>
                <button 
                  onClick={handleWhatsApp} 
                  style={{ 
                    background: '#C9A84C', color: '#1C0A00', padding: '16px', 
                    borderRadius: '4px', border: 'none', fontWeight: 'bold', 
                    fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s',
                    fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
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
                  Confirm via WhatsApp
                </button>
                <button 
                  onClick={handleSubmit} 
                  style={{ 
                    background: 'transparent', border: '2px solid #C9A84C', 
                    color: '#C9A84C', padding: '16px', borderRadius: '4px', 
                    fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', 
                    transition: 'all 0.3s', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = '#C9A84C'
                    e.target.style.color = '#1C0A00'
                    e.target.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent'
                    e.target.style.color = '#C9A84C'
                    e.target.style.transform = 'translateY(0)'
                  }}
                >
                  Send Booking
                </button>
              </div>

            </form>
          </div>
        )}
      </section>

      {/* ── WHAT TO EXPECT ── */}
      <section style={{ padding: '40px 5% 80px' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', maxWidth: '1000px', margin: '0 auto' }}>
            {[
              { icon: '🤝', t: 'Warm Welcome', d: 'Our team greets you personally' },
              { icon: '🍽️', t: 'Premium Experience', d: 'Full menu at your table' },
              { icon: '✨', t: 'Special Occasions', d: 'Tell us — we\'ll make it memorable' }
            ].map((f, i) => (
              <div key={i} data-aos="fade-up" data-aos-delay={i*100} style={{ 
                textAlign: 'center', background: '#2C1500', padding: '40px 32px', 
                borderRadius: '8px', border: '1px solid rgba(245,230,200,0.05)',
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = '#C9A84C'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'rgba(245,230,200,0.05)'
              }}>
                 <div style={{ fontSize: '48px', marginBottom: '16px' }}>{f.icon}</div>
                 <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '24px', marginBottom: '12px' }}>{f.t}</h3>
                 <p style={{ color: 'rgba(245,230,200,0.7)', fontSize: '15px', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>{f.d}</p>
              </div>
            ))}
         </div>
      </section>

      {/* ── FAQ ACCORDION ── */}
      <section style={{ padding: '80px 5%', background: '#150800' }}>
         <p style={{ color: '#C9A84C', letterSpacing: '3px', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>Details</p>
         <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(32px, 5vw, 42px)', textAlign: 'center', marginBottom: '48px' }}>Common Questions</h2>
         <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {[
             { q: 'Do you take walk-ins?', a: 'Yes, absolutely. Walk-ins are seated based on availability, but we recommend booking ahead on weekends.' },
             { q: 'Is there a reservation fee?', a: 'No, reservations are completely free. We just ask that you arrive on time.' },
             { q: 'Can I modify my booking?', a: 'Yes. Simply send us a WhatsApp message at least 2 hours prior to your slot and we will adjust your time.' },
             { q: 'What about large groups?', a: 'For groups of 10 or more, please call us directly so we can prepare a special table arrangement.' },
             { q: 'Is parking available?', a: 'Yes, we provide free basement parking with dedicated valet service.' }
           ].map((faq, i) => (
             <div key={i} style={{ background: '#2C1500', borderRadius: '8px', border: '1px solid rgba(245,230,200,0.05)', transition: 'all 0.3s' }}>
                <button 
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  style={{ 
                    width: '100%', padding: '24px', background: 'transparent', border: 'none', 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#F5E6C8', 
                    fontSize: '16px', fontWeight: 'bold' 
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#C9A84C'}
                  onMouseLeave={e => e.currentTarget.style.color = '#F5E6C8'}
                >
                  <span style={{ textAlign: 'left', paddingRight: '16px' }}>{faq.q}</span>
                  <span style={{ color: '#C9A84C', transform: openIndex === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', fontSize: '14px' }}>▼</span>
                </button>
                {openIndex === i && (
                  <div style={{ padding: '0 24px 24px', color: 'rgba(245,230,200,0.8)', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>
                    {faq.a}
                  </div>
                )}
             </div>
           ))}
         </div>
      </section>

    </main>
  )
}
