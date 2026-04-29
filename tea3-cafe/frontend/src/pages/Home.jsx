import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

// ALL IMAGE URLS — Unsplash free images
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
  espresso: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80',
  latte: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&q=80',
  croissant: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
  chocolateTart: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
  aboutBeans: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80',
  gallery1: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
  gallery2: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
  gallery3: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&q=80',
  gallery4: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
  gallery5: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80',
  gallery6: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
}

const popularItems = [
  { id:1, name:'Signature Espresso', price:180, 
    description:'Bold, rich single-origin shot with notes of dark cocoa and stone fruit.',
    image: IMAGES.espresso, category:'Coffee' },
  { id:2, name:'Hazelnut Latte', price:220,
    description:'Velvety steamed milk over espresso with cold-pressed hazelnut syrup.',
    image: IMAGES.latte, category:'Coffee' },
  { id:3, name:'Truffle Croissant', price:240,
    description:'Hand-laminated puff pastry filled with black truffle cream cheese.',
    image: IMAGES.croissant, category:'Snacks' },
  { id:4, name:'Dark Choco Tart', price:290,
    description:'72% Valrhona ganache set in a burnt butter pastry shell.',
    image: IMAGES.chocolateTart, category:'Desserts' },
]

const defaultOffers = [
  { id:1, title:'Happy Hours', 
    description:'Enjoy 20% off all tea-based drinks and pastries every afternoon. A ritual worth planning your day around.',
    discount:20, validTill:'Valid 3:00 PM – 5:00 PM Daily', icon:'☀️', tag:'SPECIAL' },
  { id:2, title:'Live Music Fridays',
    description:'Every Friday evening, experience live acoustic sets with our exclusive after-dark menu.',
    discount:0, validTill:'Every Friday, 7:00 PM – 10:00 PM', icon:'🎵', tag:'WEEKEND' },
  { id:3, title:'Tea3 Members',
    description:'Join our loyalty programme. Your 10th visit earns a Tea Sommelier experience crafted just for you.',
    discount:0, validTill:'Ongoing — Ask at the Counter', icon:'👑', tag:'LOYALTY' },
]

