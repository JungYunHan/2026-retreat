"use client";

import { useEffect, useState, useCallback } from "react";

interface MenuItem {
  id: number;
  menuDate: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER";
  mainDish?: string;
  sideDishes?: string;
}

export default function MenusAdminPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof MenuItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [menuForm, setMenuForm] = useState<MenuItem>({
    id: 0,
    menuDate: "",
    mealType: "BREAKFAST",
  });
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8080/api";
    }
    return "http://localhost:8080/api";
  }, []);

  const filteredMenus = menus.filter((menu) => {
    const searchLower = searchText.toLowerCase();
    return (
      menu.menuDate.toLowerCase().includes(searchLower) ||
      (menu.mainDish?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedMenus = [...filteredMenus].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = (aVal ?? "").toString().toLowerCase();
    const bStr = (bVal ?? "").toString().toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/admin/menus`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (response.ok) {
        const result = await response.json();
        // API 응답이 ApiResponse 래퍼로 감싸져 있음
        setMenus(result.data || []);
      } else {
        console.error("메뉴 로드 실패:", response.statusText);
        setMenus([]);
      }
    } catch (error) {
      console.error("메뉴 로드 실패:", error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  const saveMenu = async () => {
    if (!menuForm.menuDate) {
      alert("날짜를 입력하세요.");
      return;
    }

    try {
      const url = editingMenuId ? `${getApiUrl()}/admin/menus/${editingMenuId}` : `${getApiUrl()}/admin/menus`;
      const method = editingMenuId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify(menuForm),
      });

      if (response.ok) {
        alert(editingMenuId ? "메뉴가 수정되었습니다." : "메뉴가 추가되었습니다.");
        setMenuForm({ id: 0, menuDate: "", mealType: "BREAKFAST" });
        setEditingMenuId(null);
        loadMenus();
      }
    } catch (error) {
      console.error("메뉴 저장 실패:", error);
    }
  };

  const deleteMenu = async (id: number) => {
    if (!confirm("정말 이 메뉴를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`${getApiUrl()}/admin/menus/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });

      if (response.ok) {
        loadMenus();
      }
    } catch (error) {
      console.error("메뉴 삭제 실패:", error);
    }
  };

  useEffect(() => {
    loadMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-full">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">메뉴 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedMenus.length}개의 메뉴</p>
                </div>
                <button
                  onClick={loadMenus}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (날짜, 메인 메뉴)..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>

              {/* 메뉴 추가 폼 */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">{editingMenuId ? "메뉴 수정" : "새 메뉴 추가"}</h3>
                <div className="grid grid-cols-4 gap-4">
                  <input
                    type="date"
                    value={menuForm.menuDate}
                    onChange={(e) => setMenuForm({ ...menuForm, menuDate: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={menuForm.mealType}
                    onChange={(e) => setMenuForm({ ...menuForm, mealType: e.target.value as MenuItem["mealType"] })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BREAKFAST">아침</option>
                    <option value="LUNCH">점심</option>
                    <option value="DINNER">저녁</option>
                  </select>
                  <input
                    type="text"
                    placeholder="메인 메뉴"
                    value={menuForm.mainDish ?? ""}
                    onChange={(e) => setMenuForm({ ...menuForm, mainDish: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="사이드 메뉴"
                    value={menuForm.sideDishes ?? ""}
                    onChange={(e) => setMenuForm({ ...menuForm, sideDishes: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveMenu}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingMenuId ? "수정" : "추가"}
                  </button>
                  {editingMenuId && (
                    <button
                      onClick={() => {
                        setEditingMenuId(null);
                        setMenuForm({ id: 0, menuDate: "", mealType: "BREAKFAST" });
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
                            if (sortKey === "menuDate") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("menuDate");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            날짜 {sortKey === "menuDate" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "mealType") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("mealType");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            식사 {sortKey === "mealType" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "mainDish") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("mainDish");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            메인 메뉴 {sortKey === "mainDish" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">사이드</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMenus.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            메뉴가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedMenus.map((menu) => (
                          <tr key={menu.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-gray-300">{menu.menuDate}</td>
                            <td className="px-6 py-4 text-gray-300 font-medium">{menu.mealType === "BREAKFAST" ? "아침" : menu.mealType === "LUNCH" ? "점심" : "저녁"}</td>
                            <td className="px-6 py-4 text-gray-400">{menu.mainDish ?? "-"}</td>
                            <td className="px-6 py-4 text-gray-400 truncate max-w-xs">{menu.sideDishes ?? "-"}</td>
                            <td className="px-6 py-4 space-x-3">
                              <button
                                onClick={() => {
                                  setMenuForm(menu);
                                  setEditingMenuId(menu.id);
                                }}
                                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => deleteMenu(menu.id)}
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
