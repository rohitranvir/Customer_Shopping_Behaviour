/* ═══════════════════════════════════════════════
   TEA3 — Cart System  |  key: tea3cart
═══════════════════════════════════════════════ */

const Tea3Cart = {
  key: 'tea3cart',

  get() {
    return JSON.parse(localStorage.getItem(this.key)) || [];
  },

  save(cart) {
    localStorage.setItem(this.key, JSON.stringify(cart));
  },

  add(name, price) {
    const cart = this.get();
    const idx  = cart.findIndex(i => i.name === name);
    if (idx > -1) {
      cart[idx].qty++;
    } else {
      cart.push({ name, price: Number(price), qty: 1 });
    }
    this.save(cart);
    this.render();
  },

  updateQty(name, delta) {
    let cart = this.get();
    const idx = cart.findIndex(i => i.name === name);
    if (idx === -1) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    this.save(cart);
    this.render();
  },

  clear() {
    this.save([]);
    this.render();
  },

  total() {
    return this.get().reduce((s, i) => s + i.price * i.qty, 0);
  },

  count() {
    return this.get().reduce((s, i) => s + i.qty, 0);
  },

  render() {
    const cart     = this.get();
    const body     = document.getElementById('cart-body');
    const badge    = document.getElementById('cart-count');
    const subtotal = document.getElementById('cart-total');

    // Badge
    const cnt = this.count();
    badge.textContent = cnt;
    badge.classList.toggle('visible', cnt > 0);

    // Subtotal
    if (subtotal) subtotal.textContent = `₹ ${this.total().toLocaleString('en-IN')}`;

    // Body
    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-mug-hot"></i>
          <p>Your cup is empty 🍵</p>
          <span>Add something delightful!</span>
        </div>`;
      return;
    }

    body.innerHTML = cart.map(item => `
      <div class="cart-item" data-name="${item.name}">
        <div class="cart-item-name">${item.name}</div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="Tea3Cart.updateQty('${item.name}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="Tea3Cart.updateQty('${item.name}', 1)">+</button>
        </div>
        <div class="cart-item-price">₹ ${(item.price * item.qty).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
  },

  openPanel() {
    document.getElementById('cart-panel').classList.add('open');
    document.getElementById('cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closePanel() {
    document.getElementById('cart-panel').classList.remove('open');
    document.getElementById('cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  },

  orderViaWhatsApp() {
    const cart = this.get();
    if (cart.length === 0) return;
    const lines = cart.map(i =>
      `${i.name} x${i.qty} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`
    ).join('\n');
    const msg = `🍵 New Order — Tea3!\n━━━━━━━━━━━━\n${lines}\n━━━━━━━━━━━━\nOrder Total: ₹${this.total().toLocaleString('en-IN')}\n\nPlease confirm my order. Thank you!`;
    const url = `https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  init() {
    this.render();
    // Cart toggle
    document.getElementById('cart-float').addEventListener('click', () => this.openPanel());
    document.getElementById('cart-overlay').addEventListener('click', () => this.closePanel());
    document.getElementById('cart-close').addEventListener('click',   () => this.closePanel());
    // WhatsApp & Clear
    document.getElementById('btn-order-wa').addEventListener('click', () => this.orderViaWhatsApp());
    document.getElementById('btn-clear').addEventListener('click',    () => {
      if (confirm('Clear your entire order?')) this.clear();
    });
  }
};
