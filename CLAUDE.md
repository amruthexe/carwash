# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Car Wash Management System - Full stack application:
- **Framework**: Next.js 16.2.1 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: NextAuth.js (beta) with bcryptjs + Google OAuth
- **Icons**: Lucide React

**Important**: This is a monorepo-style single application with API routes included. No separate backend/frontend directories.

---

## Architecture

### Core Structure (`/src`)

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # REST API endpoints
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   └── worker/assignments/   # Worker assignment API
│   ├── actions/              # Server Actions (React Server Components)
│   ├── admin/                # Admin dashboard pages
│   ├── worker/               # Worker dashboard pages
│   ├── dashboard/            # Customer/user dashboard
│   ├── login/                # Login page
│   ├── register/             # Registration page
│   └── page.tsx              # Landing page
├── components/               # Reusable React components
│   ├── ui/                   # shadcn/ui primitives (button, card, etc.)
│   ├── auth/                 # Auth-related components (SignOutButton, etc.)
│   ├── layout/               # Layout components (Sidebar, Footer, Home, etc.)
│   └── NotificationToast.tsx # Toast notifications
├── lib/                      # Utilities and configurations
│   ├── db.ts                 # MongoDB connection manager
│   └── utils.ts              # Helper functions (cn for class merging)
├── models/                   # Mongoose schemas
│   ├── User.ts               # User model (admin/worker/customer)
│   ├── Vehicle.ts            # Vehicle model
│   ├── Service.ts            # Service requests, assignments, history
│   ├── Payment.ts            # Payment transactions
│   ├── Notification.ts       # User notifications
│   ├── Community.ts          # Community/location data
│   ├── Plan.ts               # Subscription plans
│   └── AuditLog.ts           # System audit logs
└── auth.ts                   # NextAuth instance (handlers, auth, signIn, signOut)
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `Sidebar.tsx`, `SignOutButton.tsx`)
- **Models**: PascalCase with `-model` not appended (e.g., `User.ts`, `Vehicle.ts`)
- **Pages**: `page.tsx` for route segments
- **Layouts**: `layout.tsx` for nested layouts
- **Server Actions**: Lower camelCase (e.g., `registerUser`, `auth.ts` actions)
- **Utilities**: camelCase (e.g., `utils.ts`)

---

## Database Schema

### User (`models/User.ts`)
```typescript
{
  name: string;
  email: string (unique);
  phone?: string;
  role: 'admin' | 'customer' | 'worker';
  password?: string (hashed);
  googleId?: string;
  status: 'active' | 'inactive';
  address?: {
    city: string;
    community: string;
    block: string;
    flatNumber: string;
  };
  timestamps: true
}
```

### Vehicle (`models/Vehicle.ts`)
```typescript
{
  userId: ObjectId (ref: User);
  vehicleNumber: string (unique);
  vehicleModel: string;
  type: 'car' | 'bike';
  status: 'active' | 'inactive';
}
```

### ServiceRequest (`models/Service.ts`)
```typescript
{
  userId: ObjectId (ref: User);
  vehicleId: ObjectId (ref: Vehicle);
  subscriptionId?: ObjectId (ref: Subscription);
  requestedTime: Date;
  scheduledTime: Date; // auto-scheduled = requestedTime + 2 hours
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 
          'cancelled' | 'failed' | 'no_show' | 'rescheduled';
  notes?: string;
  lastModifiedBy?: ObjectId (ref: User);
  lastModifiedAt?: Date;
  statusHistory: Array<{ status, changedBy, changedAt, notes? }>;
}
```

### WorkerAssignment (`models/Service.ts`)
```typescript
{
  requestId: ObjectId (ref: ServiceRequest);
  workerId: ObjectId (ref: User);
  assignedBy: ObjectId (ref: User/admin);
  assignedAt: Date;
  status: 'assigned' | 'accepted' | 'rejected' | 'completed';
}
```

### WorkerAvailability (`models/Service.ts`)
```typescript
{
  workerId: ObjectId (ref: User);
  date: Date;
  isAvailable: boolean;
  maxJobsPerDay: number (default: 5);
}
```

### ServiceHistory (`models/Service.ts`)
```typescript
{
  requestId: ObjectId (ref: ServiceRequest);
  workerId: ObjectId (ref: User);
  completedAt: Date;
  rating?: number (1-5);
  feedback?: string;
}
```

### Payment (`models/Payment.ts`)
```typescript
{
  userId: ObjectId (ref: User);
  subscriptionId?: ObjectId;
  amount: number;
  method: 'upi' | 'card' | 'cash';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
}
```

### AuditLog (`models/AuditLog.ts`)
```typescript
{
  userId: ObjectId (ref: User);
  action: string;
  entityType: string;
  entityId: string;
  changes?: object;
  timestamp: Date;
}
```

---

## Authentication & Authorization

### NextAuth Configuration (`auth.ts` + `auth.config.ts`)

**Providers**:
1. **Google OAuth** - For customer sign-in via Google
2. **Credentials** - For email/password sign-in (roles: admin/worker/customer)

