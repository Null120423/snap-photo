# SnapShare Rooms - Firebase Integration Guide

## Overview
SnapShare Rooms is now fully integrated with Firebase Firestore and Cloud Storage for real-time data persistence and photo storage.

## Features
✅ Create rooms with 6-digit room codes  
✅ Upload photos to Firebase Cloud Storage  
✅ Store room and photo metadata in Firestore  
✅ Real-time photo syncing  
✅ Display current device/user ID on home page  
✅ Download photos to local device  

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `snapshare-rooms`
4. Enable Google Analytics (optional)
5. Create the project

### 2. Get Firebase Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **Your apps** section
3. Click **Web** icon to add a new web app
4. Copy the Firebase config object
5. You'll need these values:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 3. Configure Environment Variables

Update `.env.local` with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=YOUR_ACTUAL_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### 4. Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll set rules below)
4. Select your region
5. Create the database

### 6. Set Firestore Security Rules

In Firebase Console, go to **Firestore Database** → **Rules** and add:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to create rooms and add photos
    match /rooms/{document=**} {
      allow read, write;
    }
    match /photos/{document=**} {
      allow read, write;
    }
  }
}
```

**⚠️ Note:** This is for development. For production, implement proper authentication!

### 7. Enable Cloud Storage

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select your region
5. Create the bucket

### 8. Set Storage Security Rules

Update rules in **Storage** → **Rules**:

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

**⚠️ Note:** This is for development. Implement authentication in production!

### 9. Install Dependencies

```bash
npm install firebase
```

### 10. Run the Application

```bash
npm run dev
```

Visit `https://photo-api.gitlabserver.id.vn/`

## Project Structure

```
snapshare-rooms/
├── config/
│   └── firebase.ts          # Firebase initialization
├── services/
│   └── firebaseService.ts   # Firebase operations
├── utils/
│   └── storage.ts           # Local storage utilities
├── components/
│   └── Button.tsx
├── types.ts                 # TypeScript definitions
├── App.tsx                  # Main component
├── index.tsx                # Entry point
├── .env.local               # Firebase credentials (local only)
└── vite.config.ts
```

## Data Structure

### Rooms Collection
```json
{
  "id": "123456",
  "ownerId": "user-id",
  "ownerEmail": "owner@example.com",
  "name": "Room Name",
  "isActive": true,
  "createdAt": "timestamp",
  "expiresAt": "timestamp"
}
```

### Photos Collection
```json
{
  "id": "photo-id",
  "roomId": "123456",
  "userId": "user-id",
  "url": "https://storage.googleapis.com/...",
  "size": 2048576,
  "timestamp": "timestamp"
}
```

## Features Implemented

✅ **User ID Display** - Shows unique device ID on home page  
✅ **Real Firebase Integration** - Uses Firestore & Cloud Storage  
✅ **Room Management** - Create, join, and manage rooms  
✅ **Photo Uploads** - Upload to Cloud Storage  
✅ **Photo Management** - View, download, and organize photos  
✅ **Room Expiration** - Automatic 15-day expiration  

## Troubleshooting

### Photos not uploading
- Check Firebase Storage rules are set correctly
- Verify `.env.local` has correct Firebase credentials
- Check browser console for errors

### Rooms not saving
- Ensure Firestore is enabled in Firebase Console
- Verify database rules allow write operations
- Check `.env.local` configuration

### CORS issues
- Ensure Firebase configuration is correct
- Storage bucket must be enabled
- Check storage rules allow the operation

## Next Steps for Production

1. **Implement Authentication** - Use Firebase Auth to secure access
2. **Update Security Rules** - Only allow authenticated users to write data
3. **Add User Accounts** - Replace temporary device IDs with real accounts
4. **Configure Rate Limiting** - Prevent abuse
5. **Enable CDN** - For faster image delivery
6. **Add Analytics** - Track user behavior
7. **Implement Backups** - Firestore automatic backups

## Support

For more information:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Storage Docs](https://firebase.google.com/docs/storage)
