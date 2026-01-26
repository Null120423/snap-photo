/** @format */

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Photo } from "../types";
import { getDownloadedPhotos, markAsDownloaded } from "../utils/storage";

const IconChevronLeft = () => (
  <svg
    className='w-6 h-6 text-white'
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

export const PhotoDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [downloadedIds, setDownloadedIds] = useState(getDownloadedPhotos());
  const photo = location.state?.photo as Photo;
  const roomId = location.state?.roomId as string;

  if (!photo) {
    return null;
  }

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `SnapShare_${photo.id}.png`;
    link.click();
    markAsDownloaded(photo.id);
    setDownloadedIds(getDownloadedPhotos());
  };

  return (
    <div className='fixed inset-0 z-50 bg-white animate-in slide-in-from-right duration-300 flex flex-col'>
      <div className='relative h-[70vh] w-full bg-black flex items-center justify-center'>
        <img
          src={photo.url}
          className='max-w-full max-h-full object-contain'
          alt='Xem chi tiết'
        />
        <button
          onClick={() => navigate(`/room/${roomId}`, { replace: true })}
          className='absolute top-10 left-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all'>
          <IconChevronLeft />
        </button>
        <button
          onClick={handleDownload}
          className='absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#FF7F50] flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-all active:scale-90'>
          <IconDownload />
        </button>
      </div>
      <div className='p-8 flex-1 overflow-y-auto bg-white rounded-t-[3rem] -mt-10 relative z-10 shadow-2xl'>
        <div className='w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6'></div>
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h2 className='text-xl font-black text-[#2D3436]'>Thông tin ảnh</h2>
            <p className='text-xs text-[#FF7F50] font-bold uppercase tracking-widest mt-1'>
              SnapShare Gallery
            </p>
          </div>
          <div className='bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold text-gray-400'>
            ID: {photo.id.slice(0, 8)}
          </div>
        </div>
        <div className='grid grid-cols-2 gap-6 mb-8'>
          <div className='p-4 bg-gray-50 rounded-2xl'>
            <p className='text-[10px] uppercase font-bold text-gray-400 mb-1'>
              Ngày tải lên
            </p>
            <p className='font-bold text-sm'>
              {new Date(photo.timestamp).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div className='p-4 bg-gray-50 rounded-2xl'>
            <p className='text-[10px] uppercase font-bold text-gray-400 mb-1'>
              Kích thước
            </p>
            <p className='font-bold text-sm'>
              {(photo.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <div className='bg-indigo-50 p-6 rounded-3xl mb-8 flex items-center gap-4'>
          <div className='w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white'>
            <IconDownload />
          </div>
          <div>
            <p className='text-xs font-bold text-indigo-700'>
              Trạng thái tải xuống
            </p>
            <p className='text-[10px] text-indigo-500'>
              {downloadedIds.includes(photo.id) ?
                "Bạn đã tải ảnh này về máy"
              : "Chưa tải về thiết bị"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailPage;
