/**
 * LOADING STATE MANAGEMENT UPDATES FOR APP.TSX
 * 
 * This document outlines the updates needed for comprehensive loading state handling
 */

// ============ UPDATE 1: Add more granular loading states ============
// Replace the current loading states section with:

const [loading, setLoading] = useState(false);
const [loadingMyRooms, setLoadingMyRooms] = useState(false);
const [loadingPhotos, setLoadingPhotos] = useState(false);
const [loadingCreate, setLoadingCreate] = useState(false);
const [loadingJoin, setLoadingJoin] = useState(false);
const [error, setError] = useState("");

// ============ UPDATE 2: Import loading components ============
// Add to imports at top:
import { 
  LoadingOverlay, 
  SkeletonRoomCard, 
  SkeletonPhotoGrid,
  SkeletonHeader,
  SkeletonInputBox 
} from "./components/LoadingSkeletons";

// ============ UPDATE 3: Enhanced loadData function ============
// Replace with:

const loadData = async () => {
  setLoadingMyRooms(true);
  try {
    const codes = getMyRooms();
    const rooms = await Promise.all(
      codes.map((c) => firebaseService.getRoom(c)),
    );
    setMyRooms(rooms.filter((r): r is Room => !!r));
  } catch (err) {
    setError("Lỗi tải phòng của bạn");
    console.error(err);
  } finally {
    setLoadingMyRooms(false);
  }
};

// ============ UPDATE 4: Enhanced joinRoom function ============
// Replace with:

const joinRoom = async (code: string) => {
  setLoadingJoin(true);
  try {
    const room = await firebaseService.getRoom(code);
    if (room) {
      const p = await firebaseService.getPhotos(code);
      setPhotos(p);
      setCurrentRoom(room);
      setView("room");
      window.location.hash = `#/room/${code}`;
    } else {
      setError("Không tìm thấy phòng hoặc đã hết hạn");
      setView("home");
    }
  } catch (err) {
    setError("Lỗi khi tham gia phòng");
    console.error(err);
  } finally {
    setLoadingJoin(false);
  }
};

// ============ UPDATE 5: Enhanced handleUpload function ============
// Replace with:

const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!currentRoom || !e.target.files?.[0]) return;
  const file = e.target.files[0];
  if (file.size > 100 * 1024 * 1024) {
    setError("File quá lớn (tối đa 100MB)");
    return;
  }

  setLoading(true);
  try {
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await firebaseService.uploadPhoto(
          currentRoom.id,
          userId,
          file,
          reader.result as string,
        );
        const p = await firebaseService.getPhotos(currentRoom.id);
        setPhotos(p);
      } catch (err) {
        setError("Lỗi tải ảnh lên");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  } catch (err) {
    setError("Lỗi xử lý ảnh");
    setLoading(false);
    console.error(err);
  }
};

// ============ UPDATE 6: Add LoadingOverlay to return ============
// Add after the main return div opening tag:

{/* Global Loading Overlay */}
<LoadingOverlay isLoading={loading || loadingJoin || loadingCreate} />

// ============ UPDATE 7: Add loading to my-rooms view ============
// In the "my-rooms" section, replace the room list with:

<div className='space-y-4'>
  {loadingMyRooms ? (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonRoomCard key={i} />
      ))}
    </>
  ) : myRooms.length > 0 ? (
    myRooms.map((room) => (
      <div
        key={room.id}
        onClick={() => joinRoom(room.id)}
        className='p-5 bg-white rounded-3xl border border-gray-100 custom-shadow flex justify-between items-center cursor-pointer active:scale-95 transition-all'>
        <div>
          <h3 className='font-bold text-lg'>{room.name}</h3>
          <p className='text-xs text-gray-400'>
            Mã: {room.id} • Hết hạn:{" "}
            {new Date(room.expiresAt).toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className='w-10 h-10 rounded-2xl bg-[#FF7F50]/10 flex items-center justify-center text-[#FF7F50]'>
          <IconBoards />
        </div>
      </div>
    ))
  ) : (
    <p className='text-center text-gray-400 py-20 uppercase text-xs font-bold'>
      Chưa có phòng nào
    </p>
  )}
</div>

// ============ UPDATE 8: Add loading to room view ============
// In the "room" view photos section, replace with:

{loadingPhotos ? (
  <div className='space-y-8'>
    <div>
      <h3 className='text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4 border-b pb-2'>
        Đang tải...
      </h3>
      <SkeletonPhotoGrid cols={gridCols} count={9} />
    </div>
  </div>
) : photos.length === 0 ? (
  <div className='py-20 text-center flex flex-col items-center'>
    <IconBoards />
    <p className='text-gray-300 text-[10px] font-bold uppercase mt-4'>
      Chưa có ảnh nào được tải lên
    </p>
  </div>
) : (
  <div className='space-y-8'>
    {Object.entries(groupedPhotos).map(([date, items]) => (
      <div key={date}>
        <h3 className='text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4 border-b pb-2'>
          {date}
        </h3>
        <div
          className={`grid gap-1`}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}>
          {(items as any[])?.map((p) => (
            <div
              key={p.id}
              className={`relative aspect-square overflow-hidden bg-gray-100 transition-all ${isSelectMode && selectedIds.has(p.id) ? "scale-90 ring-4 ring-[#FF7F50] rounded-2xl" : ""}`}
              onClick={() => {
                if (isSelectMode) toggleSelect(p.id);
                else {
                  setSelectedPhoto(p);
                  setView("detail");
                }
              }}>
              <img
                src={p.url}
                className='w-full h-full object-cover'
                loading='lazy'
              />
              {downloadedIds.includes(p.id) && !isSelectMode && (
                <div className='absolute top-1 right-1 bg-green-500 rounded-full p-0.5 shadow-sm'>
                  <IconCheck />
                </div>
              )}
              {isSelectMode && (
                <div
                  className={`absolute top-2 left-2 w-5 h-5 rounded-full border border-white flex items-center justify-center ${selectedIds.has(p.id) ? "bg-[#FF7F50]" : "bg-black/20"}`}>
                  {selectedIds.has(p.id) && <IconCheck />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
)}

// ============ UPDATE 9: Add loading to create view ============
// Replace form submit with:

<form
  onSubmit={async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    try {
      const formData = new FormData(
        e.currentTarget as HTMLFormElement,
      );
      const room = await firebaseService.createRoom(
        userId,
        formData.get("email") as string,
        formData.get("name") as string,
      );
      const current = getMyRooms();
      localStorage.setItem(
        "snapshare_my_rooms",
        JSON.stringify([...current, room.id]),
      );
      // Add to myRooms state
      setMyRooms([...myRooms, room]);
      await joinRoom(room.id);
    } catch (err) {
      setError("Lỗi tạo phòng");
      console.error(err);
    } finally {
      setLoadingCreate(false);
    }
  }}
  className='space-y-6'>
  {/* form fields */}
</form>

// ============ UPDATE 10: Error message display ============
// Add this near the bottom navigation to show errors:

{error && (
  <div className='fixed bottom-32 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg text-sm font-bold animate-in slide-in-from-bottom'>
    {error}
  </div>
)}

// ============ SUMMARY OF LOADING STATES ============
/*
- loading: General upload/download operations
- loadingMyRooms: Loading user's rooms list
- loadingPhotos: Loading photos for a room
- loadingCreate: Creating new room
- loadingJoin: Joining a room
- error: Error message display

Each operation now has:
1. setLoadingX(true) at start
2. Try/catch for error handling
3. setError() for user feedback
4. Finally block to ensure loading is reset
5. UI feedback with skeletons or overlays
*/
