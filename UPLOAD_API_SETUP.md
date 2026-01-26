# Upload API Setup Instructions

## Error: "Unsupported field value: undefined (found in field url)"

This error occurs when the external upload API is not running or not returning a valid response.

## Solution

### Option 1: Start the Upload API Server

1. **Check if the upload server is running:**
   ```bash
   # Check if port 3004 is in use
   lsof -i :3004
   ```

2. **Start your upload API server** (from the upload API project directory):
   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

3. **Verify the API is responding:**
   ```bash
   curl http://localhost:3004/health
   ```

### Option 2: Change the API Port

If your upload server runs on a different port, update `.env`:

```env
VITE_API_BASE_URL=http://localhost:YOUR_PORT
```

Then restart the Vite dev server:
```bash
yarn dev
```

### Option 3: Use Firebase Upload Instead

If you don't want to use the external upload API, you can revert to Firebase-only uploads by modifying `App.tsx`:

Replace the `handleUpload` function to use the original Firebase upload:

```typescript
const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!currentRoom || !e.target.files?.length) return;
  
  const files = Array.from(e.target.files);
  setLoading(true);

  for (const file of files) {
    if (file.size > 100 * 1024 * 1024) {
      alert("File quá lớn (tối đa 100MB)");
      continue;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await firebaseService.uploadPhoto(
        currentRoom.id,
        userId,
        file,
        reader.result as string,
      );
      const p = await firebaseService.getPhotos(currentRoom.id);
      setPhotos(p);
    };
    reader.readAsDataURL(file);
  }
  
  setLoading(false);
  resetFileInput();
};
```

## Current Configuration

- **API Base URL:** Check your `.env` file for `VITE_API_BASE_URL`
- **Expected endpoint:** `POST http://localhost:3004/upload/with-metadata`
- **Max file size:** 10MB (configurable via `VITE_MAX_FILE_SIZE`)
- **Allowed types:** image/jpeg, image/png, image/webp, application/pdf

## Testing the Upload API

```bash
# Test with curl
curl -X POST http://localhost:3004/upload/with-metadata \
  -F "file=@/path/to/test-image.jpg" \
  -F "uploadedBy=test-user" \
  -F "description=Test upload"
```

Expected response should include a `url` field:
```json
{
  "id": "...",
  "url": "https://...",
  "originalName": "test-image.jpg",
  ...
}
```

## Debugging

Check browser console for detailed error messages:
- "Không thể kết nối với server upload" = Server not running
- "API không trả về URL hợp lệ" = Server returned invalid response
- Network error = Check CORS or firewall settings
