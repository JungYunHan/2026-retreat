"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  teamName?: string;
  position?: string;
  role: "ADMIN" | "USER";
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  showConfirmButton?: boolean;
  onConfirm?: () => void;
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
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

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
    // 필수 필드 검증
    if (!editForm.username.trim()) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "사용자명은 필수 항목입니다.",
        type: "error",
      });
      return;
    }

    if (!user.name.trim()) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "이름은 필수 항목입니다.",
        type: "error",
      });
      return;
    }

    if (!user.email.trim()) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "이메일은 필수 항목입니다.",
        type: "error",
      });
      return;
    }

    // 비밀번호 확인
    if (editForm.password && editForm.password !== editForm.passwordConfirm) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "비밀번호가 일치하지 않습니다.",
        type: "error",
      });
      return;
    }

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
        setModal({
          isOpen: true,
          title: "성공",
          message: "사용자가 수정되었습니다.",
          type: "success",
        });
        setEditingUser(null);
        setEditForm({ password: "", passwordConfirm: "", username: "" });
        loadUsers();
      } else {
        setModal({
          isOpen: true,
          title: "오류",
          message: "사용자 수정에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("사용자 수정 실패:", error);
      setModal({
        isOpen: true,
        title: "오류",
        message: "사용자 수정 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const deleteUser = async (id: number) => {
    setModal({
      isOpen: true,
      title: "삭제 확인",
      message: "정말 이 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      type: "warning",
      showConfirmButton: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`${getApiUrl()}/admin/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
          });

          setModal({ isOpen: false, title: "", message: "", type: "info" });

          if (response.ok) {
            setModal({
              isOpen: true,
              title: "성공",
              message: "사용자가 삭제되었습니다.",
              type: "success",
            });
            loadUsers();
          } else {
            setModal({
              isOpen: true,
              title: "오류",
              message: "사용자 삭제에 실패했습니다.",
              type: "error",
            });
          }
        } catch (error) {
          console.error("사용자 삭제 실패:", error);
          setModal({
            isOpen: true,
            title: "오류",
            message: "사용자 삭제 중 오류가 발생했습니다.",
            type: "error",
          });
        }
      },
    });
  };

  // CSV 업로드
  const handleCsvUpload = async () => {
    if (!csvFile) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "파일을 선택해주세요.",
        type: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      setLoading(true);
      const response = await fetch(`${getApiUrl()}/admin/users/bulk-upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadResult(result.data);
        setModal({
          isOpen: true,
          title: "성공",
          message: `${result.data.successCount}명의 사용자가 등록되었습니다.`,
          type: "success",
        });
        setShowBulkModal(false);
        setCsvFile(null);
        loadUsers();
      } else {
        setModal({
          isOpen: true,
          title: "오류",
          message: "CSV 업로드에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("CSV 업로드 실패:", error);
      setModal({
        isOpen: true,
        title: "오류",
        message: "CSV 업로드 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "삭제할 사용자를 선택해주세요.",
        type: "error",
      });
      return;
    }

    setModal({
      isOpen: true,
      title: "삭제 확인",
      message: `${selectedUsers.size}명의 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      type: "warning",
      showConfirmButton: true,
      onConfirm: async () => {
        try {
          const response = await fetch(`${getApiUrl()}/admin/users/bulk-delete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify(Array.from(selectedUsers)),
          });

          setModal({ isOpen: false, title: "", message: "", type: "info" });

          if (response.ok) {
            setModal({
              isOpen: true,
              title: "성공",
              message: "선택된 사용자가 삭제되었습니다.",
              type: "success",
            });
            setSelectedUsers(new Set());
            loadUsers();
          } else {
            setModal({
              isOpen: true,
              title: "오류",
              message: "일괄 삭제에 실패했습니다.",
              type: "error",
            });
          }
        } catch (error) {
          console.error("일괄 삭제 실패:", error);
          setModal({
            isOpen: true,
            title: "오류",
            message: "일괄 삭제 중 오류가 발생했습니다.",
            type: "error",
          });
        }
      },
    });
  };

  // 체크박스 토글
  const toggleUserSelection = (id: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  // 전체 선택
  const toggleSelectAll = () => {
    if (selectedUsers.size === sortedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(sortedUsers.map(u => u.id)));
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-full">
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

              {/* 일괄 작업 버튼 */}
              <div className="flex gap-3 justify-between items-center">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    📤 CSV 업로드
                  </button>
                  {selectedUsers.size > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      🗑️ 선택 삭제 ({selectedUsers.size})
                    </button>
                  )}
                </div>
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
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">
                          <input
                            type="checkbox"
                            checked={selectedUsers.size === sortedUsers.length && sortedUsers.length > 0}
                            onChange={toggleSelectAll}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </th>
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
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                            사용자가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={selectedUsers.has(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                                className="w-4 h-4 cursor-pointer"
                              />
                            </td>
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

      {/* CSV 업로드 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-white">CSV 파일로 사용자 등록</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CSV 파일</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-2">
                  필수 칼럼: username, password, name, email, phoneNumber, teamName, position, gender
                </p>
              </div>

              {uploadResult && (
                <div className="bg-blue-900 border border-blue-700 rounded-md p-3">
                  <p className="text-blue-300 text-sm">
                    성공: {uploadResult.successCount}/{uploadResult.totalCount}
                  </p>
                  {uploadResult.errors && uploadResult.errors.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto">
                      {uploadResult.errors.map((err: string, idx: number) => (
                        <p key={idx} className="text-red-300 text-xs">{err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCsvUpload}
                  disabled={loading || !csvFile}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md transition-colors font-medium"
                >
                  {loading ? "업로드 중..." : "업로드"}
                </button>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setCsvFile(null);
                    setUploadResult(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md transition-colors font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  value={editingUser?.name ?? ""}
                  onChange={(e) => editingUser && setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                <input
                  type="email"
                  value={editingUser?.email ?? ""}
                  onChange={(e) => editingUser && setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">팀</label>
                <input
                  type="text"
                  value={editingUser?.teamName ?? ""}
                  onChange={(e) => editingUser && setEditingUser({ ...editingUser, teamName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">직책</label>
                <input
                  type="text"
                  value={editingUser?.position ?? ""}
                  onChange={(e) => editingUser && setEditingUser({ ...editingUser, position: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">역할</label>
                <select
                  value={editingUser?.role ?? "USER"}
                  onChange={(e) => editingUser && setEditingUser({ ...editingUser, role: e.target.value as "ADMIN" | "USER" })}
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
                  onClick={() => editingUser && saveUser(editingUser)}
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

      {/* 모달 */}
      <Modal
        title={modal.title}
        message={modal.message}
        type={modal.type}
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={modal.onConfirm}
        confirmText="삭제"
        showConfirmButton={modal.showConfirmButton}
      />
    </div>
  );
}
