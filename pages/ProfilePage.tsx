/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearAuth,
  getDownloadedPhotos,
  getMyRooms,
  getOrInitUserId,
  getUserName,
  setDownloadedPhotos,
  setUserName,
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

const IconUser = () => (
  <svg
    className='w-24 h-24'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    />
  </svg>
);

const IconDownload = () => (
  <svg
    className='w-6 h-6'
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

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const userId = getOrInitUserId();
  const myRooms = getMyRooms();
  const [downloadedIds, setDownloadedIds] = useState(getDownloadedPhotos());
  const [userNameDisplay, setUserNameDisplay] = useState(getUserName() || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userNameDisplay);

  const handleClearHistory = () => {
    if (confirm("Bạn chắc chắn muốn xóa lịch sử tải xuống?")) {
      setDownloadedPhotos([]);
      setDownloadedIds([]);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setUserNameDisplay(tempName.trim());
      setIsEditingName(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      clearAuth();
      window.location.reload();
    }
  };

  return (
    <div className='animate-in fade-in duration-300'>
      <header className='mb-8'>
        <button
          onClick={() => navigate("/", { replace: true })}
          className='hover:scale-110 transition-transform'>
          <IconChevronLeft />
        </button>
        <div className='mt-6 flex flex-col items-center'>
          <div className='w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 mb-4 shadow-inner'>
            <IconUser />
          </div>
          {isEditingName ?
            <div className='flex gap-2 w-full px-2'>
              <input
                type='text'
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className='flex-1 px-3 py-2 border border-[#FF7F50] rounded-lg outline-none text-center font-bold'
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className='px-4 py-2 bg-[#FF7F50] text-white rounded-lg font-bold text-sm'>
                Lưu
              </button>
              <button
                onClick={() => {
                  setTempName(userNameDisplay);
                  setIsEditingName(false);
                }}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold text-sm'>
                Huỷ
              </button>
            </div>
          : <div className='flex flex-col items-center'>
              <h1 className='text-2xl font-black'>
                {userNameDisplay || `Thiết bị #${userId.slice(0, 6)}`}
              </h1>
              <button
                onClick={() => {
                  setIsEditingName(true);
                  setTempName(userNameDisplay);
                }}
                className='text-xs font-bold text-[#FF7F50] hover:text-[#FF6B35] uppercase mt-2'>
                Chỉnh sửa tên
              </button>
            </div>
          }
          <p className='text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-2'>
            ID: {userId.slice(0, 12)}...
          </p>
        </div>
      </header>

      <div className='space-y-6'>
        <div className='bg-gray-50 p-6 rounded-[2.5rem] flex items-center justify-around text-center'>
          <div>
            <p className='text-lg font-black'>{myRooms.length}</p>
            <p className='text-[10px] font-bold text-gray-400 uppercase'>
              Phòng tạo
            </p>
          </div>
          <div className='w-px h-8 bg-gray-200'></div>
          <div>
            <p className='text-lg font-black'>{downloadedIds.length}</p>
            <p className='text-[10px] font-bold text-gray-400 uppercase'>
              Ảnh đã tải
            </p>
          </div>
        </div>

        <div className='flex justify-between items-center px-2'>
          <h3 className='text-xs font-bold uppercase text-gray-400'>
            Ảnh đã tải về gần đây
          </h3>
          <button
            onClick={handleClearHistory}
            className='text-[10px] text-[#FF7F50] font-bold hover:text-[#FF6B35] transition-colors'>
            Xóa lịch sử
          </button>
        </div>

        <div className='grid grid-cols-3 gap-2'>
          {downloadedIds.slice(0, 9).map((id) => (
            <div
              key={id}
              className='aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center'>
              <div className='w-6 h-6 text-gray-200'>
                <IconDownload />
              </div>
            </div>
          ))}
          {downloadedIds.length === 0 && (
            <p className='col-span-3 text-center text-gray-300 py-10 uppercase text-[10px] font-bold'>
              Chưa có ảnh nào được lưu
            </p>
          )}
        </div>

        <button
          onClick={handleLogout}
          className='w-full bg-red-500 text-white py-4 rounded-[2rem] font-bold hover:bg-red-600 transition-colors mt-8'>
          Đăng xuất
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
