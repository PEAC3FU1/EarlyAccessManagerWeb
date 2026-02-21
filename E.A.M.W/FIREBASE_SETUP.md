# Firebase Setup Guide - Realtime Database

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name: `early-access-manager`
4. Click "Continue"
5. Disable Google Analytics (optional)
6. Click "Create project"
7. Wait for project creation, then click "Continue"

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`)
2. Enter app nickname: `Early Access Manager Web`
3. Click "Register app"
4. **COPY YOUR FIREBASE CONFIG** - you'll need:
   - apiKey
   - authDomain
   - **databaseURL** (important!)
   - projectId
   - storageBucket
   - messagingSenderId
   - appId
5. Click "Continue to console"

## Step 3: Enable Google Authentication

1. In the left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab
4. Click on **"Google"** in the providers list
5. Toggle the **"Enable"** switch
6. Enter a project support email (your email)
7. Click **"Save"**

## Step 4: Set Up Realtime Database

1. In the left sidebar, click **"Build"** → **"Realtime Database"**
2. Click **"Create Database"**
3. Select your database location (pick closest to your users)
4. Click "Next"
5. Select **"Start in locked mode"** (we'll add rules next)
6. Click "Enable"
7. Wait for database creation

## Step 5: Configure Database Security Rules

1. In Realtime Database, click the **"Rules"** tab
2. Replace the default rules with this:

```json
{
  "rules": {
    "user-profiles": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    "submissions": {
      ".read": "auth != null && (auth.uid === 'YOUR_ADMIN_UID_HERE' || data.child(auth.uid).exists())",
      ".write": "auth != null",
      "$submissionId": {
        ".read": "auth != null && (auth.uid === 'YOUR_ADMIN_UID_HERE' || data.child('userId').val() === auth.uid)",
        ".write": "auth != null && (auth.uid === 'YOUR_ADMIN_UID_HERE' || (!data.exists() && newData.child('userId').val() === auth.uid))"
      }
    }
  }
}
```

3. Click **"Publish"**
4. **Note:** You'll update `YOUR_ADMIN_UID_HERE` after getting your UID in Step 8

## Step 6: Configure Your App

1. Open `E.A.M.W/script.js`
2. Find this section at the top:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",  // Important!
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. Replace with YOUR Firebase config from Step 2
4. **Make sure to include the `databaseURL`!**

## Step 7: Deploy Your Website

Choose one of these options:

### Option A: Netlify (Easiest)

1. Go to [Netlify](https://app.netlify.com/)
2. Drag and drop the `E.A.M.W` folder onto Netlify
3. Your site is live! Copy the URL

### Option B: Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repo or upload the folder
4. Deploy

### Option C: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
cd E.A.M.W
firebase init hosting
firebase deploy
```

## Step 8: Get Your Admin UID

1. Open your deployed website
2. Click "Sign In with Google"
3. Sign in with your Google account
4. Open browser console (Press F12)
5. Type this and press Enter:
```javascript
firebase.auth().currentUser.uid
```
6. **COPY THE UID** that appears (it looks like: `abc123XYZ456...`)

## Step 9: Update Admin UID

### In script.js:
1. Open `E.A.M.W/script.js`
2. Find this line:
```javascript
const ADMIN_UID = 'YOUR_ADMIN_UID_HERE';
```
3. Replace with your actual UID:
```javascript
const ADMIN_UID = 'abc123XYZ456...';
```
4. Save and redeploy

### In Database Rules:
1. Go back to Firebase Console → Realtime Database → Rules
2. Replace `YOUR_ADMIN_UID_HERE` with your actual UID
3. Click "Publish"

## Step 10: Test Everything

### Test User Flow:
1. Sign out and sign back in
2. You should see the game selection screen
3. Search for a game and select it
4. Enter Player ID: `TEST123`
5. Enter Username: `TestPlayer`
6. Click "Submit Request"
7. You should see "Pending Approval" status

### Test Admin Flow:
1. You should automatically see the Admin Dashboard
2. You should see your test submission
3. Click "Approve"
4. A verification code should be generated

### Test Verification:
1. Sign out and sign back in as the regular user
2. You should see the verification code
3. Copy the code
4. Test it in your Unity game

## Database Structure

Your Realtime Database will look like this:

