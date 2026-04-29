import { useState, useEffect } from 'react'
import AOS from 'aos'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'

const menuImages = {
  masalaChai: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
  matchaLatte: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=400&q=80',
  earlGrey: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&q=80',
  espresso: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
  latte: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80',
  coldBrew: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  avocadoToast: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400&q=80',
  bruschetta: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
  chocolateTart: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
  tiramisu: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
  cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80',
  default: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
}

const defaultMenuInfo = [
  { id:1, name:'Masala Chai', category:'tea', price:120, description:'Spiced Indian tea, made fresh daily with whole spices', image:menuImages.masalaChai },
  { id:2, name:'Matcha Latte', category:'tea', price:210, description:'Ceremonial grade matcha with creamy oat milk', image:menuImages.matchaLatte },
  { id:3, name:'Earl Grey', category:'tea', price:150, description:'Bergamot-infused premium black tea', image:menuImages.earlGrey },
  { id:6, name:'Signature Espresso', category:'coffee', price:180, description:'Bold, rich single-origin shot', image:menuImages.espresso },
  { id:7, name:'Hazelnut Latte', category:'coffee', price:220, description:'Creamy latte with roasted hazelnut syrup', image:menuImages.latte },
  { id:8, name:'Cold Brew', category:'coffee', price:200, description:'18-hour steeped, smooth and strong', image:menuImages.coldBrew },
  { id:11, name:'Truffle Croissant', category:'snacks', price:240, description:'Buttery croissant with black truffle butter', image:menuImages.croissant },
  { id:12, name:'Avocado Toast', category:'snacks', price:280, description:'Sourdough, smashed avo, chili flakes', image:menuImages.avocadoToast },
  { id:13, name:'Tomato Bruschetta', category:'snacks', price:180, description:'Toasted sourdough, fresh tomatoes, basil', image:menuImages.bruschetta },
  { id:16, name:'Dark Choco Tart', category:'desserts', price:290, description:'70% dark chocolate ganache tart', image:menuImages.chocolateTart },
  { id:17, name:'Tiramisu', category:'desserts', price:310, description:'Classic Italian, espresso-soaked layers', image:menuImages.tiramisu },
  { id:18, name:'Basque Cheesecake', category:'desserts', price:320, description:'Burnt Basque cheesecake with a gooey center', image:menuImages.cheesecake },
  { id:21, name:'Rose Cardamom Latte', category:'specials', price:260, description:'Floral, spiced, instagram-worthy', image:menuImages.latte },
  { id:22, name:'Saffron Cold Brew', category:'specials', price:280, description:'Kesar-infused cold brew, unique & bold', image:menuImages.coldBrew }
]

export default function Menu() {
  const { addToCart } = useCart()
  const [menuItems, setMenuItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('All Items')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    AOS.init()
    window.scrollTo(0, 0)
    
    const savedMenu = JSON.parse(localStorage.getItem('tea3_menu') || '[]')
    if (savedMenu.length > 0) {
      // we attach the default images to saved items if they don't have them
      const itemsWithImg = savedMenu.map(m => {
        if(!m.image) m.image = defaultMenuInfo.find(d => d.name === m.name)?.image || menuImages.default
        return m
      })
      setMenuItems(itemsWithImg)
    } else {
      setMenuItems(defaultMenuInfo)
    }
  }, [])

  const categories = ['All Items', 'Artisanal Teas', 'Signature Coffee', 'Savory Snacks', 'Sweet Desserts', 'House Specials']
  const catMap = { 'Artisanal Teas': 'tea', 'Signature Coffee': 'coffee', 'Savory Snacks': 'snacks', 'Sweet Desserts': 'desserts', 'House Specials': 'specials' }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = selectedCategory === 'All Items' || item.category.toLowerCase() === catMap[selectedCategory].toLowerCase()
    return matchesSearch && matchesCat
  })

  return (
    <main style={{ background: '#1C0A00', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* ── HERO ── */}
      <section style={{ 
        height: '40vh', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        textAlign: 'center', borderBottom: '1px solid rgba(201,168,76,0.2)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${menuImages.default}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.3)'
        }} />
        <div style={{ position: 'relative', zIndex: 2, padding: '0 5%' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px' }}>Our Menu</h1>
          <p style={{ color: '#F5E6C8', opacity: 0.8, fontSize: '18px', fontFamily: 'DM Sans, sans-serif' }}>Every item crafted with exquisite intention</p>
        </div>
      </section>

      {/* ── SEARCH + FILTER BAR ── */}
      <div style={{ position: 'sticky', top: '70px', zIndex: 10, background: '#1C0A00', padding: '24px 5%', borderBottom: '1px solid rgba(245,230,200,0.1)' }}>
        <input 
          type="text" 
          placeholder="Search menu items..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '600px', display: 'block', margin: '0 auto 24px', padding: '14px 24px', background: '#2C1500', border: '1px solid #C9A84C', borderRadius: '50px', color: '#F5E6C8', outline: 'none', fontFamily: 'DM Sans', fontSize: '16px' }}
        />
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
                fontFamily: 'DM Sans',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── MENU GRID ── */}
      <section style={{ padding: '80px 5%' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#F5E6C8' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>☕</div>
            <h3 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', fontSize: '24px' }}>No items found matching your search.</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px', maxWidth: '1200px', margin: '0 auto' }}>
            {filteredItems.map((item, i) => (
              <div 
                key={item.id} 
                style={{ 
                  background: '#2C1500', borderRadius: '8px', overflow: 'hidden', 
                  border: '1px solid rgba(245,230,200,0.1)', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  cursor: 'pointer' 
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-12px)'
                  e.currentTarget.style.boxShadow = '0 30px 80px rgba(0,0,0,0.5)'
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'
                  e.currentTarget.querySelector('img').style.transform = 'scale(1.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'rgba(245,230,200,0.1)'
                  e.currentTarget.querySelector('img').style.transform = 'scale(1)'
                }}
              >
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img src={item.image} alt={item.name} loading="lazy" onError={(e) => e.target.src = menuImages.default}
                       style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                  <div style={{ 
                    position: 'absolute', top: '12px', left: '12px', 
                    background: 'rgba(201,168,76,0.9)', color: '#1C0A00', 
                    padding: '4px 12px', borderRadius: '3px', fontSize: '11px', 
                    fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' 
                  }}>
                    {item.category}
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#F5E6C8', fontSize: '22px', marginBottom: '8px' }}>{item.name}</h3>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(245,230,200,0.7)', fontSize: '14px', marginBottom: '24px', minHeight: '40px', lineHeight: 1.5 }}>{item.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#C9A84C', fontWeight: 'bold', fontSize: '24px', fontFamily: 'Playfair Display, serif' }}>₹{item.price}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(item); toast.success(`${item.name} added to cart!`) }} 
                      style={{ 
                        padding: '8px 20px', border: '1.5px solid #C9A84C', background: 'transparent', 
                        color: '#C9A84C', borderRadius: '3px', cursor: 'pointer', transition: 'all 0.3s', 
                        fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px'
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
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  )
}
