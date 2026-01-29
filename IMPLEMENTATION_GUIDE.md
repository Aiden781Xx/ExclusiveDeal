# Implementation Guide: Startup Benefits Platform
## Step-by-Step Instructions for YOUR Code

This guide walks you through building each component. **You write the code**, I'll guide you.

---

## PHASE 1: BACKEND SETUP (Start Here)

### Step 1.1: Initialize Backend Project
**What you need to do:**
1. Open terminal in `backend/` folder
2. Run: `npm init -y`
3. Install dependencies:
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken cors dotenv
   npm install --save-dev typescript @types/express @types/node ts-node
   ```
4. Create `tsconfig.json` in backend root
5. Create `.env` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/startup-benefits
   JWT_SECRET=your-secret-key-here
   PORT=5000
   NODE_ENV=development
   ```

**Questions to ask yourself:**
- Why do we need `bcryptjs`? (for password hashing)
- What does `jsonwebtoken` do? (creates/verifies JWT tokens)
- Why use `.env`? (keeps secrets out of code)

---

### Step 1.2: Create Database Models

**Your Task:** Write these Mongoose models from scratch

#### User Model (`backend/src/models/User.ts`)
Think about:
- What fields does a user need? (email, password, name, role, verification status)
- What validation rules? (email format, password strength)
- What indexes? (email should be unique and indexed)
- How do you hash passwords? (use bcrypt before saving)

**Structure to follow:**
```typescript
import mongoose from 'mongoose';

// Define what a User document looks like
interface IUser {
  email: string;
  password: string;
  // ... other fields
}

// Create schema with validation
const userSchema = new mongoose.Schema({
  // Define each field here
});

// Add indexes
userSchema.index({ email: 1 });

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  // Hash password before saving
});

// Create and export model
export const User = mongoose.model<IUser>('User', userSchema);
```

#### Deal Model (`backend/src/models/Deal.ts`)
Think about:
- What fields? (title, description, category, partner info, benefits, access level)
- What enums? (category: 'cloud'|'marketing'|'analytics'|'productivity')
- What validation? (dates should be in future, title required, etc.)
- What indexes? (category, accessLevel, isActive)

#### Claim Model (`backend/src/models/Claim.ts`)
Think about:
- What relationships? (links to User and Deal)
- Status tracking? ('pending'|'approved'|'rejected')
- Metadata? (verification status at time of claim, IP address)
- Unique constraint? (user can only claim each deal once)

**Questions to ask yourself as you code:**
- What's the difference between validation and indexes?
- Why would we store `userVerificationStatus` in the claim? (audit trail)
- How do we enforce unique combinations? (compound unique index)

---

### Step 1.3: Set Up Database Connection

**Your Task:** Write `backend/src/config/database.ts`

```typescript
// Import mongoose
// Create async function that:
// 1. Connects to MongoDB using MONGODB_URI from .env
// 2. Logs success/error
// 3. Returns the connection
// 4. Export it
```

**Questions:**
- What happens if connection fails?
- Should we retry? How many times?
- Where should we call this from? (server.ts)

---

### Step 1.4: Implement Authentication Service

**Your Task:** Write `backend/src/services/auth.service.ts`

This file contains the BUSINESS LOGIC for auth. Think:

```typescript
// Function 1: registerUser(email, password, name, role)
// - Validate input (email format, password strength)
// - Check if user already exists
// - Hash password using bcrypt
// - Create new User in database
// - Generate JWT token
// - Return { user, token }

// Function 2: loginUser(email, password)
// - Find user by email
// - Compare password with stored hash
// - If match, generate JWT
// - Return { user, token }
// - If no match, throw error

// Function 3: verifyToken(token)
// - Use jsonwebtoken to verify and decode
// - Extract user ID from payload
// - Return decoded payload or throw error

// Helper: generateToken(userId)
// - Create JWT with userId in payload
// - Use JWT_SECRET from env
// - Set expiration (e.g., 7 days)
```

**Questions to ask:**
- Where does password hashing happen? (before storing in DB)
- What should we NOT return? (password field!)
- How long should JWT tokens live? (depends on use case)
- What info goes in the token payload? (user ID at minimum)

---

### Step 1.5: Build Auth Middleware

**Your Task:** Write `backend/src/middleware/auth.middleware.ts`

This intercepts requests and checks if user is authenticated.

