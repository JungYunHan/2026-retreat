'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

export default function LoginPage() {
  const router = useRouter();
  const [redirect, setRedirect] = useState('/mypage');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect');
      if (redirectParam) {
        setRedirect(redirectParam);
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: (response) => {
      if (response.success) {
        // 로그인 성공 후 redirect 경로로 이동
        router.replace(redirect);
      } else {
        setError(response.error || '로그인에 실패했습니다.');
      }
    },
    onError: () => {
      setError('네트워크 오류가 발생했습니다.');
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  return (
    <div className='flex h-full items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white shadow-2xl rounded-2xl p-8'>
          {/* 로고/타이틀 */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              선목젊은이
            </h1>
            <p className='text-gray-600'>2026 겨울 동계수련회</p>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 에러 메시지 */}
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm'>
                {error}
              </div>
            )}

            {/* 아이디 입력 */}
            <div>
              <label
                htmlFor='username'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                아이디
              </label>
              <input
                id='username'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loginMutation.isPending}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder='아이디를 입력하세요'
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                비밀번호
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loginMutation.isPending}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed'
                placeholder='비밀번호를 입력하세요'
              />
            </div>

            {/* 로그인 버튼 */}
            <button
              type='submit'
              disabled={loginMutation.isPending}
              className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {loginMutation.isPending ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
          </form>

          {/* 추가 안내 */}
          <div className='mt-6 text-center text-sm text-gray-600'>
            <p>아이디 또는 비밀번호를 잊으셨나요?</p>
            <p className='mt-1'>관리자에게 문의해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
