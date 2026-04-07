You are a senior full-stack TypeScript developer. Your job is to build
"VirtualPedia" from scratch — a web app where mothers log in with Google
and chat in realtime with an AI Pediatrician called "Dr. Pedia" powered
by OpenAI streaming API. There is also an Admin dashboard to manage users.

Read this entire file before writing a single line of code.
Follow every instruction in order. Do not skip any step.

---

## OVERVIEW

VirtualPedia has two account types:

1. Parent Account
   - Signs in with Google only (no manual registration)
   - Lands on a beautiful landing page
   - After login, goes directly to the AI chat with Dr. Pedia
   - Can view and clear their own chat history
   - Can update their profile (name, avatar)

2. Admin Account
   - Logs in with email and password (no Google)
   - Has a full dashboard to manage the app
   - Can view all registered parents and their details
   - Can activate or deactivate parent accounts
   - Can view total stats: users, chats, messages
   - Can view any parent's chat history (read-only)
   - Cannot chat with Dr. Pedia

---

## TECH STACK

- Frontend: React 18, TypeScript, Vite, TailwindCSS, React Router v6
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB with Mongoose
- Auth: Google OAuth 2.0 (parents) + JWT email/password (admin)
- AI: OpenAI API using gpt-4o with token streaming
- Realtime: Server-Sent Events (SSE) for streaming AI responses
- Forms: React Hook Form + Zod validation
- Notifications: React Toastify
- HTTP: Axios with interceptors

---

## PROJECT STRUCTURE

Create this exact folder layout before writing any code:

```
virtualpedia/
├── client/                  # React TypeScript frontend
│   └── src/
│       ├── api/             # All API call functions
│       ├── components/
│       │   ├── common/      # Navbar, Loader, ProtectedRoute
│       │   ├── chat/        # Chat UI components
│       │   └── admin/       # Admin dashboard components
│       ├── context/         # AuthContext
│       ├── hooks/           # Custom hooks
│       ├── pages/
│       │   ├── LandingPage
│       │   ├── OAuthSuccess
│       │   ├── ChatPage
│       │   └── admin/       # All admin pages
│       ├── types/           # TypeScript interfaces
│       └── utils/           # Helper functions
│
└── server/                  # Node Express TypeScript backend
    └── src/
        ├── config/          # DB, Passport, OpenAI config
        ├── controllers/     # Auth, Chat, Admin controllers
        ├── middleware/      # JWT auth, role guard, error handler
        ├── models/          # User, ChatHistory, Admin models
        ├── routes/          # Auth, Chat, Admin routes
        ├── types/           # Server TypeScript types
        └── utils/           # OpenAI helper, email (optional)
```

---

## ENVIRONMENT VARIABLES

