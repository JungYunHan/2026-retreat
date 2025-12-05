"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  teamName?: string;
  position?: string;
  role: "ADMIN" | "USER";
}

export default function UsersAdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof User>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ password: "", passwordConfirm: "", username: "" });

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8080/api";
    }
    return "http://localhost:8080/api";
  }, []);

  // 검색 및 정렬
  const filteredUsers = users.filter((user) => {
    const searchLower = searchText.toLowerCase();
    return (
      user.username.toLowerCase().includes(searchLower) ||
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.teamName?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    // 숫자 정렬 우선 처리
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = (aVal ?? "").toString().toLowerCase();
    const bStr = (bVal ?? "").toString().toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError("인증 토큰이 없습니다. 로그인 후 다시 시도하세요.");
        console.warn("토큰 없음 - 로그인 페이지로 리다이렉트");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/users`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        setError("권한이 없습니다. 관리자 권한이 필요합니다.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (response.ok) {
        const result = await response.json();
        // API 응답이 ApiResponse 래퍼로 감싸져 있음
        setUsers(result.data || []);
      } else {
        setError(`사용자 로드 실패: ${response.statusText}`);
        console.error("사용자 로드 실패:", response.statusText);
        setUsers([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(`네트워크 오류: ${errorMsg}`);
      console.error("사용자 로드 실패:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (user: User) => {
    try {
      const payload = {
        username: editForm.username || user.username,
        name: user.name,
        email: user.email,
        teamName: user.teamName,
        position: user.position,
        role: user.role,
        ...(editForm.password && { password: editForm.password }),
      };

      const response = await fetch(`${getApiUrl()}/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("사용자가 수정되었습니다.");
        setEditingUser(null);
        setEditForm({ password: "", passwordConfirm: "", username: "" });
        loadUsers();
      } else {
        alert("사용자 수정 실패");
      }
    } catch (error) {
      console.error("사용자 수정 실패:", error);
      alert("사용자 수정 중 오류 발생");
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("정말 이 사용자를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${getApiUrl()}/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (response.ok) {
        alert("사용자가 삭제되었습니다.");
        loadUsers();
      } else {
        alert("사용자 삭제 실패");
      }
    } catch (error) {
      console.error("사용자 삭제 실패:", error);
      alert("사용자 삭제 중 오류 발생");
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* 사이드바 */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 fixed h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">관리 메뉴</h2>
        <nav className="space-y-2">
          {[
            { href: "/admin", label: "대시보드", icon: "📊" },
            { href: "/admin/users", label: "사용자 관리", icon: "👥", active: true },
            { href: "/admin/posts", label: "게시글 관리", icon: "📝" },
            { href: "/admin/menus", label: "메뉴 관리", icon: "🍽️" },
            { href: "/admin/schedules", label: "스케줄 관리", icon: "📅" },
            { href: "/admin/rooms", label: "숙소 관리", icon: "🏨" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">사용자 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedUsers.length}명의 사용자</p>
                </div>
                <button
                  onClick={loadUsers}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (사용자명, 이름, 이메일, 팀)..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-500"></div>
                  <p className="mt-4 text-gray-400 text-lg">로딩 중...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700 bg-gray-700">
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "id") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("id");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            ID {sortKey === "id" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "username") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("username");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            사용자명 {sortKey === "username" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "name") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("name");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            이름 {sortKey === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "email") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("email");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            이메일 {sortKey === "email" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "teamName") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("teamName");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            팀 {sortKey === "teamName" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "position") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("position");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            직책 {sortKey === "position" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                            사용자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-gray-300">{user.id}</td>
                            <td className="px-6 py-4 text-gray-300 font-medium">{user.username}</td>
                            <td className="px-6 py-4 text-gray-300">{user.name}</td>
                            <td className="px-6 py-4 text-gray-400 truncate">{user.email}</td>
                            <td className="px-6 py-4 text-gray-400">{user.teamName ?? "-"}</td>
                            <td className="px-6 py-4 text-gray-400">{user.position ?? "-"}</td>
                            <td className="px-6 py-4 space-x-3">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditForm({ password: "", passwordConfirm: "", username: user.username });
                                }}
                                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
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
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">사용자 수정</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">사용자명</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">팀</label>
                <input
                  type="text"
                  value={editingUser.teamName ?? ""}
                  onChange={(e) => setEditingUser({ ...editingUser, teamName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">직책</label>
                <input
                  type="text"
                  value={editingUser.position ?? ""}
                  onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">역할</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as "ADMIN" | "USER" })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USER">일반사용자</option>
                  <option value="ADMIN">관리자</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">새로운 비밀번호</label>
                <input
                  type="password"
                  placeholder="비밀번호를 변경하려면 입력"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">비밀번호 확인</label>
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={editForm.passwordConfirm}
                  onChange={(e) => setEditForm({ ...editForm, passwordConfirm: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button
                  onClick={() => saveUser(editingUser)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
