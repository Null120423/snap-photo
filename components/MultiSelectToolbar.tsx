/** @format */

import React from "react";

interface MultiSelectToolbarProps {
  selectedCount: number;
  onShare: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onDuplicate: () => void;
  onCancel: () => void;
}

const IconShare = () => (
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

const IconDuplicate = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
    />
  </svg>
);

const IconTrash = () => (
  <svg
    className='w-5 h-5'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
    />
  </svg>
);

const IconClose = () => (
  <svg
    className='w-5 h-5'
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
);

export const MultiSelectToolbar: React.FC<MultiSelectToolbarProps> = ({
  selectedCount,
  onShare,
  onDelete,
  onDownload,
  onDuplicate,
  onCancel,
}) => {
  return (
    <div className='fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white rounded-3xl shadow-2xl z-40 animate-in slide-in-from-bottom-4 duration-300'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
        <div>
          <p className='text-xs font-bold uppercase text-gray-400'>Đã chọn</p>
          <p className='text-lg font-black text-[#2D3436]'>
            {selectedCount} ảnh
          </p>
        </div>
        <button
          onClick={onCancel}
          className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors'>
          <IconClose />
        </button>
      </div>

      {/* Action Buttons */}
      <div className='px-6 py-4 grid grid-cols-4 gap-2'>
        <button
          onClick={onDownload}
          className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-orange-50 transition-colors group'>
          <div className='w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors'>
            <IconShare />
          </div>
          <p className='text-[10px] font-bold text-gray-600 text-center'>Tải</p>
        </button>

        <button
          onClick={onDuplicate}
          className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group'>
          <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors'>
            <IconDuplicate />
          </div>
          <p className='text-[10px] font-bold text-gray-600 text-center'>
            Copy
          </p>
        </button>

        <button
          onClick={onShare}
          className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors group'>
          <div className='w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M8.684 13.342C9.589 12.938 10 12.502 10 12c0-.502-.411-.938-1.316-1.342m0 2.684a3 3 0 110-2.684m9.108-3.342C15.411 5.938 15 5.502 15 5c0-.502.411-.938 1.316-1.342m0 2.684a3 3 0 110-2.684'
              />
            </svg>
          </div>
          <p className='text-[10px] font-bold text-gray-600 text-center'>
            Chia sẻ
          </p>
        </button>

        <button
          onClick={onDelete}
          className='flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-50 transition-colors group'>
          <div className='w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors'>
            <IconTrash />
          </div>
          <p className='text-[10px] font-bold text-gray-600 text-center'>Xoá</p>
        </button>
      </div>
    </div>
  );
};

export default MultiSelectToolbar;
