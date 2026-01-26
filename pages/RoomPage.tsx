/** @format */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import MultiSelectToolbar from "../components/MultiSelectToolbar";
import PhotoDetailPopup from "../components/PhotoDetailPopup";
import PhotoSlideshow from "../components/PhotoSlideshow";
import UploadProgressOverlay, {
    UploadTask,
} from "../components/UploadProgressOverlay";
import { fileUploadService } from "../services/fileUploadService";
import { firebaseService } from "../services/firebaseService";
import { Photo, Room } from "../types";
import {
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
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragSelectBox, setDragSelectBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const userId = getOrInitUserId();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout>();
  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(
    null,
  );

  useEffect(() => {
    loadRoomData();
    return () => {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    };
  }, [roomId]);

  const handlePhotoMouseDown = (photoId: string, photo: Photo) => {
    if (isSelectMode) return;

    touchStartRef.current = {
      x: 0,
      y: 0,
      time: Date.now(),
    };

    // Long press detection (2 seconds)
    touchTimeoutRef.current = setTimeout(() => {
      setSelectedDetailPhoto(photo);
    }, 2000);
  };

  const handlePhotoMouseUp = (photoId: string, photo: Photo) => {
    if (!touchStartRef.current) return;

    const pressDuration = Date.now() - touchStartRef.current.time;

    // Clear long press timeout if released before 2 seconds
    if (pressDuration < 2000) {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);

      // Double tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap - Enter select mode
        setIsSelectMode(true);
        setSelectedIds(new Set([photoId]));
        lastTapRef.current = 0;
      } else {
        // Single tap - Open slideshow
        setSlideshowPhotoId(photoId);
        setShowSlideshow(true);
        lastTapRef.current = now;
      }
    }

    touchStartRef.current = null;
  };

  const handlePhotoTouchStart = (e: React.TouchEvent, photo: Photo) => {
    if (isSelectMode) return;

    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };

    // Long press detection (2 seconds)
    touchTimeoutRef.current = setTimeout(() => {
      setSelectedDetailPhoto(photo);
    }, 2000);
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

    // Long press with drag - Enter select mode
    if (pressDuration > 2000 && moveDistance > 10) {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      setIsSelectMode(true);
      setSelectedIds(new Set([photoId]));
    }
    // Long press released - show detail
    else if (pressDuration >= 2000) {
      // Detail already set by timeout
    }
    // Short press
    else if (pressDuration < 500 && moveDistance < 10) {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);

      // Double tap detection
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double tap - Enter select mode
        setIsSelectMode(true);
        setSelectedIds(new Set([photoId]));
        lastTapRef.current = 0;
      } else {
        // Single tap - Open slideshow
        setSlideshowPhotoId(photoId);
        setShowSlideshow(true);
        lastTapRef.current = now;
      }
    }

    touchStartRef.current = null;
  };

  const loadRoomData = async () => {
    setLoading(true);
    const roomData = await firebaseService.getRoom(roomId);
    if (roomData) {
      setRoom(roomData);
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
      <header className='mb-6 sticky top-0 bg-white/80 backdrop-blur-md z-30 py-2'>
        <div className='flex justify-between items-center mb-4'>
          <button
            onClick={() => navigate("/", { replace: true })}
            className='hover:scale-110 transition-transform'>
            <IconChevronLeft />
          </button>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setGridCols((prev) => (prev === 4 ? 2 : prev + 1))}
              className='text-gray-400 hover:text-[#FF7F50] transition-colors'>
              <svg
                className='w-6 h-6'
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
              className={`text-xs font-bold uppercase transition-colors ${isSelectMode ? "text-[#FF7F50]" : "text-gray-400 hover:text-[#FF7F50]"}`}>
              {isSelectMode ? "Hủy" : "Chọn"}
            </button>
          </div>
        </div>
        <h1 className='text-2xl font-black truncate'>{room.name}</h1>
        <p className='text-[10px] font-bold text-[#FF7F50] uppercase tracking-widest mt-1'>
          Mã phòng: {room.id}
        </p>
      </header>

      <div className='space-y-8'>
        {Object.entries(groupedPhotos).map(([date, items]) => (
          <div key={date}>
            <h3 className='text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-4 border-b pb-2'>
              {date}
            </h3>
            <div
              className='grid gap-1'
              style={{
                gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              }}>
              {(items as any[]).map((p) => (
                <div
                  key={p.id}
                  className={`relative aspect-square overflow-hidden bg-gray-100 transition-all rounded-lg cursor-pointer select-none ${isSelectMode && selectedIds.has(p.id) ? "scale-90 ring-4 ring-[#FF7F50]" : "hover:opacity-80"}`}
                  onMouseDown={() => handlePhotoMouseDown(p.id, p)}
                  onMouseUp={() => handlePhotoMouseUp(p.id, p)}
                  onTouchStart={(e) => handlePhotoTouchStart(e, p)}
                  onTouchEnd={(e) => handlePhotoTouchEnd(e, p.id, p)}>
                  <img
                    src={p.url}
                    className='w-full h-full object-cover pointer-events-none'
                    loading='lazy'
                    alt='photo'
                  />
                  {downloadedIds.includes(p.id) && !isSelectMode && (
                    <div className='absolute top-1 right-1 bg-green-500 rounded-full p-0.5 shadow-sm'>
                      <IconCheck />
                    </div>
                  )}
                  {isSelectMode && (
                    <div
                      className={`absolute top-2 left-2 w-5 h-5 rounded-full border border-white flex items-center justify-center transition-all ${selectedIds.has(p.id) ? "bg-[#FF7F50]" : "bg-black/20"}`}>
                      {selectedIds.has(p.id) && <IconCheck />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className='py-20 text-center flex flex-col items-center'>
            <svg
              className='w-12 h-12 text-gray-200 mb-4'
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
            <p className='text-gray-300 text-[10px] font-bold uppercase'>
              Chưa có ảnh nào được tải lên
            </p>
          </div>
        )}
      </div>

      {isSelectMode && selectedIds.size > 0 && (
        <div className='fixed bottom-28 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white rounded-[2rem] p-4 custom-shadow z-50 animate-in slide-in-from-bottom duration-300'>
          <Button
            className='w-full h-14'
            onClick={() => downloadPhotos(Array.from(selectedIds))}>
            Tải {selectedIds.size} ảnh đã chọn
          </Button>
        </div>
      )}

      {isSelectMode && selectedIds.size > 0 && (
        <MultiSelectToolbar
          selectedCount={selectedIds.size}
          onDownload={() => downloadPhotos(Array.from(selectedIds))}
          onShare={() => {
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
          onDuplicate={() => {
            navigator.clipboard.writeText(Array.from(selectedIds).join(", "));
            alert("Đã copy ID ảnh");
          }}
          onDelete={() => {
            if (
              window.confirm(
                `Xác nhận xóa ${selectedIds.size} ảnh này khỏi phòng?`,
              )
            ) {
              alert("Tính năng xoá sẽ được cập nhật trong phiên bản tiếp theo");
            }
          }}
          onCancel={() => {
            setIsSelectMode(false);
            setSelectedIds(new Set());
          }}
        />
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
        className='fixed bottom-8 right-6 w-14 h-14 bg-[#FF7F50] rounded-full flex items-center justify-center text-white active:scale-90 transition-all shadow-xl hover:shadow-2xl z-40 animate-in fade-in slide-in-from-bottom-4'>
        <svg
          className='w-6 h-6'
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
