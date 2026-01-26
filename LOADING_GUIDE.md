# Loading State Management Guide

## Overview
This guide explains the comprehensive loading state system added to SnapShare Rooms. It ensures proper feedback during all API calls and provides a better user experience with loading indicators and error messages.

## New Files Created

### 1. **components/LoadingSkeletons.tsx**
Reusable loading components:
- `LoadingOverlay` - Full-screen loading overlay
- `SkeletonRoomCard` - Placeholder for room cards
- `SkeletonPhotoGrid` - Placeholder for photo grid
- `SkeletonText` - Generic placeholder text
- `SkeletonHeader` - Placeholder for headers
- `SkeletonInputBox` - Placeholder for input forms

### 2. **utils/stateManager.ts**
State management class for centralized state handling:
- `AppState` interface - Defines all state properties
- `AppStateManager` - Handles state updates and notifications
- Methods for specific operations (updateRooms, updatePhotos, etc.)
- Error handling and auto-clearing

## Loading States in App

### Main Loading States
```typescript
const [loading, setLoading] = useState(false);              // General upload/download
const [loadingMyRooms, setLoadingMyRooms] = useState(false);  // Rooms list
const [loadingPhotos, setLoadingPhotos] = useState(false);    // Photos for room
const [loadingCreate, setLoadingCreate] = useState(false);    // Creating room
const [loadingJoin, setLoadingJoin] = useState(false);        // Joining room
const [error, setError] = useState("");                       // Error messages
```

## API Call Flow with Loading

### Pattern for Each API Call:
```typescript
// 1. Set loading state
setLoadingX(true);

try {
  // 2. Call API
  const result = await firebaseService.someOperation();
  
  // 3. Update state with result
  setState(result);
  
} catch (err) {
  // 4. Handle error
  setError("User-friendly message");
  console.error(err);
  
} finally {
  // 5. Stop loading (always runs)
  setLoadingX(false);
}
```

## UI Loading Indicators

### 1. Global Loading Overlay
Shows during critical operations (create, join room):
```tsx
<LoadingOverlay isLoading={loading || loadingJoin || loadingCreate} />
```

### 2. Skeleton Loading Screens
Replace content with skeletons while loading:
```tsx
{loadingMyRooms ? (
  // Show skeletons
  <SkeletonRoomCard />
) : (
  // Show actual content
  <RoomCard />
)}
```

### 3. Inline Spinner
Shows in action buttons:
```tsx
{loading && (
  <div className='animate-spin border-4 border-white/50 border-t-white'></div>
)}
```

### 4. Error Message Toast
Auto-dismisses after 5 seconds:
```tsx
{error && (
  <div className='fixed bottom-32 bg-red-500 text-white px-6 py-3 rounded-full'>
    {error}
  </div>
)}
```

## Updated Functions

### loadData() - Load User's Rooms
```
START: setLoadingMyRooms(true)
├─ Fetch rooms from Firebase
├─ Filter active rooms
├─ Update state
ERROR: Show error toast
END: setLoadingMyRooms(false)
```

### joinRoom(code) - Join Existing Room
```
START: setLoadingJoin(true)
├─ Fetch room data
├─ Fetch room photos
├─ Update current room
├─ Navigate to room view
ERROR: Show error, stay on home
END: setLoadingJoin(false)
```

### handleUpload(file) - Upload Photo
```
START: setLoading(true)
├─ Validate file size
├─ Convert to base64
├─ Upload to Firebase Storage
├─ Save metadata to Firestore
├─ Fetch updated photos
ERROR: Show error toast
END: setLoading(false)
```

### createRoom(name, email) - Create New Room
```
START: setLoadingCreate(true)
├─ Validate inputs
├─ Create room in Firestore
├─ Save to local storage
├─ Add to myRooms list
├─ Join the room
ERROR: Show error toast
END: setLoadingCreate(false)
```

## View-Specific Loading Handling

### Home View
- Shows user device ID
- Input field for room code
- Suggested topics
- No major loading (instant)

### My Rooms View
- Shows list of user's rooms
- Loading: Skeleton cards
- Empty state: "No rooms yet"
- Each room is clickable to join

### Create Room View
- Form with name and email
- Loading: Submit button shows spinner
- On error: Show message, keep form
- On success: Auto-join new room

### Room View (Gallery)
- Shows photos organized by date
- Loading: Skeleton grid
- Empty state: "No photos uploaded"
- Can select multiple photos
- Upload button available

### Detail View (Photo)
- Full-size photo view
- Download button
- Photo metadata
- No major loading (instant)

### Profile View
- User device ID
- Statistics (rooms, downloads)
- Recent downloads grid
- No major loading (instant)

## Error Handling

### Error Types
```typescript
// Join room errors
"Không tìm thấy phòng hoặc đã hết hạn"
"Lỗi khi tham gia phòng"

// Upload errors
"File quá lớn (tối đa 100MB)"
"Lỗi tải ảnh lên"
"Lỗi xử lý ảnh"

// Create room errors
"Lỗi tạo phòng"

// Load data errors
"Lỗi tải phòng của bạn"
```

### Error Auto-Dismiss
- Errors automatically clear after 5 seconds
- User can dismiss earlier by clicking elsewhere
- Multiple errors shown sequentially

## Best Practices

1. **Always use try/catch/finally**
   - Ensures loading state is always reset
   - Prevents UI from getting stuck in loading state

2. **Set specific loading states**
   - Use appropriate state for each operation
   - Allows showing multiple loaders if needed

3. **Show user feedback**
   - Loading: Use skeletons or spinners
   - Success: Update UI with new data
   - Error: Show friendly error message

4. **Handle edge cases**
   - Network timeouts
   - Invalid data
   - Permissions denied
   - Server errors

5. **Optimize performance**
   - Use skeletons to reduce layout shift
   - Batch similar operations
   - Debounce rapid requests

## State Manager Usage

Optional: Use `AppStateManager` for centralized state:

```typescript
const manager = new AppStateManager({
  view: 'home',
  userId: '',
  // ... other state properties
});

// Subscribe to changes
manager.subscribe((state) => {
  setState(state);
});

// Update state
manager.updateRooms(rooms);
manager.setLoading('join', true);
manager.setError('Error message');
```

## Testing Loading States

1. **Slow Network**: Use Chrome DevTools throttling
2. **Error Scenarios**: Disconnect internet temporarily
3. **Edge Cases**: Try large files, invalid room codes
4. **UI Responsiveness**: Ensure app remains responsive during loading

## Performance Considerations

- Loading overlays use CSS animations (not JS)
- Skeletons prevent layout shift (CLS)
- Error messages auto-dismiss (no manual closing)
- Operations properly timeout/cancel
- State updates are batched when possible

## Future Enhancements

- [ ] Loading progress indicators (for uploads)
- [ ] Retry failed operations
- [ ] Offline mode detection
- [ ] Connection status indicator
- [ ] Timeout warnings
- [ ] Batch operation progress
- [ ] Analytics for slow operations
