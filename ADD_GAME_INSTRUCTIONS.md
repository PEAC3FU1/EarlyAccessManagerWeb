# How to Add "Monke Minigames" to Firebase

## Step 1: Go to Firebase Console
1. Visit https://console.firebase.google.com/
2. Select your project: `earlyaccessmanagerweb`
3. Click on "Realtime Database" in the left sidebar

## Step 2: Add the Game Data
1. Click on the `+` icon next to the root node
2. Add a new child called `games` (if it doesn't exist)
3. Click on the `+` icon next to `games`
4. Add a new child with a unique ID (e.g., `monke-minigames`)
5. Add the following fields:

```json
{
  "games": {
    "monke-minigames": {
      "name": "Monke Minigames",
      "description": "A collection of fun and challenging minigames featuring monkeys! Swing through levels, collect bananas, and compete with friends in this exciting multiplayer experience.",
      "thumbnail": "https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Monke+Minigames"
    }
  }
}
```

## Step 3: Use a Real Thumbnail (Optional)
Replace the placeholder thumbnail URL with a real image URL:
- Upload an image to Firebase Storage or use an external image hosting service
- Recommended size: 800x400 pixels
- Update the `thumbnail` field with the image URL

## Example with Firebase Storage:
1. Go to Firebase Storage in the console
2. Upload your game thumbnail image
3. Click on the uploaded image
4. Copy the download URL
5. Paste it in the `thumbnail` field

## Quick Copy-Paste for Firebase Console:

**Path:** `games/monke-minigames`

**Fields:**
- `name`: Monke Minigames
- `description`: A collection of fun and challenging minigames featuring monkeys! Swing through levels, collect bananas, and compete with friends in this exciting multiplayer experience.
- `thumbnail`: https://via.placeholder.com/800x400/1a1a1a/00ff00?text=Monke+Minigames

## Result:
Once added, the game will automatically appear in the gallery on the Submit Request page!
