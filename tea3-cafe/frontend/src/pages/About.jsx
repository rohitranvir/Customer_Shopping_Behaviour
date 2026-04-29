import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'

const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1920&q=80',
  story: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  owner: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  beans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
}

export default function About() {
  useEffect(() => {
    AOS.init()
    window.scrollTo(0, 0)
  }, [])

  return (
    <main style={{ minHeight: '100vh', background: '#1C0A00' }}>
      
      {/* ══════════ SECTION 1 — CINEMATIC HERO ══════════ */}
      <section style={{ 
        height: '60vh', position: 'relative', display: 'flex', 
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        textAlign: 'center', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${IMAGES.hero})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(48px, 8vw, 80px)', marginBottom: '16px' }}>Our Story</h1>
          <p style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>From a single cup to a community</p>
        </div>
      </section>

      {/* ══════════ SECTION 2 — STORY ══════════ */}
      <section style={{ padding: '100px 5%', background: '#1C0A00' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          
          <div data-aos="fade-right" style={{ borderRadius: '8px', overflow: 'hidden' }}>
            <img src={IMAGES.story} alt="About Tea3 Story" loading="lazy" onError={(e) => e.target.src = IMAGES.beans}
                 style={{ width: '100%', height: '550px', objectFit: 'cover', borderRadius: '8px' }} />
          </div>

          <div data-aos="fade-left">
            <p style={{ color: '#C9A84C', fontVariant: 'small-caps', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '8px' }}>OUR PHILOSOPHY</p>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(32px, 4vw, 42px)', marginBottom: '24px' }}>Born from a Love of Tea</h2>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#F5E6C8', opacity: 0.8, marginBottom: '24px', lineHeight: 1.8, fontSize: '16px' }}>
              What began as a single-person obsession with the perfect brew has grown into Hyderabad's most celebrated tea destination. We source exclusively from small-batch, high-altitude gardens where farmers are paid a living wage.
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#F5E6C8', opacity: 0.8, marginBottom: '24px', lineHeight: 1.8, fontSize: '16px' }}>
              Every cup is a direct expression of that chain of care. Our master blenders take time to craft unique combinations that challenge traditional recipes while respecting their absolute foundations.
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', color: '#F5E6C8', opacity: 0.8, lineHeight: 1.8, fontSize: '16px' }}>
              Today, Tea3 is more than a café. We are a gathering place for creators, dreamers, and tea lovers in the heart of Banjara Hills. Come taste the difference.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════ SECTION 3 — GOLD STATS BAR ══════════ */}
      <section style={{ background: '#C9A84C', padding: '64px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: '32px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
           {[
             { num: '500+', label: 'Happy Guests' },
             { num: '12', label: 'Signature Blends' },
             { num: '2024', label: 'Established' },
             { num: '100%', label: 'Fresh Ingredients' }
           ].map((stat, i) => (
             <div key={i} data-aos="zoom-in" data-aos-delay={i*100}>
               <div style={{ fontSize: '56px', fontWeight: 'bold', color: '#1C0A00', fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>{stat.num}</div>
               <div style={{ color: '#2C1500', fontWeight: '700', fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', marginTop: '12px' }}>{stat.label}</div>
             </div>
           ))}
        </div>
      </section>

      {/* ══════════ SECTION 4 — WHAT MAKES US UNIQUE ══════════ */}
      <section style={{ padding: '100px 5%', background: '#150800' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(36px, 5vw, 42px)' }}>Why Tea3?</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: '🍵', title: 'Single Origin Teas', desc: 'Ethically sourced from India\'s finest gardens, supporting sustainable agriculture.' },
            { icon: '👨‍🍳', title: 'Expert Sommeliers', desc: 'Trained with years of craft experience to brew absolute perfection.' },
            { icon: '🏡', title: 'Cozy Ambience', desc: 'Designed for comfort, creativity, and calm — your second home.' },
            { icon: '🌱', title: 'Fresh Ingredients', desc: 'No preservatives. No artificial syrups. No shortcuts. Ever.' }
          ].map((feature, i) => (
            <div 
              key={i} data-aos="fade-up" data-aos-delay={i*100}
              style={{ 
                background: '#2C1500', padding: '48px 32px', borderRadius: '12px', 
                textAlign: 'center', borderTop: '3px solid transparent',
                transition: 'all 0.4s ease', cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderTopColor = '#C9A84C'
                e.currentTarget.style.transform = 'translateY(-10px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderTopColor = 'transparent'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ fontSize: '50px', marginBottom: '24px' }}>{feature.icon}</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '24px', marginBottom: '16px' }}>{feature.title}</h3>
              <p style={{ color: 'rgba(245,230,200,0.7)', lineHeight: 1.6, fontFamily: 'DM Sans, sans-serif' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ SECTION 5 — OWNER ══════════ */}
      <section style={{ padding: '100px 5%', background: '#1C0A00' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div data-aos="zoom-in" style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={IMAGES.owner} alt="Owner" loading="lazy" onError={(e) => e.target.src = IMAGES.beans}
                 style={{ width: '300px', height: '300px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #C9A84C', padding: '6px' }} />
          </div>

          <div data-aos="fade-up">
            <span style={{ color: '#C9A84C', fontVariant: 'small-caps', letterSpacing: '2px', fontWeight: 'bold' }}>Our Founder</span>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '42px', marginBottom: '16px', marginTop: '8px' }}>Vikram Rao</h2>
            <p style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', color: '#C9A84C', fontSize: '22px', marginBottom: '24px' }}>
              "I didn't open a café. I opened a feeling."
            </p>
            <p style={{ color: 'rgba(245,230,200,0.8)', lineHeight: 1.8, fontFamily: 'DM Sans, sans-serif', fontSize: '16px' }}>
              With 15 years traveling across the globe exploring the deepest pockets of tea agriculture, Vikram founded Tea3 to bring world-class tea culture back to Hyderabad. His vision was to create a sanctuary where the art of brewing meets the warmth of modern hospitality. Every detail, from the acoustics to the ceramics, has his signature touch.
            </p>
          </div>

        </div>
      </section>

      {/* ══════════ SECTION 6 — TEAM VALUES ══════════ */}
      <section style={{ padding: '100px 5%', background: '#150800' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '36px', textAlign: 'center', marginBottom: '48px' }}>What We Stand For</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { icon: '⭐', t: 'Quality First', d: 'We never compromise on our core ingredients.' },
            { icon: '🤝', t: 'Community Always', d: 'Tea3 is an inclusive space for everyone, always.' },
            { icon: '🌿', t: 'Sustainability', d: 'Eco-friendly packaging and totally ethical sourcing.' }
          ].map((v, i) => (
             <div key={i} data-aos="fade-up" data-aos-delay={i*100} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#2C1500', padding: '40px', borderRadius: '12px' }}>
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{v.icon}</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C', fontSize: '24px', marginBottom: '12px' }}>{v.t}</h3>
                <p style={{ color: 'rgba(245,230,200,0.8)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6 }}>{v.d}</p>
             </div>
          ))}
        </div>
      </section>

      {/* ══════════ SECTION 7 — CTA ══════════ */}
      <section style={{ padding: '100px 5%', background: 'linear-gradient(135deg, #C9A84C, #8B6914)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1C0A00', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '32px', fontWeight: 'bold' }}>Come experience it yourself</h2>
        <Link to="/booking" style={{ 
          background: '#1C0A00', color: '#C9A84C', padding: '18px 56px', 
          borderRadius: '4px', fontWeight: 'bold', fontSize: '16px',
          fontFamily: 'DM Sans, sans-serif', display: 'inline-block',
          textTransform: 'uppercase', letterSpacing: '2px', transition: 'all 0.3s'
        }}
        onMouseEnter={e => { e.target.style.transform = 'translateY(-4px)'; e.target.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)' }}
        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none' }}
        >Book a Table</Link>
      </section>

    </main>
  )
}
