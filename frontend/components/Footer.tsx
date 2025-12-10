'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div
        className={`fixed bottom-[-70px] left-1/2 -translate-x-1/2 w-[253px] h-[253px] bg-zinc-200 dark:bg-zinc-800 rounded-full z-0 origin-center transition-all duration-500 ease-in-out ${
          isOpen
            ? 'scale-100 opacity-100'
            : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {isOpen && (
          <div className='absolute inset-0'>
            {/* 좌측 버튼 */}
            <button
              type='button'
              className='absolute w-12 h-12 bg-white dark:bg-zinc-700 rounded-full shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform z-10 -translate-x-1/2 -translate-y-1/2'
              style={{
                top: '35%',
                left: '20%',
              }}
            >
              D-1
            </button>

            {/* 상단 버튼 */}
            <button
              type='button'
              className='absolute w-12 h-12 bg-white dark:bg-zinc-700 rounded-full shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform z-10 -translate-x-1/2'
              style={{
                top: '9%',
                left: '50%',
              }}
            >
              D-2
            </button>

            {/* 우측 버튼 */}
            <button
              type='button'
              className='absolute w-12 h-12 bg-white dark:bg-zinc-700 rounded-full shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 transition-transform z-10 -translate-x-1/2 -translate-y-1/2'
              style={{
                top: '35%',
                left: '80%',
              }}
            >
              D-3
            </button>
          </div>
        )}
      </div>

      <footer className='fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[428px] min-w-[320px] w-full h-[60px] border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 z-10'>
        <div className='relative flex justify-around items-center w-full h-full'>
          <div className='flex items-center justify-around w-1/3 h-full'>
            <Link
              href='/'
              className='flex justify-center items-center w-full h-full text-zinc-500 cursor-pointer'
            >
              홈
            </Link>
          </div>
          <div className='relative w-1/3 h-full'>
            <button
              type='button'
              className='absolute top-3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-[60px] h-[60px] bg-zinc-200 border border-zinc-200 rounded-full cursor-pointer z-20'
              onClick={handleOpen}
            ></button>
          </div>
          <div className='flex items-center justify-around w-1/3 h-full'>
            <Link
              href='/mypage'
              className='flex justify-center items-center w-full h-full text-zinc-500 cursor-pointer'
            >
              마이페이지
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
