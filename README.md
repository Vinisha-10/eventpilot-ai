# 🚀 EventPilot AI — AI-Powered Event Management Platform

<div align="center">

**Plan, organize, and manage events with AI superpowers.**

Built with Next.js • FastAPI • Supabase • Google Gemini AI

</div>

---

## ✨ Features

### 🤖 AI Agents
| Agent | Capabilities |
|-------|-------------|
| **Planner** | Timeline, checklist, milestones, reminders |
| **Budget** | Expense tracking, optimization, forecasting |
| **Vendor** | Nearby search, ranking, recommendations |
| **Guest** | Invitations, RSVPs, QR tickets, seating plans |
| **Marketing** | Social posts, email campaigns, descriptions |
| **Schedule** | Daily schedules, speaker timelines, reminders |
| **Chat** | Natural language queries with tool calling |

### 📋 Supported Events
Weddings • Birthday Parties • College Festivals • Corporate Events • Conferences • Workshops • Exhibitions • Music Shows • Community Events

### 🎨 UI Features
- Modern glassmorphism dark mode design
- Responsive mobile-first layout
- Animated transitions (Framer Motion)
- Interactive charts (Chart.js)
- Kanban task board
- AI chat interface

---

## 🏗️ Architecture

```
eventpilot/
├── frontend/          # Next.js 14 + TypeScript + Tailwind CSS
├── backend/           # FastAPI + Python AI Agents
├── database/          # Supabase PostgreSQL schema
├── docker-compose.yml # Docker deployment
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- A free [Supabase](https://supabase.com) account
- A free [Gemini API key](https://aistudio.google.com/apikey)

### 1. Clone and Setup

```bash
cd eventpilot
```

### 2. Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Copy and run the contents of `database/schema.sql`
4. Note your Project URL and anon key from **Settings → API**

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase URL, keys, and Gemini API key

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:3000`

### 5. Docker (Alternative)

```bash
# Copy and configure env files first
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Start everything
docker-compose up --build
```

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `HUGGINGFACE_API_KEY` | ❌ | HuggingFace API key (fallback) |
| `RESEND_API_KEY` | ❌ | Resend email API key |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |

---

## 📡 API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Login |
| `/api/events/` | GET/POST | List/Create events |
| `/api/events/{id}` | GET/PATCH/DELETE | Event CRUD |
| `/api/events/{id}/generate-plan` | POST | AI plan generation |
| `/api/events/{id}/dashboard` | GET | Dashboard stats |
| `/api/guests/{event_id}` | GET/POST | Guest management |
| `/api/guests/{event_id}/invite` | POST | Send invitations |
| `/api/budget/{event_id}` | GET/POST | Budget items |
| `/api/budget/{event_id}/insights` | GET | AI budget analysis |
| `/api/vendors/{event_id}` | GET/POST | Vendor management |
| `/api/vendors/search/nearby` | POST | Nearby vendor search |
| `/api/tasks/{event_id}` | GET/POST | Task management |
| `/api/marketing/generate` | POST | AI content generation |
| `/api/schedule/generate` | POST | AI schedule generation |
| `/api/chat/message` | POST | AI chat |

---

## 🌐 Free APIs Used

| Service | API | Purpose |
|---------|-----|---------|
| AI | Google Gemini (free tier) | All AI agent operations |
| AI Fallback | HuggingFace Inference | Backup AI provider |
| Database | Supabase (free tier) | PostgreSQL + Auth + Storage |
| Maps | OpenStreetMap / Nominatim | Geocoding + venue search |
| Weather | Open-Meteo | Event-day weather forecasts |
| Email | Resend (free tier) | Invitation emails |
| QR Codes | Python qrcode library | Guest tickets |
| PDF | ReportLab | Invoice generation |
| Video | Jitsi Meet | Meeting link generation |
| Charts | Chart.js | Dashboard visualizations |

---

## 🚀 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import in Vercel
3. Set environment variables
4. Deploy

### Backend → Render
1. Push to GitHub
2. Create new Web Service in Render
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables
6. Deploy

---

## 📄 License

MIT License — Built with ❤️ and AI
