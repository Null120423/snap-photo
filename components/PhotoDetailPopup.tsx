/** @format */

import React, { useEffect, useState } from "react";
import { Photo } from "../types";

interface PhotoDetailPopupProps {
  photo: Photo | null;
  onClose: () => void;
}

const IconCamera = () => (
  <svg
    className='w-5 h-5 text-[#FF7F50]'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
    />
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
    />
  </svg>
);

const IconClock = () => (
  <svg
    className='w-5 h-5 text-[#FF7F50]'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    />
  </svg>
);

const IconSize = () => (
  <svg
    className='w-5 h-5 text-[#FF7F50]'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M4 8h16M4 16h16'
    />
  </svg>
);

export const PhotoDetailPopup: React.FC<PhotoDetailPopupProps> = ({
  photo,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(!!photo);

  useEffect(() => {
    setIsVisible(!!photo);
  }, [photo]);

  if (!photo) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const photoDate = new Date(photo.timestamp);
  const formattedDate = photoDate.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fileSize = (photo.size / 1024 / 1024).toFixed(2);

  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <div
          className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] animate-in fade-in duration-300'
          onClick={handleClose}
        />
      )}

      {/* Detail Popup - iOS Style */}
      <div
        className={`fixed inset-x-4 bottom-20 z-[46] transition-all duration-300 ${
          isVisible ?
            "animate-in slide-in-from-bottom-8 opacity-100"
          : "animate-out slide-out-to-bottom-8 opacity-0"
        }`}>
        <div className='bg-white rounded-3xl shadow-2xl overflow-hidden'>
          {/* Header */}
          <div className='px-6 pt-6 pb-4 border-b border-gray-100'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-black text-[#2D3436]'>
                Thông tin ảnh
              </h3>
              <button
                onClick={handleClose}
                className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'>
                <svg
                  className='w-5 h-5 text-gray-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
            <div className='inline-block bg-[#FF7F50]/10 px-3 py-1 rounded-full'>
              <p className='text-[10px] font-bold text-[#FF7F50] uppercase tracking-widest'>
                ID: {photo.id.slice(0, 12)}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className='px-6 py-5 space-y-4 max-h-[400px] overflow-y-auto'>
            {/* Date & Time */}
            <div className='flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl'>
              <IconClock />
              <div>
                <p className='text-[10px] font-bold text-gray-400 uppercase'>
                  Ngày giờ chụp
                </p>
                <p className='text-sm font-semibold text-[#2D3436] mt-1'>
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* File Size */}
            <div className='flex items-start gap-4 p-4 bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-2xl'>
              <IconSize />
              <div>
                <p className='text-[10px] font-bold text-gray-400 uppercase'>
                  Kích thước tệp
                </p>
                <p className='text-sm font-semibold text-[#2D3436] mt-1'>
                  {fileSize} MB
                </p>
              </div>
            </div>

            {/* Device Info */}
            <div className='flex items-start gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-2xl'>
              <IconCamera />
              <div>
                <p className='text-[10px] font-bold text-gray-400 uppercase'>
                  Thiết bị
                </p>
                <p className='text-sm font-semibold text-[#2D3436] mt-1'>
                  SnapShare Camera
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className='h-px bg-gray-100' />

            {/* Additional Info */}
            <div className='text-center py-2'>
              <p className='text-[10px] text-gray-400'>
                Ảnh được lưu giữ an toàn trên SnapShare
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhotoDetailPopup;
