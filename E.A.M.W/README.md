# Early Access Manager Web Platform

Professional verification platform for game early access with Unity integration.

## Features

- Google Authentication
- Game search and selection
- Player submission workflow
- Admin approval dashboard
- Unique verification code generation
- Unity game integration support
- Real-time status updates

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Authentication in Firebase Console
3. Create a Firestore database
4. Copy your Firebase config and update `script.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissions/{submission} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
        (request.auth.uid in ['ADMIN_UID_1', 'ADMIN_UID_2']);
    }
  }
}
```

### 3. Configure Admin Users

Update the `ADMIN_UIDS` array in `script.js` with your admin user IDs:

```javascript
const ADMIN_UIDS = ['your-admin-uid-here'];
```

### 4. Add Your Games

Update the `GAMES` array in `script.js`:

```javascript
const GAMES = [
    { id: 'game1', name: 'Your Game Name' },
    { id: 'game2', name: 'Another Game' }
];
```

## Unity Integration

### C# Verification Manager

```csharp
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Text;

public class EarlyAccessManager : MonoBehaviour
{
    private const string VERIFY_ENDPOINT = "YOUR_CLOUD_FUNCTION_URL";
    
    public void VerifyPlayer(string playerId, string verificationCode)
    {
        StartCoroutine(VerifyPlayerCoroutine(playerId, verificationCode));
    }
    
    private IEnumerator VerifyPlayerCoroutine(string playerId, string code)
    {
        var data = new VerificationRequest
        {
            playerId = playerId,
            code = code
        };
        
        string json = JsonUtility.ToJson(data);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
        
        using (UnityWebRequest request = new UnityWebRequest(VERIFY_ENDPOINT, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            
            yield return request.SendWebRequest();
            
            if (request.result == UnityWebRequest.Result.Success)
            {
                VerificationResponse response = JsonUtility.FromJson<VerificationResponse>(
                    request.downloadHandler.text
                );
                
                if (response.success)
                {
                    OnVerificationSuccess();
                }
                else
                {
                    OnVerificationFailed(response.message);
                }
            }
            else
            {
                OnVerificationFailed("Network error");
            }
        }
    }
    
    private void OnVerificationSuccess()
    {
        Debug.Log("Player verified successfully!");
        // Grant early access features
    }
    
    private void OnVerificationFailed(string message)
    {
        Debug.LogError($"Verification failed: {message}");
        // Show error to player
    }
}

[System.Serializable]
public class VerificationRequest
{
    public string playerId;
    public string code;
}

[System.Serializable]
public class VerificationResponse
{
    public bool success;
    public string message;
}
```

### Firebase Cloud Function (Recommended)

Create a secure backend endpoint:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.verifyCode = functions.https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    
    if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(204).send('');
    }
    
    const { playerId, code } = req.body;
    
    if (!playerId || !code) {
        return res.status(400).json({ 
            success: false, 
            message: 'Missing parameters' 
        });
    }
    
    try {
        const snapshot = await admin.firestore()
            .collection('submissions')
            .where('playerId', '==', playerId)
            .where('verificationCode', '==', code)
            .where('status', '==', 'approved')
            .where('verified', '==', false)
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            return res.json({ 
                success: false, 
                message: 'Invalid or already used code' 
            });
        }
        
        const doc = snapshot.docs[0];
        await doc.ref.update({
            verified: true,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return res.json({ 
            success: true, 
            message: 'Verification successful' 
        });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});
```

## User Flow

1. Player signs in with Google
2. Searches and selects their game
3. Enters Player ID and in-game username
4. Waits for admin approval
5. Receives unique verification code
6. Enters code in Unity game
7. Game validates with backend
8. Player gains early access

## Security Notes

- Verification codes are single-use
- All validation happens server-side
- Admin privileges required for approvals
- Codes cannot be reused after verification
- Firebase security rules enforce access control

## Deployment

Deploy to any static hosting service:
- Netlify
- Vercel
- Firebase Hosting
- GitHub Pages

## Support

For issues or questions, contact your development team.
