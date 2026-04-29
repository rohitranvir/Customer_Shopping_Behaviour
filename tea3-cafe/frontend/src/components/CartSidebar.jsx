import { useCart } from '../context/CartContext'

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQty, removeFromCart, cartTotal, sendViaWhatsApp, clearCart } = useCart()

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} />
      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
        
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="close-btn" onClick={closeCart}><i className="fa-solid fa-xmark" /></button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="empty-cart">
              <i className="fa-solid fa-mug-hot" />
              <p>Your cart is empty ☕</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image || `https://placehold.co/80x80/2C1500/C9A84C?text=${item.name[0]}`} alt={item.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item-price">
                  <span className="price">₹{item.price * item.qty}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}><i className="fa-solid fa-trash-can" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="subtotal">
              <span>Subtotal</span>
              <span className="total-val">₹{cartTotal}</span>
            </div>
            <button className="btn-whatsapp" onClick={sendViaWhatsApp}>
              <i className="fa-brands fa-whatsapp" /> Send via WhatsApp
            </button>
            <button className="btn-clear" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        )}

      </div>

      <style>{`
        .cart-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1050;
          opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
        }
        .cart-overlay.open { opacity: 1; pointer-events: auto; }

        .cart-sidebar {
          position: fixed; top: 0; right: -400px; width: 400px; height: 100vh;
          background: var(--charcoal); z-index: 1100; box-shadow: -5px 0 25px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; transition: right 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .cart-sidebar.open { right: 0; }

        .cart-header {
          padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
          border-bottom: 1px solid rgba(201,168,76,0.15); background: rgba(28,10,0,0.5);
        }
        .cart-header h3 { font-family: var(--font-heading); color: var(--gold); margin: 0; }
        .close-btn { background: none; border: none; color: var(--muted); font-size: 1.2rem; cursor: pointer; }
        .close-btn:hover { color: var(--cream); }

        .cart-body { flex: 1; overflow-y: auto; padding: 1.5rem; }
        .empty-cart { text-align: center; color: var(--muted); padding-top: 3rem; }
        .empty-cart i { font-size: 3rem; color: rgba(201,168,76,0.3); margin-bottom: 1rem; }

        .cart-item { display: flex; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(201,168,76,0.1); margin-bottom: 1rem; }
        .cart-item-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(201,168,76,0.3); }
        .cart-item-info { flex: 1; }
        .cart-item-info h4 { color: var(--cream); font-size: 0.95rem; margin-bottom: 0.5rem; }
        .qty-controls { display: flex; align-items: center; gap: 0.8rem; background: rgba(0,0,0,0.3); width: fit-content; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(201,168,76,0.2); }
        .qty-controls button { background: none; border: none; color: var(--gold); font-size: 1.2rem; cursor: pointer; padding: 0 5px; }
        .qty-controls span { color: var(--cream); font-weight: bold; min-width: 15px; text-align: center; }
        
        .cart-item-price { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; }
        .price { color: var(--gold); font-weight: bold; font-family: var(--font-heading); }
        .remove-btn { background: none; border: none; color: #e74c3c; cursor: pointer; font-size: 0.9rem; opacity: 0.7; }
        .remove-btn:hover { opacity: 1; }

        .cart-footer { padding: 1.5rem; background: rgba(28,10,0,0.5); border-top: 1px solid rgba(201,168,76,0.15); display: flex; flex-direction: column; gap: 1rem; }
        .subtotal { display: flex; justify-content: space-between; color: var(--cream); font-size: 1.1rem; }
        .total-val { color: var(--gold); font-family: var(--font-heading); font-weight: bold; font-size: 1.3rem; }
        .btn-whatsapp { background: #25D366; color: white; border: none; padding: 1rem; border-radius: 8px; font-weight: bold; font-size: 1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 0.5rem; transition: background 0.3s; }
        .btn-whatsapp:hover { background: #1ebd5a; }
        .btn-clear { background: transparent; color: var(--muted); border: 1px solid rgba(245,230,200,0.2); padding: 0.6rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
        .btn-clear:hover { background: rgba(231, 76, 60, 0.1); color: #e74c3c; border-color: rgba(231, 76, 60, 0.4); }

        @media (max-width: 480px) {
          .cart-sidebar { width: 100vw; right: -100vw; }
        }
      `}</style>
    </>
  )
}
