# VirtualPedia — AI Pediatrician Chat Platform

A full-stack TypeScript web application where parents sign in with Google and chat in real-time with **Dr. Pedia** — an AI pediatrician powered by OpenAI GPT-4o with token streaming.

---

## Screenshots

> _Add screenshots here after setup_

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** running locally (`mongodb://localhost:27017`)
- **Google OAuth credentials** — [console.cloud.google.com](https://console.cloud.google.com)
- **OpenAI API key** — [platform.openai.com](https://platform.openai.com)

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd virtualpedia
```

### 2. Configure the backend environment

Edit `server/.env` and fill in your credentials:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/virtualpedia
JWT_SECRET=replace_with_long_random_secret_here
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
ADMIN_SEED_EMAIL=admin@virtualpedia.com
ADMIN_SEED_PASSWORD=Admin@1234
```

### 3. Configure the frontend environment

`client/.env` (already set for local development):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

### 4. Install & start the backend

```bash
cd server
npm install
npm run seed      # Creates admin@virtualpedia.com / Admin@1234
npm run dev       # Starts on http://localhost:5000
```

### 5. Install & start the frontend

```bash
# In a new terminal
cd client
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## How to get Google OAuth credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Set Application type to **Web application**
6. Add Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** into `server/.env`

---

## How to get OpenAI API key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in and navigate to **API Keys**
3. Click **Create new secret key**
4. Copy it into `OPENAI_API_KEY` in `server/.env`

---

## Default Credentials

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| Admin | admin@virtualpedia.com | Admin@1234 | http://localhost:5173/admin/login |
| Parent | Google OAuth | — | http://localhost:5173 (Sign in with Google) |

---

## Available Routes

### Parent (Google OAuth)
| Route | Description |
|-------|-------------|
| `/` | Landing page with Google sign-in |
| `/oauth-success` | OAuth callback handler |
| `/chat` | AI chat with Dr. Pedia (protected) |

### Admin (email/password)
| Route | Description |
|-------|-------------|
| `/admin/login` | Admin login page |
| `/admin` | Dashboard — stats overview |
| `/admin/users` | Manage all parent accounts |
| `/admin/users/:id` | View parent profile + chat history |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/google` | Redirect to Google OAuth |
| GET | `/google/callback` | Handle OAuth callback |
| POST | `/admin/login` | Admin email/password login |
| GET | `/me` | Get current user (JWT) |
| POST | `/logout` | Logout |

### Chat (`/api/chat`) — parent only
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/message` | Send message, stream SSE response |
| GET | `/history` | Get full chat history |
| DELETE | `/history` | Clear chat history |

### Admin (`/api/admin`) — admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | App statistics |
| GET | `/users` | All parents (paginated, searchable) |
| GET | `/users/:id` | Single parent details |
| PUT | `/users/:id/status` | Activate/deactivate parent |
| GET | `/users/:id/chat` | View parent's chat history |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite, TailwindCSS, React Router v6 |
| Forms | React Hook Form + Zod validation |
| HTTP | Axios with JWT interceptors |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | Google OAuth 2.0 (parents) + JWT email/password (admin) |
| AI | OpenAI GPT-4o with token streaming via SSE |
| Notifications | React Toastify |
