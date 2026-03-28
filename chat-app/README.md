# 💬 Real-Time Chat Application with Rooms

A full-stack real-time chat application built with Django Channels (WebSocket) and React. Supports multiple rooms, real-time messaging, typing indicators, read receipts, file sharing, and user presence tracking.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Backend    | Django 4.2, Django Channels, DRF               |
| Frontend   | React 18, Vite, Tailwind CSS                   |
| Auth       | JWT (djangorestframework-simplejwt)             |
| WebSocket  | Django Channels + Redis                         |
| Database   | PostgreSQL 15                                   |
| Deployment | Docker, Docker Compose                          |

## Features

- **Real-time messaging** via WebSocket
- **Chat rooms** — public and private (password-protected)
- **JWT authentication** with token rotation and refresh
- **Typing indicators** — see who's typing in real-time
- **Read receipts** — single tick (sent) / double tick (read)
- **File sharing** — upload images and files in chat
- **User presence** — online/offline status tracking
- **Auto-reconnect** — WebSocket reconnects automatically on disconnect
- **Responsive dark UI** — Tailwind CSS dark theme

---

## Quick Start (Docker)

```bash
# Clone the repo
git clone <repository-url>
cd chat-app

# Start everything
docker-compose up --build
```

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173         |
| Backend   | http://localhost:8000         |
| Admin     | http://localhost:8000/admin/  |

### Create a superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

---

## Manual Setup (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Edit .env — set DB_HOST=127.0.0.1, REDIS_HOST=127.0.0.1

python manage.py makemigrations accounts rooms messages_app
python manage.py migrate
python manage.py createsuperuser
daphne -b 0.0.0.0 -p 8000 chatapp.asgi:application
```

> **Prerequisites:** PostgreSQL and Redis must be running locally.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

### Authentication

| Method | Endpoint              | Auth     | Description                |
|--------|-----------------------|----------|----------------------------|
| POST   | `/api/register/`      | Public   | Register new user          |
| POST   | `/api/login/`         | Public   | Login, returns JWT tokens  |
| POST   | `/api/token/`         | Public   | Obtain JWT token pair      |
| POST   | `/api/token/refresh/` | Public   | Refresh access token       |
| GET    | `/api/me/`            | Required | Get current user profile   |
| PATCH  | `/api/profile/update/`| Required | Update avatar and bio      |

### Rooms

| Method | Endpoint                          | Auth     | Description                     |
|--------|-----------------------------------|----------|---------------------------------|
| GET    | `/api/rooms/`                     | Required | List all accessible rooms       |
| POST   | `/api/rooms/`                     | Required | Create a new room               |
| GET    | `/api/rooms/{id}/`                | Required | Get room details                |
| PUT    | `/api/rooms/{id}/`                | Required | Update room                     |
| DELETE | `/api/rooms/{id}/`                | Required | Delete room                     |
| POST   | `/api/rooms/{id}/join/`           | Required | Join a room (password for private) |
| POST   | `/api/rooms/{id}/leave/`          | Required | Leave a room                    |
| GET    | `/api/rooms/{id}/messages/`       | Required | Get paginated room messages     |

### File Upload

| Method | Endpoint                          | Auth     | Description                     |
|--------|-----------------------------------|----------|---------------------------------|
| POST   | `/api/rooms/{id}/upload/`         | Required | Upload file to room (multipart) |

---

## WebSocket Events

Connect to: `ws://localhost:8000/ws/chat/{room_id}/?token={jwt_access_token}`

### Client → Server

| Event Type     | Payload                                        | Description        |
|----------------|------------------------------------------------|--------------------|
| `chat_message` | `{ "type": "chat_message", "content": "..." }` | Send a message     |
| `typing`       | `{ "type": "typing", "is_typing": true }`      | Typing indicator   |
| `read_receipt` | `{ "type": "read_receipt", "message_id": "..." }` | Mark message read |

### Server → Client

| Event Type        | Payload                                                                                           |
|-------------------|---------------------------------------------------------------------------------------------------|
| `chat_message`    | `{ "type": "chat_message", "message_id", "content", "sender_id", "sender_username", "timestamp" }` |
| `presence_update` | `{ "type": "presence_update", "user_id", "username", "is_online" }`                                |
| `typing_indicator`| `{ "type": "typing_indicator", "user_id", "username", "is_typing" }`                               |
| `read_receipt`    | `{ "type": "read_receipt", "message_id", "user_id", "username" }`                                   |

---

## Project Structure

```
chat-app/
├── docker-compose.yml
├── setup.sh
├── README.md
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env / .env.example
│   ├── Dockerfile
│   ├── chatapp/          # Django project config
│   ├── accounts/         # Custom User model, JWT auth
│   ├── rooms/            # Room model, REST API
│   ├── chat/             # WebSocket consumers, routing, middleware
│   ├── messages_app/     # Message model, read receipts, file upload
│   └── media/            # Uploaded files
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── Dockerfile
    └── src/
        ├── api/          # Axios instance with JWT interceptors
        ├── context/      # AuthContext (login, register, logout)
        ├── hooks/        # useWebSocket custom hook
        ├── components/   # MessageBubble, TypingIndicator, FileUpload
        └── pages/        # Login, Register, RoomList, ChatRoom
```

---

## License

MIT
