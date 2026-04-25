# VendorConnect India — Backend Owner's Guide

> You built it. Now own it. This guide tells you what will actually break,
> how to catch it before the judges do, and what to hand off to your frontend teammate.

---

## 1. API Integration Reference

### Base URL
```
LOCAL:      http://localhost:5000
PRODUCTION: https://your-app.up.railway.app
```

### Authentication Header (for all protected routes)
```
Authorization: Bearer <jwt_token>
```
No quotes. No "JWT " prefix. Just `Bearer <token>`.

---

### Auth Endpoints

#### POST `/api/auth/register`
```json
// Request body (JSON)
{
  "name": "Ravi Chai Stall",       // required
  "ownerName": "Ravi Kumar",       // required
  "phone": "9876543210",           // required, unique
  "password": "test1234",          // required, min 6 chars
  "category": "food",              // optional, default "food"
  "city": "Hyderabad",             // optional
  "state": "Telangana",            // optional
  "description": "Best chai",      // optional, max 500 chars
  "upiId": "ravi@upi",             // optional
  "email": "ravi@email.com"        // optional, unique if provided
}

// 201 Success
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "vendor": {
      "_id": "660abc...",
      "name": "Ravi Chai Stall",
      "phone": "9876543210",
      "category": "food",
      "isOpen": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
      // passwordHash is NEVER in this response
    }
  }
}

// Error responses
409  { "success": false, "error": "Phone number already registered." }
409  { "success": false, "error": "Email already registered." }
400  { "success": false, "error": "Password must be at least 6 characters." }
400  { "success": false, "error": "Category must be one of: food, vegetables, snacks, beverages, other." }
```

#### POST `/api/auth/login`
```json
// Request body
{ "phone": "9876543210", "password": "test1234" }

// 200 Success — same shape as register
{ "success": true, "data": { "token": "...", "vendor": {...} } }

// Errors
404  { "success": false, "error": "No account found with this phone number." }
401  { "success": false, "error": "Incorrect password." }
400  { "success": false, "error": "Phone number is required." }
```

---

### Vendor Endpoints

#### GET `/api/vendors` — public
```
Query params (all optional):
  ?category=food
  ?city=Hyderabad         (case-insensitive partial match)
  ?isOpen=true
  ?search=masala          (searches name + description)
  
  Can combine: ?category=food&city=Hyderabad&isOpen=true

// 200 Success
{ "success": true, "data": { "count": 5, "vendors": [...] } }
```

#### GET `/api/vendors/:id` — public
```json
// 200 Success
{
  "success": true,
  "data": {
    "vendor": { "_id": "...", "name": "...", ... },
    "menuItems": [ { "name": "Chai", "price": 15, ... } ],
    "reviews": [ { "customerName": "Priya", "rating": 5, ... } ],
    "avgRating": "4.5",
    "reviewCount": 12
  }
}

// Errors
404  { "success": false, "error": "Vendor not found." }
400  { "success": false, "error": "Invalid vendor ID." }
```

#### PUT `/api/vendors/profile` — 🔒 protected
```json
// Request (JSON) — only send fields you want to change
{
  "name": "New Stall Name",
  "isOpen": false,
  "city": "Mumbai",
  "description": "Updated",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "category": "snacks",
  "upiId": "new@upi"
}

// 200 Success
{ "success": true, "data": { "vendor": { ...updatedVendor } } }
```

#### POST `/api/vendors/profile/photo` — 🔒 protected
```
Content-Type: multipart/form-data
Field name:   photo   (MUST be named exactly "photo")
File limits:  5MB, jpg/jpeg/png/webp only

// 200 Success
{ "success": true, "data": { "photoUrl": "https://res.cloudinary.com/...", "vendor": {...} } }

// Errors
400  { "success": false, "error": "No photo uploaded." }
400  { "success": false, "error": "File too large. Maximum size is 5MB." }
400  { "success": false, "error": "Only image files (jpg, jpeg, png, webp) are allowed." }
```

---

### Menu Endpoints

#### GET `/api/vendors/:vendorId/menu` — public
```json
// 200 Success
{ "success": true, "data": { "count": 3, "menuItems": [...] } }
// Returns ALL items (including isAvailable: false) from vendor's menu
```

#### POST `/api/menu` — 🔒 protected
```
Content-Type: multipart/form-data

Fields:
  name         (required, string)
  price        (required, number >= 0)
  isAvailable  (optional, boolean string "true"/"false", default true)
  photo        (optional image file, max 5MB)

// 201 Success
{ "success": true, "data": { "menuItem": { "_id": "...", "name": "Chai", "price": 15, "photoUrl": "..." } } }
```

