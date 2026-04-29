import { useState, useEffect } from 'react'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${!visible ? 'fade-out' : ''}`}>
      <div className="loader-content">
        <img src="/logo.png" alt="Tea3" className="loader-logo" />
        <p className="loader-text">Brewing something special...</p>
      </div>

      <style>{`
        .page-loader {
          position: fixed; inset: 0; background: var(--espresso);
          z-index: 9999; display: flex; align-items: center; justify-content: center;
          transition: opacity 0.5s ease;
        }
        .page-loader.fade-out { opacity: 0; pointer-events: none; }
        .loader-content { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        .loader-logo {
          width: auto; height: 45vh; max-width: 90vw; object-fit: contain;
          animation: bounce-pulse 2s infinite ease-in-out;
        }
        .loader-text {
          font-family: var(--font-heading); color: var(--gold); font-size: 1.2rem;
          letter-spacing: 1px; font-style: italic; opacity: 0.8;
        }
        @keyframes bounce-pulse {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
