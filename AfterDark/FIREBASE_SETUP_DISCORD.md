# Firebase Setup Guide - Discord OAuth Voting System

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "dark-silence-events")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set Up Realtime Database

1. Click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (e.g., United States)
4. Start in TEST MODE
5. Click "Enable"

## Step 3: Configure Database Security Rules

1. In Realtime Database, click the "Rules" tab
2. Replace with this:

```json
{
  "rules": {
    "cosmetic-votes": {
      "count": {
        ".read": true,
        ".write": "auth != null"
      },
      "users": {
        "$uid": {
          ".read": "auth != null && auth.uid == $uid",
          ".write": "auth != null && auth.uid == $uid && !data.exists()"
        }
      }
    }
  }
}
```

3. Click "Publish"

## Step 4: Create Discord OAuth Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Dark Silence Events"
4. Click "Create"
5. Go to "OAuth2" section
6. Click "Add Redirect"
7. Add: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   (Replace YOUR_PROJECT_ID with your Firebase project ID)
8. Click "Save Changes"
9. Copy your "Client ID" and "Client Secret"

## Step 5: Enable Discord in Firebase

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Find "OpenID Connect" and click it
5. Toggle "Enable"
6. Fill in:
   - Name: Discord
   - Client ID: (paste from Discord)
   - Issuer: `https://discord.com`
   - Client Secret: (paste from Discord)
7. Click "Save"

## Step 6: Get Firebase Config

1. Click gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll to "Your apps"
4. Click web icon `</>`
5. Register app
6. Copy the firebaseConfig object

## Step 7: Update HTML Files

1. Open both `afterdark-event.html` files
2. Find "YOUR_API_KEY"
3. Replace with your Firebase config
4. Save

## Step 8: Deploy

Push to Git, Vercel will auto-deploy!

## How It Works

- Users must login with Discord to vote
- One vote per Discord account (can't spam)
- Real-time vote counting
- Secure and tied to Discord IDs

## Troubleshooting

**Discord login fails?**
- Check redirect URL matches exactly
- Verify Client ID/Secret in Firebase

**Permission denied?**
- Check database rules are published
- Verify user is authenticated

Check Firebase Console > Authentication and Realtime Database for debugging.
