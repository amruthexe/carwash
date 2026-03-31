# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Car Wash Management System - Full stack application with:
- **Frontend**: Next.js 16.2.1 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + MongoDB + Mongoose ODM
- **Authentication**: NextAuth.js (beta) with bcryptjs for password hashing

### Architecture

**Application Structure** (`/src`)
- **App Router**: `src/app/` - Next.js 13+ app directory structure with route groups
- **API Routes**: `src/app/api/` - RESTful endpoints using Next.js API routes
- **Authentication**: `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- **Models**: `src/models/*` - Mongoose schemas for MongoDB collections
- **Database**: `src/lib/db.ts` - MongoDB connection utilities with caching
- **Components**: `src/components/` - Reusable UI components (shadcn/ui based)
- **Styles**: `src/app/globals.css` - Global Tailwind CSS styles
- **Utilities**: `src/lib/utils.ts` - Helper functions

**Key Features**:
- User authentication (registration, login, logout)
- Role-based access (users, workers, admins)
- Vehicle management
- Service booking and scheduling
- Payment processing
- Notification system
- Audit logging
- Community features

## Common Development Tasks

### General Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server on http://localhost:3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint for code quality
```

### Environment Configuration
Create `.env.local` file with:
```
MONGODB_URI=mongodb://localhost:27017/carwashdb  # or MongoDB Atlas connection
# NextAuth variables (generate with openssl rand -base64 32)
AUTH_SECRET=your_nextauth_secret_key_here
# Optional: Better Auth configuration if used
```

## Key File Locations

- **Database Connection**: `src/lib/db.ts` - MongoDB connection with caching for hot reloads
- **Mongoose Models**: `src/models/*` (User.ts, Vehicle.ts, Service.ts, etc.)
- **API Routes**: `src/app/api/*` - REST endpoints (auth, users, vehicles, services, etc.)
- **Authentication**: `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- **Pages**: `src/app/*` - Next.js pages using app router (dashboard, login, register, etc.)
- **Components**: `src/components/` - UI components (layout, UI primitives, feature-specific)
- **Styles**: `src/app/globals.css` - Tailwind CSS base styles
- **Utilities**: `src/lib/utils.ts` - Helper functions

## Database Schema Overview

### User (`UserModel`)
- Fields: `name`, `email`, `password` (hashed), `role` (user/worker/admin), `phone`, `address`, `status`
- Relationships: References to Vehicle, Service, Payment, Notification

### Vehicle (`VehicleModel`)
- Fields: `userId` (ref), `make`, `model`, `year`, `licensePlate`, `vin`, `status`

### Service (`ServiceModel`)
- Fields: `name`, `description`, `price`, `duration`, `category`, `status`

### Payment (`PaymentModel`)
- Fields: `userId` (ref), `serviceId` (ref), `amount`, `paymentMethod`, `transactionId`, `status`

### Notification (`NotificationModel`)
- Fields: `userId` (ref), `title`, `message`, `type`, `isRead`, `relatedId` (optional reference)

### AuditLog (`AuditLogModel`)
- Fields: `userId` (ref), `action`, `entityType`, `entityId`, `changes`, `timestamp`

### Community (`CommunityModel`)
- Fields: `name`, `description`, `location`, `contactInfo`, `workingHours`

### Plan (`PlanModel`)
- Fields: `name`, `description`, `price`, `duration`, `features`, `status`

## API Endpoints Reference

**Authentication** (`/api/auth/*`)
- Handles NextAuth routes (signin, signout, callback, etc.)
- Configured in `src/app/api/auth/[...nextauth]/route.ts`

**User APIs** (`/api/users/*`)
- `GET /` - Get all users (admin/worker)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (admin)

**Vehicle APIs** (`/api/vehicles/*`)
- CRUD operations for vehicle management

**Service APIs** (`/api/services/*`)
- CRUD operations for service offerings

**Payment APIs** (`/api/payments/*`)
- Payment processing and history

**Notification APIs** (`/api/notifications/*`)
- Notification management

## Development Tips

1. **Database Connections**: The `src/lib/db.ts` file uses a global cache to prevent excessive connections during development hot reloads. Always use `connectToDatabase()` before accessing models.

2. **Model Usage**: Models are automatically registered when imported in `db.ts`. Import models directly from `src/models/` when needed.

3. **Authentication**: 
   - Use `getServerSession` from `next-auth` in API routes and server components
   - Use `useSession` from `next-auth/react` in client components
   - Protected routes should check session user role

4. **Form Handling**: 
   - Use React Hook Form with Zod validation (if implemented)
   - API routes should validate input data

5. **Error Handling**:
   - API routes should use try/catch and return appropriate HTTP status codes
   - Frontend should handle loading and error states gracefully

6. **Styling**:
   - Uses Tailwind CSS with custom configuration
   - UI components built with shadcn/ui primitives
   - Extend theme in `tailwind.config.ts` if needed

7. **Type Safety**:
   - TypeScript is used throughout
   - Define interfaces in `src/types/` or alongside models
   - Fix type errors before committing

## Important Conventions

- **File Organization**: Feature-based grouping where applicable
- **Naming**: Use PascalCase for components, camelCase for functions/variables
- **API Responses**: Follow `{ success: boolean, data?: any, error?: string }` pattern
- **Middleware**: Custom middleware for authentication/authorization in API routes
- **Environment Variables**: Prefix with appropriate scope (`NEXT_PUBLIC_` for client-exposed vars)

## Deployment Notes

- Build: `npm run build` creates optimized production build
- Start: `npm run start` runs the Next.js server
- Platform: Deploy to Vercel, AWS, or any Node.js hosting service
- Environment: Ensure `MONGODB_URI` and `AUTH_SECRET` are set in production
- Database: MongoDB Atlas recommended for production deployments

## Getting Started Checklist

1. Copy `.env.example` to `.env.local` and fill in required variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Visit `http://localhost:3000` to view the application
5. Register a new user account to begin using the system