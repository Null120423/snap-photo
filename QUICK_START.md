# Quick Start Guide - SnapShare Rooms with Firebase

## What Was Changed?

Your SnapShare Rooms app now uses **real Firebase** instead of localStorage:

✅ Photos uploaded to **Firebase Cloud Storage**  
✅ Rooms and photo data stored in **Firestore Database**  
✅ **User Device ID** displayed on home page  
✅ Data persists across sessions  

## 5-Minute Setup

### 1️⃣ Create Firebase Project
Go to https://console.firebase.google.com and create a new project called "snapshare-rooms"

### 2️⃣ Get Your Credentials
- Go to **Project Settings** (⚙️ icon)
- Find the "Firebase SDKs" section
- Copy the config values

### 3️⃣ Update `.env.local`
Edit `.env.local` and replace placeholders with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=snapshare-rooms.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=snapshare-rooms
VITE_FIREBASE_STORAGE_BUCKET=snapshare-rooms.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

### 4️⃣ Enable Firestore
In Firebase Console → **Firestore Database** → Click "Create Database"
- Production mode
- Default region

### 5️⃣ Enable Storage
In Firebase Console → **Storage** → Click "Get Started"
- Production mode
- Default region

### 6️⃣ Set Security Rules (Development)

**Firestore Rules:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{document=**} {
      allow read, write;
    }
    match /photos/{document=**} {
      allow read, write;
    }
  }
}
```

**Storage Rules:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /rooms/{allPaths=**} {
      allow read, write;
    }
  }
}
```

### 7️⃣ Run the App
```bash
npm run dev
```

Visit `https://photo-api.gitlabserver.id.vn` and you're done! 🎉

## Where's My User ID?

Your unique device ID now appears in **two places**:

1. **Home Page** (top right corner)
   - Shows first 12 characters
   - In an indigo badge

2. **Profile Page** (bottom navigation)
   - Shows full ID
   - Helps identify your device

## What Files Changed?

| File | What Changed |
|------|--------------|
| `services/firebaseService.ts` | Now uses real Firebase APIs |
| `App.tsx` | Added User ID display on home page |
| `config/firebase.ts` | **NEW** - Firebase configuration |
| `.env.local` | Added Firebase credentials |

## File Uploads Now Work Like This:

```
Upload Photo
    ↓
Compressed to Base64
    ↓
Sent to Firebase Cloud Storage
    ↓
URL saved to Firestore metadata
    ↓
Ready to download!
```

## Need Help?

**Issue: Photos not uploading?**
- Check `.env.local` has correct Firebase credentials
- Ensure Storage bucket is created
- Check Storage rules allow write

**Issue: Can't create rooms?**
- Verify Firestore database exists
- Check Firestore rules allow write
- Check `.env.local` configuration

**Issue: App won't start?**
- Run `npm install` to ensure all packages installed
- Check `.env.local` exists in root directory
- Clear browser cache and reload

## Production Checklist

Before deploying to production:

- [ ] Add Firebase Authentication (Google, Email/Password)
- [ ] Update Firestore rules to require authentication
- [ ] Update Storage rules to require authentication
- [ ] Set up proper user accounts instead of device IDs
- [ ] Enable backups in Firestore
- [ ] Set up Cloud CDN for images
- [ ] Add rate limiting
- [ ] Enable analytics

## Next Steps

Want to add more features? Check out:
- 📖 [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed setup guide
- 📋 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Full change summary

Happy sharing! 📸
