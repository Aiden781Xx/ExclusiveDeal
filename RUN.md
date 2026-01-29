# How to Run the Project

## Prerequisites
- Node.js 18+
- MongoDB (or use the Atlas URI in `backend/.env`)

## 1. Backend (port 5001)

```powershell
cd backend
npm install
npm run dev
```

You should see:
- `✓ Server is running on port 5001`
- `✓ Connected to MongoDB`

## 2. Frontend (port 3000 or 3001)

**If you see "Unable to acquire lock" / "another instance of next dev running":**

1. **Stop** the other `next dev` (Ctrl+C in that terminal).
2. **Delete** the lock file if it exists:
   ```powershell
   Remove-Item -Path "frontend\.next\dev\lock" -ErrorAction SilentlyContinue
   ```
3. Then start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

- Local: http://localhost:3000 (or 3001 if 3000 is in use)
- API: http://localhost:5001/api

## 3. Health check

- Backend: http://localhost:5001/api/health
- Frontend: http://localhost:3000 (or your dev URL)
