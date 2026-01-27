/** @format */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const IconSearch = () => (
  <svg
    className='w-6 h-6'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
    />
  </svg>
);

const IconBoards = () => (
  <svg
    className='w-6 h-6'
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
);

const IconAdd = () => (
  <svg
    className='w-8 h-8 text-white'
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
);

const IconPencil = () => (
  <svg
    className='w-6 h-6'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
    />
  </svg>
);

const IconUser = () => (
  <svg
    className='w-6 h-6'
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

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view
  const isHome = location.pathname === "/";
  const isMyRooms = location.pathname === "/my-rooms";
  const isCreate = location.pathname === "/create";
  const isProfile = location.pathname === "/profile";
  const isDetail = location.pathname.startsWith("/photo/");
  const isRoom = location.pathname.startsWith("/room/");

  // Show navbar only when not in detail view or room view
  const showNav = !isDetail && !isRoom;

  return (
    <div className='flex justify-center min-h-screen bg-[#FDFDFD] text-[#2D3436]'>
      <div className='w-full max-w-[480px] bg-white min-h-screen relative flex flex-col shadow-xl'>
        <main className='flex-1 px-6 pt-8 pb-32 overflow-y-auto no-scrollbar'>
          {children}
        </main>

        {showNav && (
          <nav className='fixed bottom-10 left-1/2 -translate-x-1/2 w-[85%] max-w-[380px] h-20 bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.1)] z-40 flex items-center justify-around px-4 animate-in fade-in slide-in-from-bottom duration-300'>
            <button
              onClick={() => navigate("/", { replace: true })}
              className={`transition-all ${isHome ? "text-[#FF7F50] scale-110" : "text-gray-300 hover:text-[#FF7F50]"}`}>
              <IconSearch />
            </button>
            <button
              onClick={() => navigate("/my-rooms", { replace: true })}
              className={`transition-all ${isMyRooms ? "text-[#FF7F50] scale-110" : "text-gray-300 hover:text-[#FF7F50]"}`}>
              <IconBoards />
            </button>

            <div className='relative -top-8'>
              <button
                onClick={() => navigate("/create", { replace: true })}
                className='w-16 h-16 bg-[#FF7F50] rounded-full shadow-xl shadow-[#FF7F50]/40 flex items-center justify-center active:scale-90 transition-all hover:shadow-2xl'>
                <IconAdd />
              </button>
            </div>

            <button className='text-gray-300 cursor-not-allowed opacity-50'>
              <IconPencil />
            </button>
            <button
              onClick={() => navigate("/profile", { replace: true })}
              className={`transition-all ${isProfile ? "text-[#FF7F50] scale-110" : "text-gray-300 hover:text-[#FF7F50]"}`}>
              <IconUser />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