#### PUT `/api/menu/:itemId` — 🔒 protected
```
Content-Type: multipart/form-data
Fields: name, price, isAvailable, photo (all optional)

// 200 Success
{ "success": true, "data": { "menuItem": { ...updated } } }

// Errors
403  { "success": false, "error": "Not authorized to update this item." }
404  { "success": false, "error": "Menu item not found." }
```

#### DELETE `/api/menu/:itemId` — 🔒 protected
```json
// 200 Success
{ "success": true, "data": { "message": "Menu item deleted successfully." } }

// Errors
403  { "success": false, "error": "Not authorized to delete this item." }
404  { "success": false, "error": "Menu item not found." }
```

---

### Review Endpoints

#### POST `/api/vendors/:vendorId/reviews` — public
```json
// Request
{ "customerName": "Priya", "rating": 5, "comment": "Amazing!" }

// 201 Success
{ "success": true, "data": { "review": { "_id": "...", "rating": 5, ... } } }

// Errors
400  { "success": false, "error": "Rating is required." }
400  { "success": false, "error": "Rating must be a number." }
400  { "success": false, "error": "Rating must be between 1 and 5." }
```

#### GET `/api/vendors/:vendorId/reviews` — public
```json
{
  "success": true,
  "data": {
    "vendorId": "660abc...",
    "reviewCount": 5,
    "avgRating": 4.6,
    "reviews": [...]
  }
}
```

---

### Common Frontend Mistakes

| Mistake | Effect | Fix |
|---|---|---|
| Sending `Authorization: token xyz` instead of `Bearer xyz` | 401 every time | Must be `Bearer <token>` |
| Sending menu data as JSON instead of `form-data` | Multer won't parse it, fields are undefined | Use `multipart/form-data` for any endpoint with photo |
| Using `isAvailable: true` (boolean) in form-data | Arrives as string `"true"` — controller handles this, but be aware | Always send as string in form-data |
| Storing token in localStorage only | Token lost on browser close or XSS | Use `localStorage` for hackathon; note the risk |
| Not sending `Content-Type: application/json` on JSON routes | Body is `undefined` | Always set the header for JSON requests |
| Calling `/api/vendors/profile` without Bearer token | Gets 401 | Check token exists before making protected calls |
| Calling `GET /api/vendors/menu` instead of `GET /api/vendors/:id/menu` | 404 | The `vendorId` must be in the URL path |

---

## 2. Debugging Guide

### MongoDB Issues

#### Connection Timeout on Railway
```
Error: MongooseServerSelectionError: connect ECONNREFUSED
```
**Checklist:**
1. Atlas → Network Access → Is `0.0.0.0/0` added?
2. Is `MONGODB_URI` in Railway Variables? (no quotes, no spaces)
3. Does the URI contain `+srv`?  
   ✅ `mongodb+srv://user:pass@cluster.mongodb.net/dbname`  
   ❌ `mongodb://user:pass@cluster.mongodb.net/dbname`
4. Does the password have special chars? Encode them: `@` → `%40`, `#` → `%23`, `$` → `%24`

#### Duplicate Key Error on Register
```
MongoError: E11000 duplicate key error collection: vendorconnect.vendors index: phone_1
```
This hits the global error handler and returns:
```json
{ "success": false, "error": "phone already exists." }
```
This is correct behavior. If you see this on the *first* register, your Atlas is holding stale data from a previous test. Drop the collection in Atlas UI.

---

### JWT Issues

#### Token Expired During Demo
The token lives for 7 days. Not an issue for a hackathon.  
If you see `Token expired. Please login again.` — the user needs to login again.  
**Frontend must catch this and redirect to login.**

#### Invalid Signature
Happens when `JWT_SECRET` changes (e.g. you redeployed with a new secret).  
All existing tokens become invalid. Users must re-login.

#### "Access denied. No token provided."
The frontend is not sending the header, or it's sending `"null"` or `"undefined"` as the token.
```js
// Frontend check before calling protected API
const token = localStorage.getItem('token');
if (!token) { redirect to login; }
headers: { Authorization: `Bearer ${token}` }
```

---

### CORS Issues

#### "Blocked by CORS policy" in browser console
The browser is blocking the request before it even reaches your server.
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```
**Fix checklist:**
1. Is `CLIENT_URL` in Railway set to your exact Vercel URL?
   - ✅ `https://vendor-connect.vercel.app`
   - ❌ `https://vendor-connect.vercel.app/` (trailing slash kills it)
2. Is `credentials: true` set in your frontend `fetch`/`axios` call?
3. For local testing, is `CLIENT_URL=http://localhost:5173` in your local `.env`?

**Temporary nuclear option for hackathon:**  
Set `CLIENT_URL=*` in Railway Variables. Ships the CORS check entirely.

---

### Cloudinary Issues