```typescript
// Middleware function that:
// 1. Extracts token from Authorization header
//    - Header format: "Bearer <token>"
// 2. Calls verifyToken() from auth.service
// 3. If valid, attaches user to request object (req.user = decoded)
// 4. If invalid, returns 401 error
// 5. Calls next() to continue

// Export this middleware to use on protected routes
```

**Questions:**
- What if no Authorization header? (return 401)
- What if token is malformed? (return 401)
- How do we attach user to request? (req.user = ...)
- What type is request? (Express.Request with custom property)

---

### Step 1.6: Create Auth Controller

**Your Task:** Write `backend/src/controllers/auth.controller.ts`

Controllers handle HTTP requests. They:
- Receive request data
- Call service functions
- Return responses

```typescript
// Function 1: registerHandler(req, res)
// - Extract email, password, name, role from req.body
// - Call authService.registerUser()
// - Return 201 with user and token
// - Catch errors and return appropriate status

// Function 2: loginHandler(req, res)
// - Extract email, password from req.body
// - Call authService.loginUser()
// - Return 200 with user and token
// - Handle invalid credentials

// Function 3: getCurrentUserHandler(req, res)
// - Uses req.user from auth middleware
// - Find full user details from DB
// - Return user data
```

**Questions:**
- What status codes? (201 for create, 200 for success, 400 for bad request, 401 for auth)
- How do we validate input? (manually check fields, or use express-validator)
- Should we return password? (NO!)
- What errors should return what status? (Email exists → 400, Invalid credentials → 401)

---

### Step 1.7: Create Auth Routes

**Your Task:** Write `backend/src/routes/auth.routes.ts`

```typescript
// Create Express router
// Define routes:
// POST /register → registerHandler
// POST /login → loginHandler
// GET /me → authMiddleware → getCurrentUserHandler
// Export router
```

**Questions:**
- Which routes need auth middleware?
- Route order matters? (usually no, but good practice to put protected after middleware)

---

### Step 1.8: Build Deals Service & Controller

**Your Task:** Write `backend/src/services/deals.service.ts` and `backend/src/controllers/deals.controller.ts`

**Service functions:**
```typescript
// Function 1: getAllDeals(filters)
// - Find deals where isActive = true
// - Apply filters (category, accessLevel)
// - Return array of deals
// - Consider pagination (skip, limit)

// Function 2: getDealById(dealId)
// - Find deal by ID
// - Return deal or throw error if not found

// Function 3: searchDeals(searchTerm)
// - Find deals where title or description contains searchTerm
// - Case-insensitive search
```

**Controller functions:**
```typescript
// Function 1: getDealsHandler(req, res)
// - Extract filters from req.query (category, search, page)
// - Call dealService.getAllDeals()
// - Return 200 with deals array

// Function 2: getDealHandler(req, res)
// - Extract dealId from req.params
// - Call dealService.getDealById()
// - Return 200 with deal or 404 if not found
```

---

### Step 1.9: Build Claims Service & Controller

**Your Task:** Write `backend/src/services/claims.service.ts` and `backend/src/controllers/claims.controller.ts`

**Key function: claimDeal(userId, dealId)**
```typescript
// Implement the pseudocode from architecture:
// 1. Find deal, check exists and isActive
// 2. Check user hasn't already claimed
// 3. Check authorization (verified_only deals)
// 4. Check claim limit not exceeded
// 5. Create claim with redemptionCode
// 6. Increment deal.totalClaimed
// 7. Return claim

// Helper functions:
// - generateRedemptionCode() → unique string
// - getUserClaims(userId) → list of claims
// - getClaimDetails(claimId) → single claim with deal info
```

---

### Step 1.10: Create Express Server

**Your Task:** Write `backend/src/server.ts`

```typescript
// 1. Import express, middleware, routes
// 2. Create app
// 3. Connect to database
// 4. Set up middleware:
//    - CORS
//    - JSON body parser
// 5. Set up routes:
//    - /api/auth → auth routes
//    - /api/deals → deals routes
//    - /api/claims → claims routes
// 6. Error handling middleware
// 7. Listen on PORT
```

---

## PHASE 2: FRONTEND SETUP

### Step 2.1: Create Next.js Project Structure

