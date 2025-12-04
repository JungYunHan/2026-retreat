"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phoneNumber: string;
  teamName: string;
  position: string;
  role: string;
  gender: string;
  birthDate: string;
}

interface Stats {
  totalUsers: number;
  totalPosts: number;
  totalMenus: number;
  totalSchedules: number;
  totalRooms: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"users" | "posts" | "menus" | "schedules">("users");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.hostname === "localhost"
        ? "http://localhost:8080/api"
        : `${window.location.origin}/api`;
    }
    return "http://localhost:8080/api";
  }, []);

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${getApiUrl()}/admin${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (response.status === 403) {
      alert("관리자 권한이 필요합니다.");
      router.replace("/");
      return null;
    }

    return response.json();
  }, [router, getApiUrl]);

  const loadStats = useCallback(async () => {
    const response = await apiCall("/stats");
    if (response?.success) {
      setStats(response.data);
    }
  }, [apiCall]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const response = await apiCall("/users");
    if (response?.success) {
      setUsers(response.data);
    }
    setLoading(false);
  }, [apiCall]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }
    
    void loadStats();
    void loadUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    
    const response = await apiCall(`/users/${id}`, { method: "DELETE" });
    if (response?.success) {
      alert("삭제되었습니다.");
      loadUsers();
    }
  };

  const updateUser = async (user: User) => {
    const response = await apiCall(`/users/${user.id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });
    if (response?.success) {
      alert("수정되었습니다.");
      setEditingUser(null);
      loadUsers();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">관리자 페이지</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">데이터베이스 관리 시스템</p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors w-full sm:w-auto"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 통계 카드 */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-xs sm:text-sm text-gray-600">사용자</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-xs sm:text-sm text-gray-600">게시글</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.totalPosts}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-xs sm:text-sm text-gray-600">메뉴</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.totalMenus}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="text-xs sm:text-sm text-gray-600">스케줄</div>
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{stats.totalSchedules}</div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
              <div className="text-xs sm:text-sm text-gray-600">숙소</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.totalRooms}</div>
            </div>
          </div>
        )}

        {/* 탭 메뉴 */}
        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === "users"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              사용자 관리
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === "posts"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              게시글 관리
            </button>
            <button
              onClick={() => setActiveTab("menus")}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === "menus"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              메뉴 관리
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors ${
                activeTab === "schedules"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              스케줄 관리
            </button>
          </div>

          {/* 사용자 관리 탭 */}
          {activeTab === "users" && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-bold">
                  사용자 목록 <span className="text-gray-500 text-base">(총 {users.length}명)</span>
                </h2>
                <button
                  onClick={loadUsers}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors w-full sm:w-auto"
                >
                  새로고침
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-600">로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                      <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자명</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">이름</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">이메일</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">팀</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">직책</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">권한</th>
                              <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {users.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                  <div className="flex flex-col items-center">
                                    <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <p>사용자가 없습니다.</p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">{user.name}</td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                                    <span className="truncate block max-w-xs">{user.email}</span>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{user.teamName}</td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{user.position}</td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        user.role === "ADMIN"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                  </td>
                                  <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm">
                                    <button
                                      onClick={() => setEditingUser(user)}
                                      className="text-blue-600 hover:text-blue-900 font-medium mr-2 sm:mr-3"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => deleteUser(user.id)}
                                      className="text-red-600 hover:text-red-900 font-medium"
                                    >
                                      삭제
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 다른 탭들 */}
          {activeTab === "posts" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">게시글 관리</h2>
              <p className="text-gray-600">게시글 관리 기능은 개발 중입니다.</p>
            </div>
          )}
          {activeTab === "menus" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">메뉴 관리</h2>
              <p className="text-gray-600">메뉴 관리 기능은 개발 중입니다.</p>
            </div>
          )}
          {activeTab === "schedules" && (
            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-4">스케줄 관리</h2>
              <p className="text-gray-600">스케줄 관리 기능은 개발 중입니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">사용자 수정</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="text"
                  value={editingUser.phoneNumber}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  권한
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateUser(editingUser)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium"
              >
                저장
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
