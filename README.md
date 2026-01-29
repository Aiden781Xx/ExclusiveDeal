# ConversAllab - Startup Benefits Platform

A full-stack application that connects early-stage startups with exclusive deals and benefits on premium SaaS tools. The platform features user authentication, deal browsing with filters, and a claim management system with verification workflows.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [End-to-End Application Flow](#end-to-end-application-flow)
5. [Authentication & Authorization](#authentication--authorization)
6. [Claiming a Deal - Internal Flow](#claiming-a-deal---internal-flow)
7. [API Endpoints](#api-endpoints)
8. [Setup & Installation](#setup--installation)
9. [Running the Application](#running-the-application)
10. [UI/UX Implementation](#uiux-implementation)
11. [Known Limitations](#known-limitations)
12. [Production Readiness Improvements](#production-readiness-improvements)

---

## Project Overview

### Problem Statement
Early-stage startups struggle with limited budgets and cannot afford premium SaaS tools. ConversAllab solves this by providing:
- **Exclusive deals** on cloud services, marketing tools, analytics platforms, and productivity software
- **Public deals** - accessible to all registered users
- **Locked deals** - require user verification (company details, founding year, team size)
- **Deal tracking** - users can see claimed deals and their status

### Target Users
- Startup founders
- Early-stage teams
- Indie hackers

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: CSS transitions and keyframe animations
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing

---

## System Architecture

### Data Models

#### User Model
```typescript
{
  email: String (unique, required)
  password: String (hashed, required)
  firstName: String (required)
  lastName: String (required)
  company: String (optional)
  isVerified: Boolean (default: false)
  verificationDetails: {
    industry: String
    foundingYear: Number
    teamSize: String
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### Deal Model
```typescript
{
  title: String (required)
  description: String (required)
  category: String (enum: 'cloud'|'marketing'|'analytics'|'productivity')
  partner: String (required)
  discount: Number (percentage)
  value: Number (original value in USD)
  status: String (enum: 'active'|'inactive'|'archived')
  isLocked: Boolean (requires verification)
  requiredVerification: String (enum: 'none'|'basic'|'full')
  claimsCount: Number (default: 0)
  maxClaims: Number (limit, null for unlimited)
  expiryDate: Date
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### Claim Model
```typescript
{
  userId: ObjectId (reference to User)
  dealId: ObjectId (reference to Deal)
  claimCode: String (unique code for verification)
  status: String (enum: 'pending'|'claimed'|'approved'|'rejected')
  userVerificationAtClaim: Boolean (snapshot of user's verification status)
  expiryDate: Date
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Database Relationships
```
User (1) ──→ (Many) Claim ←── (1) Deal
```

---

## End-to-End Application Flow

### User Journey

#### 1. Authentication Phase
```
User → Landing Page
  ↓
User clicks "Register" or "Login"
  ↓
Registration Route: /register
  - User enters: email, password, firstName, lastName, company
  - Backend validates input
  - Password is hashed using bcryptjs
  - User created in MongoDB
  - JWT token generated
  - Token stored in localStorage on frontend
  ↓
User Authenticated → Redirected to Deals Page
```

#### 2. Browsing Deals Phase
```
User → Deals Listing Page
  ↓
Frontend calls: GET /api/deals
  ↓
Backend returns:
  - All active deals
  - Deal metadata (title, category, discount, isLocked)
  - Claim count
  ↓
Frontend displays:
  - Deal cards with category filters
  - Search functionality
  - Visual indicator for locked deals
  - "Claim" button or "Verify to Claim" prompt
```

#### 3. Deal Details Phase
```
User clicks on a deal card
  ↓
Frontend navigates to: /deals/[dealId]
  ↓
Frontend calls: GET /api/deals/:dealId
  ↓
Backend returns:
  - Full deal details
  - Partner information
  - Eligibility conditions
  - Current user's claim status
  ↓
Frontend displays:
  - Animated deal details
  - Eligibility requirements
  - "Claim Deal" button (if eligible) or "Verify Account" prompt
```

#### 4. Deal Claiming Phase
```
User clicks "Claim Deal"
  ↓
Check: Is deal locked AND user not verified?
  ├─ YES → Redirect to verification page
  │       User enters: industry, founding year, team size
  │       Frontend calls: POST /api/users/verify
  │       Backend updates: User.isVerified = true
  │       Redirect back to deal page
  │
  └─ NO → Proceed to claim
          Frontend calls: POST /api/claims/:dealId/claim
          ↓
          Backend logic:
            - Validate deal exists
            - Check deal is active
            - Check user not already claimed
            - Create Claim with status:
              * 'claimed' (if deal is public)
              * 'pending' (if deal is locked)
            - Generate unique claimCode
            - Increment deal's claimsCount
            - Return claim with claimCode
          ↓
          Frontend shows success message
          User can view claim in dashboard
```

#### 5. User Dashboard Phase
```
User → Dashboard Page
  ↓
Frontend calls: GET /api/claims/user/claims
  ↓
Backend returns:
  - All claims for authenticated user
  - Populated deal details
  - Claim status (pending/claimed/approved)
  ↓
Frontend displays:
  - Claimed deals list
  - Claim status badges
  - Expiry dates
  - Claim codes for redemption
```

---

## Authentication & Authorization

### JWT Token Structure
```typescript
{
  userId: string (MongoDB ObjectId)
  email: string
  isVerified: boolean
  iat: number (issued at)
  exp: number (expires in 7 days)
}
```

### Authentication Flow

#### 1. Login
```
POST /api/auth/login
Body: { email, password }
↓
Backend:
  - Find user by email
  - Compare hashed password with bcryptjs
  - If valid: generate JWT token
  - Return: { token, user }
↓
Frontend:
  - Store token in localStorage
  - Add to Axios interceptor for all requests
  - Redirect to /deals
```

#### 2. Protected Routes
```
All routes requiring authentication use authMiddleware:

authMiddleware checks:
  1. Request has Authorization header with Bearer token
  2. Token is valid (not expired)
  3. Extract userId from token
  4. Add user info to req.user
  5. If invalid: return 401 Unauthorized
```

#### 3. Authorization Logic
```
Locked Deal Access:
  IF deal.isLocked = true:
    - Check user.isVerified
    - IF false: return 403 Forbidden with message
    - IF true: allow claim

User Claim Ownership:
  - User can only view/claim their own claims
  - API validates: claim.userId === req.user.id
  - If mismatch: return 403 Forbidden
```

---

## Claiming a Deal - Internal Flow

### Step-by-Step Backend Logic

```typescript
POST /api/claims/:dealId/claim

1. VALIDATION
   - Extract dealId from params
   - Extract userId from JWT token (req.user.id)
   - Validate dealId is a valid MongoDB ID

2. DEAL VERIFICATION
   - Query Deal by dealId
   - If not found: return 404
   - If status !== 'active': return 400 "Deal unavailable"
   - If maxClaims reached: return 400 "Deal limit reached"

3. USER VERIFICATION CHECK
   - If deal.isLocked = true:
     * Fetch User by userId
     * If user.isVerified = false:
       → Return 403 with requiredVerification info
     * This prevents unverified users from claiming locked deals

4. DUPLICATE CHECK
   - Query Claim: { userId, dealId }
   - If exists: return 409 "Already claimed"
   - This ensures users claim each deal only once

5. CREATE CLAIM
   - Generate unique claimCode (6 alphanumeric characters)
   - Determine status:
     * If deal.isLocked: status = 'pending' (admin approval needed)
     * If deal.isPublic: status = 'claimed' (immediate)
   - Set expiryDate: current date + 30 days
   - Create Claim document in MongoDB

6. UPDATE DEAL
   - Increment deal.claimsCount by 1
   - Save updated deal

7. RETURN RESPONSE
   - Status 201 Created
   - Return: {
       claimId,
       dealId,
       status,
       claimCode
     }
```

### Error Handling
```
400 Bad Request:
  - Invalid dealId format
  - Deal no longer active
  - Deal claim limit reached

401 Unauthorized:
  - No token provided
  - Token expired or invalid

403 Forbidden:
  - User not verified for locked deal
  - User trying to access another user's claim

404 Not Found:
  - Deal doesn't exist
  - Claim doesn't exist

409 Conflict:
  - User already claimed this deal

500 Internal Server Error:
  - Database connection issues
  - Unexpected errors logged to console
```

---

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
```
Request: {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  company?: string
}

Response: {
  message: "User created successfully",
  token: "jwt_token_here",
  user: { id, email, firstName, lastName, isVerified }
}

Errors: 400 (validation), 409 (user exists)
```

#### POST `/api/auth/login`
```
Request: { email, password }

Response: {
  message: "Login successful",
  token: "jwt_token_here",
  user: { ... }
}

Errors: 400 (invalid), 401 (unauthorized)
```

### Deal Routes

#### GET `/api/deals`
```
Query Params:
  - category?: 'cloud'|'marketing'|'analytics'|'productivity'
  - isLocked?: boolean
  - search?: string (title/description)

Response: {
  message: "Deals fetched successfully",
  count: number,
  data: Deal[]
}
```

#### GET `/api/deals/:dealId`
```
Response: {
  message: "Deal fetched successfully",
  data: Deal
}

Errors: 404 (not found)
```

### Claim Routes

#### POST `/api/claims/:dealId/claim` (Protected)
```
Headers: Authorization: Bearer {token}

Response: {
  message: "Deal claimed successfully",
  data: { claimId, dealId, status, claimCode }
}

Errors: 400, 403, 404, 409 (as listed above)
```

#### GET `/api/claims/user/claims` (Protected)
```
Response: {
  message: "Claims fetched successfully",
  count: number,
  data: Claim[] (with populated dealId)
}
```

#### GET `/api/claims/:claimId` (Protected)
```
Response: {
  message: "Claim fetched successfully",
  data: Claim (with populated dealId)
}

Errors: 403 (not owner), 404 (not found)
```

### User Routes

#### POST `/api/users/verify` (Protected)
```
Request: {
  industry: string,
  foundingYear: number,
  teamSize: string
}

Response: {
  message: "User verified successfully",
  data: { id, email, isVerified, verificationDetails }
}
```

#### GET `/api/users/profile` (Protected)
```
Response: {
  message: "Profile fetched successfully",
  data: User (without password)
}
```

#### PUT `/api/users/profile` (Protected)
```
Request: {
  firstName?: string,
  lastName?: string,
  company?: string
}

Response: { message, data: User }
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
MONGO_URI=mongodb+srv://assignment011:750Shivam@cluster0.jhr4ffk.mongodb.net/
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
EOF

# Install TypeScript types
npm install --save-dev typescript @types/node @types/express

# Verify setup
npm run build
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
EOF

# Install latest Next.js
npm install next@latest eslint-config-next@latest
```

---

## Running the Application

### Terminal 1: Backend
```bash
cd backend
set PORT=5000
npm run dev
# Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Frontend running on http://localhost:3000
```

### Verify Both Running
```bash
# Terminal 3: Test health endpoint
curl http://localhost:5000/api/health
# Response: { "message": "Server is running" }
```

---

## UI/UX Implementation

### Frontend Architecture

#### Pages Implemented

1. **Landing Page** (`app/page.tsx`)
   - Welcome message
   - Navigation to login/register
   - Call-to-action buttons
   - Animated hero section

2. **Deals Listing** (To be implemented)
   - Grid/list view of deals
   - Category filters
   - Search functionality
   - Locked deal visual indicators
   - Smooth card animations on hover

3. **Deal Details** (To be implemented)
   - Full deal description
   - Partner information
   - Eligibility requirements
   - Claim button or verification prompt
   - Related deals carousel

4. **User Dashboard** (To be implemented)
   - User profile summary
   - Claimed deals list
   - Claim status tracking
   - Claim code display (for redemption)
   - Expiry date notifications

5. **Authentication Pages** (To be implemented)
   - Register form with validation
   - Login form
   - Verification form (for locked deals)

#### Animation Strategy
```css
/* Page Transitions */
- Fade-in on mount
- Smooth transitions between routes
- Loading states with skeleton screens

/* Micro-interactions */
- Button hover effects (scale, color change)
- Card hover effects (shadow, lift)
- Form input focus states
- Success/error message animations

/* Lazy Loading */
- Images load with fade-in
- Deals load incrementally
- Skeleton loaders while fetching
```

#### Styling Approach
- Tailwind CSS for utility classes
- CSS modules for component-specific styles
- Dark mode support (optional)
- Responsive design (mobile-first)

### Component Structure
```
app/
├── layout.tsx (root layout with HTML/body)
├── page.tsx (landing page)
├── globals.css (tailwind + global styles)
├── (auth)/
│   ├── layout.tsx
│   ├── register/page.tsx
│   ├── login/page.tsx
│   └── verify/page.tsx
├── deals/
│   ├── page.tsx (listing)
│   └── [id]/page.tsx (details)
└── dashboard/
    └── page.tsx (user dashboard)

lib/
├── api.ts (axios setup and API calls)
└── utils.ts (helper functions)
```

---

## Known Limitations

### Backend
1. **Scalability**
   - No caching layer (Redis)
   - No rate limiting on endpoints
   - Database queries not optimized with aggregation pipelines

2. **Features**
   - No pagination for deal listings
   - No deal categories with filtering in database query
   - No admin dashboard for deal management
   - No email notifications for claims

3. **Security**
   - Passwords sent in plain text over HTTPS only
   - No CSRF protection (should use in production)
   - No request logging or audit trails
   - JWT tokens don't refresh

### Frontend
1. **Performance**
   - No image optimization
   - No code splitting beyond Next.js defaults
   - No service worker for offline support

2. **Features**
   - No real-time updates (WebSocket)
   - No deal recommendations
   - No wishlist/save for later
   - No claim status notifications

3. **Accessibility**
   - Some animations might not respect `prefers-reduced-motion`
   - Form error messages need better ARIA labels

---

## Production Readiness Improvements

### Critical (Must Have)
1. **Authentication**
   - [ ] Token refresh endpoint (refresh tokens)
   - [ ] Token revocation on logout
   - [ ] Password reset functionality
   - [ ] Email verification before account activation

2. **Data Validation**
   - [ ] Input sanitization to prevent injection attacks
   - [ ] Rate limiting on auth endpoints
   - [ ] IP-based restrictions for suspicious activity

3. **Error Handling**
   - [ ] Structured error logging (Winston, Bunyan)
   - [ ] Error tracking service (Sentry)
   - [ ] User-friendly error messages

### High Priority (Should Have)
1. **Performance**
   - [ ] Database indexing optimization
   - [ ] Redis caching for frequently accessed deals
   - [ ] API response compression (gzip)
   - [ ] CDN for static assets

2. **Monitoring**
   - [ ] Application performance monitoring (APM)
   - [ ] Database query analysis
   - [ ] Uptime monitoring
   - [ ] Alert system for critical issues

3. **Deployment**
   - [ ] Environment-based configuration (dev/staging/prod)
   - [ ] Database migration system
   - [ ] Blue-green deployment setup
   - [ ] Automated backups

### Medium Priority (Nice to Have)
1. **Features**
   - [ ] Admin dashboard for deal management
   - [ ] Email notifications for claim status updates
   - [ ] Pagination and sorting for deals
   - [ ] Advanced filtering with facets

2. **Testing**
   - [ ] Unit tests for backend routes
   - [ ] Integration tests for API endpoints
   - [ ] E2E tests for user flows
   - [ ] Performance testing

3. **Documentation**
   - [ ] API documentation (Swagger/OpenAPI)
   - [ ] Architecture decision records (ADRs)
   - [ ] Runbook for common issues
   - [ ] Video tutorials for users

### Infrastructure
1. **Deployment Options**
   - [ ] Docker containerization
   - [ ] Kubernetes orchestration
   - [ ] AWS/GCP/Azure deployment guides
   - [ ] Environment variable management

2. **Database**
   - [ ] MongoDB Atlas for managed service
   - [ ] Backup and recovery procedures
   - [ ] Point-in-time restore capability
   - [ ] Read replicas for scaling

---

## Key Design Decisions

### 1. Route Ordering in Claim Routes
**Decision**: Specific routes (like `/user/claims`) MUST come before generic routes (like `/:claimId`)

**Why**: Express matches routes in order. A generic `/:claimId` route would catch `/user/claims` and try to validate "user" as a MongoDB ID, causing 404 errors.

**Implementation**:
```typescript
// ✅ CORRECT ORDER
router.get('/user/claims', ...) // specific first
router.get('/:claimId', ...) // generic last
```

### 2. JWT Token Includes Verification Status
**Decision**: JWT includes `isVerified` boolean, not just userId

**Why**: Reduces database queries during claim eligibility checks. The token reflects the user's state at login time.

**Trade-off**: If a user gets verified while logged in, they need to re-login to see updated token.

### 3. Claim Status Models
**Decision**: Distinguish between 'pending' (locked deals) and 'claimed' (public deals)

**Why**: Provides audit trail and allows future admin approval workflow for locked deals.

**Future**: Could add status transitions like: pending → approved → redeemed → expired

### 4. ClaimCode Generation
**Decision**: Generate random 6-character alphanumeric code

**Why**: Easy for users to share and verify without exposing MongoDB IDs

**Alternative**: Could use QR codes or shorter URL-safe codes for better UX

---

## Troubleshooting

### Backend Issues

#### "Cannot find module 'express'"
```bash
cd backend
npm install express
```

#### "Connection to MongoDB failed"
```
1. Check MONGO_URI in .env
2. Ensure MongoDB is running
3. Check network connection to MongoDB Atlas
4. Verify IP whitelist if using cloud database
```

#### "Token expired" error
```
The JWT tokens expire in 7 days. User needs to login again.
In production, implement refresh tokens for better UX.
```

### Frontend Issues

#### "API requests return 404"
```
1. Verify backend is running on correct port (5000)
2. Check NEXT_PUBLIC_API_BASE_URL in .env.local
3. Ensure routes are prefixed with /api
4. Check CORS is enabled in backend
```

#### "localStorage is undefined"
```
This happens during SSR. Always check:
typeof window !== 'undefined' before accessing localStorage
```

---

## Performance Considerations

### Database
- **Indexes**: Email, dealId, userId are indexed for fast queries
- **Relationships**: Populate dealId in claims to avoid N+1 queries
- **Pagination**: Implement limit/offset for large datasets

### Frontend
- **Code Splitting**: Next.js automatically splits code per route
- **Image Optimization**: Use Next.js Image component when images are added
- **Lazy Loading**: Implement intersection observer for below-fold content

### API
- **Caching**: Use HTTP cache headers for GET requests
- **Compression**: Enable gzip compression
- **Rate Limiting**: Essential for public endpoints in production

---

## Conclusion

ConversAllab demonstrates a complete full-stack architecture with:
- ✅ Proper authentication and authorization
- ✅ Database relationships and constraints
- ✅ RESTful API design
- ✅ Frontend-backend integration
- ✅ Error handling and validation
- ✅ Scalable structure for additions

The application successfully implements the core flow: User → Browse → Verify (if needed) → Claim → Track

---

## Contact & Support

For questions or issues, refer to the inline code comments and this README.

**Last Updated**: January 29, 2026