**Your Task:** Set up the folder structure as shown in architecture

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (platform)/
│   │   ├── deals/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── animations/
│   └── shared/
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── types.ts
└── hooks/
```

---

### Step 2.2: Create Types File

**Your Task:** Write `frontend/lib/types.ts`

```typescript
// Define TypeScript interfaces:
// - User type
// - Deal type
// - Claim type
// - API response types
// Match your backend schema!
```

---

### Step 2.3: Build API Client

**Your Task:** Write `frontend/lib/api.ts`

```typescript
// Create fetch wrapper for API calls
// Base URL from environment variable

// Functions:
// - register(email, password, name, role)
// - login(email, password)
// - getCurrentUser()
// - getDeals(filters)
// - getDeal(id)
// - claimDeal(dealId)
// - getUserClaims()

// Handle:
// - Token in localStorage
// - Authorization header
// - Error responses
// - JSON parsing
```

---

### Step 2.4: Create Auth Context

**Your Task:** Write `frontend/lib/auth.ts` or `frontend/app/providers.tsx`

```typescript
// Use React Context API (no external library)
// Provide:
// - Current user state
// - Login function
// - Logout function
// - Register function
// - Loading state

// Wrap app with provider in layout.tsx
```

---

### Step 2.5: Build Landing Page with Animations

**Your Task:** Write `frontend/app/page.tsx`

```typescript
// Create landing page with:
// - Header/nav
// - Animated hero section
// - Value proposition
// - CTA button → /deals
// - Animations using Framer Motion or React Spring

// Install: npm install framer-motion
// Focus on:
// - Text animations (fade in, slide)
// - Button hover effects
// - Smooth transitions
```

---

### Step 2.6: Build Deals Page

**Your Task:** Write `frontend/app/(platform)/deals/page.tsx`

```typescript
// Page with:
// - List of deals from API
// - Filter by category
// - Search functionality
// - Loading skeleton
// - Locked deals styling (show lock icon)
// - Card hover animations
// - Link to deal details
```

---

### Step 2.7: Build Deal Details Page

**Your Task:** Write `frontend/app/(platform)/deals/[id]/page.tsx`

```typescript
// Page with:
// - Full deal info (title, description, partner, benefits)
// - Eligibility conditions
// - Claim button
// - Check user verification status
// - Show error if can't claim
// - Success message after claim
```

---

### Step 2.8: Build Dashboard

**Your Task:** Write `frontend/app/(platform)/dashboard/page.tsx`

```typescript
// Protected page with:
// - User profile info
// - List of claimed deals
// - Claim status (pending, approved, etc.)
// - Redemption codes
// - Timeline or status animations
```

---

### Step 2.9: Create Reusable Components

**Your Task:** Build components you'll reuse:

Examples:
- `DealCard.tsx` - Displays single deal
- `LoadingSkeleton.tsx` - Loading state
- `Button.tsx` - Styled button with hover effects
- `Header.tsx` - Nav bar with auth status
- `Modal.tsx` - For confirmations

---

## PHASE 3: INTEGRATION & TESTING

### Step 3.1: Test Auth Flow
1. Register new user
2. Check DB for user (hashed password)
3. Login with credentials
4. Verify token in localStorage
5. Fetch current user

### Step 3.2: Test Deal Workflow
1. Get all deals
2. Filter by category
3. Search deals
4. Get single deal details
5. Claim deal (check verification status)
6. Get user claims

### Step 3.3: Test Protected Routes
1. Try accessing /dashboard without token → redirect to login
2. Try claiming verified_only deal without verification → error

---

## PHASE 4: DOCUMENTATION

### Step 4.1: Write README.md

Cover:
1. How to set up (install, env variables, run backend/frontend)
2. Application flow (user journey)
3. Authentication implementation
4. Claiming flow
5. API endpoints
6. Frontend architecture
7. Animation strategy
8. Known limitations
9. Production improvements needed

---

## Key Principles as You Code

✅ **DRY** - Don't repeat code
✅ **SOLID** - Single responsibility
✅ **Error Handling** - Every function should handle errors
✅ **Validation** - Validate all inputs
✅ **Security** - Never return passwords, validate on backend
✅ **Types** - Use TypeScript strictly
✅ **Comments** - Explain WHY, not WHAT

---

## Start Here

1. Open `backend/` folder
2. Run: `npm init -y`
3. Install dependencies
4. Create `.env` file
5. Start building User model
6. Message me when done, I'll review it

**Let me know when you start and which step you're on!**
