# Tea3 Café Website
Full-stack café website with React frontend + Django backend

## Tech Stack
- Frontend: React.js (Vite) + React Router + Axios + AOS + Swiper
- Backend: Django + Django REST Framework + SimpleJWT
- Database: MongoDB Atlas (via Djongo)
- Storage: Cloudinary
- Email: Django Email / EmailJS

## Getting Started

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # fill in your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # fill in your values
npm run dev
```

## Environment Variables

### backend/.env
```
SECRET_KEY=
MONGO_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WHATSAPP_NUMBER=91XXXXXXXXXX
VITE_CLOUDINARY_CLOUD_NAME=
```

## Admin Panel
- **Django Admin**: http://localhost:8000/admin (use createsuperuser credentials)
- **React Admin**: http://localhost:5173/admin (use same credentials via JWT)

## Free Services Used
- **MongoDB Atlas**: Free M0 cluster (512MB)
- **Cloudinary**: Free tier (25GB storage)
- **EmailJS**: Free (200 emails/month)
- **Vercel**: Free React hosting
- **Railway/Render**: Free Django hosting

━━━━━━━━━━━━━━━━━━━━━━━━
## FREE DEPLOYMENT GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━

### FRONTEND → Vercel (free):
1. Push `frontend/` to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add `.env` variables in Vercel dashboard
4. Auto-deploys on every push

### BACKEND → Render (free):
1. Push `backend/` to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `pip install djongo==1.3.6 --no-deps && pip install -r requirements.txt` (This bypasses pip conflicts safely!)
4. Start command: `gunicorn tea3.wsgi:application`
5. Add all `.env` variables in Render dashboard
6. *Free tier: spins down after 15min inactivity (upgrade to $7/mo for always-on)*

### DATABASE → MongoDB Atlas (free M0):
1. [atlas.mongodb.com](https://atlas.mongodb.com) → Create free cluster
2. Network Access → Allow `0.0.0.0/0` (all IPs)
3. Copy connection string to `MONGO_URI`

### IMAGES → Cloudinary (free):
1. [cloudinary.com](https://cloudinary.com) → Create free account
2. Copy Cloud Name, API Key, API Secret to `.env`
