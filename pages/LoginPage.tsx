/** @format */

import React, { useState } from "react";

const IconLock = () => (
  <svg
    className='w-5 h-5 text-gray-400'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
    />
  </svg>
);

const IconUser = () => (
  <svg
    className='w-5 h-5 text-gray-400'
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

interface LoginPageProps {
  onLogin: (name: string, password: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Vui lòng nhập tên của bạn");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 4) {
      setError("Mật khẩu phải có ít nhất 4 ký tự");
      return;
    }

    setError("");
    onLogin(name.trim(), password);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF7F50] to-[#FF6B35] px-6'>
      <div className='w-full max-w-md animate-in fade-in zoom-in duration-500'>
        {/* Logo/Title */}
        <div className='text-center mb-12'>
          <div className='w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl'>
            <svg
              className='w-12 h-12 text-[#FF7F50]'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h1 className='text-4xl font-black text-white mb-2'>SnapShare</h1>
          <p className='text-white/80 font-medium'>
            Chia sẻ khoảnh khắc nghệ thuật
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='bg-white rounded-[2rem] p-8 shadow-2xl space-y-6'>
            <div>
              <label className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block'>
                Tên của bạn
              </label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                  <IconUser />
                </div>
                <input
                  type='text'
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder='Nhập tên của bạn'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition-all'
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block'>
                Mật khẩu
              </label>
              <div className='relative'>
                <div className='absolute left-4 top-1/2 -translate-y-1/2'>
                  <IconLock />
                </div>
                <input
                  type='password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder='Nhập mật khẩu'
                  className='w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#FF7F50] focus:ring-2 focus:ring-[#FF7F50]/20 transition-all'
                />
              </div>
            </div>

            {error && (
              <p className='text-red-500 text-sm font-bold text-center animate-in fade-in slide-in-from-top-2'>
                {error}
              </p>
            )}

            <button
              type='submit'
              disabled={!name.trim() || !password.trim()}
              className='w-full bg-[#FF7F50] text-white py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF6B35] transition-all active:scale-95 shadow-lg hover:shadow-xl'>
              Đăng nhập
            </button>
          </div>

          <p className='text-center text-white/70 text-sm'>
            Lần đầu sử dụng? Chỉ cần tạo tài khoản mới!
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
