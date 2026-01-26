# ✨ Floating Button & Upload Overlay Updates

## 🎯 Features Implemented

### 1. **Collapsible Upload Overlay**
```
FULL VIEW (isMinimized = false)
┌─────────────────────────────────┐
│ Đang tải ảnh    [−] [Đóng]     │ ← Minimize button
│ Tiến trình upload               │
├─────────────────────────────────┤
│ ▸ file1.jpg     70%  Đang tải   │
│ ▸ file2.jpg     40%  Đang tải   │
│ ▸ file3.jpg    100%  Hoàn tất   │
├─────────────────────────────────┤
│ Hệ thống đang tải lần lượt...   │
└─────────────────────────────────┘

       ↓ Click minimize button ↓

MINIMIZED VIEW (isMinimized = true)
┌──┐
│ 2/3 │ ← Shows progress (completed/total)
│  !  │ ← Shows error indicator if any
└──┐

       ↓ Click button again ↓

Back to FULL VIEW
```

### 2. **Floating Upload Button** (Right Side)
```
On Room Page:
┌────────────────────────┐
│   Photo Gallery        │
│   📷 📷 📷 📷          │
│   📷 📷 📷 📷          │
│   📷 📷 📷 📷          │
│                   [+]  │ ← Floating button
│                        │    (bottom-right)
└────────────────────────┘
```

### 3. **Hidden Bottom Navigation on Room Page**
```
Other Pages (Home, Create, MyRooms, Profile):
┌────────────────────────┐
│   Content              │
│                        │
│                        │
├────────────────────────┤
│ 🔍  📋  [+]  ✏️  👤    │ ← Bottom nav visible
└────────────────────────┘

Room Page:
┌────────────────────────┐
│   Gallery              │
│   📷 📷 📷 📷          │
│   📷 📷 📷 📷          │
│   📷 📷 📷 📷          │
│                   [+]  │ ← Floating button
│                        │
└────────────────────────┘
   (NO bottom nav bar)
```

---

## 🔧 Code Changes

### **UploadProgressOverlay.tsx**
- Added `isMinimized` prop (boolean, default false)
- Added `onToggleMinimize` callback function
- Shows floating button when `isMinimized = true`
- Floating button displays: `completed/total` count
- Red `!` indicator shows if any uploads failed
- Clicking floating button toggles back to full overlay

### **RoomPage.tsx**
- Added `isOverlayMinimized` state
- Pass to UploadProgressOverlay: `isMinimized={isOverlayMinimized}`
- Pass callback: `onToggleMinimize={() => setIsOverlayMinimized(!isOverlayMinimized)}`
- Floating button positioned: `fixed bottom-8 right-6`
- Floating button: `w-14 h-14 rounded-full bg-[#FF7F50]`
- Floating button has animations: `animate-in fade-in slide-in-from-bottom-4`

### **Layout.tsx**
```typescript
// OLD:
const showNav = !isDetail;

// NEW:
const showNav = !isDetail && !isRoom;
```
- Bottom navbar now hides on room pages (`/room/:roomId`)
- Still visible on: Home, Create, MyRooms, Profile pages
- Hidden on: Room detail pages and Photo detail pages

---

## 🎨 Visual Flow

### Upload Flow:
```
1. User clicks floating [+] button
   ↓
2. Select multiple images
   ↓
3. Upload overlay appears (full view)
   ↓
4. User can minimize by clicking [−] button
   ↓
5. Shows progress as floating button "2/3" (bottom-right)
   ↓
6. User can click floating button to expand again
   ↓
7. When done, click "Đóng" to close overlay
```

---

## 🎯 Features

### ✅ Minimize Button
- Located at top-right of overlay
- Click to collapse to floating button
- Shows progress count: `completed/total`

### ✅ Floating Button States
- **Uploading**: Shows `1/3` (1 completed out of 3 total)
- **With Errors**: Shows red `!` indicator
- **Clickable**: Click to expand back to full overlay

### ✅ Room Page Floating Button
- Always visible in room gallery
- Click to upload new images
- Positioned at `bottom-8 right-6` (bottom-right corner)
- Smooth entrance animation

### ✅ Clean Room Experience
- No bottom navigation bar in room
- More space for photo gallery
- Floating button dedicated to uploads
- Clean, distraction-free interface

---

## 🚀 Testing Checklist

- [ ] Navigate to room page - bottom nav should hide
- [ ] Click floating [+] button to upload
- [ ] Select multiple images
- [ ] Overlay appears with full view
- [ ] Click [-] button to minimize
- [ ] Floating button shows "X/Y" progress
- [ ] Click floating button to expand
- [ ] On overlay, click "Đóng" to close completely
- [ ] Floating upload button still visible after overlay closes
- [ ] Navigate away from room - bottom nav reappears

---

## 💾 Files Modified

1. **UploadProgressOverlay.tsx** - Added minimize functionality
2. **RoomPage.tsx** - Added overlay minimize state, new floating button
3. **Layout.tsx** - Hide nav on room pages

✨ **All changes complete and ready to test!**
