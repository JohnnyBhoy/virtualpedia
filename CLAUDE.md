You are a senior MERN stack developer. Build me a complete full-stack web application called "VirtualPedia" — a pediatric clinic booking and child health platform. Follow every step below completely without skipping anything.

---

## TECH STACK

- Frontend: React (Vite), React Router v6, Axios, TailwindCSS
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT, bcryptjs, Google OAuth (passport-google-oauth20)
- File Upload: Multer
- Email: Nodemailer
- Others: dotenv, cors, morgan, express-validator

---

## STEP 1 — PROJECT SETUP

Create the following folder structure:
virtualpedia/
├── client/ # React frontend
└── server/ # Node/Express backend

### Backend Setup

1. Inside /server run: npm init -y
2. Install: express mongoose dotenv cors bcryptjs jsonwebtoken passport passport-google-oauth20 passport-jwt multer nodemailer express-validator morgan
3. Install dev deps: nodemon

### Frontend Setup

1. Inside /client run: npm create vite@latest . -- --template react
2. Install: axios react-router-dom react-hook-form @hookform/resolvers yup tailwindcss postcss autoprefixer react-toastify react-icons date-fns
3. Init Tailwind

---

## STEP 2 — ENVIRONMENT VARIABLES

Create /server/.env with:
PORT=5000
MONGO_URI=mongodb://localhost:27017/virtualpedia
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
NODE_ENV=development

---

## STEP 3 — BACKEND: SERVER ENTRY POINT

Create /server/server.js:

