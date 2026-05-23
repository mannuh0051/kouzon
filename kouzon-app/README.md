# Kouzon Kenya — Deployment Guide

## Files in this zip
```
kouzon-app/
├── server.js          ← Node.js backend
├── package.json       ← Dependencies
└── public/
    ├── index.html     ← Main website
    └── admin.html     ← Admin dashboard (/admin)
```

---

## STEP 1 — Get a free JSONBin account (2 min)
1. Go to https://jsonbin.io and click Sign Up (free)
2. After login, click **"+ Create Bin"**
3. Paste this as the initial content: `{"applicants":[]}`
4. Click Save. Copy the **BIN ID** from the URL (looks like: 64abc123...)
5. Go to **API Keys** tab → copy your **Master Key** (starts with $2b$...)

---

## STEP 2 — Push to GitHub (3 min)
1. Go to https://github.com and create a **New Repository** (name it `kouzon-kenya`, set to Public)
2. On your computer, install Git if not installed: https://git-scm.com
3. Open terminal/command prompt in the `kouzon-app` folder and run:
```
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kouzon-kenya.git
git push -u origin main
```
Replace YOUR_USERNAME with your GitHub username.

---

## STEP 3 — Deploy on Render (5 min)
1. Go to https://render.com and sign up (free, use GitHub login)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select the `kouzon-kenya` repo
4. Fill in:
   - **Name**: kouzon-kenya
   - **Region**: pick closest (e.g. Frankfurt for East Africa latency)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Click **"Advanced"** → **"Add Environment Variable"** and add these 3:
   ```
   JSONBIN_API_KEY   →  paste your JSONBin Master Key
   JSONBIN_BIN_ID    →  paste your JSONBin Bin ID
   ADMIN_PASSWORD    →  choose a strong password (e.g. KouzonAdmin2026!)
   ```
6. Click **"Create Web Service"**
7. Wait ~2 minutes for deploy. Render gives you a URL like:
   `https://kouzon-kenya.onrender.com`

---

## Your pages
| Page | URL |
|------|-----|
| Main website | https://your-app.onrender.com |
| Admin dashboard | https://your-app.onrender.com/admin |

---

## Admin Dashboard
- Go to `/admin` → enter ADMIN_PASSWORD you set
- See all applicants, their details, payment status
- Download CVs directly

---

## Notes
- Render free tier sleeps after 15min of inactivity (first load takes ~30sec to wake)
- JSONBin free tier: 10,000 requests/month — enough for hundreds of applicants
- NestLink API secret already set in the frontend code
- To update the site: edit files → `git add . && git commit -m "update" && git push` → Render auto-redeploys
