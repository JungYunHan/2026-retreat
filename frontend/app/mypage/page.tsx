"use client";

import { pageApi } from "@/lib/api";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export default function MyPage() {
  const router = useRouter();
  
  // 로그인 체크
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router]);

  const { data: userData, isLoading: loading } = useQuery({
    queryKey: ['mypage'],
    queryFn: async () => {
      const res = await pageApi.getMyPageData();
      if (res.success && res.data) {
        return res.data;
      }
      // API 호출 실패 시에도 로그인 페이지로 리다이렉션
      if (!res.success) {
        router.replace('/login');
      }
      return null;
    },
  });

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

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
        <p className="text-gray-500">데이터를 불러올 수 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 pb-20">
      {/* 프로필 카드 */}
      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
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
          <h4 className="text-xl font-bold mb-1">{userData.name}</h4>
          <p className="text-gray-600">
            {userData.teamName} / {userData.position}
          </p>
        </div>
      </div>

      {/* 내 정보 카드 */}
      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="border-b p-4">
          <h5 className="font-semibold">내 정보</h5>
        </div>
        <ul className="divide-y">
          <li className="px-4 py-3 flex justify-between items-center">
            <strong className="text-gray-700">이메일</strong>
            <span className="text-gray-600">{userData.email}</span>
          </li>
          <li className="px-4 py-3 flex justify-between items-center">
            <strong className="text-gray-700">연락처</strong>
            <span className="text-gray-600">{userData.phoneNumber}</span>
          </li>
          <li className="px-4 py-3 flex justify-between items-center">
            <strong className="text-gray-700">권한</strong>
            <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
              {userData.role}
            </span>
          </li>
        </ul>
      </div>

      {/* 메뉴 리스트 */}
      <div className="rounded-lg shadow-sm bg-white">
        <button
          onClick={() => router.push("/change-password")}
          className="w-full px-4 py-3 flex justify-between items-center border-b hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span>🔑</span>
            <span>비밀번호 변경</span>
          </div>
          <span className="text-gray-400">›</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <span>📤</span>
            <span>로그아웃</span>
          </div>
          <span className="text-gray-400">›</span>
        </button>
      </div>
    </main>
  );
}
