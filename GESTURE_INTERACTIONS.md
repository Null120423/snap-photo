# 📱 iOS-Style Gesture Interactions

## 🎯 Features Implemented

### 1. **Single Tap → Fullscreen Slideshow**
- **Action:** Tap once on any photo
- **Result:** Opens fullscreen slideshow mode
- **Features:**
  - Navigate between photos with left/right arrows
  - Use arrow keys on keyboard (← →)
  - Press ESC to close
  - Shows counter (e.g., "2/10")
  - Date/time displayed at bottom
  - Smooth transitions between photos

### 2. **Long Press (2 seconds) → Detail Popup**
- **Action:** Press and hold on any photo for 2 seconds
- **Result:** Shows iOS-style detail popup with:
  - ✅ Photo capture date & time
  - ✅ File size (MB)
  - ✅ Device information
  - ✅ Photo ID
  - **Animation:** Slides up from bottom with smooth easing
  - **Colors:** Gradient backgrounds for each info section
  - **Close:** Click the X button or backdrop

### 3. **Double Tap → Select Mode**
- **Action:** Tap twice quickly (within 300ms)
- **Result:** Enters select mode with photo automatically selected
- **Behavior:** Same as "Chọn" button but triggered by gesture

### 4. **Long Press + Drag → Select Mode**
- **Action:** Press and hold, then drag 10+ pixels
- **Result:** Enters select mode with that photo selected
- **Use Case:** Start bulk selection directly from gesture

---

## 🎨 Visual Design

### Fullscreen Slideshow
```
┌─────────────────────────────────┐
│  [✕]                      [2/10]│
│                                 │
│         ◄ [Photo] ►             │
│                                 │
│  [◄]                      [►]   │
│                                 │
│         📅 2024-01-26          │
└─────────────────────────────────┘
```

### Detail Popup (iOS-Style)
```
┌──────────────────────────────────┐
│ Thông tin ảnh              [✕]  │
│ ID: 7a8f9e2b...                 │
├──────────────────────────────────┤
│ 🕐 Ngày giờ chụp                │
│   26 tháng 1 2024, 14:30        │
│                                  │
│ 📏 Kích thước tệp                │
│   2.45 MB                        │
│                                  │
│ 📷 Thiết bị                      │
│   SnapShare Camera               │
├──────────────────────────────────┤
│ Ảnh được lưu giữ an toàn...     │
└──────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Gesture Detection Logic
```typescript
// Touch start → start timer and track position
onTouchStart: {
  x: clientX,
  y: clientY,
  time: Date.now()
}

// Touch end → calculate duration and movement
duration = Date.now() - startTime
moveDistance = √((endX - startX)² + (endY - startY)²)

// Determine action:
if (duration >= 2000 && moveDistance > 10) → Select mode
else if (duration >= 2000) → Show detail
else if (duration < 300 && moveDistance < 10 && doubleTap) → Select mode
else if (duration < 300 && moveDistance < 10) → Slideshow
```

### Components Used
1. **PhotoDetailPopup.tsx**
   - Shows detail info with iOS-style animation
   - Props: `photo`, `onClose`
   - States: `isVisible` (controls animation)

2. **PhotoSlideshow.tsx**
   - Fullscreen slideshow viewer
   - Props: `photos`, `initialPhotoId`, `onClose`
   - Keyboard support (← → ESC)
   - Touch/click navigation

3. **RoomPage.tsx** (updated)
   - Handles all gesture logic
   - Manages state for detail popup and slideshow
   - Refs: `touchTimeoutRef`, `lastTapRef`, `touchStartRef`

---

## 🎯 User Flows

### Scenario 1: Quick Browse
```
User taps photo
    ↓
Slideshow opens (full screen)
    ↓
User navigates with arrows
    ↓
User presses ESC or clicks X
    ↓
Back to gallery
```

### Scenario 2: Check Details
```
User presses and holds for 2s
    ↓
Detail popup slides up
    ↓
Shows: date, size, device
    ↓
User clicks X to close
    ↓
Back to gallery
```

### Scenario 3: Select Multiple
```
User double-taps photo
    ↓
Select mode activated
    ↓
Photo is already selected
    ↓
User taps more photos to add to selection
    ↓
User clicks "Tải" to download
```

### Scenario 4: Start Selection via Drag
```
User presses and holds
    ↓
Tries to drag
    ↓
Select mode activates automatically
    ↓
Photo is selected
    ↓
User continues selecting others
```

---

## 🎨 Animations

### Popup Entry
```css
animate-in slide-in-from-bottom-8
duration-300
opacity-100
```

### Popup Exit
```css
animate-out slide-out-to-bottom-8
opacity-0
```

### Slideshow Fade
```css
animate-in fade-in duration-300
```

---

## 📋 Timings

| Action | Duration | Threshold |
|--------|----------|-----------|
| Long Press | 2000ms | Exact |
| Double Tap | <300ms | 2 taps within |
| Movement Threshold | N/A | >10px |
| Animation | 300ms | Default |

---

## ✅ Interaction Rules

1. **Don't Show Detail on Select Mode**
   - Gestures disabled when `isSelectMode = true`
   
2. **Close Detail Before Slideshow**
   - Detail popup closes automatically when navigating away

3. **Keyboard Support in Slideshow**
   - Arrow keys: Navigate
   - ESC: Close

4. **Touch vs Mouse**
   - Both touch (mobile) and mouse (desktop) events handled
   - Touch is primary on mobile
   - Mouse fallback on desktop

5. **Double Tap Window**
   - 300ms window between taps
   - Resets after successful double tap
   - Single tap becomes slideshow if not double-tapped

---

## 🚀 Features Summary

| Feature | Trigger | Action | Animation |
|---------|---------|--------|-----------|
| **Slideshow** | Single tap | Open fullscreen | Fade in |
| **Detail** | Long press 2s | Show iOS popup | Slide up |
| **Select** | Double tap | Enter select mode | Scale down |
| **Bulk Select** | Long + drag | Enter select mode | Instant |
| **Navigate** | Arrow keys | Prev/next photo | Fade |
| **Close** | ESC | Exit slideshow | Fade out |

✨ **All gestures are iOS-style, smooth, and intuitive!**