**Mock Test Accounts** (auto-created on first login):
- `customer@test.com` / `customer123` → role: customer
- `admin@test.com` / `admin123` → role: admin
- `worker@test.com` / `worker123` → role: worker

**Callbacks**:
- `signIn`: Auto-registers Google users with role="customer"
- `jwt`: Stores user id and role in token
- `session`: Exposes user id and role to client

**Session Data**: `{ user: { id, name, email, role } }`

### Role-Based Access

- **customer**: Access to `/dashboard` and vehicle management
- **worker**: Access to `/worker` dashboard for assignments
- **admin**: Access to `/admin` dashboard for user/request management

### Protected Routes

- `/dashboard/*` - Requires authenticated user (any role)
- `/admin/*` - Requires admin role (checked in components/UI)
- `/worker/*` - Requires worker role
- API routes under `/api/*` - Use `getServerSession()` for auth checks

---

## API Routes

### Authentication (`/api/auth/*`)
NextAuth.js handles:
- `GET /api/auth/signin` - redirects to `/login`
- `POST /api/auth/callback/credentials` - credentials sign-in
- `POST /api/auth/callback/google` - Google OAuth callback
- `GET /api/auth/signout` - logout

### Worker Assignments (`/api/worker/assignments/`)
**GET** - Fetch worker's assignments (requires worker role)

---

## Server Actions

Located in `src/app/actions/` - React Server Actions for form submissions:

- **`auth.ts`**: `registerUser(formData)` - Creates new customer account
- **`profile.ts`**: 
  - `updateProfile(formData)` - Update user profile/address
  - `addVehicle(formData)` - Add vehicle to user account
  - `deleteVehicle(vehicleId)` - Remove vehicle
- **`admin.ts`**:
  - `assignWorker(requestId, workerId)` - Assign worker to service request
  - `updateServiceStatus(requestId, status, notes?)` - Update service status
  - `getUsers()` - Fetch all users (admin/worker)
  - `updateUserRole(userId, role)` - Change user role
  - `holdUser(userId)` - Block/unblock user
  - `deleteUser(userId)` - Soft delete user
- **`notifications.ts`**: `getUnreadNotifications()` - Fetch user's unread notifications

Actions handle their own database connections via `connectToDatabase()` and return plain objects: `{ success?: boolean, data?: any, error?: string }`.

---

## Common Development Tasks

### First-Time Setup

1. **Clone and install**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Copy `.env` to `.env.local` (already committed with placeholder values for development):
   ```env
   MONGODB_URI=your_mongodb_connection_string
   AUTH_SECRET=openssl rand -base64 32
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   AUTH_URL=http://localhost:3000
   ```
   For local dev, the provided `.env` file contains test credentials and a working MongoDB Atlas URI.

3. **Run development server**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

### Available Scripts

```bash
npm run dev          # Start development server (hot reload)
npm run build        # Create production build in .next/
npm run start        # Start production server
npm run lint         # Run ESLint (eslint-config-next)
```

### Database Operations

- **MongoDB Connection**: `src/lib/db.ts` uses global caching to avoid connection leaks during hot reloads. All API routes and actions must call `await connectToDatabase()` before using models.

- **Models are auto-registered** when imported via `db.ts`. Import from `@/models/*` directly.

### Testing

**No test suite configured yet**. If adding tests:
- Jest/Vitest could be added for unit tests
- React Testing Library for component tests
- Supertest for API route testing
- Consider placing tests alongside files (`*.test.tsx`) or in `__tests__/` directories

### Debugging

- **Check server logs** in terminal running `npm run dev`
- **MongoDB Atlas**: Use the provided connection string in `.env` to access the database directly
- **Next.js Dev Tools**: Built-in with `npm run dev` (React DevTools, etc.)
- **Auth debugging**: Check cookies (`next-auth.session-token`) and server session via `auth()` in pages

---

## Key File Locations

| Feature | Location |
|---------|----------|
| **Database connection** | `src/lib/db.ts` |
| **Mongoose models** | `src/models/*.ts` |
| **Auth configuration** | `src/auth.ts`, `src/auth.config.ts` |
| **API routes** | `src/app/api/**/route.ts` |
| **Server actions** | `src/app/actions/*.ts` |
| **Pages** | `src/app/*/page.tsx` + `src/app/page.tsx` |
| **Layouts** | `src/app/*/layout.tsx` + `src/app/layout.tsx` |
| **UI components** | `src/components/ui/*.tsx` (shadcn/ui) |
| **Feature components** | `src/components/layout/*.tsx`, `src/components/auth/*.tsx` |
| **Global styles** | `src/app/globals.css` (Tailwind + CSS variables) |
| **TypeScript config** | `tsconfig.json` (path alias: `@/*` → `src/*`) |
| **ESLint config** | `eslint.config.mjs` (based on `eslint-config-next`) |

---

## Routing Structure

**Public**:
- `/` - Landing page (Home)
- `/login` - Sign in
- `/register` - Create account

