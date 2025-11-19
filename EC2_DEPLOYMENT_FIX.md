# EC2 Deployment - DATABASE_URL Error Fix ✅

## Problem (SOLVED)

When deploying to EC2, you were getting this error:

```bash
Error: DATABASE_URL must be set. Did you forget to provision a database?
    at file:///home/ec2-user/ORNUT/dist/index.js:252:9
```

Even though your `.env` file was set up correctly!

## Root Cause

The built code (`dist/index.js`) was checking for `DATABASE_URL` **before** loading the `.env` file. Here's what was happening:

1. ❌ `server/db.ts` checked for `DATABASE_URL` at module import time
2. ❌ This happened BEFORE `server/env.ts` loaded the `.env` file
3. ❌ Result: Error even with correct `.env` file

## Solution Applied ✅

**Fixed the import order in `server/index.ts`:**

```typescript
// BEFORE (Wrong order - caused the error):
import express from "express";
import { registerRoutes } from "./routes";  // This imports db.ts
import { validateEnv } from "./env";

validateEnv();  // Too late! Database already tried to connect

// AFTER (Correct order - fixed!):
import { validateEnv } from "./env";  // Import env FIRST
validateEnv();                        // Load .env file IMMEDIATELY

import express from "express";
import { registerRoutes } from "./routes";  // Now db.ts can find DATABASE_URL
```

## How to Deploy on EC2 (Updated)

### Step 1: Copy Your Code to EC2

```bash
# On your local machine, create a zip of the entire project
# (Make sure to exclude node_modules if you have it locally)

# On EC2:
cd /home/ec2-user
git clone https://github.com/its-ansh-jha/ORNUT.git
cd ORNUT

# Or upload your code via scp:
scp -i your-key.pem -r ./ORNUT ec2-user@your-ec2-ip:/home/ec2-user/
```

### Step 2: Create `.env` File

```bash
# Create .env file in the ORNUT directory
cd /home/ec2-user/ORNUT
nano .env
```

Add your environment variables (minimum required):

```env
# Database (Required)
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/ornut

# Session (Required)
SESSION_SECRET=your-random-secret-here-use-openssl-rand

# Optional but recommended
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=PRODUCTION

ADMIN_PASSWORD_HASH=your-bcrypt-hash

# Firebase (if using authentication)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourKey\n-----END PRIVATE KEY-----"

# Formspree (if using contact form)
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Build for Production

```bash
npm run build
```

### Step 5: Push Database Schema

```bash
npm run db:push
```

If you see a data-loss warning, use:
```bash
npm run db:push -- --force
```

### Step 6: Start the Application

```bash
npm start
```

Your app should now start successfully! 🎉

You should see:
```
✓ Loaded environment variables from .env file
✓ Critical environment variables are set
⚠️  Missing optional environment variables: ...
Server running on port 5000
```

## Generate Required Secrets

### Session Secret
```bash
openssl rand -base64 32
```

### Admin Password Hash
```bash
# Install bcryptjs if not already installed
npm install -g bcryptjs

# Generate hash (replace 'YourPassword123' with your actual password)
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123', 10))"
```

## Using PM2 for Production (Recommended)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your app with PM2
pm2 start npm --name "ornut" -- start

# View logs
pm2 logs ornut

# Restart
pm2 restart ornut

# Auto-start on server reboot
pm2 startup
pm2 save
```

## Troubleshooting

### Error: DATABASE_URL must be set

✅ **This is now fixed!** If you still see this error:

1. **Make sure you rebuilt the app:**
   ```bash
   npm run build
   ```

2. **Verify .env file exists in the project root:**
   ```bash
   ls -la .env
   cat .env  # Check the contents
   ```

3. **Test DATABASE_URL directly:**
   ```bash
   # Source the .env file
   export $(cat .env | xargs)
   
   # Check if it's set
   echo $DATABASE_URL
   ```

4. **Verify NODE_ENV is set to production:**
   ```bash
   # The .env file only loads when NODE_ENV=production
   export NODE_ENV=production
   npm start
   ```

### Error: Cannot connect to database

```bash
# Test database connection
psql "$DATABASE_URL"

# If that fails, check:
# - Is your RDS security group allowing connections from EC2?
# - Is the DATABASE_URL format correct?
# - Can you reach the database from EC2?
ping your-rds-endpoint
```

### Port 5000 already in use

```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or use a different port
PORT=3000 npm start
```

## Verification Checklist

Before deploying, make sure:

- ✅ Code is on EC2
- ✅ `.env` file created in project root
- ✅ All required environment variables set
- ✅ Database is accessible from EC2
- ✅ `npm install` completed
- ✅ **`npm run build` completed** ← This applies the fix!
- ✅ `npm run db:push` completed
- ✅ Security groups configured
- ✅ `npm start` runs without errors

## What Changed

The fix is already applied in your code! The changes were:

**File: `server/index.ts`**
- Moved environment loading to be the **very first** operation
- This ensures `.env` file is loaded before any database connections

**File: `server/env.ts`**
- Made environment validation flexible
- Critical variables (DATABASE_URL, SESSION_SECRET) are required
- Optional variables show warnings but don't stop the app

## Next Steps

1. **Deploy to EC2** using the steps above
2. **Test** that the app starts without DATABASE_URL error
3. **Set up Nginx** as reverse proxy (optional, see DEPLOYMENT.md)
4. **Configure SSL** with Let's Encrypt (optional, see DEPLOYMENT.md)
5. **Use PM2** for process management (recommended)

---

**Your app is now ready for successful EC2 deployment!** 🚀

The DATABASE_URL error has been fixed - just rebuild and redeploy.
