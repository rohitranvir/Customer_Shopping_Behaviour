import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('tea3_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('tea3_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (item) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const updateQty = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id)
      return
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i))
  }

  const clearCart = () => {
    setItems([])
  }

  const toggleCart = () => setIsOpen(o => !o)
  const closeCart = () => setIsOpen(false)

  const cartTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0)

  const sendViaWhatsApp = () => {
    if (!items.length) return
    const waNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '91XXXXXXXXXX'
    const lines = items.map(i => `• ${i.name} x${i.qty} — ₹${i.price * i.qty}`)
    const msg = `Hi Tea3! I'd like to order:\n\n${lines.join('\n')}\n\n*Total: ₹${cartTotal}*`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
    clearCart()
    closeCart()
  }

  return (
    <CartContext.Provider value={{
      items, isOpen, toggleCart, closeCart,
      addToCart, removeFromCart, updateQty, clearCart,
      cartTotal, cartCount, sendViaWhatsApp
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
