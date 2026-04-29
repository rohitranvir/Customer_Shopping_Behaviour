# ☕ Tea3 — Luxury Café Website

A fully responsive, performance-optimised static website for **Tea3**, a luxury café in Banjara Hills, Hyderabad. Built with pure HTML5, CSS3, and Vanilla JavaScript — no frameworks, no build tools required.

---

## 🗂️ Project Structure

```
tea3/
├── index.html          # Homepage
├── menu.html           # Full menu with search & filter
├── about.html          # Brand story, stats, team, values
├── gallery.html        # Masonry photo gallery + lightbox
├── contact.html        # Contact form (EmailJS-ready)
├── booking.html        # 3-step reservation system
├── admin.html          # Password-protected CMS panel
├── css/
│   ├── style.css       # Global design system + utilities
│   └── responsive.css  # Mobile-first breakpoints
├── js/
│   └── main.js         # Global loader, AOS init, mobile nav
└── assets/
    └── images/         # Replace placeholder images here
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Espresso | `#1C0A00` |
| Cream | `#F5E6C8` |
| Gold | `#C9A84C` |
| Off-white | `#FAF7F0` |
| Charcoal | `#2C2C2C` |
| Heading Font | Playfair Display |
| Body Font | DM Sans |

---

## 🚀 Features

### Frontend Pages
- **Homepage** (`index.html`) — Hero, marquee ticker, featured menu cards, offers (from admin), testimonials, gallery teaser, CTA, footer
- **Menu** (`menu.html`) — 25 items across 5 categories with real-time dual filter (search + category pills) and slide-in cart panel with WhatsApp order
- **About** (`about.html`) — Brand story, animated stats counter, team cards, values, timeline
- **Gallery** (`gallery.html`) — Masonry grid, category filter, custom lightbox with keyboard navigation
- **Contact** (`contact.html`) — Validated form with EmailJS integration hooks + embedded map
- **Booking** (`booking.html`) — 3-step form (Details → Date/Time → Confirm), WhatsApp + Email submission, persists to `localStorage`

### Admin Panel (`admin.html`)
- Login screen with shake animation (default: `admin` / `tea32024`)
- Session persists via `sessionStorage` (cleared on tab close)
- **Dashboard** — Live stat cards (menu items, bookings, offers, today's reservations)
- **Menu Management** — Full CRUD with search/filter, inline editing, JSON export
- **Bookings Management** — Status updates (Pending / Confirmed / Cancelled), date & search filter, CSV export
- **Offers Management** — Full CRUD with active/inactive toggle; active offers appear on homepage automatically
- Mobile-responsive with bottom tab navigation on small screens

### Performance & SEO
- Global page loader (coffee bounce animation)
- `defer` on all external scripts
- `loading="lazy"` on all below-fold images
- Font preloading with `onload` trick (non-render-blocking)
- AOS animations with `will-change` hint
- SEO meta tags on every page: `title`, `description`, `keywords`, `robots`, Open Graph, Twitter Card, `canonical`
- Skip-to-content link on every page
- `focus-visible` gold ring for keyboard accessibility
- ARIA labels on all interactive elements

---

## ⚙️ Setup & Configuration

### 1. Replace the phone number
Search for `91XXXXXXXXXX` (`Ctrl+Shift+F`) across all files and replace with your actual WhatsApp number in international format (no `+`, e.g., `919876543210`).

### 2. Set up EmailJS (optional)
In `contact.html` and `booking.html`, find the `EMAILJS SETUP GUIDE` comment and fill in:
```js
emailjs.init("YOUR_PUBLIC_KEY");
// Service ID: "service_xxxxxxx"
// Template ID: "template_xxxxxxx"
```

### 3. Change admin credentials
In `admin.html`, find:
```js
const CREDS = { user: 'admin', pass: 'tea32024' };
```

### 4. Replace placeholder images
All images currently use `placehold.co`. Replace `src` attributes in each page with your actual café photography. Recommended path: `assets/images/`.

### 5. Update OG image
Place your sharing image at `assets/images/og-image.jpg` (1200×630px recommended).

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout Change |
|---|---|
| `> 1100px` | Full desktop, 4-col menu grid |
| `768px – 1100px` | 3-col menu grid, tablet nav |
| `480px – 768px` | 2-col grid, hamburger menu |
| `< 480px` | 1-col, stacked layouts |

---

## 🏗️ Architecture — Data Flow

```
Booking Form ──► localStorage (tea3_bookings)
                        │
                        ▼
                  Admin Panel ──► Status updates ──► localStorage
                                        │
                                        ▼
                               Offers (tea3_offers)
                                        │
                                        ▼
                              Homepage (dynamic inject)
```

---

## 🚢 Deployment

This is a **100% static site** — no server required.

**Netlify (drag & drop):**
1. Build is not needed — deploy the folder directly
2. Drag `tea3/` to [app.netlify.com](https://app.netlify.com)

**GitHub Pages:**
```bash
git init
git add .
git commit -m "Initial commit: Tea3 website"
git remote add origin https://github.com/your-username/tea3.git
git push -u origin main
# Enable GitHub Pages → Settings → Pages → Deploy from branch: main
```

**Vercel:**
```bash
npx vercel --prod
```

---

## 📋 Pre-Launch Checklist

- [ ] Replace `91XXXXXXXXXX` with real WhatsApp number in all files
- [ ] Set up EmailJS credentials in `contact.html` and `booking.html`
- [ ] Change admin password in `admin.html`
- [ ] Replace all `placehold.co` images with professional photography
- [ ] Add `assets/images/og-image.jpg` (1200×630px)
- [ ] Update footer address and phone number across all pages
- [ ] Set the correct canonical URLs (replace `tea3cafe.in` with real domain)
- [ ] Test full booking flow end-to-end (form → WhatsApp/email → admin panel shows new booking)
- [ ] Test cart → WhatsApp order on `menu.html`
- [ ] Test admin login and all CRUD operations
- [ ] Verify all pages on mobile (375px) and tablet (768px)

---

## 🔐 Admin Panel Notes

| Item | Value |
|---|---|
| URL | `/admin.html` |
| Username | `admin` |
| Password | `tea32024` |
| Session type | `sessionStorage` (tab-scoped) |

> ⚠️ Since this is a static site, credentials are visible in source code. For production, replace with a proper backend authentication system.

---

## 📦 Third-Party Libraries

| Library | CDN | Purpose |
|---|---|---|
| Font Awesome 6.4 | cdnjs | Icons |
| AOS 2.3.1 | unpkg | Scroll animations |
| Swiper 10 | jsDelivr | Testimonial carousel (homepage) |
| Google Fonts | fonts.googleapis.com | Playfair Display + DM Sans |

All libraries are loaded from CDN — no npm install needed.

---

*Built with ❤️ for Tea3, Hyderabad.*
