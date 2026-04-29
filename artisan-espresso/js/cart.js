// ========================
// Cart System — Tea3
// ========================

const Cart = {
  storageKey: 'TEA3_cart',

  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey)) || [];
  },

  add(item) {
    const cart = this.getAll();
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.qty = (existing.qty || 1) + 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.updateBadge();
    this.showToast(`${item.name} added to cart!`);
  },

  remove(id) {
    let cart = this.getAll().filter(c => c.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.updateBadge();
  },

  count() {
    return this.getAll().reduce((sum, item) => sum + (item.qty || 1), 0);
  },

  updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
      const count = this.count();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  },

  showToast(message) {
    // Remove any existing toast
    const existing = document.getElementById('cart-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${message}`;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 30px;
      background: linear-gradient(135deg, #1C0A00, #2C1500);
      color: #C9A84C;
      border: 1px solid #C9A84C;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: slideInCart 0.3s ease forwards;
    `;

    // Inject keyframe if not present
    if (!document.getElementById('cart-toast-style')) {
      const style = document.createElement('style');
      style.id = 'cart-toast-style';
      style.textContent = `
        @keyframes slideInCart {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  },

  init() {
    this.updateBadge();
    console.log('🛒 TEA3 Cart System Initialized');
  }
};

document.addEventListener('DOMContentLoaded', () => Cart.init());