**Protected** (require authentication):
- `/dashboard` - Customer dashboard (default redirect for logged-in users)
  - `/dashboard/vehicles` - Manage vehicles
  - `/dashboard/book` - Book a service
  - `/dashboard/profile` - Edit profile/address
  - `/dashboard/complete-profile` - Complete profile setup
  - `/dashboard/subscription` - Subscription plans
- `/admin` - Admin dashboard
  - `/admin/workers` - Manage workers
- `/worker` - Worker dashboard
  - `/worker/assignments` - View assigned service requests

---

## Styling & Theming

- **CSS Framework**: Tailwind CSS v4 with CSS custom properties (variables)
- **Component Library**: shadcn/ui (radix-ui primitives) with "nova" style
- **Color Theme**: Light blue primary (`oklch(0.205 0 0)`) with dark mode support
- **Icons**: Lucide React (`import { IconName } from "lucide-react"`)
- **Custom utilities**: Use `cn()` from `@/lib/utils` for conditional class merging
- **Radius**: `--radius` CSS variable (default `0.625rem`)
- **CSS Variables**: Defined in `globals.css` for theming (background, foreground, primary, secondary, etc.)

---

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- `AUTH_SECRET` - NextAuth secret (generate: `openssl rand -base64 32`)

### Optional (for Google OAuth)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Auth
- `AUTH_URL` - Base URL for auth callbacks (default: `http://localhost:3000`)

---

## Important Conventions

1. **Server Components by Default**: Pages in App Router are Server Components. Use `"use client"` only when you need state/effects/interactivity.

2. **Authentication Checks**: Use `const session = await auth()` in Server Components. In client components, use `useSession()` from `next-auth/react`.

3. **Database Access**: Always call `await connectToDatabase()` before accessing Mongoose models. The connection is cached globally.

4. **API Response Format**:
   - Server Actions: `{ success?: boolean, data?: any, error?: string }`
   - API Routes: Follow NextAuth patterns; generally `NextResponse.json({ success, data, error })`

5. **Role Checks**: Access `session?.user?.role` to authorize. In Server Components: `if (session?.user?.role !== 'admin') redirect('/')`.

6. **Error Handling**: API routes and Server Actions should use try/catch with proper error messages. User-friendly errors returned to client; detailed errors logged server-side.

7. **Mongoose Model Definitions**: Use `mongoose.model<T>('ModelName', schema)` and `export default mongoose.models.ModelName || ...` pattern to avoid "OverwriteModelError" during HMR.

8. **Strict TypeScript**: `tsconfig.json` has `strict: true`. No `any` unless necessary (global mongoose cache uses `any`).

9. **Path Aliases**: Use `@/` prefix for imports from `src/` (e.g., `@/components/ui/button`, `@/lib/db`).

10. **URLs and Navigation**: Use `next/link` for navigation, not manual `router.push()` in server components.

---

## Deployment Notes

### Build & Run
```bash
npm run build        # Creates .next/ production build
npm run start        # Starts Node.js server (default port 3000)
```

### Production Environment
- Set `NODE_ENV=production`
- Ensure `MONGODB_URI` and `AUTH_SECRET` are configured
- Deploy to Vercel (recommended) or any Node.js host (Railway, AWS, DigitalOcean)
- If not on Vercel, ensure `next.config.ts` allows proper hostnames

### Database
- MongoDB Atlas recommended for production
- Ensure IP whitelist includes your server IP

### Google OAuth (Production)
- Set Google OAuth redirect URI to: `https://yourdomain.com/api/auth/callback/google`
- Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### NextAuth on Production
- Generate a strong `AUTH_SECRET` (32+ bytes random)
- Set `AUTH_URL=https://yourdomain.com`
- Consider using database adapter for persistent sessions if scaling beyond single instance

---

## Known Issues / Technical Debt

- **No test coverage**: Consider adding Jest/Vitest + React Testing Library + Supertest
- **Mock auth backdoor**: `auth.ts` still contains test credentials; remove or guard behind `NODE_ENV === 'development'` for production
- **API validation**: Minimal input validation; consider Zod or Joi for server-side form validation
- **Audit logging**: `AuditLog` model exists but not consistently used; implement for sensitive operations
- **Error handling**: Inconsistent error responses; standardize error formatting
- **API routes sparse**: Most business logic in Server Actions; consider moving admin/worker APIs to REST for clarity if needed

---

## Getting Started Checklist

1. ✅ Copy `.env` to `.env.local` (already present)
2. ✅ Run `npm install`
3. Run `npm run dev`
4. Open http://localhost:3000
5. Test mock accounts:
   - Customer: `customer@test.com` / `customer123`
   - Admin: `admin@test.com` / `admin123`
   - Worker: `worker@test.com` / `worker123`
6. Or register a new account via `/register`
7. Explore dashboards based on role

---

## AGENTS.md Note

This repo includes an `AGENTS.md` file with special instructions for AI agents. Important: **"This is NOT the Next.js you know"** - the project uses Next.js 16 with potentially breaking changes from training data. Read `node_modules/next/dist/docs/` before making Next.js-specific changes.