- Initialize express app
- Connect to MongoDB using mongoose
- Use cors (allow http://localhost:5173)
- Use express.json()
- Use morgan for logging
- Mount routes:
  - /api/auth
  - /api/admin
  - /api/pediatrician
  - /api/customer
  - /api/appointments
- Start server on PORT from .env

---

## STEP 4 — BACKEND: DATABASE CONNECTION

Create /server/config/db.js:

- Export async function connectDB()
- mongoose.connect(process.env.MONGO_URI)
- Log success or error

---

## STEP 5 — BACKEND: MODELS

### User Model (/server/models/User.js)

Fields:

- name: String, required
- email: String, required, unique
- password: String (not required for Google OAuth)
- googleId: String
- role: String enum ['admin', 'customer', 'pediatrician'], default 'customer'
- profilePhoto: String
- isActive: Boolean, default true
- createdAt: Date, default Date.now

Pre-save hook: hash password with bcryptjs if modified
Method: comparePassword(candidatePassword)

### PediatricianProfile Model (/server/models/PediatricianProfile.js)

Fields:

- userId: ObjectId ref User, required, unique
- licenseNumber: String, required
- specialization: String, required
- clinicName: String, required
- clinicAddress: String, required
- contactNumber: String
- bio: String
- profilePhoto: String
- isVerified: Boolean, default false
- rating: Number, default 0
- totalReviews: Number, default 0
- createdAt: Date, default Date.now

### Schedule Model (/server/models/Schedule.js)

Fields:

- pediatricianId: ObjectId ref User, required
- date: Date, required
- startTime: String, required (e.g. "09:00")
- endTime: String, required
- slotDurationMinutes: Number, default 30
- maxPatients: Number, default 10
- isAvailable: Boolean, default true
- createdAt: Date, default Date.now

### Appointment Model (/server/models/Appointment.js)

Fields:

- customerId: ObjectId ref User, required
- pediatricianId: ObjectId ref User, required
- scheduleId: ObjectId ref Schedule, required
- childName: String, required
- childAge: Number, required
- childGender: String enum ['male', 'female']
- concern: String, required
- appointmentDate: Date, required
- timeSlot: String, required
- status: String enum ['pending', 'approved', 'rejected', 'completed', 'cancelled'], default 'pending'
- notes: String
- createdAt: Date, default Date.now

### Review Model (/server/models/Review.js)

Fields:

- customerId: ObjectId ref User, required
- pediatricianId: ObjectId ref User, required
- appointmentId: ObjectId ref Appointment, required
- rating: Number min 1 max 5, required
- comment: String
- createdAt: Date, default Date.now

---

## STEP 6 — BACKEND: MIDDLEWARE

### Auth Middleware (/server/middleware/auth.js)

- verifyToken: checks Authorization header, verifies JWT, attaches user to req
- requireRole(...roles): checks req.user.role is in allowed roles

### Error Middleware (/server/middleware/error.js)

- Global error handler
- Returns { success: false, message } with appropriate status code

### Upload Middleware (/server/middleware/upload.js)

- Configure multer for profile photo uploads
- Store in /server/uploads/profiles/
- Accept only images
- Max size 5MB

---

## STEP 7 — BACKEND: AUTH ROUTES & CONTROLLERS

Create /server/routes/auth.js and /server/controllers/authController.js

### Endpoints:

**POST /api/auth/register**

- Validate: name, email, password (min 6 chars), role (customer or pediatrician)
- Check if email exists
- Create user
- If role is pediatrician, create empty PediatricianProfile
- Return JWT token + user object

**POST /api/auth/login**

- Validate: email, password
- Find user by email
- Compare password
- Return JWT token + user object

**GET /api/auth/google**

- Passport Google OAuth redirect

**GET /api/auth/google/callback**

- Handle Google callback
- Create user if doesn't exist (role defaults to customer)
- Redirect to frontend with token: http://localhost:5173/oauth-success?token=JWT

**GET /api/auth/me**

- Protected route (verifyToken)
- Return current user data

---

## STEP 8 — BACKEND: ADMIN ROUTES & CONTROLLERS

Create /server/routes/admin.js and /server/controllers/adminController.js
All routes protected with verifyToken + requireRole('admin')

### Endpoints:

**GET /api/admin/users** — get all users with pagination
**GET /api/admin/users/:id** — get single user
**PUT /api/admin/users/:id/status** — activate/deactivate user
**DELETE /api/admin/users/:id** — delete user

**GET /api/admin/pediatricians** — get all pediatricians (verified and unverified)
**PUT /api/admin/pediatricians/:id/verify** — verify or unverify a pediatrician account
**GET /api/admin/appointments** — get all appointments with filters (status, date)
**GET /api/admin/stats** — return counts: total users, total pediatricians, total appointments, pending appointments

---

## STEP 9 — BACKEND: PEDIATRICIAN ROUTES & CONTROLLERS

Create /server/routes/pediatrician.js and /server/controllers/pediatricianController.js
All routes protected with verifyToken + requireRole('pediatrician')

### Endpoints:

**GET /api/pediatrician/profile** — get own profile
**PUT /api/pediatrician/profile** — update profile (licenseNumber, specialization, clinicName, clinicAddress, contactNumber, bio)
**POST /api/pediatrician/profile/photo** — upload profile photo (multer)

**GET /api/pediatrician/schedules** — get own schedules
**POST /api/pediatrician/schedules** — create schedule (date, startTime, endTime, slotDurationMinutes, maxPatients)
**PUT /api/pediatrician/schedules/:id** — update schedule
**DELETE /api/pediatrician/schedules/:id** — delete schedule

**GET /api/pediatrician/appointments** — get all appointments for this pediatrician
**PUT /api/pediatrician/appointments/:id/status** — approve, reject, complete appointment

---

## STEP 10 — BACKEND: CUSTOMER ROUTES & CONTROLLERS

Create /server/routes/customer.js and /server/controllers/customerController.js
All routes protected with verifyToken + requireRole('customer')

### Endpoints:

**GET /api/customer/pediatricians** — list all verified pediatricians (public info + rating)
**GET /api/customer/pediatricians/:id** — get single pediatrician profile + schedules
**GET /api/customer/pediatricians/:id/schedules** — get available schedules for a pediatrician

**GET /api/customer/appointments** — get own appointment history
**POST /api/customer/appointments** — book appointment (pediatricianId, scheduleId, childName, childAge, childGender, concern, appointmentDate, timeSlot)
**PUT /api/customer/appointments/:id/cancel** — cancel own appointment

**POST /api/customer/reviews** — submit review after completed appointment
**GET /api/customer/profile** — get own profile
**PUT /api/customer/profile** — update own profile

---

## STEP 11 — BACKEND: EMAIL NOTIFICATIONS

Create /server/utils/emailService.js

- Configure nodemailer with Gmail
- Create functions:
  - sendBookingConfirmation(customerEmail, appointmentDetails)
  - sendAppointmentStatusUpdate(customerEmail, status, appointmentDetails)
  - sendWelcomeEmail(email, name)
- Call these in the appropriate controllers

---

## STEP 12 — FRONTEND: FOLDER STRUCTURE

Organize /client/src as:
src/
├── api/ # axios instance + api calls
├── components/
│ ├── common/ # Navbar, Footer, Loader, ProtectedRoute
│ ├── admin/
│ ├── pediatrician/
│ └── customer/
├── context/
│ └── AuthContext.jsx
├── hooks/
│ └── useAuth.js
├── pages/
│ ├── Home.jsx
│ ├── Login.jsx
│ ├── Register.jsx
│ ├── OAuthSuccess.jsx
│ ├── admin/
│ │ ├── AdminDashboard.jsx
│ │ ├── ManageUsers.jsx
│ │ ├── ManagePediatricians.jsx
│ │ └── ManageAppointments.jsx
│ ├── pediatrician/
│ │ ├── PedDashboard.jsx
│ │ ├── PedProfile.jsx
│ │ ├── PedSchedules.jsx
│ │ └── PedAppointments.jsx
│ └── customer/
│ ├── CustomerDashboard.jsx
│ ├── FindPediatrician.jsx
│ ├── PediatricianDetail.jsx
│ ├── BookAppointment.jsx
│ └── MyAppointments.jsx
├── utils/
│ └── helpers.js
├── App.jsx
└── main.jsx

---

## STEP 13 — FRONTEND: AXIOS INSTANCE & API

Create /client/src/api/axios.js:

- Base URL: http://localhost:5000/api
- Request interceptor: attach JWT token from localStorage to Authorization header
- Response interceptor: if 401, clear token and redirect to login

Create /client/src/api/authApi.js — functions: register, login, getMe
Create /client/src/api/adminApi.js — functions: getUsers, updateUserStatus, deleteUser, getPediatricians, verifyPediatrician, getAppointments, getStats
Create /client/src/api/pediatricianApi.js — functions: getProfile, updateProfile, uploadPhoto, getSchedules, createSchedule, updateSchedule, deleteSchedule, getAppointments, updateAppointmentStatus
Create /client/src/api/customerApi.js — functions: getPediatricians, getPediatricianById, getSchedules, getAppointments, bookAppointment, cancelAppointment, submitReview, getProfile, updateProfile

---

## STEP 14 — FRONTEND: AUTH CONTEXT

Create /client/src/context/AuthContext.jsx:

- State: user, token, loading
- On mount: read token from localStorage, call getMe to restore session
- Functions: login(token, user), logout(), updateUser(user)
- Export useAuth() hook

---

## STEP 15 — FRONTEND: APP.JSX ROUTING

Set up React Router v6 with these routes:

Public:

- / → Home
- /login → Login
- /register → Register
- /oauth-success → OAuthSuccess (reads token from URL, saves to localStorage)

Protected (ProtectedRoute component that checks auth + role):

- /admin/\* → AdminDashboard layout with nested:
  - /admin → stats overview
  - /admin/users → ManageUsers
  - /admin/pediatricians → ManagePediatricians
  - /admin/appointments → ManageAppointments
- /pediatrician/\* → PedDashboard layout with nested:
  - /pediatrician → overview
  - /pediatrician/profile → PedProfile
  - /pediatrician/schedules → PedSchedules
  - /pediatrician/appointments → PedAppointments
- /customer/\* → CustomerDashboard layout with nested:
  - /customer → overview
  - /customer/find → FindPediatrician
  - /customer/pediatrician/:id → PediatricianDetail
  - /customer/book/:id → BookAppointment
  - /customer/appointments → MyAppointments

---

## STEP 16 — FRONTEND: PAGES & COMPONENTS

Build all pages with TailwindCSS. Use clean, modern UI with a blue and white color scheme.

### Home.jsx

- Hero section: "Find the Best Pediatrician for Your Child"
- CTA buttons: Get Started, Find a Doctor
- Features section: icons explaining the app
- How it works section (3 steps)
- Navbar with Login / Register buttons

### Login.jsx

- Email + password form (react-hook-form + yup validation)
- Google Sign In button (links to /api/auth/google)
- Link to register

### Register.jsx

- Name, email, password, confirm password fields
- Role selection: Parent/Customer or Pediatrician
- Google Sign Up button
- Link to login

### OAuthSuccess.jsx

- On mount: get token from URL params, save to localStorage, call getMe, redirect by role

### AdminDashboard

- Sidebar navigation
- Stats cards (total users, pedia, appointments)
- Tables for users with activate/deactivate/delete actions
- Verify/unverify pediatrician toggle
- Appointments list with filters

### PedDashboard

- Sidebar navigation
- Profile form with all pedia fields + photo upload
- Schedule manager: calendar or list view, add/edit/delete time slots
- Appointments list: approve / reject / complete buttons, show patient info

### CustomerDashboard

- Sidebar navigation
- Find Pediatrician page: search by name or specialization, cards with photo, rating, clinic
- Pediatrician detail page: profile, schedule list
- Book Appointment form: select schedule + time slot, fill child info and concern
- My Appointments: list with status badges, cancel button, review button for completed

---

## STEP 17 — BACKEND: SEED ADMIN USER

Create /server/seeders/adminSeeder.js:

- Create one admin user: admin@virtualpedia.com / Admin@123
- Role: admin
- Run with: node seeders/adminSeeder.js

---

## STEP 18 — SCRIPTS

### /server/package.json scripts:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seeders/adminSeeder.js"
}
```

### /client/package.json scripts (already from vite):

```json
"scripts": {
  "dev": "vite",
  "build": "vite build"
}
```

---

## STEP 19 — README

Create /README.md with:

- Project description
- Setup instructions (clone, install deps, configure .env, seed admin, run dev)
- List all roles and credentials
- API endpoints summary

---

## FINAL INSTRUCTIONS FOR YOU (Claude Code):

1. Create every single file listed above — do not skip any
2. Every API function must have proper error handling with try/catch
3. All protected routes must check JWT and role
4. Frontend must show loading states and toast notifications (react-toastify) for all actions
5. All forms must have validation
6. Make sure CORS is properly configured
7. Use consistent response format: { success: true/false, data: {}, message: "" }
8. After creating all files, show me the commands to install all dependencies and run the project

How to use this in Claude Code (VS Code):

Open VS Code
Install the Claude Code extension if you haven't yet
Open a new empty folder called virtualpedia
Open Claude Code (Ctrl+Shift+P → Claude Code)
Paste the entire prompt above
Let it generate — it will create all files step by step
Once done, run:

bash# Terminal 1 - Backend
cd server && npm install && npm run seed && npm run dev

# Terminal 2 - Frontend

cd client && npm install && npm run dev