const defaultReviews = [
  { id:1, name:'Ananya Krishnan', title:'Food Writer, Hyderabad', rating:5,
    comment:'From the truffle croissant to the signature chai, every single thing I ordered made me close my eyes. This is what luxury actually means.',
    avatar:'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { id:2, name:'Vikram Joshi', title:'Entrepreneur, Bangalore', rating:5,
    comment:'I brought a client here on a whim and it became the best business meeting I\'ve ever had. The ambience alone closes deals. Tea3 is my new office.',
    avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { id:3, name:'Priya Nair', title:'Travel Blogger, Kochi', rating:5,
    comment:'I\'ve been to cafés across Tokyo and Milan. Tea3 sits comfortably alongside them. The dark chocolate tart is, without exaggeration, world-class.',
    avatar:'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
]

export default function Home() {
  const { addToCart } = useCart()
  const [offers, setOffers] = useState(defaultOffers)
  const [reviews, setReviews] = useState(defaultReviews)
  const [menuItems, setMenuItems] = useState(popularItems)
  const [currentReview, setCurrentReview] = useState(0)

  useEffect(() => {
    const savedOffers = JSON.parse(localStorage.getItem('tea3_offers') || '[]')
    const savedReviews = JSON.parse(localStorage.getItem('tea3_reviews') || '[]')
    const savedMenu = JSON.parse(localStorage.getItem('tea3_menu') || '[]')
    if(savedOffers.filter(o=>o.active).length > 0) 
      setOffers(savedOffers.filter(o=>o.active))
    if(savedReviews.filter(r=>r.approved).length > 0) 
      setReviews(savedReviews.filter(r=>r.approved))
    if(savedMenu.filter(i=>i.is_popular).length > 0) 
      setMenuItems(savedMenu.filter(i=>i.is_popular).map(m => {
        if(!m.image) m.image = popularItems.find(p=>p.name===m.name)?.image || IMAGES.espresso
        return m
      }))
  }, [])

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReview(prev => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [reviews.length])

  return (
    <main style={{ background:'#1C0A00' }}>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 5%',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${IMAGES.hero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.35)',
        }} />
        {/* Gold top bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)',
        }} />
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ 
            color:'#C9A84C', letterSpacing:'6px', fontSize:'13px',
            textTransform:'uppercase', marginBottom:'24px',
            fontFamily:'DM Sans, sans-serif',
          }}>
            HYDERABAD'S FINEST — EST. 2024
          </p>
          <h1 style={{
            fontFamily:'Playfair Display, serif',
            fontSize:'clamp(48px, 8vw, 96px)',
            color:'#F5E6C8', lineHeight:1.1,
            maxWidth:'900px', marginBottom:'28px',
            fontWeight:700,
          }}>
            Where Every Sip<br/>Tells a Story
          </h1>
          <p style={{
            color:'#F5E6C8', opacity:0.8, fontSize:'18px',
            maxWidth:'500px', marginBottom:'48px',
            fontFamily:'DM Sans, sans-serif', margin:'0 auto 48px',
          }}>
            Handcrafted teas. Soulful bites. Timeless moments.
          </p>
          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center' }}>
            <Link to="/menu" style={{
              background:'transparent',
              border:'2px solid #C9A84C',
              color:'#F5E6C8',
              padding:'16px 40px', borderRadius:'4px',
              fontWeight:600, fontSize:'14px',
              fontFamily:'DM Sans, sans-serif',
              letterSpacing:'2px', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:'8px',
            }}>🍽️ EXPLORE MENU</Link>
            <Link to="/booking" style={{
              background:'#C9A84C', color:'#1C0A00',
              padding:'16px 40px', borderRadius:'4px',
              fontWeight:700, fontSize:'14px',
              fontFamily:'DM Sans, sans-serif',
              letterSpacing:'2px', textTransform:'uppercase',
              display:'flex', alignItems:'center', gap:'8px',
            }}>📅 BOOK A TABLE</Link>
          </div>
        </div>
        {/* Scroll indicator */}
        <div style={{
          position:'absolute', bottom:'40px', left:'50%',
          transform:'translateX(-50%)', textAlign:'center',
          animation:'bounce 2s infinite',
        }}>
          <p style={{ color:'#C9A84C', fontSize:'11px', letterSpacing:'3px', marginBottom:'8px' }}>SCROLL</p>
          <div style={{ color:'#C9A84C', fontSize:'20px' }}>∨</div>
        </div>
        <style>{`@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-10px)}}`}</style>
      </section>

      {/* ══════════ MARQUEE ══════════ */}
      <div style={{
        background:'#150800', padding:'18px 0', overflow:'hidden',
        borderTop:'1px solid rgba(201,168,76,0.4)',
        borderBottom:'1px solid rgba(201,168,76,0.4)',
      }}>
        <div style={{ display:'flex', animation:'marqueeScroll 30s linear infinite', width:'max-content' }}>
          {[1,2,3,4].map(i=>(
            <span key={i} style={{
              color:'#C9A84C', fontSize:'13px', letterSpacing:'3px',
              marginRight:'80px', whiteSpace:'nowrap', fontFamily:'DM Sans',
            }}>
              Artisanal Cold Brew &nbsp;•&nbsp; Fresh Baked Daily &nbsp;•&nbsp;
              Live Music Fridays &nbsp;•&nbsp; Open 8AM–10PM &nbsp;•&nbsp;
              Hyderabad's Finest &nbsp;•&nbsp; Reserve Your Table Today &nbsp;•&nbsp;
            </span>
          ))}
        </div>
        <style>{`@keyframes marqueeScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </div>

      {/* ══════════ POPULAR ITEMS ══════════ */}
      <section style={{ background:'#1C0A00', padding:'100px 5%' }}>
        <div style={{ textAlign:'center', marginBottom:'16px' }}>
          <p style={{ color:'#C9A84C', letterSpacing:'4px', fontSize:'12px',
                      textTransform:'uppercase', marginBottom:'16px' }}>Featured</p>
          <h2 style={{
            fontFamily:'Playfair Display, serif',
            fontSize:'clamp(36px, 5vw, 56px)',
            color:'#F5E6C8', marginBottom:'16px',
          }}>Crafted to Perfection</h2>
          <p style={{ color:'#F5E6C8', opacity:0.55, maxWidth:'600px', margin:'0 auto 60px',
                      lineHeight:1.7 }}>
            Four icons of the Tea3 experience — each made with obsessive precision and seasonal ingredients.
          </p>
        </div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
          gap:'28px', maxWidth:'1200px', margin:'0 auto',
        }}>
          {menuItems.map(item => (
            <div key={item.id}
              style={{
                background:'#2C1500', borderRadius:'8px',
                overflow:'hidden', transition:'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                border:'1px solid rgba(201,168,76,0.1)',
                cursor:'pointer',
              }}
              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-12px)'
                e.currentTarget.style.boxShadow='0 30px 80px rgba(0,0,0,0.5)'
                e.currentTarget.style.borderColor='rgba(201,168,76,0.4)'
              }}
              onMouseLeave={e=>{
                e.currentTarget.style.transform='translateY(0)'
                e.currentTarget.style.boxShadow='none'
                e.currentTarget.style.borderColor='rgba(201,168,76,0.1)'
              }}
            >
              {/* Image */}
              <div style={{ height:'220px', overflow:'hidden', position:'relative' }}>
                <img src={item.image} alt={item.name} loading="lazy" onError={e=>e.target.src=IMAGES.hero}
                  style={{ width:'100%', height:'100%', objectFit:'cover',
                           transition:'transform 0.6s ease' }}
                  onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
                  onMouseLeave={e=>e.target.style.transform='scale(1)'}
                />
                <div style={{
                  position:'absolute', top:'12px', left:'12px',
                  background:'rgba(201,168,76,0.9)', color:'#1C0A00',
                  padding:'4px 12px', borderRadius:'3px',
                  fontSize:'11px', fontWeight:700, letterSpacing:'1px',
                }}>{item.category}</div>
              </div>
              {/* Content */}
              <div style={{ padding:'24px' }}>
                <h3 style={{
                  fontFamily:'Playfair Display, serif',
                  color:'#F5E6C8', fontSize:'22px', marginBottom:'10px',
                }}>{item.name}</h3>
                <p style={{
                  color:'#F5E6C8', opacity:0.6, fontSize:'14px',
                  lineHeight:1.6, marginBottom:'20px',
                }}>{item.description}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#C9A84C', fontWeight:700, fontSize:'24px',
                                 fontFamily:'Playfair Display, serif' }}>
                    ₹ {item.price}
                  </span>
                  <button onClick={() => addToCart(item)} style={{
                    border:'1.5px solid #C9A84C', color:'#C9A84C',
                    background:'transparent', padding:'8px 20px',
                    borderRadius:'3px', cursor:'pointer', fontSize:'13px',
                    fontWeight:600, letterSpacing:'1px', transition:'all 0.3s',
                    fontFamily:'DM Sans, sans-serif',
                  }}
                  onMouseEnter={e=>{e.target.style.background='#C9A84C';e.target.style.color='#1C0A00'}}
                  onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color='#C9A84C'}}
                  >+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:'60px' }}>
          <Link to="/menu" style={{
            border:'2px solid #C9A84C', color:'#C9A84C',
            padding:'16px 48px', borderRadius:'4px',
            fontWeight:600, letterSpacing:'2px', fontSize:'13px',
            textTransform:'uppercase', display:'inline-block',
            transition:'all 0.3s', fontFamily:'DM Sans',
          }}
          onMouseEnter={e=>{e.target.style.background='#C9A84C';e.target.style.color='#1C0A00'}}
          onMouseLeave={e=>{e.target.style.background='transparent';e.target.style.color='#C9A84C'}}
          >VIEW FULL MENU →</Link>
        </div>
      </section>

      {/* ══════════ ABOUT TEASER ══════════ */}
      <section style={{
        background:'#150800', padding:'100px 5%',
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
        gap:'80px', alignItems:'center',
        maxWidth:'1300px', margin:'0 auto',
      }}>
        <div style={{ borderRadius:'8px', overflow:'hidden', lineHeight:0 }}>
          <img src={IMAGES.aboutBeans} alt="Coffee beans" loading="lazy" onError={e=>e.target.src=IMAGES.hero}
            style={{ width:'100%', height:'500px', objectFit:'cover', borderRadius:'8px' }} />
        </div>
        <div>
          <p style={{ color:'#C9A84C', letterSpacing:'4px', fontSize:'12px',
                      textTransform:'uppercase', marginBottom:'20px' }}>OUR PHILOSOPHY</p>
          <h2 style={{
            fontFamily:'Playfair Display, serif',
            fontSize:'clamp(32px, 4vw, 52px)', color:'#C9A84C',
            lineHeight:1.2, marginBottom:'28px',
          }}>Born from a Love of Tea</h2>
          <p style={{ color:'#F5E6C8', opacity:0.75, lineHeight:1.9,
                      marginBottom:'20px', fontSize:'16px' }}>
            What began as a single-person obsession with the perfect brew has grown into 
            Hyderabad's most celebrated tea destination. We source exclusively from small-batch, 
            high-altitude gardens where farmers are paid a living wage.
          </p>
          <p style={{ color:'#F5E6C8', opacity:0.75, lineHeight:1.9,
                      marginBottom:'40px', fontSize:'16px' }}>
            Every cup is a direct expression of that chain of care. Come taste the difference.
          </p>
          {/* Stats */}
          <div style={{ display:'flex', gap:'40px', marginBottom:'40px', flexWrap:'wrap' }}>
            {[['500+','HAPPY GUESTS\nWEEKLY'],['12','SIGNATURE\nDRINKS'],
              ['2024','YEAR\nESTABLISHED'],['100%','FRESH\nDAILY']].map(([num,label])=>(
              <div key={label} style={{ textAlign:'center' }}>
                <div style={{ color:'#C9A84C', fontSize:'36px', fontWeight:700,
                              fontFamily:'Playfair Display, serif' }}>{num}</div>
                <div style={{ color:'#F5E6C8', opacity:0.5, fontSize:'11px',
                              letterSpacing:'2px', marginTop:'4px',
                              whiteSpace:'pre-line', lineHeight:1.4 }}>{label}</div>
              </div>
            ))}
          </div>
          <Link to="/about" style={{
            background:'#C9A84C', color:'#1C0A00',
            padding:'16px 40px', borderRadius:'4px',
            fontWeight:700, letterSpacing:'2px', fontSize:'13px',
            textTransform:'uppercase', display:'inline-block',
          }}>OUR FULL STORY →</Link>
        </div>
      </section>

      {/* ══════════ OFFERS ══════════ */}
      <section style={{ background:'#1C0A00', padding:'100px 5%' }}>
        <div style={{ textAlign:'center', marginBottom:'64px' }}>
          <p style={{ color:'#C9A84C', letterSpacing:'4px', fontSize:'12px',
                      textTransform:'uppercase', marginBottom:'16px' }}>LIMITED TIME</p>
          <h2 style={{ fontFamily:'Playfair Display, serif',
                       fontSize:'clamp(36px, 5vw, 56px)', color:'#F5E6C8',
                       marginBottom:'16px' }}>Today's Specials</h2>
          <p style={{ color:'#F5E6C8', opacity:0.5, maxWidth:'500px', margin:'0 auto' }}>
            Curated offers as exclusive as the teas we brew. Available while they last.
          </p>
        </div>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
          gap:'28px', maxWidth:'1100px', margin:'0 auto',
        }}>
          {offers.map(offer=>(
            <div key={offer.id} style={{
              background:'#2C1500', borderRadius:'8px', padding:'40px',
              border:'1px solid rgba(201,168,76,0.15)',
              position:'relative', overflow:'hidden',
              transition:'all 0.3s',
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(201,168,76,0.5)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(201,168,76,0.15)'}}
            >
              {/* Corner ribbon */}
              <div style={{
                position:'absolute', top:'20px', right:'-12px',
                background:'#C9A84C', color:'#1C0A00',
                padding:'4px 28px 4px 16px',
                fontSize:'10px', fontWeight:800, letterSpacing:'2px',
                clipPath:'polygon(0 0, 100% 0, 100% 100%, 10% 100%)',
              }}>{offer.tag || 'OFFER'}</div>
              <div style={{ fontSize:'40px', marginBottom:'20px' }}>{offer.icon}</div>
              <h3 style={{
                fontFamily:'Playfair Display, serif',
                color:'#F5E6C8', fontSize:'26px', marginBottom:'12px',
              }}>{offer.title}</h3>
              <p style={{ color:'#F5E6C8', opacity:0.65, lineHeight:1.7,
                          marginBottom:'20px', fontSize:'15px' }}>
                {offer.description}
              </p>
              <p style={{ color:'#C9A84C', fontSize:'13px',
                          letterSpacing:'1px', fontWeight:600 }}>
                ⏰ {offer.validTill}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section style={{ background:'#150800', padding:'100px 5%' }}>
        <div style={{ textAlign:'center', marginBottom:'64px' }}>
          <p style={{ color:'#C9A84C', letterSpacing:'4px', fontSize:'12px',
                      textTransform:'uppercase', marginBottom:'16px' }}>GUEST VOICES</p>
          <h2 style={{ fontFamily:'Playfair Display, serif',
                       fontSize:'clamp(36px, 5vw, 56px)', color:'#F5E6C8',
                       marginBottom:'16px' }}>What Our Guests Say</h2>
          <p style={{ color:'#F5E6C8', opacity:0.5, maxWidth:'500px', margin:'0 auto' }}>
            Authentic stories from the people who make Tea3 what it is.
          </p>
        </div>
        {/* Carousel */}
        <div style={{ maxWidth:'1100px', margin:'0 auto', position:'relative' }}>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',
            gap:'24px',
          }}>
            {reviews.map((r, i)=>(
              <div key={r.id} style={{
                background:'#FAF7F0', borderRadius:'8px', padding:'40px',
                transition:'all 0.3s',
                opacity: reviews.length > 1 && i !== currentReview && window.innerWidth < 768 ? 0 : 1,
              }}>
                <div style={{ color:'#C9A84C', fontSize:'22px', marginBottom:'20px',
                              letterSpacing:'2px' }}>★★★★★</div>
                <p style={{
                  color:'#2C2C2C', fontSize:'16px', lineHeight:1.8,
                  fontStyle:'italic', marginBottom:'28px',
                  fontFamily:'Playfair Display, serif',
                }}>"{r.comment}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                  <img src={r.avatar} alt={r.name} loading="lazy" onError={e=>e.target.src=IMAGES.aboutBeans}
                    style={{ width:'52px', height:'52px', borderRadius:'50%',
                             objectFit:'cover', border:'2px solid #C9A84C' }} />
                  <div>
                    <p style={{ color:'#1C0A00', fontWeight:700, fontSize:'16px' }}>{r.name}</p>
                    <p style={{ color:'#666', fontSize:'13px' }}>{r.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'32px' }}>
            {reviews.map((_, i)=>(
              <button key={i}
                onClick={()=>setCurrentReview(i)}
                style={{
                  width: i===currentReview ? '32px' : '10px',
                  height:'10px',
                  borderRadius:'5px',
                  background: i===currentReview ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                  border:'none', cursor:'pointer', transition:'all 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ GALLERY TEASER ══════════ */}
      <section style={{ background:'#1C0A00', padding:'100px 5%', textAlign:'center' }}>
        <p style={{ color:'#C9A84C', letterSpacing:'4px', fontSize:'12px',
                    textTransform:'uppercase', marginBottom:'16px' }}>@TEA3CAFE</p>
        <h2 style={{ fontFamily:'Playfair Display, serif',
                     fontSize:'clamp(36px, 5vw, 56px)', color:'#F5E6C8',
                     marginBottom:'16px' }}>A Feast for the Eyes</h2>
        <p style={{ color:'#F5E6C8', opacity:0.5, maxWidth:'500px',
                    margin:'0 auto 60px' }}>
          Follow us for daily captures of our craft, our space, and our people.
        </p>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, 1fr)',
          gap:'16px', maxWidth:'1000px', margin:'0 auto 60px',
        }}>
          {[IMAGES.gallery1,IMAGES.gallery2,IMAGES.gallery3,
            IMAGES.gallery4,IMAGES.gallery5,IMAGES.gallery6].map((src,i)=>(
            <div key={i} style={{
              height: i%2===0 ? '260px' : '220px',
              borderRadius:'8px', overflow:'hidden',
              position:'relative', cursor:'pointer',
            }}
            onMouseEnter={e=>{
              e.currentTarget.querySelector('img').style.transform='scale(1.1)'
              e.currentTarget.querySelector('.overlay').style.opacity='1'
            }}
            onMouseLeave={e=>{
              e.currentTarget.querySelector('img').style.transform='scale(1)'
              e.currentTarget.querySelector('.overlay').style.opacity='0'
            }}
            >
              <img src={src} alt={`Gallery ${i+1}`} loading="lazy" onError={e=>e.target.src=IMAGES.hero}
                style={{ width:'100%', height:'100%', objectFit:'cover',
                         transition:'transform 0.5s ease' }} />
              <div className="overlay" style={{
                position:'absolute', inset:0,
                background:'rgba(28,10,0,0.6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                opacity:0, transition:'opacity 0.3s',
              }}>
                <span style={{ color:'#C9A84C', fontSize:'28px' }}>🔍</span>
              </div>
            </div>
          ))}
        </div>
        <Link to="/gallery" style={{
          border:'2px solid #C9A84C', color:'#C9A84C',
          padding:'16px 48px', borderRadius:'4px',
          fontWeight:600, letterSpacing:'2px', fontSize:'13px',
          textTransform:'uppercase', display:'inline-block',
          transition:'all 0.3s',
        }}>VIEW FULL GALLERY →</Link>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section style={{
        background:'linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)',
        padding:'100px 5%', textAlign:'center',
      }}>
        <p style={{ color:'rgba(28,10,0,0.6)', letterSpacing:'4px', fontSize:'12px',
                    textTransform:'uppercase', marginBottom:'20px' }}>READY?</p>
        <h2 style={{
          fontFamily:'Playfair Display, serif',
          fontSize:'clamp(32px, 5vw, 56px)',
          color:'#1C0A00', marginBottom:'20px', lineHeight:1.2,
        }}>
          Ready for an Unforgettable<br/>Experience?
        </h2>
        <p style={{ color:'#1C0A00', opacity:0.7, fontSize:'18px',
                    marginBottom:'40px', maxWidth:'500px', margin:'0 auto 40px' }}>
          Reserve your table today — we can't wait to welcome you.
        </p>
        <Link to="/booking" style={{
          background:'#1C0A00', color:'#C9A84C',
          padding:'18px 56px', borderRadius:'4px',
          fontWeight:700, fontSize:'14px', letterSpacing:'3px',
          textTransform:'uppercase', display:'inline-block',
          transition:'all 0.3s',
        }}>RESERVE YOUR TABLE</Link>
      </section>

    </main>
  )
}
