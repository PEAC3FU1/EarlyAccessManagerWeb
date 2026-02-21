# How to Add "Monke Minigames" to Firebase

## Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: `earlyaccessmanagerweb`
3. Click on "Realtime Database" in the left sidebar

## Step 2: Add the Game Data
1. Click on the `+` icon next to the root node
2. Add a new child called `games` (if it doesn't exist)
3. Click on the `+` icon next to `games`
4. Add a new child with a unique ID: `monke-minigames`
5. Add the following fields:

```json
{
  "games": {
    "monke-minigames": {
      "name": "Monke Minigames",
      "description": "A collection of fun and challenging minigames featuring monkeys! Swing through levels, collect bananas, and compete with friends in this exciting multiplayer experience.",
      "thumbnail": "https://early-access-manager-web.vercel.app/assets/monke-minigames.png"
    }
  }
}
```

## Quick Copy-Paste for Firebase Console:

**Path:** `games/monke-minigames`

**Fields to add (click + icon for each):**
- Field name: `name` → Value: `Monke Minigames`
- Field name: `description` → Value: `A collection of fun and challenging minigames featuring monkeys! Swing through levels, collect bananas, and compete with friends in this exciting multiplayer experience.`
- Field name: `thumbnail` → Value: `https://early-access-manager-web.vercel.app/assets/monke-minigames.png`

## Result:
Once added, the game will automatically appear in the gallery on the Submit Request page with your custom thumbnail!

## Note:
The thumbnail image is already deployed at `/assets/monke-minigames.png` on your Vercel site.
