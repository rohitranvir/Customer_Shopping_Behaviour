import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('tea3_token')
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } }

  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenu, setMobileMenu] = useState(false)
  
  // Data States
  const [stats, setStats] = useState({ menu:0, bookingsTotal:0, bookingsPending:0, offers:0, reviewsPending:0, gallery:0 })
  const [menu, setMenu] = useState([])
  const [bookings, setBookings] = useState([])
  const [offers, setOffers] = useState([])
  const [reviews, setReviews] = useState([])
  const [gallery, setGallery] = useState([])

  // Dashboard Protection Hook
  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    fetchData()
  }, [token, navigate])

  const fetchData = async () => {
    try {
      const [mRes, bRes, oRes, rRes, gRes] = await Promise.all([
        API.get('/menu/'), API.get('/bookings/', authHeaders), API.get('/offers/'), API.get('/reviews/all/', authHeaders), API.get('/gallery/')
      ])
      setStats({
        menu: mRes.data.length,
        bookingsTotal: bRes.data.length,
        bookingsPending: bRes.data.filter(b => b.status === 'pending').length,
        offers: oRes.data.length,
        reviewsPending: rRes.data.filter(r => !r.is_approved).length,
        gallery: gRes.data.length
      })
      setMenu(mRes.data)
      setBookings(bRes.data)
      setOffers(oRes.data)
      setReviews(rRes.data)
      setGallery(gRes.data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to sync master database')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('tea3_token')
    navigate('/')
  }

  // --- CRUD HANDLERS ---
  const handleCreate = async (endpoint, payload, setState) => {
    try {
      const res = await API.post(endpoint, payload, authHeaders)
      setState(prev => [...prev, res.data])
      toast.success('Successfully created!')
      fetchData()
    } catch (err) { toast.error('Creation failed') }
  }

  const handleDelete = async (endpoint, id, setState) => {
    try {
      await API.delete(`${endpoint}${id}/delete/`, authHeaders)
      setState(prev => prev.filter(item => item.id !== id))
      toast.success('Item deleted')
      fetchData()
    } catch (err) { toast.error('Deletion failed') }
  }

  const updateBookingStatus = async (id, status) => {
    try {
      await API.patch(`/bookings/${id}/update/`, { status }, authHeaders)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
      toast.success('Status updated')
      fetchData()
    } catch { toast.error('Failed to update') }
  }

  const toggleReviewApproval = async (review) => {
    try {
      await API.patch(`/reviews/${review.id}/update/`, { is_approved: !review.is_approved }, authHeaders)
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: !r.is_approved } : r))
      toast.success('Review status toggled')
      fetchData()
    } catch { toast.error('Failed to update review') }
  }

  // ---- Subcomponents for Tabs ----
  const DashboardHome = () => (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Menu Items', val: stats.menu, icon: 'mug-hot' },
          { label: 'Total Bookings', val: stats.bookingsTotal, icon: 'calendar-check' },
          { label: 'Pending Bookings', val: stats.bookingsPending, icon: 'clock', highlight: stats.bookingsPending > 0 },
          { label: 'Active Offers', val: stats.offers, icon: 'tag' },
          { label: 'Pending Reviews', val: stats.reviewsPending, icon: 'star', highlight: stats.reviewsPending > 0 },
        ].map((s, i) => (
          <div key={i} style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 12, border: s.highlight ? '1px solid #e74c3c' : '1px solid rgba(201,168,76,0.1)', textAlign: 'center' }}>
            <i className={`fa-solid fa-${s.icon}`} style={{ fontSize: '2rem', color: s.highlight ? '#e74c3c' : '#C9A84C', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '2.5rem', color: '#F5E6C8', margin: 0 }}>{s.val}</h3>
            <span style={{ color: '#888', fontSize: '0.9rem', textTransform: 'uppercase' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const BookingsManager = () => (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Manage Bookings</h2>
      <div style={{ overflowX: 'auto', background: '#2C2C2C', borderRadius: 12, border: '1px solid rgba(201,168,76,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: 'rgba(0,0,0,0.3)', color: '#C9A84C' }}>
            <tr><th style={{padding:'1rem'}}>Date / Time</th><th style={{padding:'1rem'}}>Name</th><th style={{padding:'1rem'}}>Phone</th><th style={{padding:'1rem'}}>Guests</th><th style={{padding:'1rem'}}>Status</th></tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid rgba(201,168,76,0.1)', background: b.status === 'pending' ? 'rgba(241,196,15,0.05)' : 'transparent' }}>
                <td style={{padding:'1rem', color:'#F5E6C8'}}>{b.date} <span style={{color:'#888'}}>@ {b.time}</span></td>
                <td style={{padding:'1rem', color:'#F5E6C8'}}>{b.name}</td>
                <td style={{padding:'1rem', color:'#888'}}>{b.phone}</td>
                <td style={{padding:'1rem', color:'#F5E6C8'}}>{b.guests}</td>
                <td style={{padding:'1rem'}}>
                  <select 
                    value={b.status} 
                    onChange={e => updateBookingStatus(b.id, e.target.value)}
                    style={{
                      background: b.status === 'pending' ? 'rgba(241,196,15,0.2)' : b.status === 'confirmed' ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)',
                      color: b.status === 'pending' ? '#f1c40f' : b.status === 'confirmed' ? '#2ecc71' : '#e74c3c',
                      border: 'none', padding: '0.4rem 0.8rem', borderRadius: 4, cursor: 'pointer', outline: 'none'
                    }}
                  >
                    <option value="pending" style={{ color: 'black' }}>Pending</option>
                    <option value="confirmed" style={{ color: 'black' }}>Confirmed</option>
                    <option value="cancelled" style={{ color: 'black' }}>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const MenuManager = () => {
    const [newItem, setNewItem] = useState({ name:'', category:'tea', price:'', description:'', is_popular:false })
    
    return (
      <div>
        <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Menu Items</h2>
        
        {/* ADD FORM */}
        <div style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 12, marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.1)' }}>
          <h3 style={{ color: '#F5E6C8', marginBottom: '1rem' }}>Add New Item</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input placeholder="Name" value={newItem.name} onChange={e=>setNewItem({...newItem, name:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <select value={newItem.category} onChange={e=>setNewItem({...newItem, category:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }}>
              <option value="tea">Tea</option><option value="coffee">Coffee</option><option value="snacks">Snacks</option><option value="desserts">Desserts</option><option value="specials">Specials</option>
            </select>
            <input type="number" placeholder="Price (₹)" value={newItem.price} onChange={e=>setNewItem({...newItem, price:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <input placeholder="Description" value={newItem.description} onChange={e=>setNewItem({...newItem, description:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            
            <button onClick={() => { handleCreate('/menu/create/', newItem, setMenu); setNewItem({name:'', category:'tea', price:'', description:'', is_popular:false}) }} style={{ background:'#C9A84C', color:'#1C0A00', border:'none', padding:'0.8rem', borderRadius:6, fontWeight:'bold', cursor:'pointer' }}>
              Add Menu Item
            </button>
          </div>
        </div>

        {/* LIST */}
        <div style={{ display: 'grid', gap: '1rem' }}>
           {menu.map(item => (
             <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#2C2C2C', padding:'1rem 1.5rem', borderRadius:8 }}>
                <div>
                  <div style={{ color:'#F5E6C8', fontWeight:'bold', fontSize:'1.1rem' }}>{item.name} <span style={{ color:'#C9A84C', fontSize:'0.9rem', marginLeft:'10px' }}>₹{item.price}</span></div>
                  <div style={{ color:'#888', fontSize:'0.9rem' }}>{item.category.toUpperCase()} - {item.description}</div>
                </div>
                <button onClick={() => handleDelete('/menu/', item.id, setMenu)} style={{ color:'#e74c3c', background:'rgba(231,76,60,0.1)', border:'none', padding:'0.5rem 1rem', borderRadius:4, cursor:'pointer' }}>Delete</button>
             </div>
           ))}
        </div>
      </div>
    )
  }

  const GalleryManager = () => {
    const [newImg, setNewImg] = useState({ title:'', category:'ambience' })
    return (
      <div>
        <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Gallery Management</h2>
        
        <div style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 12, marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.1)', display: 'flex', gap: '1rem', flexWrap:'wrap' }}>
            <input placeholder="Image Title" value={newImg.title} onChange={e=>setNewImg({...newImg, title:e.target.value})} style={{ flex:1, padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8', minWidth:'200px' }} />
            <select value={newImg.category} onChange={e=>setNewImg({...newImg, category:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }}>
              <option value="ambience">Ambience</option><option value="food">Food</option><option value="coffee">Coffee</option><option value="events">Events</option>
            </select>
            <button onClick={() => { handleCreate('/gallery/create/', newImg, setGallery); setNewImg({title:'', category:'ambience'}) }} style={{ background:'#C9A84C', color:'#1C0A00', border:'none', padding:'0.8rem 1.5rem', borderRadius:6, fontWeight:'bold', cursor:'pointer' }}>
              Add Gallery Image
            </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
           {gallery.map(img => (
             <div key={img.id} style={{ background:'#2C2C2C', padding:'1.5rem', borderRadius:8, textAlign:'center', border:'1px solid rgba(201,168,76,0.1)' }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📸</div>
                <h4 style={{ color:'#F5E6C8' }}>{img.title}</h4>
                <div style={{ color:'#C9A84C', fontSize:'0.8rem', marginBottom:'1rem', textTransform:'uppercase' }}>{img.category}</div>
                <button onClick={() => handleDelete('/gallery/', img.id, setGallery)} style={{ color:'#e74c3c', background:'rgba(231,76,60,0.1)', border:'none', padding:'0.5rem 1rem', borderRadius:4, cursor:'pointer', width:'100%' }}>Delete Image</button>
             </div>
           ))}
        </div>
      </div>
    )
  }

  const OffersManager = () => {
    const [newOffer, setNewOffer] = useState({ title:'', discount_percent:'', description:'', valid_till:'' })
    return (
      <div>
        <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Active Offers</h2>
        <div style={{ background: '#2C2C2C', padding: '2rem', borderRadius: 12, marginBottom: '2rem', border: '1px solid rgba(201,168,76,0.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <input placeholder="Offer Title" value={newOffer.title} onChange={e=>setNewOffer({...newOffer, title:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <input type="number" placeholder="Discount %" value={newOffer.discount_percent} onChange={e=>setNewOffer({...newOffer, discount_percent:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <input type="date" value={newOffer.valid_till} onChange={e=>setNewOffer({...newOffer, valid_till:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <input placeholder="Short Description" value={newOffer.description} onChange={e=>setNewOffer({...newOffer, description:e.target.value})} style={{ padding:'0.8rem', borderRadius:6, border:'1px solid #C9A84C', background:'#1C0A00', color:'#F5E6C8' }} />
            <button onClick={() => { handleCreate('/offers/create/', newOffer, setOffers); setNewOffer({title:'', discount_percent:'', description:'', valid_till:''}) }} style={{ background:'#C9A84C', color:'#1C0A00', border:'none', padding:'0.8rem', borderRadius:6, fontWeight:'bold', cursor:'pointer' }}>Add Offer</button>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
           {offers.map(off => (
             <div key={off.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#2C2C2C', padding:'1.5rem', borderRadius:8, borderLeft:`4px solid #C9A84C` }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                    <span style={{ background:'#C9A84C', color:'#1C0A00', padding:'4px 8px', borderRadius:4, fontWeight:'bold' }}>{off.discount_percent}% OFF</span>
                    <h3 style={{ color:'#F5E6C8', margin:0 }}>{off.title}</h3>
                  </div>
                  <div style={{ color:'#888', marginTop:'0.5rem' }}>{off.description} • Expires: {off.valid_till}</div>
                </div>
                <button onClick={() => handleDelete('/offers/', off.id, setOffers)} style={{ color:'#e74c3c', background:'rgba(231,76,60,0.1)', border:'none', padding:'0.5rem 1rem', borderRadius:4, cursor:'pointer' }}>Delete</button>
             </div>
           ))}
        </div>
      </div>
    )
  }

  const ReviewsManager = () => (
    <div>
      <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', marginBottom: '2rem' }}>Guest Reviews</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
         {reviews.map(rev => (
           <div key={rev.id} style={{ background:'#2C2C2C', padding:'1.5rem', borderRadius:8, border: rev.is_approved ? '1px solid rgba(46,204,113,0.3)' : '1px solid rgba(241,196,15,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                 <div style={{ color:'#F5E6C8', fontWeight:'bold' }}>{rev.name}</div>
                 <div style={{ color:'#C9A84C' }}>{'★'.repeat(rev.rating)}</div>
              </div>
              <p style={{ color:'#888', fontSize:'0.95rem', marginBottom:'1.5rem', fontStyle:'italic' }}>"{rev.comment}"</p>
              
              <div style={{ display:'flex', gap:'1rem' }}>
                 <button 
                  onClick={() => toggleReviewApproval(rev)} 
                  style={{ flex:1, color: rev.is_approved ? '#2ecc71' : '#f1c40f', background: rev.is_approved ? 'rgba(46,204,113,0.1)' : 'rgba(241,196,15,0.1)', border:'none', padding:'0.5rem', borderRadius:4, cursor:'pointer' }}
                 >
                   {rev.is_approved ? 'Approved' : 'Pending Approval'}
                 </button>
                 <button onClick={() => handleDelete('/reviews/', rev.id, setReviews)} style={{ color:'#e74c3c', background:'rgba(231,76,60,0.1)', border:'none', padding:'0.5rem 1rem', borderRadius:4, cursor:'pointer' }}>Delete</button>
              </div>
           </div>
         ))}
      </div>
    </div>
  )

  // Layout Render
  return (
    <div style={{ display: 'flex', height: '100vh', background: '#1C0A00' }}>
      
      {/* Mobile Ham */}
      <button onClick={() => setMobileMenu(!mobileMenu)} style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: '#C9A84C', color: '#1C0A00', border: 'none', width: 45, height: 45, borderRadius: '50%', fontSize: '1.2rem', display: window.innerWidth <= 768 ? 'block' : 'none' }}>
        <i className={`fa-solid ${mobileMenu ? 'fa-xmark' : 'fa-bars'}`} />
      </button>

      {/* Sidebar */}
      <aside style={{ 
        width: 250, background: '#2C2C2C', borderRight: '1px solid rgba(201,168,76,0.1)', display: 'flex', flexDirection: 'column',
        position: window.innerWidth <= 768 ? 'fixed' : 'static', height: '100vh', zIndex: 999, transition: 'left 0.3s',
        left: mobileMenu || window.innerWidth > 768 ? 0 : -250
      }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid rgba(201,168,76,0.1)', textAlign: 'center' }}>
          <img src="/logo.png" alt="Tea3" style={{ width: 40, marginBottom: '0.5rem' }} />
          <h2 style={{ fontFamily: 'Playfair Display', color: '#C9A84C', fontSize: '1.2rem' }}>Tea3 Portal</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'chart-pie' },
            { id: 'menu', label: 'Menu Items', icon: 'utensils' },
            { id: 'bookings', label: 'Bookings', icon: 'calendar-check' },
            { id: 'gallery', label: 'Gallery', icon: 'image' },
            { id: 'offers', label: 'Offers', icon: 'tag' },
            { id: 'reviews', label: 'Reviews', icon: 'star' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileMenu(false); }}
              style={{
                width: '100%', padding: '1rem 1.5rem', textAlign: 'left', background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: activeTab === tab.id ? '#C9A84C' : '#F5E6C8', border: 'none', borderLeft: `3px solid ${activeTab === tab.id ? '#C9A84C' : 'transparent'}`,
                cursor: 'pointer', fontSize: '1rem', transition: 'all 0.2s', display: 'flex', gap: '1rem', alignItems: 'center'
              }}
            >
              <i className={`fa-solid fa-${tab.icon}`} style={{ width: 20, textAlign: 'center' }} /> {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={{ padding: '1.5rem', background: 'transparent', border: 'none', borderTop: '1px solid rgba(201,168,76,0.1)', color: '#e74c3c', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <i className="fa-solid fa-right-from-bracket" style={{ width: 20, textAlign: 'center' }} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '3rem', position: 'relative' }}>
         {activeTab === 'dashboard' && <DashboardHome />}
         {activeTab === 'bookings' && <BookingsManager />}
         {activeTab === 'menu' && <MenuManager />}
         {activeTab === 'gallery' && <GalleryManager />}
         {activeTab === 'offers' && <OffersManager />}
         {activeTab === 'reviews' && <ReviewsManager />}
      </main>

    </div>
  )
}
