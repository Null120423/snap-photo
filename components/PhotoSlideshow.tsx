/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Photo } from "../types";

interface PhotoSlideshowProps {
  photos: Photo[];
  initialPhotoId: string;
  onClose: () => void;
}

const IconChevronLeft = () => (
  <svg
    className='w-8 h-8 text-white'
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

const IconChevronRight = () => (
  <svg
    className='w-8 h-8 text-white'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2.5'
      d='M9 5l7 7-7 7'
    />
  </svg>
);

const IconClose = () => (
  <svg
    className='w-6 h-6 text-white'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2.5'
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
);

const IconZoom = () => (
  <svg
    className='w-5 h-5 text-white'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7'
    />
  </svg>
);

const IconZoomOut = () => (
  <svg
    className='w-5 h-5 text-white'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7'
    />
  </svg>
);

export const PhotoSlideshow: React.FC<PhotoSlideshowProps> = ({
  photos,
  initialPhotoId,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(
    photos.findIndex((p) => p.id === initialPhotoId) || 0,
  );
  const [zoom, setZoom] = useState(1);
  const [showToolbar, setShowToolbar] = useState(true);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{
    x: number;
    y: number;
    distance: number;
  } | null>(null);
  const lastTapRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  const currentPhoto = photos[currentIndex];

  const goToPrevious = () => {
    resetZoom();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    resetZoom();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const resetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(1, Math.min(zoom * delta, 4));
    setZoom(newZoom);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2),
      );
      touchStartRef.current = {
        x: touch1.clientX,
        y: touch1.clientY,
        distance,
      };
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        distance: 0,
      };
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2),
      );
      const ratio = distance / touchStartRef.current.distance;
      const newZoom = Math.max(1, Math.min(zoom * ratio, 4));
      setZoom(newZoom);
      touchStartRef.current.distance = distance;
    } else if (e.touches.length === 1 && zoom > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
      setIsDragging(true);
    } else if (e.touches.length === 1 && zoom === 1) {
      // Swipe detection
      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartRef.current.x;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) goToPrevious();
        else goToNext();
      }

      const diffY = touch.clientY - touchStartRef.current.y;
      if (diffY > 100) {
        onClose();
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom === 1) return;
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom === 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      resetZoom();
    }
  };

  const handleImageClick = () => {
    setShowToolbar(!showToolbar);
  };

  return (
    <div
      className='fixed inset-0 bg-black z-[47] animate-in fade-in duration-300 flex flex-col items-center justify-center select-none'
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      {/* Toolbar - Show/Hide on tap */}
      {showToolbar && (
        <>
          {/* Top Toolbar */}
          <div className='absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-50 flex items-center justify-between px-6 animate-in fade-in duration-300'>
            <button
              onClick={onClose}
              className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors'>
              <IconClose />
            </button>
            <div className='text-white text-sm font-semibold'>
              {currentIndex + 1} / {photos.length}
            </div>
            <div className='w-10 h-10' />
          </div>

          {/* Bottom Toolbar */}
          <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent z-50 flex items-end justify-between px-6 pb-6 animate-in fade-in duration-300'>
            <div className='text-white text-center flex-1'>
              <p className='text-xs font-semibold'>
                {new Date(currentPhoto.timestamp).toLocaleDateString("vi-VN")}
              </p>
              <p className='text-[10px] text-gray-300 mt-1'>
                {(currentPhoto.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            {/* Zoom Controls */}
            {zoom > 1 && (
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
                  className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors'>
                  <IconZoomOut />
                </button>
                <div className='text-white text-sm font-semibold w-12 text-center'>
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
                  className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors'>
                  <IconZoom />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Image Container */}
      <div className='flex-1 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing'>
        <img
          ref={imageRef}
          key={currentPhoto.id}
          src={currentPhoto.url}
          alt='Slideshow'
          onDoubleClick={handleDoubleClick}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          className='max-w-full max-h-full object-contain animate-in fade-in duration-300 transition-transform'
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            cursor: zoom > 1 ? "grab" : "pointer",
          }}
        />
      </div>

      {/* Navigation Buttons - Only show when toolbar visible */}
      {showToolbar && photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className='absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors animate-in fade-in duration-300'>
            <IconChevronLeft />
          </button>
          <button
            onClick={goToNext}
            className='absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors animate-in fade-in duration-300'>
            <IconChevronRight />
          </button>
        </>
      )}
    </div>
  );
};

export default PhotoSlideshow;
