# Quick Deployment Guide - GitHub + Vercel

## Step 1: Push to GitHub

### If you don't have Git installed:
Download and install from [git-scm.com](https://git-scm.com/)

### Initialize Git and Push:

Open terminal/command prompt in the E.A.M.W folder and run:

```bash
git init
git add .
git commit -m "Initial commit - Early Access Manager"
```

### Create GitHub Repository:

1. Go to [github.com](https://github.com/)
2. Click the **"+"** icon → **"New repository"**
3. Repository name: `early-access-manager`
4. Make it **Private** (recommended - contains Firebase config)
5. **Don't** initialize with README (we already have files)
6. Click **"Create repository"**

### Push to GitHub:

Copy the commands from GitHub (they'll look like this):

```bash
git remote add origin https://github.com/YOUR_USERNAME/early-access-manager.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/)
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub
5. Click **"Add New"** → **"Project"**
6. Find your `early-access-manager` repository
7. Click **"Import"**
8. Click **"Deploy"** (no configuration needed!)
9. Wait 30 seconds - your site is live!

## Step 3: After Deployment

### 1. Authorize Domain in Firebase
1. Copy your Vercel URL (e.g., `early-access-manager.vercel.app`)
2. Go to [Firebase Console](https://console.firebase.google.com/)
3. Select project: `earlyaccessmanagerweb`
4. Go to **Authentication** → **Settings** → **Authorized domains**
5. Click **"Add domain"**
6. Paste your Vercel URL
7. Click **"Add"**

### 2. Get Your Admin UID
1. Open your deployed site
2. Click "Sign In with Google"
3. Sign in with your account
4. Press **F12** to open browser console
5. Type: `firebase.auth().currentUser.uid`
6. **Copy the UID**

### 3. Update Admin UID in Code
1. Open `script.js` in your editor
2. Find: `const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';`
3. Replace with your actual UID
4. Save the file

### 4. Update Database Rules
1. Go to Firebase Console → **Realtime Database** → **Rules**
2. Replace `YOUR_ADMIN_UID_HERE` with your actual UID (in 2 places)
3. Click **"Publish"**

### 5. Push Update to GitHub

```bash
git add .
git commit -m "Update admin UID"
git push
```

Vercel will automatically redeploy with your changes!

## Future Updates

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel automatically redeploys on every push!

## Add Custom Domain (Optional)

1. In Vercel dashboard, click your project
2. Go to **Settings** → **Domains**
3. Click **"Add"**
4. Enter your domain
5. Follow DNS instructions
6. Add custom domain to Firebase authorized domains too

## Troubleshooting

**Git not found?**
- Install Git from [git-scm.com](https://git-scm.com/)

**Permission denied (GitHub)?**
- Use HTTPS URL, not SSH
- Or set up SSH keys: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

**Vercel not auto-deploying?**
- Check Vercel dashboard → Settings → Git
- Make sure auto-deploy is enabled

**Google Sign-In not working?**
- Verify Vercel domain is in Firebase authorized domains
- Clear browser cache

## You're Done!

Your site is now live and will auto-deploy on every Git push! 🚀

**Your URLs:**
- GitHub: `https://github.com/YOUR_USERNAME/early-access-manager`
- Vercel: `https://early-access-manager.vercel.app`



