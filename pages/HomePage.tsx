/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { getOrInitUserId } from "../utils/storage";

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

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const userId = getOrInitUserId();

  return (
    <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <header className='mb-8'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-extrabold tracking-tight'>Khám phá</h1>
            <p className='text-gray-400 font-medium text-sm mt-1'>
              Kết nối và chia sẻ khoảnh khắc nghệ thuật.
            </p>
          </div>
          <div className='bg-indigo-50 px-4 py-3 rounded-2xl'>
            <p className='text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1'>
              ID Thiết bị
            </p>
            <p className='text-sm font-mono font-bold text-indigo-700 break-all'>
              {userId.slice(0, 12)}...
            </p>
          </div>
        </div>
      </header>

      <div className='mb-8 p-6 rounded-[2rem] bg-gray-50 border border-gray-100 custom-shadow'>
        <p className='text-[10px] uppercase font-bold text-gray-400 mb-3 text-center tracking-widest'>
          Nhập mã phòng 6 số
        </p>
        <input
          type='text'
          placeholder='000 000'
          className='w-full bg-transparent border-none outline-none text-center text-4xl font-mono tracking-widest text-[#2D3436]'
          value={roomCode}
          onChange={(e) => {
            const code = e.target.value.replace(/\D/g, "").slice(0, 6);
            setRoomCode(code);
            setError("");
          }}
        />
        {roomCode.length === 6 && (
          <Button
            onClick={() => navigate(`/room/${roomCode}`)}
            className='w-full mt-6 !py-3'>
            Vào phòng
          </Button>
        )}
        {error && (
          <p className='text-red-400 text-[10px] font-bold mt-2 text-center uppercase'>
            {error}
          </p>
        )}
      </div>

      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xs font-bold uppercase tracking-widest text-gray-400'>
          Gợi ý chủ đề
        </h2>
      </div>
      <div className='flex gap-2 mb-8 overflow-x-auto no-scrollbar'>
        <Button variant='tag'>Hội họa</Button>
        <Button variant='tag'>Nhiếp ảnh</Button>
        <Button variant='tag'>Thiên nhiên</Button>
      </div>
    </div>
  );
};

export default HomePage;