### /server/.env

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/virtualpedia
JWT_SECRET=replace_with_long_random_secret
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=from_google_cloud_console
GOOGLE_CLIENT_SECRET=from_google_cloud_console
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
ADMIN_SEED_EMAIL=admin@virtualpedia.com
ADMIN_SEED_PASSWORD=Admin@1234
```

### /client/.env

```
VITE_API_URL=http://localhost:5000/api
VITE_SERVER_URL=http://localhost:5000
```

---

## DATABASE MODELS

### User (Parents only)

- googleId — String, required, unique
- name — String, required
- email — String, required, unique
- avatar — String (from Google)
- isActive — Boolean, default true
- createdAt — Date

### Admin

- name — String, required
- email — String, required, unique
- password — String, hashed with bcryptjs, required
- role — String, fixed value "admin"
- createdAt — Date
- Pre-save hook: hash password if modified
- Method: comparePassword(candidate)

### ChatHistory (one per parent user)

- userId — ref to User, unique
- messages — array of:
  - role: "user" or "assistant"
  - content: String
  - timestamp: Date
- timestamps: true (createdAt, updatedAt)

---

## BACKEND INSTRUCTIONS

### Server Entry Point

- Load env vars with dotenv
- Connect MongoDB
- Initialize passport
- Apply CORS for CLIENT_URL
- Parse JSON body
- Use morgan for dev logging
- Mount all routes under /api
- Serve a health check at GET /api/health
- Global error handler as last middleware

### Auth Routes — /api/auth

GET /api/auth/google

- Redirect to Google OAuth with scope: profile, email
- Session: false

GET /api/auth/google/callback

- On success: sign a JWT, redirect to CLIENT_URL/oauth-success?token=JWT
- On fail: redirect to CLIENT_URL?error=auth_failed

POST /api/auth/admin/login

- Body: email, password
- Find admin by email
- Compare password with bcrypt
- Return JWT + admin object { id, name, email, role }
- Return 401 if credentials are wrong

GET /api/auth/me

- Protected: verifyToken
- Return the current logged-in user or admin

POST /api/auth/logout

- Protected: verifyToken
- Return success message

### Chat Routes — /api/chat

All routes: verifyToken + requireRole("parent")

POST /api/chat/message

- Body: { message: string }
- Find or create ChatHistory for this user
- Append user message to history
- Build last 20 messages as context for OpenAI
- Call OpenAI gpt-4o with streaming enabled
- Use Server-Sent Events (SSE) to stream tokens back to client:
  - Set headers: Content-Type: text/event-stream, Cache-Control: no-cache
  - Send each token chunk as: data: {"content":"...","done":false}
  - When done send: data: {"content":"","done":true}
- After stream ends, save complete assistant message to ChatHistory
- Handle client disconnect gracefully

GET /api/chat/history

- Return all messages in this user's ChatHistory
- Return empty array if no history yet

DELETE /api/chat/history

- Delete all messages in this user's ChatHistory
- Return success message

### Admin Routes — /api/admin

All routes: verifyToken + requireRole("admin")

GET /api/admin/stats

- Return: { totalUsers, activeUsers, inactiveUsers, totalChats, totalMessages }

GET /api/admin/users

- Return all parent users with pagination
- Query params: page (default 1), limit (default 10), search (by name or email)
- Return: { users, total, page, totalPages }

GET /api/admin/users/:id

- Return single user details

PUT /api/admin/users/:id/status

- Body: { isActive: boolean }
- Toggle user active/inactive
- Return updated user

GET /api/admin/users/:id/chat

- Return full chat history of a specific parent user (read-only)

### Middleware

verifyToken

- Read Authorization: Bearer <token> header
- Verify JWT, get decoded { id, role }
- If role is "admin": find in Admin collection
- If role is "parent": find in User collection
- Attach user to req.user
- Return 401 if invalid or missing

requireRole(...roles)

- Check req.user.role is in the allowed roles array
- Return 403 if not allowed

errorHandler

- Global error middleware
- Return { success: false, message } with proper status code

### Admin Seeder

Create /server/src/seeders/adminSeeder.ts

- Check if admin already exists by email from .env
- If not, create admin with hashed password
- Log success or skip message
- Add a seed script to package.json: "seed": "ts-node src/seeders/adminSeeder.ts"

### OpenAI Config

- Initialize OpenAI client with OPENAI_API_KEY
- Model: gpt-4o
- Streaming: true
- Max tokens: 1024

### Dr. Pedia System Prompt

Use this exact system prompt for every OpenAI call:

"You are Dr. Pedia, a warm, caring, and knowledgeable AI Pediatrician
assistant on the VirtualPedia platform. You help mothers and parents with
questions about their children's health, development, nutrition, and
wellbeing.

Your personality:

- Warm, empathetic, and reassuring like a trusted family doctor
- Address parents kindly, e.g. Hi Mama! or Hi there!
- Use simple clear language, avoid heavy medical jargon
- Always acknowledge the parent's concern before giving advice

Your expertise:

- Common childhood illnesses: fever, cough, colds, rashes, ear infections
- Vaccination schedules and their importance
- Growth and developmental milestones by age
- Newborn care: feeding, sleeping, diaper rash
- Breastfeeding and formula feeding
- Introducing solid foods and child nutrition
- Sleep habits and sleep training
- Child safety and accident prevention
- When to go to the ER vs manage at home
- Teething, toilet training, and common parenting concerns

Critical rules:

- Always end serious discussions with: Please consult your actual
  pediatrician for proper diagnosis and treatment.
- Never diagnose with 100% certainty
- For life-threatening symptoms always say: Please go to the nearest
  emergency room immediately.
- On the very first message greet warmly: Hi Mama! I am Dr. Pedia,
  your AI pediatrician. How can I help your little one today?
- You are a support assistant, not a replacement for real medical care."

---

## FRONTEND INSTRUCTIONS

### Axios Instance

- baseURL from VITE_API_URL
- Request interceptor: read token from localStorage key vp_token,
  attach as Authorization: Bearer <token>
- Response interceptor: if 401, remove token, redirect to /

### Auth Context

- State: user (null), role (null), loading (true)
- On mount: if token in localStorage, call GET /api/auth/me to restore session
- login(token): save to localStorage vp_token, call getMe, set user + role
- logout(): remove token, call POST /api/auth/logout, clear state, redirect to /
- Export useAuth() hook

### Routing (App.tsx)

Public routes:

- / — LandingPage
- /oauth-success — OAuthSuccess
- /admin/login — AdminLogin

Protected routes (parent only):

- /chat — ChatPage

Protected routes (admin only):

- /admin — AdminDashboard
- /admin/users — ManageUsers
- /admin/users/:id — UserDetail

ProtectedRoute component:

- If loading: show full-page spinner
- If no user: redirect to /
- If wrong role: redirect to /

---

## PAGE INSTRUCTIONS

### LandingPage

Design a beautiful, modern, medical-themed landing page.

Sections:

1. Navbar — Logo (stethoscope icon + VirtualPedia text), no login button
2. Hero — Large headline: Your Child's Health, Just a Message Away
   Subtext: Talk to Dr. Pedia — your AI pediatrician available 24/7
   One button: Sign in with Google (styled with Google colors and icon)
   Clicking this button navigates to: VITE_SERVER_URL/api/auth/google
3. Features — 3 cards: Available 24/7, Expert AI Knowledge, Private and Secure
4. How it Works — 3 steps: Sign in, Ask your question, Get caring advice
5. Footer — VirtualPedia is not a substitute for professional medical care

Design rules:

- Color scheme: white background, blue accent (#2563EB)
- Clean, soft shadows, rounded cards
- Professional medical feel
- Fully responsive for mobile

### OAuthSuccess Page

- On mount: read ?token= from URL search params
- If token found: call login(token) from AuthContext
- Show a centered loading spinner while processing
- After login completes: navigate to /chat
- If no token: navigate to / and show error toast

### ChatPage (Main Feature)

Layout (full viewport height, no scroll on outer):

- Top: fixed Navbar with logo, user avatar, and logout button
- Below navbar: Dr. Pedia header card showing avatar, name, and Online status
- Middle: scrollable messages area (flex-1, overflow-y-auto)
- Bottom: fixed input bar with textarea and send button

Features:

- On mount: call GET /api/chat/history to load previous messages
- If no messages: show a centered welcome card with Dr. Pedia avatar
  and text Ask me anything about your child's health
- Use SSE (EventSource or fetch with ReadableStream) to receive
  streaming tokens from POST /api/chat/message
- Show each token appended in realtime to the current assistant bubble
  as it arrives — do not wait for the full response
- Show TypingIndicator (animated 3 dots) only before the first token arrives
- Auto-scroll to bottom on every new token and new message
- Disable input while streaming is in progress
- Press Enter to send, Shift+Enter for new line
- Clear chat button with a confirmation dialog before clearing
- Show timestamps on each message bubble
- User messages: right-aligned, blue bubble
- Dr. Pedia messages: left-aligned, white card with soft shadow and
  a small stethoscope icon

### AdminLogin Page

- Email and password form
- Validate with React Hook Form + Zod
- On submit: POST /api/auth/admin/login
- On success: login(token), navigate to /admin
- Show error toast on wrong credentials
- No Google sign in option on this page

### AdminDashboard (layout with sidebar)

Sidebar links: Dashboard, Users, Logout

Dashboard page (/admin):

- 4 stat cards: Total Parents, Active, Inactive, Total Messages
- Recent users table showing last 5 registered parents
- Each row: avatar, name, email, status badge, joined date

ManageUsers page (/admin/users):

- Search bar to filter by name or email
- Table with columns: avatar, name, email, status, joined date, actions
- Actions: View button, Toggle active/inactive button
- Pagination controls
- Status badge: green for active, red for inactive

UserDetail page (/admin/users/:id):

- Parent profile card: avatar, name, email, status, joined date
- Toggle active/inactive button
- Full chat history displayed below (read-only, same bubble style as ChatPage)
- Back button to return to users list

---

## UI & DESIGN RULES

Apply these rules to every page and component:

- TailwindCSS only, no inline styles, no external CSS files
- Fully responsive: mobile first, works on phones and desktop
- Color palette: primary blue #2563EB, white backgrounds, gray-100 surfaces
- Font: use Tailwind default sans, clean and readable
- Every button must have a hover state and disabled state
- Every form field must show validation errors inline
- Every async action must show a loading state
- Every error must show a toast notification via React Toastify
- Smooth transitions on route changes and modal opens
- All avatars use Google profile photo with a fallback initials circle
- No page should ever show a blank white screen — always show a loader

---

## SCRIPTS & COMMANDS

### Server package.json scripts:

```
dev:   nodemon --exec ts-node src/server.ts
build: tsc
start: node dist/server.js
seed:  ts-node src/seeders/adminSeeder.ts
```

### Client package.json scripts:

```
dev:   vite
build: vite build
```

### Commands to run after all files are created:

```
# Terminal 1 — seed admin then start backend
cd server
npm install
npm run seed
npm run dev

