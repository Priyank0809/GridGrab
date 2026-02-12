# GridGrab 🎯

**A real-time collaborative grid where users capture blocks and everyone sees updates instantly.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](YOUR_DEPLOYED_APP_LINK)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue)](YOUR_GITHUB_REPO_LINK)

---

## 🌟 Features

- **Real-time Updates**: See captures happen instantly across all connected users via WebSockets
- **Interactive Grid**: Click any block to claim it with your name and color
- **User Identity**: Customize your nickname and color - see who's playing
- **Cooldown System**: Blocks are locked for 10 seconds after capture to prevent spam
- **Leaderboard**: See top players ranked by blocks captured
- **Zoom & Pan**: Navigate large grids with mouse wheel zoom and drag-to-pan
- **Smooth Animations**: Visual feedback when blocks are captured

---

## 🚀 Live Demo

**Deployed App:** [YOUR_DEPLOYED_APP_LINK](YOUR_DEPLOYED_APP_LINK)

Open the link in multiple tabs or share with friends to see real-time collaboration in action!

---

## 📋 Table of Contents

- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Running Locally](#-running-locally)
- [Deployment](#-deployment)
- [API Endpoints](#-api-endpoints)
- [Real-time Architecture](#-real-time-architecture)
- [Trade-offs & Decisions](#-trade-offs--decisions)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎮 How It Works

1. **Load the Grid**: The frontend fetches all blocks from the Django REST API
2. **Capture Blocks**: Click any unclaimed block to capture it with your name and color
3. **Real-time Sync**: When you capture a block:
   - Backend saves the capture to the database
   - Backend broadcasts the update via Django Channels WebSocket
   - All connected clients receive the update instantly
   - UI updates automatically without refresh
4. **Cooldown**: Each block is locked for 10 seconds after capture
5. **Leaderboard**: Stats update every 15 seconds showing top players

---

## 🛠 Tech Stack

### Backend
- **Django 4.2+**: Web framework
- **Django REST Framework**: RESTful API
- **Django Channels**: WebSocket support for real-time updates
- **Daphne**: ASGI server (runs Django with WebSocket support)
- **SQLite**: Database (can be swapped for PostgreSQL in production)
- **Redis**: Channel layer for production (optional - uses in-memory for local dev)

### Frontend
- **React 18+**: UI framework
- **Vite**: Build tool and dev server
- **WebSocket API**: Native browser WebSocket for real-time updates
- **CSS3**: Styling with animations and transitions

---

## 📁 Project Structure

```
GridGrab/
├── backend/                    # Django backend
│   ├── gridgrab_backend/      # Django project settings
│   │   ├── settings.py        # Configuration
│   │   ├── urls.py            # URL routing
│   │   ├── asgi.py            # ASGI config for WebSockets
│   │   └── routing.py         # WebSocket routing
│   ├── grid/                  # Main app
│   │   ├── models.py          # Block model
│   │   ├── views.py           # API views (list, capture, leaderboard)
│   │   ├── serializers.py     # DRF serializers
│   │   ├── urls.py            # API URLs
│   │   ├── consumers.py       # WebSocket consumer
│   │   └── management/
│   │       └── commands/
│   │           └── seed_grid.py  # Command to create grid
│   ├── manage.py
│   └── db.sqlite3             # SQLite database
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── App.jsx            # Main component
│   │   ├── App.css            # Styles
│   │   └── main.jsx           # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt           # Python dependencies
├── BUILD_GUIDE.md             # Step-by-step build instructions
├── BONUS_FEATURES_GUIDE.md   # Bonus features guide
├── DEPLOY_GUIDE.md           # Deployment instructions
└── README.md                  # This file
```

---

## 💻 Installation

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and npm
- **Git** (optional)

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/GridGrab.git
   cd GridGrab
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations**:
   ```bash
   cd backend
   python manage.py migrate
   ```

6. **Seed the grid** (creates 30x30 grid = 900 blocks):
   ```bash
   python manage.py seed_grid
   ```

7. **Create superuser** (optional, for admin):
   ```bash
   python manage.py createsuperuser
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://127.0.0.1:8000/api/blocks
   VITE_WS_URL=ws://127.0.0.1:8000/ws/grid/
   ```

---

## 🏃 Running Locally

### Start Backend

In one terminal (from `backend/` directory):

```bash
# Activate venv if not already active
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # macOS/Linux

# Run with Daphne (supports WebSockets)
daphne -b 127.0.0.1 -p 8000 gridgrab_backend.asgi:application
```

Backend will be available at: **http://127.0.0.1:8000**

- API: http://127.0.0.1:8000/api/blocks/
- Admin: http://127.0.0.1:8000/admin/
- Leaderboard: http://127.0.0.1:8000/api/blocks/leaderboard/

### Start Frontend

In another terminal (from `frontend/` directory):

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173** (or the port Vite assigns)

Open multiple browser tabs to test real-time updates!

---

## 🚀 Deployment

### Backend (Render/Railway/Fly.io)

1. **Set environment variables**:
   - `DJANGO_SECRET_KEY`: Generate a secure secret key
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: Your domain (e.g., `gridgrab-backend.onrender.com`)
   - `REDIS_URL`: Redis connection string (for production channel layer)

2. **Build command**:
   ```bash
   pip install -r requirements.txt && python manage.py migrate && python manage.py seed_grid
   ```

3. **Start command**:
   ```bash
   daphne -b 0.0.0.0 -p $PORT gridgrab_backend.asgi:application
   ```

### Frontend (Vercel/Netlify)

1. **Root directory**: `frontend`
2. **Build command**: `npm run build`
3. **Output directory**: `dist`
4. **Environment variables**:
   - `VITE_API_URL`: Your deployed backend API URL
   - `VITE_WS_URL`: Your deployed backend WebSocket URL (use `wss://` for secure)

See **DEPLOY_GUIDE.md** for detailed step-by-step instructions.

---

## 📡 API Endpoints

### `GET /api/blocks/`
Returns all blocks in the grid.

**Response**:
```json
[
  {
    "id": 1,
    "row": 0,
    "col": 0,
    "owner_name": "Alice",
    "color": "#3b82f6",
    "captured_at": "2026-02-08T12:00:00Z"
  },
  ...
]
```

### `POST /api/blocks/{id}/capture/`
Capture a block.

**Request Body**:
```json
{
  "owner_name": "Alice",
  "color": "#3b82f6"
}
```

**Response**: Updated block object

**Error**: `429 Too Many Requests` if block is locked (cooldown active)

### `GET /api/blocks/leaderboard/`
Get top 15 players by block count.

**Response**:
```json
[
  {
    "owner_name": "Alice",
    "count": 42
  },
  ...
]
```

---

## 🔌 Real-time Architecture

### How Real-time Updates Work

1. **WebSocket Connection**: Frontend opens WebSocket to `/ws/grid/`
2. **Channel Group**: All clients join the same channel group (`room_grid_updates`)
3. **Capture Event**: When a block is captured:
   - Backend saves to database
   - Backend sends message to channel group via `channel_layer.group_send()`
   - WebSocket consumer (`GridConsumer`) receives the message
   - Consumer forwards message to all connected clients
4. **Client Update**: Frontend receives WebSocket message and updates local state
5. **UI Re-render**: React re-renders only the changed block

### Channel Layer

- **Development**: `InMemoryChannelLayer` (single process, no Redis needed)
- **Production**: `RedisChannelLayer` (required for multiple workers/instances)

---

## ⚖️ Trade-offs & Decisions

### Architecture Choices

1. **In-Memory Channel Layer (Dev)**: 
   - ✅ Simple setup, no Redis needed locally
   - ❌ Only works with single worker
   - **Production**: Use Redis for scalability

2. **SQLite Database**:
   - ✅ Zero configuration, perfect for development
   - ❌ Not ideal for high-traffic production
   - **Production**: Use PostgreSQL for better performance

3. **No User Authentication**:
   - ✅ Simple, no login barriers
   - ✅ Quick to start playing
   - ❌ No persistent user accounts
   - **Future**: Add optional OAuth/login

4. **Full Grid Load**:
   - ✅ Simple implementation
   - ✅ Works well for 30x30 (900 blocks)
   - ❌ May be slow for very large grids (1000x1000+)
   - **Future**: Pagination or viewport-based loading

5. **Cooldown vs. Lock Forever**:
   - ✅ Cooldown allows re-capture after time
   - ✅ More dynamic gameplay
   - **Alternative**: Permanent ownership (simpler but less interactive)

6. **Single Channel Group**:
   - ✅ All users see all updates
   - ✅ Simple implementation
   - **Future**: Room-based channels for multiple grids

---

## 🎨 Features Implemented

- ✅ Real-time block capture with WebSocket updates
- ✅ User nickname and color customization
- ✅ 10-second cooldown/lock time on blocks
- ✅ Leaderboard showing top players
- ✅ Zoom (mouse wheel) and pan (drag) for grid navigation
- ✅ Smooth animations on block capture
- ✅ Responsive UI with dark theme
- ✅ LocalStorage persistence for user preferences

---

## 📚 Documentation

- **[BUILD_GUIDE.md](BUILD_GUIDE.md)**: Complete step-by-step guide to build from scratch
- **[BONUS_FEATURES_GUIDE.md](BONUS_FEATURES_GUIDE.md)**: Instructions for adding bonus features
- **[DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)**: Deployment instructions for GitHub and hosting

---

## 🤝 Contributing

Contributions welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Built with Django Channels for real-time WebSocket support
- React + Vite for fast frontend development
- Inspired by collaborative pixel art projects like r/place

---

## 📧 Contact

**GitHub**: [YOUR_GITHUB_USERNAME](https://github.com/YOUR_GITHUB_USERNAME)

**Project Link**: [YOUR_GITHUB_REPO_LINK](YOUR_GITHUB_REPO_LINK)

---

**Made with ❤️ for real-time collaboration**
