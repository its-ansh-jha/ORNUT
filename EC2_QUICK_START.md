# EC2 Quick Start Guide

## ✅ Setup Complete!

Your ORNUT e-commerce application is now configured for Amazon Linux EC2 deployment with `.env` file support.

## 📦 What's Been Set Up

1. **Environment Configuration**
   - `.env.example` - Template for all environment variables
   - `server/env.ts` - Environment loader with validation
   - Supports both Replit Secrets (development) and `.env` file (EC2 production)

2. **Deployment Scripts**
   - `deploy.sh` - Automated deployment script for EC2
   - Database schema auto-migration
   - PM2 process manager integration

3. **Documentation**
   - `README.md` - Complete project documentation
   - `DEPLOYMENT.md` - Detailed EC2 deployment guide
   - This guide for quick reference

## 🚀 EC2 Deployment (3 Commands)

On your Amazon Linux EC2 instance:

```bash
# 1. Setup environment
cp .env.example .env
nano .env  # Add your credentials

# 2. Install and build
npm install
npm run build

# 3. Start the application
npm start
```

**Or use the automated script:**

```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 Environment Variables for EC2

Create a `.env` file in the project root with these variables:

### Required (Critical)
```env
DATABASE_URL=postgresql://user:password@your-rds:5432/ornut
SESSION_SECRET=your-session-secret-here
```

### Required (For Full Functionality)
```env
# Firebase Client (Frontend)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Admin (Backend)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Cashfree Payments
CASHFREE_APP_ID=your-app-id
CASHFREE_SECRET_KEY=your-secret-key
CASHFREE_ENV=PRODUCTION

# Formspree Email
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id

# Admin Access
ADMIN_PASSWORD_HASH=your-bcrypt-hash
```

### Optional
```env
NODE_ENV=production
PORT=5000
```

## 🔧 Development vs Production

### Development (Replit)
- Uses Replit Secrets (already configured)
- Run: `npm run dev`
- Hot reload enabled
- Vite dev server

### Production (EC2)
- Uses `.env` file
- Run: `npm start`
- Optimized build
- Static file serving

## 📋 Deployment Checklist

Before deploying to EC2:

- [ ] PostgreSQL database ready (RDS or self-hosted)
- [ ] Firebase project configured
- [ ] Cashfree account set up
- [ ] Formspree form created
- [ ] Admin password hash generated
- [ ] `.env` file created with all credentials
- [ ] EC2 security group allows HTTP/HTTPS
- [ ] Domain configured (if using)

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Development mode
npm run dev

# Database migration
npm run db:push

# Type checking
npm run check
```

## 🔐 Generating Secrets

### Session Secret
```bash
openssl rand -base64 32
```

### Admin Password Hash
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10))"
```

## 📊 PM2 Process Manager (Recommended)

```bash
# Install PM2
sudo npm install -g pm2

# Start app
pm2 start npm --name "ornut" -- start

# View logs
pm2 logs ornut

# Restart app
pm2 restart ornut

# Stop app
pm2 stop ornut

# Monitor
pm2 monit
```

## 🌐 Nginx Reverse Proxy (Optional)

For production, use Nginx in front of your Node app:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔍 Troubleshooting

**App won't start on EC2:**
```bash
# Check if .env exists
ls -la .env

# Verify environment variables
cat .env

# Check logs
pm2 logs ornut

# Or if not using PM2
npm start
```

**Database connection fails:**
```bash
# Test connection
psql $DATABASE_URL

# Check DATABASE_URL format
echo $DATABASE_URL
```

**Port already in use:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill process
sudo kill -9 <PID>
```

## 📖 Additional Resources

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Project Documentation**: See `README.md`
- **Design Guidelines**: See `design_guidelines.md`

## 🆘 Support

If you encounter issues:
1. Check the logs: `pm2 logs ornut` or check console output
2. Verify all environment variables are set correctly
3. Ensure database is accessible
4. Review `DEPLOYMENT.md` for detailed troubleshooting

## 🎯 Next Steps

1. **Local Testing**: Test the app in Replit (currently running)
2. **Prepare EC2**: Set up your EC2 instance and database
3. **Deploy**: Follow the 3-command deployment above
4. **Configure Domain**: Point your domain to EC2
5. **Setup SSL**: Use Let's Encrypt for HTTPS

---

**Your app is ready for EC2 deployment!** 🚀

The workflow: `npm install; npm run build; npm start` is fully supported.
