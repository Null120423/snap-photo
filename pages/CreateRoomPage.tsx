/** @format */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { firebaseService } from "../services/firebaseService";
import { getOrInitUserId, getMyRooms } from "../utils/storage";

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

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const userId = getOrInitUserId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    setLoading(true);

    try {
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
      navigate(`/room/${room.id}`, { replace: true });
    } catch (error) {
      console.error("Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='animate-in slide-in-from-right duration-300'>
      <button
        onClick={() => navigate("/", { replace: true })}
        className='hover:scale-110 transition-transform'>
        <IconChevronLeft />
      </button>
      <h1 className='text-3xl font-extrabold mt-8 mb-8'>Tạo phòng mới</h1>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <label className='text-xs font-bold text-gray-400 uppercase'>
            Tên phòng
          </label>
          <input
            name='name'
            required
            placeholder='Ví dụ: Đám cưới Linh & Nam'
            className='w-full p-5 rounded-[1.5rem] bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#FF7F50] font-bold'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-xs font-bold text-gray-400 uppercase'>
            Email nhận thông báo
          </label>
          <input
            name='email'
            type='email'
            required
            placeholder='email@vi-du.com'
            className='w-full p-5 rounded-[1.5rem] bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#FF7F50] font-bold'
          />
        </div>
        <p className='text-[10px] text-indigo-600 bg-indigo-50 p-4 rounded-2xl leading-relaxed'>
          Phòng sẽ tự động xóa sau 15 ngày kể từ khi tạo. Bất kỳ ai có mã đều
          có thể tải ảnh lên.
        </p>
        <Button
          type='submit'
          className='w-full h-16'
          isLoading={loading}>
          Kích hoạt phòng
        </Button>
      </form>
    </div>
  );
};

export default CreateRoomPage;
