# ORNUT E-commerce - EC2 Deployment Guide

This guide will help you deploy the ORNUT e-commerce application on Amazon Linux EC2.

## Prerequisites

- Amazon Linux EC2 instance (t2.medium or higher recommended)
- Node.js 20.x installed
- PostgreSQL database (RDS or self-hosted)
- Domain name (optional, for production)

## Quick Deployment Steps

### 1. Install Node.js on EC2

```bash
# Update system
sudo yum update -y

# Install Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 2. Clone and Setup Project

```bash
# Clone your repository
git clone https://github.com/its-ansh-jha/ORNUT.git
cd ORNUT

# Copy example env file
cp .env.example .env

# Edit .env with your actual credentials
nano .env
```

### 3. Configure Environment Variables

Edit the `.env` file with your actual credentials:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@your-rds-endpoint:5432/ornut

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-random-session-secret

# Firebase Client Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (from Service Account)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Key-Here\n-----END PRIVATE KEY-----\n"

# Cashfree Payment Gateway
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=PRODUCTION

# Formspree Email Service
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id

# Admin Panel (generate with: node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your-password', 10))")
ADMIN_PASSWORD_HASH=your-bcrypt-hash

# Production Settings
NODE_ENV=production
PORT=5000
```

### 4. Install Dependencies and Build

```bash
# Install dependencies
npm install

# Push database schema to PostgreSQL
npm run db:push

# Build the application
npm run build
```

### 5. Start the Application

#### Option A: Direct Start (for testing)
```bash
npm run start
```

#### Option B: Using PM2 (recommended for production)
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "ornut" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs

# Monitor application
pm2 logs ornut
pm2 status
```

### 6. Configure Nginx (Optional but Recommended)

```bash
# Install Nginx
sudo yum install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/conf.d/ornut.conf
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Test Nginx configuration
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7. Setup SSL with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

## Security Configuration

### 1. Configure EC2 Security Group

Allow the following inbound rules:
- HTTP (80) from 0.0.0.0/0
- HTTPS (443) from 0.0.0.0/0
- SSH (22) from your IP only

### 2. Configure Firewall

```bash
# Open port 80 and 443
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## Database Setup

### Using AWS RDS PostgreSQL

1. Create RDS PostgreSQL instance in AWS Console
2. Configure security group to allow connections from EC2
3. Update `DATABASE_URL` in `.env` with RDS endpoint
4. Run migrations: `npm run db:push`

### Self-hosted PostgreSQL on EC2

```bash
# Install PostgreSQL
sudo yum install postgresql15-server -y

# Initialize database
sudo postgresql-setup --initdb

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE ornut;
CREATE USER ornut_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ornut TO ornut_user;
\q
```

## Monitoring and Maintenance

### View Application Logs
```bash
# With PM2
pm2 logs ornut

# View last 100 lines
pm2 logs ornut --lines 100

# Follow logs in real-time
pm2 logs ornut --raw
```

### Restart Application
```bash
pm2 restart ornut
```

### Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Rebuild
npm run build

# Push database changes
npm run db:push

# Restart with PM2
pm2 restart ornut
```

## Troubleshooting

### Application won't start
1. Check logs: `pm2 logs ornut`
2. Verify all environment variables in `.env`
3. Ensure PostgreSQL is accessible
4. Check if port 5000 is available: `sudo lsof -i :5000`

### Database connection errors
1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running
3. Verify security group allows connection
4. Test connection: `psql $DATABASE_URL`

### 502 Bad Gateway (with Nginx)
1. Check if application is running: `pm2 status`
2. Verify application is listening on port 5000
3. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

## Performance Optimization

### Enable Compression
Already configured in Express middleware

### Setup CDN (Optional)
- Use CloudFront for static assets
- Configure bucket for product images
- Update image URLs to use CDN

### Database Optimization
```bash
# Create indexes for frequently queried fields
npm run db:push
```

## Backup Strategy

### Database Backups
```bash
# Create backup script
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_$DATE.sql"
```

```bash
chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

## Support

For issues or questions, refer to:
- Application logs: `pm2 logs ornut`
- Nginx logs: `/var/log/nginx/`
- PostgreSQL logs: `/var/log/postgresql/`
