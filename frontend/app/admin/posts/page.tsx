"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PostItem {
  id: number;
  title: string;
  content: string;
  category?: string;
  createdAt?: string;
  user?: {
    username: string;
  };
}

export default function PostsAdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof PostItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8080/api";
    }
    return "http://localhost:8080/api";
  }, []);

  // 검색 및 정렬
  const filteredPosts = posts.filter((post) => {
    const searchLower = searchText.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      (post.user?.username.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (sortKey === "createdAt") {
      const toTime = (val: unknown) => (typeof val === "string" || typeof val === "number" ? new Date(val).getTime() : 0);
      const aTime = toTime(aVal);
      const bTime = toTime(bVal);
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = (aVal ?? "").toString().toLowerCase();
    const bStr = (bVal ?? "").toString().toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError("인증 토큰이 없습니다. 로그인 후 다시 시도하세요.");
        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      const response = await fetch(`${getApiUrl()}/admin/posts`, {
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
        setPosts(result.data || []);
      } else {
        setError(`게시글 로드 실패: ${response.statusText}`);
        console.error("게시글 로드 실패:", response.statusText);
        setPosts([]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setError(`네트워크 오류: ${errorMsg}`);
      console.error("게시글 로드 실패:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${getApiUrl()}/admin/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (response.ok) {
        alert("게시글이 삭제되었습니다.");
        loadPosts();
      } else {
        alert("게시글 삭제 실패");
      }
    } catch (error) {
      console.error("게시글 삭제 실패:", error);
      alert("게시글 삭제 중 오류 발생");
    }
  };

  useEffect(() => {
    loadPosts();
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
            { href: "/admin/users", label: "사용자 관리", icon: "👥" },
            { href: "/admin/posts", label: "게시글 관리", icon: "📝", active: true },
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
      <div className="max-w-full">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">게시글 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedPosts.length}개의 게시글</p>
                </div>
                <button
                  onClick={loadPosts}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (제목, 작성자)..."
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
                            if (sortKey === "title") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("title");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            제목 {sortKey === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작성자</th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "category") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("category");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            카테고리 {sortKey === "category" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "createdAt") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("createdAt");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            작성일 {sortKey === "createdAt" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPosts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                            게시글이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedPosts.map((post) => (
                          <tr key={post.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-gray-300">{post.id}</td>
                            <td className="px-6 py-4 text-gray-300 font-medium truncate max-w-xs">{post.title}</td>
                            <td className="px-6 py-4 text-gray-400">{post.user?.username ?? "-"}</td>
                            <td className="px-6 py-4 text-gray-400">{post.category ?? "-"}</td>
                            <td className="px-6 py-4 text-gray-400">{post.createdAt?.replace("T", " ") ?? "-"}</td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => deletePost(post.id)}
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
  );
}