#### "Must supply api_key"
```
Error: Must supply api_key
```
`require('./config/cloudinary')` runs at startup. If any of the 3 env vars is missing, this throws.
**Fix:** Check Railway Variables for `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME`. Delete and re-paste if you suspect whitespace.

#### Photo uploads silently return `photoUrl: null`
The frontend is sending the file as JSON (`{ photo: base64 }`) instead of `multipart/form-data`. Multer only processes `multipart/form-data`. It never sees JSON bodies.

---

## 3. Testing Strategy (Postman)

### Collection Structure
```
VendorConnect India
├── 🔐 Auth
│   ├── Register (happy path)
│   ├── Register — duplicate phone
│   ├── Register — missing fields
│   ├── Login — success → SET VENDOR_TOKEN
│   ├── Login — wrong password
│   └── Login — phone not found
├── 🏪 Vendors
│   ├── Get all vendors
│   ├── Filter by category
│   ├── Search by name
│   ├── Get vendor by ID → SET VENDOR_ID
│   ├── Get vendor by invalid ID
│   ├── Update profile — success
│   ├── Update profile — no token
│   └── Upload shop photo
├── 🍵 Menu
│   ├── Add item (with photo)
│   ├── Add item (no photo) → SET ITEM_ID
│   ├── Add item — missing name
│   ├── Add item — negative price
│   ├── Update item — success
│   ├── Update item — wrong vendor
│   ├── Get menu by vendor
│   └── Delete item
└── ⭐ Reviews
    ├── Submit review — success
    ├── Submit review — rating 0 (invalid)
    ├── Submit review — rating 6 (invalid)
    ├── Submit review — missing customerName
    ├── Get reviews — has avgRating
    └── Get reviews — vendor not found
```

### Critical Edge Cases to Test

| Case | Why it matters |
|---|---|
| Register with `email` field empty string `""` | Empty string vs undefined — does Mongoose treat it as a value and try to store it? |
| Upload a `.gif` file as photo | Should get 400 not a Cloudinary error |
| Send `price: -5` on menu item | Should get 400 |
| Send `price: "fifteen"` on menu item | Should get 400 |
| Delete another vendor's menu item | Should get 403, NOT 404 |
| Call `GET /api/vendors/000000000000000000000000` (valid format, non-existent) | Should get 404, not 500 |
| Submit review with `rating: "5"` (string) | Should work — controller coerces to Number |
| Update profile with `category: "pizza"` | Should get 400 |

---

## 4. Deployment Verification Checklist

Run every step in order. Do not skip.

```
[ ] 1. npm run dev locally → see all 3 startup logs
[ ] 2. GET /api/health locally → { success: true }
[ ] 3. Register a vendor locally → 201 with token
[ ] 4. Login locally → 200 with token
[ ] 5. Add a menu item locally → Cloudinary URL in photoUrl
[ ] 6. git add . && git commit && git push main
[ ] 7. Railway build logs show no errors
[ ] 8. Railway deploy logs show:
        Cloudinary configured ✅
        MongoDB Connected ✅ to cluster: ...
        🚀 VendorConnect India server running on port ...
[ ] 9. curl https://your-app.up.railway.app/api/health → { success: true }
[ ] 10. Register a vendor on production URL → 201
[ ] 11. Login on production URL → 200 + token
[ ] 12. Add menu item on production URL → Cloudinary URL in response
[ ] 13. Hit fake route → 404 with correct error message
[ ] 14. Hit protected route without token → 401
```

If any step fails, **stop and fix it before the next step**.

---

## 5. Known Breakpoints — Where This Will Actually Fail

### Breakpoint 1: `isOpen` filter with string `"false"`
`?isOpen=false` query param arrives as string `"false"`.  
The controller does `isOpen === 'true'` so `"false"` correctly maps to `false`.  
**Verify:** `GET /api/vendors?isOpen=false` returns only closed vendors.

### Breakpoint 2: Menu items — `isAvailable` in form-data
`isAvailable=false` arrives as string `"false"`.  
The update controller does `req.body.isAvailable === 'true' || req.body.isAvailable === true`.  
`"false"` evaluates to `false` correctly. **Still manually verify this** — it's an easy regression.

### Breakpoint 3: `GET /api/vendors/:id` with a valid-format but non-existent ID
A 24-char hex string passes `ObjectId.isValid()` but doesn't exist in the DB.  
This returns `404 Vendor not found` — correct. But if the `try/catch` is ever missing, it will return a raw Mongoose error. **Check this manually.**

### Breakpoint 4: Cloudinary upload on slow connections
Multer uploads synchronously to Cloudinary before your controller runs. On a slow connection, this blocks the Express thread for several seconds. Not a problem for hackathon scale, but be aware — uploading a 5MB photo may take 10 seconds.