```
early-access-manager/
├── user-profiles/
│   └── {userId}/
│       ├── username: "PlayerName"
│       ├── email: "user@example.com"
│       ├── photoURL: "https://..."
│       └── createdAt: 1234567890
│
└── submissions/
    └── {submissionId}/
        ├── userId: "abc123..."
        ├── userEmail: "user@example.com"
        ├── userName: "PlayerName"
        ├── gameId: "game1"
        ├── gameName: "Dark Silence"
        ├── playerId: "PLAYER123"
        ├── playerName: "InGameName"
        ├── status: "pending" | "approved" | "rejected"
        ├── submittedAt: 1234567890
        ├── verificationCode: "ABC123XY" (when approved)
        ├── approvedAt: 1234567890 (when approved)
        ├── verified: false
        └── verifiedAt: 1234567890 (when verified in game)
```

## Customize Games List

In `script.js`, update the GAMES array:

```javascript
const GAMES = [
    { id: 'game1', name: 'Your Game Name 1' },
    { id: 'game2', name: 'Your Game Name 2' },
    { id: 'game3', name: 'Your Game Name 3' }
];
```

## Add More Admins (Optional)

To add more admin users:

1. Have them sign in to get their UID
2. Update the database rules to include multiple UIDs:

```json
{
  "rules": {
    "submissions": {
      ".read": "auth != null && (auth.uid === 'ADMIN_UID_1' || auth.uid === 'ADMIN_UID_2' || data.child(auth.uid).exists())",
      "$submissionId": {
        ".read": "auth != null && (auth.uid === 'ADMIN_UID_1' || auth.uid === 'ADMIN_UID_2' || data.child('userId').val() === auth.uid)",
        ".write": "auth != null && (auth.uid === 'ADMIN_UID_1' || auth.uid === 'ADMIN_UID_2' || (!data.exists() && newData.child('userId').val() === auth.uid))"
      }
    }
  }
}
```

3. Update script.js to check multiple admins:

```javascript
const ADMIN_UIDS = ['ADMIN_UID_1', 'ADMIN_UID_2'];

// In auth state observer:
if (ADMIN_UIDS.includes(user.uid)) {
    loadAdminDashboard();
    showScreen('admin');
}
```

## Troubleshooting

### "Permission denied" error
- Make sure you published the database rules
- Verify your UID is correct in both script.js and database rules
- Check that you're signed in

### Google Sign-In not working
- Verify Google auth is enabled in Firebase Console
- Check that your domain is authorized in Authentication → Settings → Authorized domains
- Add your deployment domain (e.g., `yoursite.netlify.app`)

### Can't see submissions
- Open browser console (F12) and check for errors
- Verify Firebase config includes `databaseURL`
- Check that Realtime Database is created and rules are published

### Admin dashboard not showing
- Verify your UID matches exactly in script.js
- Check browser console for errors
- Make sure you're signed in with the admin account

### Real-time updates not working
- Check that you're using `firebase-database-compat.js` not `firebase-firestore-compat.js`
- Verify database rules allow reading submissions
- Check browser console for connection errors

## View Your Data

To view your data in Firebase Console:
1. Go to Realtime Database
2. Click the "Data" tab
3. You'll see your database structure
4. Click on nodes to expand and view data

## Security Best Practices

1. **Never commit Firebase config to public repos** with real credentials
2. **Use environment variables** in production
3. **Regularly review database rules**
4. **Monitor usage** in Firebase Console
5. **Set up billing alerts** to avoid unexpected charges
6. **Keep admin UIDs private**

## Next Steps

1. ✅ Set up Firebase Realtime Database
2. ✅ Configure authentication
3. ✅ Deploy your website
4. ✅ Get your admin UID
5. ✅ Update database rules
6. 🔄 Test the complete flow
7. 🔄 Customize games list
8. 🔄 Set up Unity integration (see README.md)
9. 🔄 Add custom styling/branding

## Unity Integration

For Unity verification, see the README.md file for:
- C# code examples
- Firebase Cloud Functions setup
- Secure verification endpoint
- Testing instructions

## Support

If you need help:
1. Check browser console for errors (F12)
2. Check Firebase Console → Realtime Database → Data
3. Verify all UIDs match exactly
4. Review database rules
5. Check that databaseURL is in your config

The system now works exactly like AfterDark with Realtime Database!
