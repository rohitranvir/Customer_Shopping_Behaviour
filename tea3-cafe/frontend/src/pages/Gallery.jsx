import { useState, useEffect } from 'react'
import AOS from 'aos'

const galleryImages = [
  {id:1,category:'coffee',src:'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',title:'Signature Espresso'},
  {id:2,category:'ambience',src:'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',title:'The Space'},
  {id:3,category:'coffee',src:'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',title:'Morning Brew'},
  {id:4,category:'food',src:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',title:'Fresh Croissants'},
  {id:5,category:'ambience',src:'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80',title:'Cozy Corner'},
  {id:6,category:'food',src:'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',title:'Chocolate Tart'},
  {id:7,category:'coffee',src:'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',title:'Cold Brew'},
  {id:8,category:'ambience',src:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',title:'Evening Vibes'},
  {id:9,category:'food',src:'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',title:'Breakfast Spread'},
  {id:10,category:'events',src:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',title:'Live Music Night'},
  {id:11,category:'coffee',src:'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&q=80',title:'Hazelnut Latte'},
  {id:12,category:'events',src:'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80',title:'Tea Tasting'},
]

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxItem, setLightboxItem] = useState(null)
  const [columns, setColumns] = useState(3)

  useEffect(() => {
    AOS.init()
    window.scrollTo(0, 0)
    
    // Close lightbox on Escape key
    const handleEsc = (e) => {
      if(e.key === 'Escape') setLightboxItem(null)
    }
    window.addEventListener('keydown', handleEsc)

    // Responsive masonry columns
    const handleResize = () => {
      if(window.innerWidth < 650) setColumns(1)
      else if(window.innerWidth < 1000) setColumns(2)
      else setColumns(3)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleEsc)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const categories = ['All', 'Food', 'Coffee', 'Ambience', 'Events']
  
  const filteredItems = galleryImages.filter(item => 
    selectedCategory === 'All' ? true : item.category.toLowerCase() === selectedCategory.toLowerCase()
  )

  return (
    <main style={{ minHeight: '100vh', background: '#1C0A00' }}>
      
      {/* ── HERO ── */}
      <section style={{ 
        height: '40vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', 
        position: 'relative', textAlign: 'center',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1920&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px' }}>Gallery</h1>
          <p style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>A feast for the eyes</p>
        </div>
      </section>

      {/* ── FILTER TABS ── */}
      <div style={{ position: 'sticky', top: '70px', zIndex: 10, background: '#1C0A00', padding: '24px 5%', borderBottom: '1px solid rgba(245,230,200,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '10px 24px',
                borderRadius: '50px',
                cursor: 'pointer',
                border: '1px solid #C9A84C',
                background: selectedCategory === cat ? '#C9A84C' : 'transparent',
                color: selectedCategory === cat ? '#1C0A00' : '#F5E6C8',
                fontWeight: 'bold',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '13px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── MASONRY GRID ── */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ columnCount: columns, columnGap: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {filteredItems.map((item, i) => (
            <div 
              key={item.id} 
              onClick={() => setLightboxItem(item)}
              style={{ 
                marginBottom: '20px', 
                breakInside: 'avoid', 
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(245,230,200,0.05)',
                display: 'flex',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#C9A84C'
                e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'
                e.currentTarget.querySelector('.overlay').style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(245,230,200,0.05)'
                e.currentTarget.querySelector('img').style.transform = 'scale(1)'
                e.currentTarget.querySelector('.overlay').style.opacity = '0'
              }}
            >
              <img src={item.src} alt={item.title} loading="lazy" 
                   style={{ width: '100%', display: 'block', transition: 'transform 0.6s ease' }} />
              
              <div className="overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(28,10,0,0.6)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                opacity: 0, transition: 'opacity 0.3s ease'
              }}>
                <span style={{ color: '#C9A84C', fontSize: '32px', marginBottom: '8px' }}>🔍</span>
                <span style={{ color: '#F5E6C8', fontFamily: 'DM Sans, sans-serif', fontWeight: 'bold', letterSpacing: '1px' }}>{item.title}</span>
              </div>
            </div>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', color: '#F5E6C8', padding: '80px 0' }}>
             <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '24px' }}>No images found.</h3>
          </div>
        )}
      </section>

      {/* ── LIGHTBOX ── */}
      {lightboxItem && (
        <div 
          onClick={() => setLightboxItem(null)}
          style={{ 
            position: 'fixed', inset: 0, zIndex: 99999, 
            background: 'rgba(0,0,0,0.95)', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            padding: '2%', backdropFilter: 'blur(10px)'
          }}
        >
          <button 
            onClick={() => setLightboxItem(null)}
            style={{ 
              position: 'absolute', top: '30px', right: '40px', 
              background: 'transparent', border: 'none', color: '#F5E6C8', 
              fontSize: '40px', cursor: 'pointer', transition: 'all 0.3s',
              zIndex: 100000
            }}
            onMouseEnter={e => e.target.style.color = '#C9A84C'}
            onMouseLeave={e => e.target.style.color = '#F5E6C8'}
          >
            ✕
          </button>
          
          <div onClick={(e) => e.stopPropagation()} style={{ 
            position: 'relative', maxWidth: '90vw', maxHeight: '85vh',
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}>
            <img src={lightboxItem.src} alt={lightboxItem.title} 
                 style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '4px', border: '2px solid #C9A84C' }} />
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '28px', marginBottom: '4px' }}>{lightboxItem.title}</h2>
              <p style={{ color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '13px', fontWeight: 'bold' }}>{lightboxItem.category}</p>
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