### Breakpoint 5: MongoDB Atlas free tier goes to sleep
Atlas M0 (free) clusters pause after periods of inactivity. First request after sleep returns `MongooseServerSelectionError`. Second request succeeds (cluster woke up). **Before the demo: hit the health check endpoint to wake the cluster.**

### Breakpoint 6: `toJSON` stripping `passwordHash` but login needing it
The login controller uses `.select('+passwordHash')` explicitly. If you ever remove that select, `bcrypt.compare(password, undefined)` throws.  
**Verify:** Login works. If it starts returning 500, that's the first thing to check.

### Breakpoint 7: `protectRoute` getting `req.vendor` but controller using `req.user`
All protected controllers use `req.vendor.vendorId`. If any future changes rename this, every protected endpoint silently returns `undefined` for the vendor ID — causing 404s or wrong data.

### Breakpoint 8: Railway PORT assignment
Railway injects `PORT` dynamically. If `app.listen(5000)` is hardcoded anywhere, Railway's health check will fail (it checks the injected port).  
Your `index.js` correctly uses `process.env.PORT || 5000` — just confirm this was not changed.

---

## 6. Frontend Coordination Sheet

**Hand this to your frontend teammate. Verbatim.**

---

### Token Handling
```js
// After login or register:
localStorage.setItem('vendorToken', data.token);
localStorage.setItem('vendorId', data.vendor._id);

// On every protected request:
const token = localStorage.getItem('vendorToken');
const res = await fetch(`${API_URL}/api/vendors/profile`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`   // exactly this format
  },
  body: JSON.stringify({ isOpen: false })
});

// If 401 → token expired or missing → redirect to login
// If 403 → token invalid → clear storage + redirect to login
if (res.status === 401 || res.status === 403) {
  localStorage.removeItem('vendorToken');
  // navigate to /login
}
```

### File Upload — MUST use FormData
```js
// WRONG — this sends JSON, Multer ignores it
fetch('/api/menu', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Chai', price: 15, photo: file })
});

// CORRECT — multipart/form-data, DO NOT set Content-Type manually
const formData = new FormData();
formData.append('name', 'Masala Chai');
formData.append('price', '15');
formData.append('photo', fileInputRef.current.files[0]); // File object

fetch('/api/menu', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  // Do NOT set Content-Type — browser sets it with boundary automatically
  body: formData
});
```

### Error Response Contract
Every error from this backend follows this exact shape:
```json
{ "success": false, "error": "Human-readable message here." }
```
Every success follows:
```json
{ "success": true, "data": { ... } }
```
Frontend should check `response.success` first, then access `response.data`.

### HTTP Status Codes Frontend Must Handle

| Status | Meaning | Frontend action |
|---|---|---|
| `200` / `201` | Success | Use `data` |
| `400` | Bad input | Show `error` message to user |
| `401` | No/expired token | Redirect to login |
| `403` | Invalid token or not your resource | Clear token + redirect |
| `404` | Not found | Show "not found" UI |
| `409` | Duplicate (phone/email) | Show "already registered" |
| `500` | Server crash | Show generic "Something went wrong" |

---

## 7. Hackathon Demo Checklist

### What Judges Actually Test

```
[ ] Register a new vendor account (5 seconds)
[ ] Login with that vendor (5 seconds)
[ ] Update the vendor profile (is it reflected instantly?)
[ ] Upload a shop photo (does the image appear?)
[ ] Add 2-3 menu items (with prices and photos)
[ ] Browse the vendor list from a "customer" view
[ ] Search/filter vendors by category or city
[ ] Submit a star review as a customer (no login needed)
[ ] See the avgRating update on the vendor page
[ ] Open on mobile — does the API work from a phone browser?
```

### What Must Work Before Demo (Non-Negotiable)

1. ✅ Register + Login flow — if this fails, nothing else matters
2. ✅ Vendor profile visible publicly (customer view)
3. ✅ Menu items showing on vendor page
4. ✅ Review submission working (no login required — customers can review)
5. ✅ `/api/health` returns 200 on production URL

### What Judges Will Overlook

- Slow Cloudinary uploads (expected on free tier)
- Atlas M0 first-request latency
- No pagination on vendor list

### Last 10 Minutes Before Demo

```bash
# 1. Wake up Atlas cluster
curl https://your-app.up.railway.app/api/health

# 2. Confirm all env vars are set in Railway
# 3. Do ONE full flow test on production:
#    Register → Login → Add menu item → Submit review → Verify vendor page

# 4. Share this with team:
API_URL = https://your-app.up.railway.app
Test vendor phone: 9876543210
Test vendor password: test1234

# 5. Open Railway logs tab — keep it visible during demo
#    If anything breaks, the error will appear here in real time
```
