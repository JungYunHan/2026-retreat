'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <footer className='fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[428px] min-w-[320px] w-full h-[60px] border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'>
      <div className='relative flex justify-around items-center w-full h-full'>
        <div className='flex items-center justify-around w-1/3'>
          <button
            type='button'
            className='flex justify-center items-center text-zinc-500 cursor-pointer'
          >
            버튼1
          </button>
          <button
            type='button'
            className='flex justify-center items-center text-zinc-500 cursor-pointer'
          >
            버튼2
          </button>
        </div>
        <div className='relative w-1/3 h-full'>
          <button
            type='button'
            className='absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center w-[60px] h-[60px] bg-zinc-200 border border-zinc-200 rounded-full cursor-pointer'
            onClick={handleOpen}
          >
            <Image src='/vercel.svg' alt='logo' width={20} height={20} />
          </button>
        </div>
        <div className='flex items-center justify-around w-1/3'>
          <button
            type='button'
            className='flex justify-center items-center text-zinc-500 cursor-pointer'
          >
            버튼3
          </button>
          <button
            type='button'
            className='flex justify-center items-center text-zinc-500 cursor-pointer'
          >
            버튼4
          </button>
        </div>
      </div>
    </footer>
  );
}
