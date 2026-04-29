import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // If already logged in, redirect
    if (localStorage.getItem('tea3_token')) {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/token/', { username, password })
      localStorage.setItem('tea3_token', res.data.access)
      toast.success('Login successful!')
      navigate('/admin/dashboard')
    } catch (error) {
      toast.error('Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--espresso)', backgroundImage: 'radial-gradient(circle, #2a1000 0%, #1c0a00 100%)' }}>
      
      <div style={{ background: 'rgba(28,10,0,0.8)', padding: '3.5rem 2.5rem', borderRadius: 16, border: '1px solid rgba(201,168,76,0.2)', width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <img src="/logo.png" alt="Tea3" style={{ width: 60, marginBottom: '1.5rem' }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)', fontSize: '2rem', marginBottom: '2rem' }}>Tea3 Portal</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Username" 
            required 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            style={{ width: '100%', padding: '1rem', background: 'var(--charcoal)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--cream)', borderRadius: 8, outline: 'none' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)}
             style={{ width: '100%', padding: '1rem', background: 'var(--charcoal)', border: '1px solid rgba(201,168,76,0.3)', color: 'var(--cream)', borderRadius: 8, outline: 'none' }}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: 'var(--gold)', color: 'var(--espresso)', padding: '1rem', border: 'none', borderRadius: 8, fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '1rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>

    </div>
  )
}
