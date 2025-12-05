"use client";

import { useEffect, useState, useCallback } from "react";

interface RoomItem {
  id: number;
  name: string;
  capacity: number;
  genderType?: string;
  location?: string;
  memo?: string;
}

export default function RoomsAdminPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof RoomItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [roomForm, setRoomForm] = useState<RoomItem>({
    id: 0,
    name: "",
    capacity: 2,
    genderType: "",
    location: "",
  });
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8080/api";
    }
    return "http://localhost:8080/api";
  }, []);

  const filteredRooms = rooms.filter((room) => {
    const searchLower = searchText.toLowerCase();
    return (
      room.name.toLowerCase().includes(searchLower) ||
      (room.location?.toLowerCase().includes(searchLower) ?? false) ||
      (room.memo?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = (aVal ?? "").toString().toLowerCase();
    const bStr = (bVal ?? "").toString().toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const loadRooms = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      setRooms([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/admin/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setRooms(result.data || []);
      } else {
        setError(`숙소 로드 실패: ${response.status} ${response.statusText}`);
        setRooms([]);
      }
    } catch (error) {
      console.error("숙소 로드 실패:", error);
      setError("숙소 로드 중 오류가 발생했습니다.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const saveRoom = async () => {
    if (!roomForm.name) {
      alert("숙소명을 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      setError(null);
      const url = editingRoomId
        ? `${getApiUrl()}/admin/rooms/${editingRoomId}`
        : `${getApiUrl()}/admin/rooms`;
      const method = editingRoomId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomForm),
      });

      if (response.ok) {
        setRoomForm({ id: 0, name: "", capacity: 2, genderType: "", location: "" });
        setEditingRoomId(null);
        loadRooms();
      } else {
        setError(`숙소 ${editingRoomId ? "수정" : "추가"} 실패: ${response.statusText}`);
      }
    } catch (error) {
      console.error("숙소 저장 실패:", error);
      setError("숙소 저장 중 오류가 발생했습니다.");
    }
  };

  const deleteRoom = async (id: number) => {
    if (!confirm("정말 이 숙소를 삭제하시겠습니까?")) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      setError(null);
      const response = await fetch(`${getApiUrl()}/admin/rooms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        loadRooms();
      } else {
        setError(`숙소 삭제 실패: ${response.statusText}`);
      }
    } catch (error) {
      console.error("숙소 삭제 실패:", error);
      setError("숙소 삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    loadRooms();
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
            { href: "/admin/posts", label: "게시글 관리", icon: "📝" },
            { href: "/admin/menus", label: "메뉴 관리", icon: "🍽️" },
            { href: "/admin/schedules", label: "스케줄 관리", icon: "📅" },
            { href: "/admin/rooms", label: "숙소 관리", icon: "🏨", active: true },
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
                  <h1 className="text-4xl font-bold">숙소 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedRooms.length}개의 숙소</p>
                </div>
                <button
                  onClick={loadRooms}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (숙소명, 위치, 메모)..."
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

              {/* 숙소 추가 / 수정 */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">{editingRoomId ? "숙소 수정" : "새 숙소 추가"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="숙소명"
                    value={roomForm.name}
                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="정원"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <select
                    value={roomForm.genderType ?? ""}
                    onChange={(e) => setRoomForm({ ...roomForm, genderType: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">성별 선택</option>
                    <option value="MALE">남성</option>
                    <option value="FEMALE">여성</option>
                    <option value="MIXED">혼성</option>
                  </select>
                  <input
                    type="text"
                    placeholder="위치"
                    value={roomForm.location ?? ""}
                    onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <textarea
                    placeholder="메모"
                    value={roomForm.memo ?? ""}
                    onChange={(e) => setRoomForm({ ...roomForm, memo: e.target.value })}
                    className="col-span-2 px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveRoom}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingRoomId ? "수정" : "추가"}
                  </button>
                  {editingRoomId && (
                    <button
                      onClick={() => {
                        setEditingRoomId(null);
                        setRoomForm({ id: 0, name: "", capacity: 2, genderType: "", location: "" });
                      }}
                      className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>

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
                            if (sortKey === "name") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("name");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            숙소명 {sortKey === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "capacity") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("capacity");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            정원 {sortKey === "capacity" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">성별</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">위치</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRooms.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            숙소가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedRooms.map((room) => (
                          <tr key={room.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-gray-300 font-medium">{room.name}</td>
                            <td className="px-6 py-4 text-gray-400">{room.capacity}명</td>
                            <td className="px-6 py-4 text-gray-400">
                              {room.genderType === "MALE"
                                ? "남성"
                                : room.genderType === "FEMALE"
                                  ? "여성"
                                  : room.genderType === "MIXED"
                                    ? "혼성"
                                    : "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-400">{room.location ?? "-"}</td>
                            <td className="px-6 py-4 space-x-3">
                              <button
                                onClick={() => {
                                  setRoomForm(room);
                                  setEditingRoomId(room.id);
                                }}
                                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => deleteRoom(room.id)}
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
    </div>
  );
}
