"use client";

import { pageApi } from "@/lib/api";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tokenError, setTokenError] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  
  // 로그인 체크
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setTokenError(true);
        router.replace('/login');
      } else {
        setHasToken(true);
      }
    }
  }, [router]);

  const { data: userData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['mypage'],
    queryFn: async () => {
      const res = await pageApi.getMyPageData();
      if (res.success && res.data) {
        return res.data;
      }
      // API 호출 실패 시에도 로그인 페이지로 리다이렉션
      if (!res.success) {
        console.error('마이페이지 데이터 로드 실패:', res.error);
        setTokenError(true);
        router.replace('/login');
      }
      return null;
    },
    enabled: hasToken,
    staleTime: 0, // 항상 최신 데이터 가져오기
  });

  const handleLogout = () => {
    authApi.logout();
    // 캐시 초기화
    queryClient.clear();
    router.push("/login");
  };

  if (tokenError || (queryError && !loading)) {
    return (
      <main className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-4">데이터를 불러올 수 없습니다.</p>
          <p className="text-gray-500 text-sm mb-6">다시 로그인 해주세요.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-6 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  if (!userData) {
    return (
      <main className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* 프로필 카드 */}
        <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
              <svg
                className="w-14 h-14 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">{userData.name}</h4>
            <p className="text-indigo-100 text-sm">
              {userData.teamName} · {userData.position}
            </p>
          </div>
        </div>

        {/* 내 정보 카드 */}
        <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-lg">👤</span>
              <span>내 정보</span>
            </h5>
          </div>
          <ul className="divide-y divide-gray-100">
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <strong className="text-gray-600 text-sm font-medium">아이디</strong>
                <span className="text-gray-900 font-semibold">{userData.username}</span>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <strong className="text-gray-600 text-sm font-medium">이메일</strong>
                <span className="text-gray-900">{userData.email}</span>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <strong className="text-gray-600 text-sm font-medium">연락처</strong>
                <span className="text-gray-900">{userData.phoneNumber}</span>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <strong className="text-gray-600 text-sm font-medium">조</strong>
                <span className="text-gray-900 font-semibold">{userData.teamName}</span>
              </div>
            </li>
            <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-center">
                <strong className="text-gray-600 text-sm font-medium">권한</strong>
                <span className="inline-block px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
                  {userData.role}
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* 숙소 정보 카드 */}
        {userData.roomName && (
          <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 border-b border-green-200">
              <h5 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span>숙소 정보</span>
              </h5>
            </div>
            <ul className="divide-y divide-gray-100">
              <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <strong className="text-gray-600 text-sm font-medium">숙소명</strong>
                  <span className="text-gray-900 font-semibold">{userData.roomName}</span>
                </div>
              </li>
              {userData.roomLocation && (
                <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <strong className="text-gray-600 text-sm font-medium">위치</strong>
                    <span className="text-gray-900">{userData.roomLocation}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* 메뉴 리스트 */}
        <div className="rounded-2xl shadow-lg bg-white overflow-hidden">
          <button
            onClick={() => router.push("/change-password")}
            className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔑</span>
              <span className="font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">비밀번호 변경</span>
            </div>
            <span className="text-gray-400 group-hover:text-indigo-600 transition-colors text-xl">›</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📤</span>
              <span className="font-medium text-gray-700 group-hover:text-red-600 transition-colors">로그아웃</span>
            </div>
            <span className="text-gray-400 group-hover:text-red-600 transition-colors text-xl">›</span>
          </button>
        </div>
      </div>
    </main>
  );
}
