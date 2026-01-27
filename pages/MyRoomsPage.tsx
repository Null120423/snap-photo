/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { firebaseService } from "../services/firebaseService";
import { Room } from "../types";
import { getMyRooms } from "../utils/storage";

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

export const MyRoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const codes = getMyRooms();
    const rooms = await Promise.all(
      codes.map((c) => firebaseService.getRoom(c)),
    );
    setMyRooms(rooms.filter((r): r is Room => !!r));
    setLoading(false);
  };

  return (
    <div className='animate-in fade-in duration-300'>
      <header className='mb-8'>
        <button
          onClick={() => navigate("/", { replace: true })}
          className='hover:scale-110 transition-transform'>
          <IconChevronLeft />
        </button>
        <h1 className='text-3xl font-extrabold mt-4'>Phòng của tôi</h1>
        <p className='text-gray-400 text-sm'>
          Danh sách các phòng bạn đã tạo và tham gia.
        </p>
      </header>

      <div className='space-y-4'>
        {myRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => navigate(`/room/${room.id}`, { replace: true })}
            className='p-5 bg-white rounded-3xl border border-gray-100 custom-shadow flex justify-between items-center cursor-pointer active:scale-95 transition-all hover:shadow-lg'>
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
        ))}
        {!loading && myRooms.length === 0 && (
          <p className='text-center text-gray-400 py-20 uppercase text-xs font-bold'>
            Chưa có phòng nào
          </p>
        )}
      </div>
    </div>
  );
};

export default MyRoomsPage;
