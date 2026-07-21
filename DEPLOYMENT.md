# WEB LAUNCH - Deployment Guide

## Pre-Deployment Checklist

### ✅ 1. Verify All Dependencies Are Installed

\`\`\`bash
npm install
\`\`\`

### ✅ 2. Configure Environment Variables

Create `.env.local` file with:

\`\`\`
EMAIL_PASSWORD=your_gmail_app_password_here
\`\`\`

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Copy the 16-character password
5. Paste in `.env.local`

### ✅ 3. Verify Logo Files

Check that these files exist in `public/assets/`:
- logo.png
- logo-white.png
- favicon-32.png
- favicon-64.png
- favicon-192.png
- favicon-512.png

### ✅ 4. Test Locally

\`\`\`bash
npm run dev
\`\`\`

Test all pages:
- ✓ Home: http://localhost:3000/en
- ✓ Services: http://localhost:3000/en/services
- ✓ Portfolio: http://localhost:3000/en/portfolio
- ✓ About: http://localhost:3000/en/about
- ✓ Process: http://localhost:3000/en/process
- ✓ Contact: http://localhost:3000/en/contact

Test all languages:
- 🇦🇱 Albanian: /al
- English: /en
- 🇩🇪 German: /de
- 🇫🇷 French: /fr
- 🇮🇹 Italian: /it
- 🇹🇷 Turkish: /tr
- 🇪🇸 Spanish: /es

### ✅ 5. Test Contact Form

1. Fill out the contact form
2. Submit and verify:
   - Success message appears
   - Email received at weblaunchdigital@gmail.com
   - Confirmation email sent to user

### ✅ 6. Test WhatsApp Button

Click the floating WhatsApp button and verify it opens WhatsApp with:
- Phone: +38345949507
- Pre-filled message

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros:** Easy, automatic, optimized for Next.js, free SSL

**Steps:**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Add environment variable:
   - Name: `EMAIL_PASSWORD`
   - Value: Your Gmail app password
7. Click "Deploy"

**Custom Domain:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., weblaunch.com)
3. Update DNS records as instructed
4. SSL automatically configured

---

### Option 2: Netlify

**Steps:**
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import from Git"
4. Select your repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site Settings
7. Deploy

---

### Option 3: DigitalOcean App Platform

**Steps:**
1. Push code to GitHub
2. Go to DigitalOcean → App Platform
3. Create new app from GitHub
4. Select repository
5. Configure:
   - Environment: Node.js
   - Build command: `npm run build`
   - Run command: `npm start`
6. Add environment variables
7. Choose plan and deploy

---

### Option 4: Traditional VPS (Advanced)

**Requirements:**
- VPS with Ubuntu 20.04+
- Node.js 18+
- Nginx
- PM2

**Steps:**

1. **Set up server:**
\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
\`\`\`

2. **Deploy code:**
\`\`\`bash
# Clone repository
git clone your-repo-url /var/www/weblaunch
cd /var/www/weblaunch

# Install dependencies
npm install

# Build
npm run build

# Create .env.local file
nano .env.local
# Add: EMAIL_PASSWORD=your_password

# Start with PM2
pm2 start npm --name "weblaunch" -- start
pm2 save
pm2 startup
\`\`\`

3. **Configure Nginx:**
\`\`\`nginx
# /etc/nginx/sites-available/weblaunch
server {
    listen 80;
    server_name weblaunch.com www.weblaunch.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

\`\`\`bash
# Enable site
sudo ln -s /etc/nginx/sites-available/weblaunch /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Install SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d weblaunch.com -d www.weblaunch.com
\`\`\`

---

## Post-Deployment

### ✅ 1. Update Domain in Code

Update `baseUrl` in `app/sitemap.ts`:
\`\`\`typescript
const baseUrl = 'https://yourdomainname.com';
\`\`\`

### ✅ 2. Test Production Site

- Test all pages work
- Test all language versions
- Test contact form sends emails
- Test on mobile devices
- Test all browser (Chrome, Firefox, Safari, Edge)

### ✅ 3. Submit Sitemap to Search Engines

**Google Search Console:**
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property: `yourdomainname.com`
3. Verify ownership
4. Submit sitemap: `https://yourdomainname.com/sitemap.xml`

**Bing Webmaster Tools:**
1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Add site
3. Submit sitemap

### ✅ 4. Set Up Analytics (Optional)

**Google Analytics:**
1. Create GA4 property
2. Add tracking code to `app/layout.tsx`

**Microsoft Clarity (Free):**
1. Create project at [clarity.microsoft.com](https://clarity.microsoft.com)
2. Add tracking code

### ✅ 5. Set Up Monitoring

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- Better Uptime

**Error Tracking:**
- Sentry (free tier)
- LogRocket

### ✅ 6. Performance Optimization

Check your site performance:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

Should achieve:
- ✓ Mobile score: 90+
- ✓ Desktop score: 95+
- ✓ First Contentful Paint: < 1.5s
- ✓ Largest Contentful Paint: < 2.5s

---

## Maintenance

### Regular Tasks

**Weekly:**
- Monitor contact form submissions
- Check email delivery
- Review analytics

**Monthly:**
- Update dependencies: `npm update`
- Review and respond to inquiries
- Check for broken links

**Quarterly:**
- Update Node.js if needed
- Security audit: `npm audit`
- Performance review

---

## Support

If you encounter issues:

1. **Check logs:**
   - Vercel: Project → Deployments → View logs
   - VPS: `pm2 logs weblaunch`

2. **Common issues:**
   - Email not sending → Check EMAIL_PASSWORD
   - Language not working → Clear build cache
   - Images not showing → Check file paths

3. **Contact:**
   - Email: weblaunchdigital@gmail.com
   - Phone: +383 45 949 507

---

## Backup Strategy

**Automated Backups:**
1. Code → GitHub (automatic)
2. Database (if added) → Daily backups
3. Media files → Cloud storage

**Manual Backup:**
\`\`\`bash
# Create backup
tar -czf weblaunch-backup-$(date +%Y%m%d).tar.gz /var/www/weblaunch

# Download backup
scp user@server:/path/to/backup.tar.gz ./
\`\`\`

---

## Future Enhancements

Consider adding:
- ✨ Blog section
- ✨ Client testimonials
- ✨ Live chat integration
- ✨ CMS for easy content updates
- ✨ Analytics dashboard
- ✨ Booking system
- ✨ Payment integration

---

**🚀 Ready to Launch!**

Once everything is verified, your premium multilingual website is ready to help WEB LAUNCH grow internationally!
