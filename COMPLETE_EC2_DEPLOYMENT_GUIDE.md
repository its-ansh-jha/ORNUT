# Complete EC2 Deployment Guide for ORNUT E-Commerce Application

**From Zero to Production: Complete Guide**

This guide takes you from creating a brand new AWS EC2 instance to having your ORNUT e-commerce website live with HTTPS.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Create EC2 Instance](#part-1-create-ec2-instance)
3. [Part 2: Connect to EC2](#part-2-connect-to-ec2)
4. [Part 3: Install Node.js & Dependencies](#part-3-install-nodejs--dependencies)
5. [Part 4: Set Up PostgreSQL Database](#part-4-set-up-postgresql-database)
6. [Part 5: Deploy Your Application](#part-5-deploy-your-application)
7. [Part 6: Set Up Nginx Reverse Proxy](#part-6-set-up-nginx-reverse-proxy)
8. [Part 7: Configure SSL with Let's Encrypt](#part-7-configure-ssl-with-lets-encrypt)
9. [Part 8: Set Up PM2 Process Manager](#part-8-set-up-pm2-process-manager)
10. [Part 9: Final Testing](#part-9-final-testing)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, you need:

- ✅ AWS Account (with billing enabled)
- ✅ Domain name (optional but recommended for SSL)
- ✅ Your GitHub repository or code ready to deploy
- ✅ Basic terminal/command line knowledge
- ✅ Firebase project (if using authentication)
- ✅ Cashfree account (if using payments)

---

## Part 1: Create EC2 Instance

### Step 1.1: Launch Instance

1. **Go to AWS Console**
   - Navigate to https://aws.amazon.com/console/
   - Sign in to your account
   - Search for "EC2" in the services search bar

2. **Click "Launch Instance"**
   - You'll see the big orange button on the EC2 dashboard

### Step 1.2: Configure Instance

**Name and Tags:**
```
Name: ORNUT-Production
```

**Application and OS Images (AMI):**
- Select: **Amazon Linux 2023 AMI**
- Architecture: **64-bit (x86)**
- Why? It's free tier eligible and optimized for AWS

**Instance Type:**
- Select: **t2.micro** (Free tier eligible)
- For production with more traffic: **t2.small** or **t3.small**
- CPU: 1 vCPU, Memory: 1 GiB (t2.micro)

**Key Pair (Required for SSH):**
- Click "Create new key pair"
- Key pair name: `ornut-ec2-key`
- Key pair type: **RSA**
- Private key format: **`.pem`** (for Mac/Linux) or **`.ppk`** (for Windows/PuTTY)
- Click "Create key pair"
- **IMPORTANT:** Save this file securely! You can't download it again

**Network Settings:**
Click "Edit" and configure:

- **Auto-assign public IP:** Enable
- **Firewall (Security Groups):** Create new security group
- **Security group name:** `ornut-web-sg`
- **Description:** `Security group for ORNUT e-commerce`

**Security Group Rules:**

| Type  | Protocol | Port | Source        | Description              |
|-------|----------|------|---------------|--------------------------|
| SSH   | TCP      | 22   | My IP         | SSH access (your IP only)|
| HTTP  | TCP      | 80   | 0.0.0.0/0     | Public web traffic       |
| HTTPS | TCP      | 443  | 0.0.0.0/0     | Secure web traffic       |

**To add rules:**
- SSH is already added
- Click "Add security group rule" for HTTP
- Click "Add security group rule" for HTTPS

**Configure Storage:**
- Size: **20 GiB** (increase from default 8 GiB)
- Volume type: **gp3** (faster and cheaper than gp2)
- Delete on termination: ✅ Checked

### Step 1.3: Review and Launch

1. Click "Launch instance"
2. Wait ~1 minute for instance to start
3. Click "View all instances"
4. Wait for "Instance State" to show **Running**
5. Note down your **Public IPv4 address** (e.g., `54.123.45.67`)

---

## Part 2: Connect to EC2

### Step 2.1: Set Permissions on Key File

**On Mac/Linux:**
```bash
# Navigate to where you downloaded the key
cd ~/Downloads

# Set correct permissions (required for SSH)
chmod 400 ornut-ec2-key.pem

# Move to a safe location (optional but recommended)
mkdir -p ~/.ssh
mv ornut-ec2-key.pem ~/.ssh/
```

**On Windows:**
- Use PuTTY or Windows Subsystem for Linux (WSL)
- If using WSL, follow Mac/Linux instructions above

### Step 2.2: Connect via SSH

```bash
# Replace YOUR_IP with your EC2 public IP
ssh -i ~/.ssh/ornut-ec2-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# Example:
# ssh -i ~/.ssh/ornut-ec2-key.pem ec2-user@54.123.45.67
```

**First time connecting?**
- Type `yes` when asked "Are you sure you want to continue connecting?"

**You should see:**
```
   ,     #_
   ~\_  ####_        Amazon Linux 2023
  ~~  \_#####\
  ~~     \###|
  ~~       \#/ ___   https://aws.amazon.com/linux/amazon-linux-2023
   ~~       V~' '->
    ~~~         /
      ~~._.   _/
         _/ _/
       _/m/'

[ec2-user@ip-172-31-xx-xx ~]$
```

✅ **You're now connected to your EC2 instance!**

---

## Part 3: Install Node.js & Dependencies

### Step 3.1: Update System

```bash
# Update all packages
sudo dnf update -y
```

### Step 3.2: Install Node.js

**Option A: Using DNF (Simplest - Recommended)**

```bash
# Install Node.js 20 (LTS)
sudo dnf install -y nodejs

# Verify installation
node --version   # Should show v18.x or v20.x
npm --version    # Should show 9.x or 10.x
```

**Option B: Using NVM (For version flexibility)**

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Activate NVM
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verify
node --version
npm --version
```

### Step 3.3: Install Essential Tools

```bash
# Install Git
sudo dnf install -y git

# Install build tools (for native npm modules)
sudo dnf groupinstall -y "Development Tools"

# Install PostgreSQL client (to test DB connections)
sudo dnf install -y postgresql15

# Verify installations
git --version
gcc --version
psql --version
```

---

## Part 4: Set Up PostgreSQL Database

You have two options: **AWS RDS (Recommended)** or **Self-hosted on EC2**

### Option A: AWS RDS (Recommended for Production)

#### 4.A.1: Create RDS Instance

1. **Go to RDS Console**
   - Search for "RDS" in AWS Console
   - Click "Create database"

2. **Database Settings**
   - Engine: **PostgreSQL**
   - Version: **PostgreSQL 15.x** (latest stable)
   - Templates: **Free tier** (or Production for better performance)

3. **DB Instance Settings**
   - DB instance identifier: `ornut-db`
   - Master username: `ornut_admin`
   - Master password: `YourStrongPassword123!` (save this!)
   - Confirm password

4. **Instance Configuration**
   - DB instance class: **db.t3.micro** (free tier) or **db.t3.small**

5. **Storage**
   - Storage type: **General Purpose SSD (gp3)**
   - Allocated storage: **20 GiB**
   - Disable storage autoscaling (for cost control)

6. **Connectivity**
   - VPC: **Default VPC** (same as your EC2)
   - Publicly accessible: **Yes** (for development)
   - VPC security group: Create new
   - Security group name: `ornut-db-sg`

7. **Additional Configuration**
   - Initial database name: `ornut`
   - Backup retention: 7 days
   - Disable Enhanced monitoring (to save costs)

8. **Click "Create database"**
   - Wait 5-10 minutes for creation

#### 4.A.2: Configure RDS Security Group

1. Go to RDS → Databases → Click your database
2. Click on the VPC security group
3. Edit inbound rules
4. Add rule:
   - Type: **PostgreSQL**
   - Port: **5432**
   - Source: Your EC2 security group (`ornut-web-sg`)

#### 4.A.3: Get Database Connection String

1. Go to your RDS database details
2. Find **Endpoint** (e.g., `ornut-db.xxxxx.us-east-1.rds.amazonaws.com`)
3. Your `DATABASE_URL` will be:

```
postgresql://ornut_admin:YourStrongPassword123!@ornut-db.xxxxx.us-east-1.rds.amazonaws.com:5432/ornut
```

Format:
```
postgresql://USERNAME:PASSWORD@ENDPOINT:5432/DATABASE_NAME
```

#### 4.A.4: Test Connection from EC2

```bash
# Test connection
psql "postgresql://ornut_admin:YourStrongPassword123!@ornut-db.xxxxx.us-east-1.rds.amazonaws.com:5432/ornut"

# If successful, you'll see:
# ornut=>

# Exit
\q
```

### Option B: Self-Hosted PostgreSQL on EC2

**Only use this for development/testing. RDS is recommended for production.**

```bash
# Install PostgreSQL 15
sudo dnf install -y postgresql15-server

# Initialize database
sudo postgresql-setup --initdb

# Start and enable
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql
CREATE DATABASE ornut;
CREATE USER ornut_admin WITH PASSWORD 'YourPassword123';
GRANT ALL PRIVILEGES ON DATABASE ornut TO ornut_admin;
\q
exit

# Edit config to allow password auth
sudo nano /var/lib/pgsql/data/pg_hba.conf
# Change peer to md5 for local connections

# Restart PostgreSQL
sudo systemctl restart postgresql
```

Your `DATABASE_URL`:
```
postgresql://ornut_admin:YourPassword123@localhost:5432/ornut
```

---

## Part 5: Deploy Your Application

### Step 5.1: Clone Your Repository

```bash
# Navigate to home directory
cd ~

# Clone from GitHub
git clone https://github.com/its-ansh-jha/ORNUT.git
cd ORNUT

# Or if you have it on Replit, you can download and upload via scp
# On your local machine:
# scp -i ~/.ssh/ornut-ec2-key.pem -r ./ORNUT ec2-user@YOUR_EC2_IP:~/
```

### Step 5.2: Create .env File

```bash
# Create .env file in the ORNUT directory
nano .env
```

**Paste this configuration (update with your actual values):**

```env
# Node Environment
NODE_ENV=production
PORT=5000

# Database (REQUIRED)
DATABASE_URL=postgresql://ornut_admin:YourPassword@your-rds-endpoint:5432/ornut

# Session (REQUIRED)
SESSION_SECRET=your-session-secret-here

# Cashfree Payment Gateway
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=PRODUCTION

# Admin Access
ADMIN_PASSWORD_HASH=your-bcrypt-password-hash

# Firebase Client Configuration (Frontend)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin SDK (Backend)
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----"

# Formspree Contact Form
FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
```

**Save and exit:**
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

### Step 5.3: Generate Required Secrets

**Generate Session Secret:**
```bash
openssl rand -base64 32
# Copy the output and paste in .env for SESSION_SECRET
```

**Generate Admin Password Hash:**
```bash
# First install bcryptjs
npm install -g bcryptjs

# Generate hash (replace 'AdminPassword123' with your password)
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('AdminPassword123', 10))"
# Copy the output and paste in .env for ADMIN_PASSWORD_HASH
```

### Step 5.4: Install Dependencies

```bash
# Make sure you're in the ORNUT directory
cd ~/ORNUT

# Install all dependencies
npm install

# This will take 2-5 minutes
```

### Step 5.5: Build for Production

```bash
# Build the application
npm run build

# This compiles:
# - Frontend React app → dist/public/
# - Backend server → dist/index.js
```

You should see:
```
✓ 2075 modules transformed.
../dist/public/index.html    3.11 kB
../dist/public/assets/...
✓ built in 12.53s

dist/index.js  56.2kb
⚡ Done
```

### Step 5.6: Initialize Database Schema

```bash
# Push database schema
npm run db:push

# If you see a data-loss warning:
npm run db:push -- --force
```

You should see:
```
✓ Pushing schema to database...
✓ Tables created successfully
```

### Step 5.7: Test the Application

```bash
# Start the app (test mode)
npm start

# You should see:
# ✓ Loaded environment variables from .env file
# ✓ Critical environment variables are set
# Server running on port 5000
```

**Test locally on EC2:**
```bash
# Open a new SSH session (keep the app running in the first one)
ssh -i ~/.ssh/ornut-ec2-key.pem ec2-user@YOUR_EC2_IP

# Test the server
curl http://localhost:5000

# You should see HTML response
```

**Press Ctrl + C to stop the app for now** (we'll use PM2 later)

---

## Part 6: Set Up Nginx Reverse Proxy

### Step 6.1: Install Nginx

```bash
# Install Nginx
sudo dnf install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### Step 6.2: Configure Nginx

```bash
# Create configuration for your app
sudo nano /etc/nginx/conf.d/ornut.conf
```

**Paste this configuration:**

```nginx
# HTTP Server Block
server {
    listen 80;
    listen [::]:80;
    
    # Replace with your domain or use _ for IP access
    server_name your-domain.com www.your-domain.com;
    
    # If you don't have a domain yet, use:
    # server_name _;

    # Reverse proxy to Node.js app
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        
        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Forward headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Don't cache
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (if any)
    location /attached_assets/ {
        alias /home/ec2-user/ORNUT/attached_assets/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

### Step 6.3: Test and Restart Nginx

```bash
# Test configuration
sudo nginx -t

# Should show:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
sudo systemctl reload nginx
```

### Step 6.4: Configure Firewall (if needed)

```bash
# Allow HTTP and HTTPS through firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## Part 7: Configure SSL with Let's Encrypt

**Skip this if you don't have a domain yet. You can add SSL later.**

### Prerequisites

- ✅ Domain name registered
- ✅ Domain DNS points to your EC2 public IP
  - Create an A record: `your-domain.com` → `YOUR_EC2_IP`
  - Wait 5-10 minutes for DNS to propagate

### Step 7.1: Install Certbot

```bash
# Install Certbot for Nginx
sudo dnf install -y certbot python3-certbot-nginx
```

### Step 7.2: Update Nginx Config with Domain

```bash
# Edit Nginx config
sudo nano /etc/nginx/conf.d/ornut.conf

# Change this line:
# server_name _;
# To:
server_name your-domain.com www.your-domain.com;

# Save and test
sudo nginx -t
sudo systemctl reload nginx
```

### Step 7.3: Get SSL Certificate

```bash
# Run Certbot (it will configure Nginx automatically)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# 1. Enter email address
# 2. Agree to Terms (A)
# 3. Share email? (Y/N - your choice)
# 4. Redirect HTTP to HTTPS? Choose 2 (Redirect)
```

**Certbot will:**
- Get certificates from Let's Encrypt
- Update your Nginx configuration
- Set up auto-renewal

### Step 7.4: Test Auto-Renewal

```bash
# Test renewal process (dry run)
sudo certbot renew --dry-run

# Should show:
# Congratulations, all simulated renewals succeeded
```

### Step 7.5: Verify HTTPS

Open your browser and visit:
- `http://your-domain.com` (should redirect to HTTPS)
- `https://your-domain.com` (should show secure lock icon)

---

## Part 8: Set Up PM2 Process Manager

PM2 keeps your Node.js app running 24/7, auto-restarts on crashes, and starts on server reboot.

### Step 8.1: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2
```

### Step 8.2: Start Your Application

```bash
# Navigate to app directory
cd ~/ORNUT

# Start app with PM2
pm2 start npm --name "ornut" -- start

# You should see:
# ┌─────┬──────────┬─────────────┬─────────┬─────────┬──────────┬
# │ id  │ name     │ mode        │ status  │ cpu     │ memory   │
# ├─────┼──────────┼─────────────┼─────────┼─────────┼──────────┤
# │ 0   │ ornut    │ fork        │ online  │ 0%      │ 45.5mb   │
# └─────┴──────────┴─────────────┴─────────┴─────────┴──────────┘
```

### Step 8.3: Configure Auto-Start on Boot

```bash
# Set up PM2 to start on system boot
pm2 startup

# Copy and run the command it shows (something like):
# sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user

# Save current PM2 process list
pm2 save

# You should see:
# [PM2] Saving current process list...
# [PM2] Successfully saved
```

### Step 8.4: Useful PM2 Commands

```bash
# View all processes
pm2 list

# View logs (live)
pm2 logs ornut

# View logs (last 100 lines)
pm2 logs ornut --lines 100

# Monitor CPU/Memory
pm2 monit

# Restart app
pm2 restart ornut

# Stop app
pm2 stop ornut

# Delete from PM2
pm2 delete ornut

# View detailed info
pm2 show ornut
```

---

## Part 9: Final Testing

### Step 9.1: Test HTTP Access

```bash
# Test from EC2
curl http://localhost:5000
curl http://YOUR_EC2_IP

# Open browser and visit:
# http://YOUR_EC2_IP
# or
# https://your-domain.com (if you set up SSL)
```

### Step 9.2: Test All Features

Open your website and test:

- ✅ Homepage loads
- ✅ Product pages work
- ✅ Cart functionality
- ✅ User authentication (Firebase)
- ✅ Payment gateway (Cashfree) - Use test mode first!
- ✅ Contact form (Formspree)
- ✅ Admin panel access

### Step 9.3: Check Application Logs

```bash
# View application logs
pm2 logs ornut

# Check for errors
pm2 logs ornut --err

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Step 9.4: Monitor System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
pm2 monit

# Check system load
uptime
```

---

## Troubleshooting

### Issue 1: Can't Connect via SSH

**Problem:** `Permission denied (publickey)` or `Connection timeout`

**Solutions:**
```bash
# 1. Check key permissions
chmod 400 ~/.ssh/ornut-ec2-key.pem

# 2. Verify you're using correct key
ssh -v -i ~/.ssh/ornut-ec2-key.pem ec2-user@YOUR_IP
# Look for "debug" messages

# 3. Check Security Group
# - Go to EC2 Console
# - Security Groups
# - Verify port 22 is open for your IP

# 4. Verify instance is running
# - Go to EC2 Console
# - Check instance state is "Running"
```

### Issue 2: Website Not Loading

**Problem:** Browser shows "This site can't be reached"

**Solutions:**
```bash
# 1. Check if app is running
pm2 list
pm2 logs ornut

# 2. Check if Nginx is running
sudo systemctl status nginx

# 3. Test locally first
curl http://localhost:5000

# 4. Check Security Group
# - Port 80 (HTTP) should allow 0.0.0.0/0
# - Port 443 (HTTPS) should allow 0.0.0.0/0

# 5. Check Nginx configuration
sudo nginx -t
sudo systemctl restart nginx
```

### Issue 3: 502 Bad Gateway

**Problem:** Nginx shows "502 Bad Gateway"

**Solutions:**
```bash
# 1. Check if Node.js app is running
pm2 list
pm2 restart ornut

# 2. Check app logs for errors
pm2 logs ornut --err

# 3. Verify port in Nginx config matches app
# App runs on port 5000
# Nginx should proxy_pass to http://127.0.0.1:5000

# 4. Check if port is listening
sudo netstat -tlnp | grep 5000

# 5. Restart everything
pm2 restart ornut
sudo systemctl restart nginx
```

### Issue 4: Database Connection Failed

**Problem:** `Error: DATABASE_URL must be set` or connection timeout

**Solutions:**
```bash
# 1. Verify .env file exists
ls -la ~/ORNUT/.env
cat ~/ORNUT/.env | grep DATABASE_URL

# 2. Test database connection
psql "$DATABASE_URL"

# 3. Check RDS Security Group
# - Should allow PostgreSQL (5432) from EC2 security group

# 4. Verify DATABASE_URL format
# postgresql://USERNAME:PASSWORD@ENDPOINT:5432/DATABASE

# 5. Rebuild app
cd ~/ORNUT
npm run build
pm2 restart ornut
```

### Issue 5: SSL Certificate Issues

**Problem:** `NET::ERR_CERT_AUTHORITY_INVALID` or HTTPS not working

**Solutions:**
```bash
# 1. Verify domain DNS
dig +short your-domain.com
# Should show your EC2 IP

# 2. Check certificate
sudo certbot certificates

# 3. Renew certificate
sudo certbot renew

# 4. Check Nginx SSL config
sudo nano /etc/nginx/conf.d/ornut.conf
# Verify ssl_certificate paths

# 5. Test SSL
curl -I https://your-domain.com
```

### Issue 6: Application Crashes

**Problem:** PM2 shows app as "errored" or constantly restarting

**Solutions:**
```bash
# 1. Check logs for errors
pm2 logs ornut --lines 200

# 2. Check environment variables
cat ~/ORNUT/.env
# Verify all required variables are set

# 3. Test app manually
cd ~/ORNUT
npm start
# Look for error messages

# 4. Check Node.js version
node --version
# Should be v18 or v20

# 5. Reinstall dependencies
npm install
npm run build
pm2 restart ornut
```

### Issue 7: Out of Memory

**Problem:** Instance freezes or becomes unresponsive

**Solutions:**
```bash
# 1. Check memory usage
free -h
pm2 monit

# 2. Upgrade instance type
# - t2.micro (1GB) → t2.small (2GB)
# - Stop instance → Actions → Instance Settings → Change Instance Type

# 3. Add swap space (temporary fix)
sudo dd if=/dev/zero of=/swapfile bs=1M count=1024
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 4. Reduce Node.js memory if needed
pm2 delete ornut
pm2 start npm --name "ornut" --max-memory-restart 400M -- start
```

### Issue 8: Firebase Authentication Not Working

**Problem:** "Firebase: Error (auth/invalid-api-key)"

**Solutions:**
```bash
# 1. Verify Firebase credentials in .env
cat ~/ORNUT/.env | grep FIREBASE

# 2. Rebuild with new env variables
cd ~/ORNUT
npm run build
pm2 restart ornut

# 3. Check Firebase console
# - Go to Firebase Console
# - Project Settings
# - Verify API key matches .env

# 4. Check if API key restrictions
# - Firebase Console → API Keys
# - Remove IP restrictions for testing
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED` | Database not accessible | Check DATABASE_URL and RDS security group |
| `EADDRINUSE` | Port 5000 already in use | `sudo lsof -ti:5000 \| xargs kill -9` |
| `MODULE_NOT_FOUND` | Missing dependencies | `npm install` |
| `Permission denied` | File permissions | `chmod` or `chown` the file |
| `502 Bad Gateway` | App not running | `pm2 restart ornut` |
| `CERT_UNTRUSTED` | SSL certificate issue | `sudo certbot renew` |

---

## Performance Optimization

### Enable Gzip Compression

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside `http` block:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Enable Caching

Add to your Nginx server block:
```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Cluster Mode

For better performance (multi-core):
```bash
pm2 delete ornut
pm2 start npm --name "ornut" -i max -- start
pm2 save
```

---

## Security Checklist

Before going live:

- ✅ Change all default passwords
- ✅ Restrict SSH to your IP only
- ✅ Enable HTTPS (SSL certificate)
- ✅ Use strong SESSION_SECRET
- ✅ Keep system updated (`sudo dnf update`)
- ✅ Set up automated backups (RDS snapshots)
- ✅ Enable CloudWatch monitoring
- ✅ Set up firewall rules
- ✅ Use environment variables (never hardcode secrets)
- ✅ Test payment gateway in sandbox mode first
- ✅ Set up error logging and monitoring

---

## Backup Strategy

### Database Backup

**RDS Automated Backups:**
- Go to RDS Console
- Select your database
- Modify → Backup retention period: 7 days
- Enable automatic backups

**Manual Backup:**
```bash
# Backup database
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Restore backup
psql "$DATABASE_URL" < backup_20241119.sql
```

### Application Backup

```bash
# Create backup of application
cd ~
tar -czf ornut-backup-$(date +%Y%m%d).tar.gz ORNUT/

# Copy to S3 (optional)
aws s3 cp ornut-backup-$(date +%Y%m%d).tar.gz s3://your-bucket/backups/
```

---

## Monitoring & Maintenance

### Set Up CloudWatch

1. **Go to CloudWatch Console**
2. **Create Alarm** for:
   - CPU usage > 80%
   - Memory usage > 80%
   - Disk space < 20%
   - HTTP 5xx errors

### Regular Maintenance Tasks

**Weekly:**
```bash
# Update system packages
sudo dnf update -y

# Check disk space
df -h

# Check logs for errors
pm2 logs ornut --lines 1000 | grep -i error
```

**Monthly:**
```bash
# Clean npm cache
npm cache clean --force

# Clean old logs
pm2 flush

# Review security group rules
# Check for any suspicious access in logs
```

---

## Cost Optimization

### Free Tier Resources (12 months)

- EC2 t2.micro: 750 hours/month
- RDS db.t3.micro: 750 hours/month
- 30 GB EBS storage
- 15 GB data transfer out

### After Free Tier

**Estimated Monthly Costs:**
- EC2 t2.small: ~$17/month
- RDS db.t3.micro: ~$15/month
- 20 GB EBS: ~$2/month
- Data transfer: ~$5/month
- **Total: ~$40/month**

**Cost Reduction Tips:**
- Use reserved instances (save up to 75%)
- Stop instances when not needed
- Use S3 for static assets
- Enable gzip compression
- Use CloudFront CDN

---

## Next Steps

After successful deployment:

1. **Point Your Domain** to EC2 IP
2. **Set Up Email** notifications (SES)
3. **Configure Analytics** (Google Analytics)
4. **Set Up Monitoring** (CloudWatch, UptimeRobot)
5. **Create Staging Environment** for testing
6. **Set Up CI/CD** with GitHub Actions
7. **Add CDN** (CloudFront) for better performance
8. **Configure WAF** for security
9. **Set Up Log Aggregation** (CloudWatch Logs)
10. **Create Documentation** for your team

---

## Quick Reference Commands

```bash
# SSH into EC2
ssh -i ~/.ssh/ornut-ec2-key.pem ec2-user@YOUR_IP

# Check app status
pm2 list
pm2 logs ornut

# Restart app
pm2 restart ornut

# Update code
cd ~/ORNUT
git pull
npm install
npm run build
pm2 restart ornut

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# View logs
pm2 logs ornut
sudo tail -f /var/log/nginx/error.log

# Database
psql "$DATABASE_URL"

# System info
df -h          # Disk space
free -h        # Memory
uptime         # Server uptime
pm2 monit      # Real-time monitoring
```

---

## Support Resources

- **AWS Documentation:** https://docs.aws.amazon.com/
- **PM2 Docs:** https://pm2.io/docs/
- **Nginx Docs:** https://nginx.org/en/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **PostgreSQL:** https://www.postgresql.org/docs/

---

## Congratulations! 🎉

Your ORNUT e-commerce application is now:
- ✅ Running on a production EC2 server
- ✅ Secured with HTTPS (if domain configured)
- ✅ Auto-restarting with PM2
- ✅ Serving behind Nginx reverse proxy
- ✅ Connected to PostgreSQL database
- ✅ Ready to accept customers!

**Your website is live and ready for business!** 🚀

For questions or issues, refer to the troubleshooting section or check the application logs.