# Terminal 2 — start frontend
cd client
npm install
npm run dev
```

---

## README.md

Create a README.md at the project root with:

- Project description and purpose
- Screenshot placeholder section
- Prerequisites: Node 18+, MongoDB, Google OAuth credentials, OpenAI API key
- Step by step setup instructions
- How to get Google OAuth credentials (link: console.cloud.google.com)
- How to get OpenAI API key (link: platform.openai.com)
- All environment variables explained
- Default admin credentials: admin@virtualpedia.com / Admin@1234
- Available routes listed for both roles
- Tech stack summary

---

## FINAL CHECKLIST FOR CLAUDE CODE

Before finishing, verify every item below is complete:

- [ ] All folders and files created exactly as specified
- [ ] TypeScript compiles with no errors on both client and server
- [ ] Google OAuth flow works: login → redirect → token → /chat
- [ ] Admin email/password login works and redirects to /admin
- [ ] Admin seeder creates the admin user when npm run seed is run
- [ ] OpenAI streaming works: tokens appear one by one in the chat bubble
- [ ] SSE connection closes cleanly when client disconnects
- [ ] Chat history is saved to MongoDB after each exchange
- [ ] Admin can see all users and toggle their active status
- [ ] Admin can read any parent's chat history
- [ ] ProtectedRoute blocks wrong roles and redirects correctly
- [ ] All forms have validation with inline error messages
- [ ] All async actions have loading states
- [ ] All errors show toast notifications
- [ ] App is fully responsive on mobile and desktop
- [ ] README.md is complete with all setup instructions
- [ ] .env files are listed in .gitignore
- [ ] No hardcoded secrets anywhere in the codebase

```

---

**How to use this:**

1. Create an empty folder called `virtualpedia`
2. Open it in VS Code
3. Save the above as `CLAUDE.md` in the root
4. Open Claude Code (`Ctrl+Shift+P` → Claude Code)
5. Type: `Read CLAUDE.md and build the entire VirtualPedia app following every instruction`
6. Let it run — it will build everything file by file
```
