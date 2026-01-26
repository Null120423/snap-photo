# What You Get - SnapShare Rooms with Firebase

## 🏠 Home Page

```
┌─────────────────────────────────┐
│  Khám phá        ID Thiết bị    │
│                  abc123def456   │
│  Kết nối và chia sẻ...         │
├─────────────────────────────────┤
│ │ Nhập mã phòng 6 số             │
│ │ ┌─────────────────────────┐   │
│ │ │ 000 000                 │   │
│ │ └─────────────────────────┘   │
│ │ ┌─────────────────────────┐   │
│ │ │   Vào phòng             │   │
│ │ └─────────────────────────┘   │
│                                  │
│ GỢI Ý CHỦ ĐỀ                    │
│ [Hội họa] [Nhiếp ảnh] [Thiên]   │
└─────────────────────────────────┘
```

**New Feature:** 
- Device ID badge shows your unique identifier
- Full ID available in Profile page
- Auto-generated and stored in browser

---

## 📸 Create Room → Firebase

```
User Creates Room
        ↓
Firestore creates document:
{
  "id": "123456",
  "ownerId": "abc123def456xyz789",
  "ownerEmail": "user@example.com",
  "name": "My Wedding Photos",
  "isActive": true,
  "createdAt": 2026-01-26,
  "expiresAt": 2026-02-10  (15 days later)
}
        ↓
User joins room → sees empty gallery
```

---

## 🎞️ Upload Photos → Cloud Storage

```
User selects photo
        ↓
File processed & compressed
        ↓
Uploaded to Firebase Cloud Storage:
gs://snapshare-rooms.appspot.com/rooms/123456/photos/photo-id-filename.jpg
        ↓
URL saved to Firestore:
{
  "id": "photo-id",
  "roomId": "123456",
  "url": "https://storage.googleapis.com/...",
  "size": 2048576,
  "timestamp": 2026-01-26
}
        ↓
Photo appears in gallery instantly
```

---

## 👤 Profile Page

```
┌─────────────────────────────────┐
│ < Hồ Sơ                         │
│                                  │
│        ┌───────────────┐        │
│        │      👤       │        │
│        └───────────────┘        │
│   Thiết bị #abc123def456         │
│   NGƯỜI DÙNG TẠM THỜI            │
│                                  │
│ ┌──────────────┬────────────────┤
│ │      2       │       5        │
│ │  Phòng tạo   │ Ảnh đã tải    │
│ └──────────────┴────────────────┤
│                                  │
│ ẢNH ĐÃ TẢI VỀ GẦN ĐÂY   Xóa lịch sử
│ [📸] [📸] [📸]                   │
│ [📸] [📸] [📸]                   │
│ [📸] [📸] [📸]                   │
└─────────────────────────────────┘
```

**Full ID here shows:**
`abc123def456xyz789abc123def456xyz789`

---

## 🗄️ Firebase Collections Structure

### Firestore Database

```
firestore/
├── rooms/
│   ├── doc1
│   │   ├── id: "123456"
│   │   ├── ownerId: "abc123..."
│   │   ├── name: "Wedding"
│   │   └── expiresAt: timestamp
│   └── doc2 (more rooms)
│
└── photos/
    ├── doc1
    │   ├── id: "photo1"
    │   ├── roomId: "123456"
    │   ├── url: "https://storage.googleapis.com/..."
    │   └── timestamp: timestamp
    └── doc2 (more photos)
```

### Cloud Storage

```
gs://bucket/
└── rooms/
    ├── 123456/
    │   ├── photos/
    │   │   ├── photo-id-image1.jpg (actual image files)
    │   │   ├── photo-id-image2.png
    │   │   └── photo-id-video1.mp4
    │   └── 654321/
    │       └── photos/
    │           └── (more files)
```

---

## 🔄 Data Flow Summary

```
DEVICE ID GENERATION
└─ First visit → Generate random ID → Store in localStorage
   
ROOM CREATION
├─ User enters name & email
├─ Generate 6-digit code
└─ Save to Firestore (rooms collection)
   
PHOTO UPLOAD
├─ User selects file from device
├─ Compress & convert to base64
├─ Upload to Cloud Storage
├─ Save metadata to Firestore
└─ Display in gallery
   
PHOTO DOWNLOAD
├─ User clicks download
├─ Retrieve from Cloud Storage URL
├─ Download to device
└─ Mark as downloaded in localStorage
   
ROOM EXPIRATION
├─ Check when opening room
├─ If > 15 days: mark inactive
└─ Firestore rules can auto-delete
```

---

## 📊 Key Numbers

| Metric | Value |
|--------|-------|
| Room Code Length | 6 digits |
| Room Expiration | 15 days |
| Max File Size | 100 MB |
| Device ID Length | Random (16-32 chars) |
| Photos per Room | Unlimited |
| Storage Capacity | Unlimited (Firebase tier) |

---

## 🎯 Features

✅ **Anonymous Access** - No login required  
✅ **Device Identification** - Unique ID per device  
✅ **Real-time Storage** - Cloud-backed  
✅ **Expiring Rooms** - Auto cleanup  
✅ **Photo Gallery** - Organized by date  
✅ **Download Management** - Track downloaded photos  
✅ **Mobile Friendly** - Responsive design  
✅ **Persistent Data** - Survives refreshes  

---

## 🚀 Ready to Deploy

The app is fully functional with Firebase. To deploy:

1. **Complete Firebase setup** (see QUICK_START.md)
2. **Test locally** (`npm run dev`)
3. **Build** (`npm run build`)
4. **Deploy** (Vercel, Netlify, Firebase Hosting)

---

**Status:** ✅ Complete and Ready to Use  
**Last Updated:** January 26, 2026  
**Version:** 1.0.0 with Firebase Integration
