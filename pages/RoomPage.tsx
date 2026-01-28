/** @format */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhotoDetailPopup from "../components/PhotoDetailPopup";
import PhotoSlideshow from "../components/PhotoSlideshow";
import UploadProgressOverlay, {
  UploadTask,
} from "../components/UploadProgressOverlay";
import { fileUploadService } from "../services/fileUploadService";
import { firebaseService } from "../services/firebaseService";
import { Photo, Room } from "../types";
import {
  addMyRoom,
  getDownloadedPhotos,
  getOrInitUserId,
  markAsDownloaded,
} from "../utils/storage";

const IconChevronLeft = () => (
  <svg
    className='w-6 h-6 text-[#FF7F50]'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2.5'
      d='M15 19l-7-7 7-7'
    />
  </svg>
);

const IconDownload = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
    />
  </svg>
);

const IconCheck = () => (
  <svg className='w-4 h-4 text-white' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
      clipRule='evenodd'
    />
  </svg>
);

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return "Hôm nay";
  if (isYesterday) return "Hôm qua";
  return d.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

interface RoomPageProps {
  roomId: string;
}

export const RoomPage: React.FC<RoomPageProps> = ({ roomId }) => {
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [gridCols, setGridCols] = useState(3);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
  const [selectedDetailPhoto, setSelectedDetailPhoto] = useState<Photo | null>(
    null,
  );
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowPhotoId, setSlideshowPhotoId] = useState<string>("");
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPhoto, setContextMenuPhoto] = useState<Photo | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );
  const userId = getOrInitUserId();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );
  const pullStartRef = useRef<{ y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const touchesRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    loadRoomData();
    return () => {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, [roomId]);

  const handlePhotoClick = (photoId: string, photo: Photo) => {
    if (isSelectMode) {
      // Toggle selection in select mode
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(photoId)) {
          newSet.delete(photoId);
        } else {
          newSet.add(photoId);
        }
        return newSet;
      });
    } else {
      // Single tap - Open slideshow (iOS behavior)
      setSlideshowPhotoId(photoId);
      setShowSlideshow(true);
    }
  };

  const handlePhotoTouchStart = (
    e: React.TouchEvent,
    photoId: string,
    photo: Photo,
  ) => {
    // Track multiple touches for pinch zoom
    touchesRef.current = Array.from(e.touches).map((t: React.Touch) => ({
      x: t.clientX,
      y: t.clientY,
    }));

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };

    // Long press detection for SELECT MODE (600ms like iOS)
    touchTimeoutRef.current = setTimeout(() => {
      if (!isSelectMode) {
        // Enable select mode on long press
        setIsSelectMode(true);
        setSelectedIds(new Set([photoId]));
        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
    }, 600);
  };

  const handlePhotoTouchEnd = (
    e: React.TouchEvent,
    photoId: string,
    photo: Photo,
  ) => {
    if (!touchStartRef.current) return;

    const pressDuration = Date.now() - touchStartRef.current.time;
    const moveDistance = Math.sqrt(
      Math.pow(e.changedTouches[0].clientX - touchStartRef.current.x, 2) +
        Math.pow(e.changedTouches[0].clientY - touchStartRef.current.y, 2),
    );

    // Clear long press timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    // If it's a quick tap (not a long press, not a drag)
    if (pressDuration < 600 && moveDistance < 10) {
      // Double tap to zoom
      const now = Date.now();
      const isDoubleTap = now - lastTapRef.current < 300;
      lastTapRef.current = now;

      if (isDoubleTap) {
        // Toggle zoom
        setZoomLevel((prev) => (prev === 1 ? 2 : 1));
      } else {
        // Single tap
        handlePhotoClick(photoId, photo);
      }
    }

    // Swipe detection
    if (pressDuration < 500 && moveDistance > 50) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      if (Math.abs(deltaX) > 50) {
        // Swipe left or right
        setSwipeDirection(deltaX > 0 ? "right" : "left");
        setTimeout(() => setSwipeDirection(null), 300);
      }
    }

    touchStartRef.current = null;
    touchesRef.current = [];
  };

  const handlePullToRefresh = (e: React.TouchEvent) => {
    const touch = e.touches[0];

    if (!pullStartRef.current) {
      pullStartRef.current = { y: touch.clientY, time: Date.now() };
      return;
    }

    const scrollTop = scrollContainerRef.current?.scrollTop || 0;

    // Only allow pull when at top
    if (scrollTop === 0) {
      const pullDistance = pullStartRef.current.y - touch.clientY;
      if (pullDistance > 60 && !isRefreshing) {
        setIsRefreshing(true);
        loadRoomData().then(() => setIsRefreshing(false));
        pullStartRef.current = null;
      }
    }
  };

  const handlePullEnd = () => {
    pullStartRef.current = null;
  };

  const handlePinchZoom = (e: React.TouchEvent) => {
    if (e.touches.length !== 2) return;

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];

    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2),
    );

    if (touchesRef.current.length === 2) {
      const prevDistance = Math.sqrt(
        Math.pow(touchesRef.current[1].x - touchesRef.current[0].x, 2) +
          Math.pow(touchesRef.current[1].y - touchesRef.current[0].y, 2),
      );

      const scale = distance / prevDistance;
      setZoomLevel((prev) => Math.min(Math.max(prev * scale, 1), 3));
    }

    touchesRef.current = [
      { x: touch1.clientX, y: touch1.clientY },
      { x: touch2.clientX, y: touch2.clientY },
    ];
  };

  const loadRoomData = async () => {
    setLoading(true);
    const roomData = await firebaseService.getRoom(roomId);
    if (roomData) {
      setRoom(roomData);
      // Auto join the room when visiting
      addMyRoom(roomId);
      const p = await firebaseService.getPhotos(roomId);
      setPhotos(p);
      setDownloadedIds(getDownloadedPhotos());
    } else {
      navigate("/", { replace: true });
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!room || !e.target.files?.length) return;

    const files = Array.from(e.target.files) as File[];
    const tasks: UploadTask[] = files.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${file.name}`,
      name: file.name,
      progress: 0,
      status: "pending",
    }));

    setUploadTasks(tasks);
    setShowUploadOverlay(true);
    setLoading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const taskId = tasks[i].id;

      const validation = fileUploadService.validateFile(file);
      if (!validation.valid) {
        updateUploadTask(taskId, {
          status: "error",
          progress: 0,
          error: validation.error || "File không hợp lệ",
        });
        continue;
      }

      updateUploadTask(taskId, { status: "uploading", progress: 1 });

      try {
        const uploadResult = await fileUploadService.uploadSingleFile(
          file,
          {
            uploadedBy: userId,
            description: room.name,
          },
          (pct) => updateUploadTask(taskId, { progress: pct }),
        );

        if (!uploadResult || !uploadResult.url) {
          throw new Error("Upload không trả về URL hợp lệ");
        }

        updateUploadTask(taskId, { progress: 100, status: "done" });

        const savedPhoto = await firebaseService.saveExternalPhoto(
          room.id,
          userId,
          uploadResult.url,
          file.size,
        );

        setPhotos((prev) => [savedPhoto, ...prev]);
      } catch (err: any) {
        console.error("Upload error:", err);
        updateUploadTask(taskId, {
          status: "error",
          error:
            err?.response?.data?.message ||
            err?.message ||
            "Upload thất bại. Vui lòng thử lại.",
        });
      }
    }

    const refreshed = await firebaseService.getPhotos(room.id);
    setPhotos(refreshed);
    setLoading(false);
    resetFileInput();
  };

  const updateUploadTask = (taskId: string, updates: Partial<UploadTask>) => {
    setUploadTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
    );
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const closeUploadOverlay = () => {
    setUploadTasks([]);
    setShowUploadOverlay(false);
  };

  const groupedPhotos = useMemo(() => {
    const groups: Record<string, Photo[]> = {};
    photos.forEach((p) => {
      const dateKey = formatDate(p.timestamp);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(p);
    });
    return groups;
  }, [photos]);

  const downloadPhotos = async (ids: string[]) => {
    for (const id of ids) {
      const p = photos.find((x) => x.id === id);
      if (p) {
        try {
          // Fetch the image as a blob to handle CORS
          const response = await fetch(p.url, { mode: "cors" });
          if (!response.ok) throw new Error("Failed to fetch image");

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = `SnapShare_${p.id || id}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Clean up blob URL
          URL.revokeObjectURL(blobUrl);

          // Mark as downloaded
          markAsDownloaded(id);
        } catch (err) {
          console.error(`Failed to download photo ${id}:`, err);
          alert(`Không thể tải ảnh ${id}. Vui lòng thử lại.`);
        }
      }
    }
    setDownloadedIds(getDownloadedPhotos());
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  if (loading && !room) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='w-12 h-12 border-4 border-gray-200 border-t-[#FF7F50] rounded-full animate-spin'></div>
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className='animate-in fade-in duration-300'>
      <header className='mb-6 fixed left-0 right-0 px-6 top-0 bg-white/95 backdrop-blur-lg z-30 border-b border-gray-100 shadow-sm'>
        <div className='flex justify-between items-center py-4'>
          <button
            onClick={() => navigate("/", { replace: true })}
            className='hover:scale-110 transition-transform -ml-2'>
            <IconChevronLeft />
          </button>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setGridCols((prev) => (prev === 4 ? 2 : prev + 1))}
              className='text-gray-400 hover:text-[#FF7F50] transition-colors p-2'>
              <svg
                className='w-5 h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsSelectMode(!isSelectMode);
                setSelectedIds(new Set());
              }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                isSelectMode ?
                  "bg-[#FF7F50] text-white"
                : "text-[#FF7F50] hover:bg-[#FF7F50]/10"
              }`}>
              {isSelectMode ? "Xong" : "Chọn"}
            </button>
          </div>
        </div>
        <div className='pb-3'>
          <h1 className='text-xl font-bold truncate'>{room.name}</h1>
          <p className='text-xs text-gray-500 mt-0.5'>
            {photos.length} ảnh • Mã: {room.id}
          </p>
        </div>
      </header>

      <div
        className='space-y-8 pt-32 px-6'
        ref={scrollContainerRef}
        onTouchStart={handlePullToRefresh}
        onTouchEnd={handlePullEnd}
        onTouchMove={handlePinchZoom}
        style={{ overflow: "auto" }}>
        {isRefreshing && (
          <div className='pt-4 flex justify-center'>
            <div className='w-6 h-6 border-3 border-[#FF7F50]/30 border-t-[#FF7F50] rounded-full animate-spin'></div>
          </div>
        )}
        {Object.entries(groupedPhotos).map(([date, items]) => (
          <div
            key={date}
            className={`transition-all duration-300 ${
              swipeDirection === "left" ? "translate-x-[-8px] opacity-80"
              : swipeDirection === "right" ? "translate-x-[8px] opacity-80"
              : "translate-x-0 opacity-100"
            }`}>
            <h3 className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1'>
              {date}
            </h3>
            <div
              className='grid gap-1 transition-transform duration-200'
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top center",
              }}>
              {(items as any[]).map((p) => (
                <div
                  key={p.id}
                  className={`relative aspect-square overflow-hidden bg-gray-100 transition-all rounded-lg cursor-pointer select-none ${isSelectMode && selectedIds.has(p.id) ? "scale-95 ring-4 ring-[#FF7F50]" : "hover:opacity-90 active:scale-95"}`}
                  onClick={() => handlePhotoClick(p.id, p)}
                  onTouchStart={(e) => handlePhotoTouchStart(e, p.id, p)}
                  onTouchEnd={(e) => handlePhotoTouchEnd(e, p.id, p)}>
                  <img
                    src={p.url}
                    className='w-full h-full object-cover pointer-events-none'
                    loading='lazy'
                    alt='photo'
                  />
                  {downloadedIds.includes(p.id) && !isSelectMode && (
                    <div className='absolute top-1 right-1 bg-green-500 rounded-full p-0.5 shadow-sm animate-in fade-in zoom-in duration-300'>
                      <IconCheck />
                    </div>
                  )}
                  {isSelectMode && (
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all shadow-lg animate-in scale-in duration-200 ${selectedIds.has(p.id) ? "bg-[#FF7F50]" : "bg-white/60"}`}>
                      {selectedIds.has(p.id) && <IconCheck />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className='py-20 text-center flex flex-col items-center animate-in fade-in duration-500'>
            <div className='animate-bounce mb-4'>
              <svg
                className='w-12 h-12 text-gray-200'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M4 6h16M4 12h16m-7 6h7'
                />
              </svg>
            </div>
            <p className='text-gray-300 text-[10px] font-bold uppercase'>
              Chưa có ảnh nào được tải lên
            </p>
          </div>
        )}
      </div>

      {isSelectMode && selectedIds.size > 0 && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 animate-in slide-in-from-bottom-2 backdrop-blur-lg bg-white/95 duration-300'>
          <div className='flex gap-3 max-w-md mx-auto'>
            <button
              onClick={() => downloadPhotos(Array.from(selectedIds))}
              className='flex-1 bg-[#FF7F50] text-white py-3 rounded-xl font-semibold hover:bg-[#FF6B35] transition-all active:scale-95 shadow-lg animate-in scale-in duration-300'>
              <div className='flex items-center justify-center gap-2'>
                <IconDownload />
                Tải xuống ({selectedIds.size})
              </div>
            </button>
            <button
              onClick={() => {
                const text = `Tôi vừa chia sẻ ${selectedIds.size} ảnh từ phòng ${room?.name}`;
                if (navigator.share) {
                  navigator.share({
                    title: `${room?.name} - SnapShare`,
                    text: text,
                  });
                } else {
                  alert(text);
                }
              }}
              className='px-6 py-3 border-2 border-[#FF7F50] text-[#FF7F50] rounded-xl font-semibold hover:bg-[#FF7F50]/10 transition-all active:scale-95 animate-in scale-in duration-300 delay-100'>
              Chia sẻ
            </button>
          </div>
        </div>
      )}

      {isSelectMode && selectedIds.size === 0 && (
        <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 p-4 z-50 animate-in slide-in-from-bottom-2 duration-300'>
          <p className='text-center text-gray-400 text-sm'>
            Chạm vào ảnh để chọn
          </p>
        </div>
      )}

      {zoomLevel > 1 && (
        <div className='fixed top-32 right-6 bg-white/90 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg animate-in fade-in zoom-in duration-300 z-40'>
          <p className='text-sm font-semibold text-[#FF7F50]'>
            {(zoomLevel * 100).toFixed(0)}%
          </p>
        </div>
      )}

      {showContextMenu && contextMenuPhoto && (
        <div
          className='fixed inset-0 bg-black/50 z-[100] flex items-end animate-in fade-in duration-200'
          onClick={() => setShowContextMenu(false)}>
          <div className='w-full bg-white/95 backdrop-blur-lg rounded-t-3xl animate-in slide-in-from-bottom-8 duration-300 p-6 pb-8'>
            <div className='flex flex-col gap-3 max-w-md mx-auto'>
              <button
                onClick={() => {
                  downloadPhotos([contextMenuPhoto.id]);
                  setShowContextMenu(false);
                }}
                className='px-6 py-4 rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300'>
                <svg
                  className='w-5 h-5 text-[#FF7F50]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                  />
                </svg>
                <span className='font-semibold'>Tải xuống</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${room?.name} - SnapShare`,
                      text: "Xem ảnh này",
                    });
                  }
                  setShowContextMenu(false);
                }}
                className='px-6 py-4 rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300 delay-100'>
                <svg
                  className='w-5 h-5 text-[#FF7F50]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M8.684 13.342C9.589 12.51 10 11.313 10 10c0-2.748-2.239-5-5-5s-5 2.252-5 5 2.239 5 5 5c1.313 0 2.51-.411 3.342-1.316m12.728-6.027A9 9 0 1021 12a.75.75 0 00-1.5 0 7.5 7.5 0 11-7.5-7.5.75.75 0 000 1.5h4.243a.75.75 0 000-1.5H15'
                  />
                </svg>
                <span className='font-semibold'>Chia sẻ</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDetailPhoto(contextMenuPhoto);
                  setShowContextMenu(false);
                }}
                className='px-6 py-4 rounded-xl hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-3 animate-in fade-in slide-in-from-left duration-300 delay-200'>
                <svg
                  className='w-5 h-5 text-[#FF7F50]'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='font-semibold'>Chi tiết</span>
              </button>
              <div className='border-t pt-3'>
                <button
                  onClick={() => setShowContextMenu(false)}
                  className='w-full px-6 py-3 rounded-xl hover:bg-gray-100 transition-all active:scale-95 font-semibold text-gray-500 animate-in fade-in delay-300'>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleUpload}
        className='hidden'
        multiple
        accept='image/*'
      />

      {showUploadOverlay && (
        <UploadProgressOverlay
          tasks={uploadTasks}
          onClose={closeUploadOverlay}
          isMinimized={isOverlayMinimized}
          onToggleMinimize={() => setIsOverlayMinimized(!isOverlayMinimized)}
        />
      )}

      <PhotoDetailPopup
        photo={selectedDetailPhoto}
        onClose={() => setSelectedDetailPhoto(null)}
      />

      {showSlideshow && (
        <PhotoSlideshow
          photos={photos}
          initialPhotoId={slideshowPhotoId}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        className='fixed bottom-8 right-6 w-14 h-14 bg-gradient-to-br from-[#FF7F50] to-[#FF6B35] rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-xl hover:shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:scale-110'>
        <svg
          className='w-6 h-6 animate-pulse'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='3'
            d='M12 4v16m8-8H4'
          />
        </svg>
      </button>
    </div>
  );
};

export default RoomPage;
