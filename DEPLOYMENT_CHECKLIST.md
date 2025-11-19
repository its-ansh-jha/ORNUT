# EC2 Deployment Checklist

Quick checklist for deploying ORNUT to AWS EC2.

---

## Pre-Deployment

- [ ] AWS account created and active
- [ ] Domain name registered (optional but recommended)
- [ ] Firebase project configured
- [ ] Cashfree account set up
- [ ] Formspree form created

---

## Part 1: AWS Setup (30 minutes)

### Create EC2 Instance
- [ ] Launch Amazon Linux 2023 instance (t2.micro or larger)
- [ ] Create and download key pair (`ornut-ec2-key.pem`)
- [ ] Configure security group with ports: 22, 80, 443
- [ ] Set storage to 20 GB
- [ ] Launch and wait for "Running" state
- [ ] Note public IP address: `________________`

### Create RDS Database (Optional - Recommended)
- [ ] Create PostgreSQL 15 RDS instance
- [ ] Set DB name: `ornut`
- [ ] Set master username: `ornut_admin`
- [ ] Set strong password: `________________`
- [ ] Configure security group to allow EC2 access
- [ ] Wait for "Available" status
- [ ] Note endpoint: `________________`

---

## Part 2: Connect & Configure (20 minutes)

### SSH Access
- [ ] Set key permissions: `chmod 400 ornut-ec2-key.pem`
- [ ] Connect via SSH: `ssh -i ornut-ec2-key.pem ec2-user@YOUR_IP`

### Install Software
- [ ] Update system: `sudo dnf update -y`
- [ ] Install Node.js: `sudo dnf install -y nodejs`
- [ ] Install Git: `sudo dnf install -y git`
- [ ] Install Nginx: `sudo dnf install -y nginx`
- [ ] Install PM2: `sudo npm install -g pm2`
- [ ] Verify: `node --version && npm --version`

---

## Part 3: Deploy Application (30 minutes)

### Clone & Setup
- [ ] Clone repo: `git clone https://github.com/its-ansh-jha/ORNUT.git`
- [ ] Navigate: `cd ORNUT`
- [ ] Create `.env` file

### Generate Secrets
- [ ] Session secret: `openssl rand -base64 32`
- [ ] Admin password hash: `node -e "...bcrypt..."`
- [ ] Copy to `.env` file

### Configure .env File
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `SESSION_SECRET=...`
- [ ] `CASHFREE_APP_ID=...`
- [ ] `CASHFREE_SECRET_KEY=...`
- [ ] `FIREBASE_...` (all 9 variables)
- [ ] `FORMSPREE_ENDPOINT=...`
- [ ] `ADMIN_PASSWORD_HASH=...`

### Build & Deploy
- [ ] Install: `npm install`
- [ ] Build: `npm run build`
- [ ] Push schema: `npm run db:push`
- [ ] Test: `npm start` (then Ctrl+C)

---

## Part 4: Production Setup (20 minutes)

### Configure Nginx
- [ ] Create config: `/etc/nginx/conf.d/ornut.conf`
- [ ] Set server_name (domain or `_` for IP)
- [ ] Configure proxy to localhost:5000
- [ ] Test: `sudo nginx -t`
- [ ] Start: `sudo systemctl start nginx && sudo systemctl enable nginx`

### Configure PM2
- [ ] Start app: `pm2 start npm --name "ornut" -- start`
- [ ] Enable startup: `pm2 startup` (run the command it gives)
- [ ] Save: `pm2 save`
- [ ] Verify: `pm2 list`

---

## Part 5: SSL Setup (15 minutes - Optional)

**Only if you have a domain**

### DNS Configuration
- [ ] Point domain A record to EC2 IP
- [ ] Wait 5-10 minutes for propagation
- [ ] Verify: `dig +short your-domain.com`

### SSL Certificate
- [ ] Install Certbot: `sudo dnf install -y certbot python3-certbot-nginx`
- [ ] Update Nginx config with domain name
- [ ] Get certificate: `sudo certbot --nginx -d your-domain.com`
- [ ] Choose redirect option (2)
- [ ] Test auto-renewal: `sudo certbot renew --dry-run`

---

## Part 6: Testing (10 minutes)

### Application Tests
- [ ] Visit: `http://YOUR_EC2_IP` or `https://your-domain.com`
- [ ] Test homepage loads
- [ ] Test product pages
- [ ] Test cart functionality
- [ ] Test authentication
- [ ] Test contact form
- [ ] Check admin panel

### System Tests
- [ ] Check PM2: `pm2 list`
- [ ] Check logs: `pm2 logs ornut`
- [ ] Check Nginx: `sudo systemctl status nginx`
- [ ] Check disk space: `df -h`
- [ ] Check memory: `free -h`

---

## Part 7: Monitoring (5 minutes)

- [ ] Set up CloudWatch alarms
- [ ] Configure log rotation
- [ ] Test PM2 auto-restart: `pm2 restart ornut`
- [ ] Test server reboot (PM2 should auto-start)

---

## Security Checklist

- [ ] SSH restricted to your IP only
- [ ] Strong passwords used everywhere
- [ ] HTTPS enabled (if domain available)
- [ ] Firewall configured
- [ ] Database in private subnet (RDS) or localhost only
- [ ] Environment variables in `.env` (not committed to git)
- [ ] Payment gateway in test mode initially
- [ ] Regular backups configured

---

## Post-Deployment

- [ ] Test all payment flows (sandbox mode)
- [ ] Set up monitoring alerts
- [ ] Configure automated backups
- [ ] Document admin credentials securely
- [ ] Create staging environment
- [ ] Set up CI/CD (optional)
- [ ] Configure CDN (optional)
- [ ] Switch to production payment mode (when ready)

---

## Estimated Timeline

| Phase | Time | 
|-------|------|
| AWS Setup | 30 min |
| Software Installation | 20 min |
| Application Deployment | 30 min |
| Production Setup | 20 min |
| SSL Configuration | 15 min |
| Testing | 10 min |
| **Total** | **~2 hours** |

---

## Quick Commands Reference

```bash
# Connect
ssh -i ~/.ssh/ornut-ec2-key.pem ec2-user@YOUR_IP

# Check status
pm2 list
pm2 logs ornut
sudo systemctl status nginx

# Restart
pm2 restart ornut
sudo systemctl restart nginx

# Update code
cd ~/ORNUT
git pull
npm install
npm run build
pm2 restart ornut

# Monitor
pm2 monit
df -h
free -h
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't SSH | Check key permissions: `chmod 400 key.pem` |
| 502 Bad Gateway | `pm2 restart ornut` |
| Database error | Check `.env` DATABASE_URL |
| HTTPS not working | Run `sudo certbot renew` |
| App crashes | Check `pm2 logs ornut --err` |
| Out of memory | Upgrade to t2.small |

---

## Success Criteria

Your deployment is successful when:

✅ Website loads at `http://YOUR_IP` or `https://your-domain.com`  
✅ `pm2 list` shows app as "online"  
✅ Database connections work  
✅ All pages navigate correctly  
✅ Forms submit successfully  
✅ PM2 auto-restarts after `pm2 restart ornut`  
✅ App survives server reboot  
✅ HTTPS works (if domain configured)  
✅ No errors in `pm2 logs`  

---

**Ready to deploy? Follow the complete guide in `COMPLETE_EC2_DEPLOYMENT_GUIDE.md`**
