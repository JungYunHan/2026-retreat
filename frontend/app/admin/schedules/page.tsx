"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/Modal";

interface ScheduleItem {
  id: number;
  title: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  dayNumber: number;
  description?: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  showConfirmButton?: boolean;
  onConfirm?: () => void;
}

export default function SchedulesAdminPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof ScheduleItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [scheduleForm, setScheduleForm] = useState<ScheduleItem>({
    id: 0,
    title: "",
    dayNumber: 1,
    startTime: "",
    endTime: "",
  });
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
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

  const filteredSchedules = schedules.filter((sch) => {
    const searchLower = searchText.toLowerCase();
    return (
      sch.title.toLowerCase().includes(searchLower) ||
      (sch.description?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }

    const aStr = (aVal ?? "").toString().toLowerCase();
    const bStr = (bVal ?? "").toString().toLowerCase();
    return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const loadSchedules = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      setSchedules([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/admin/schedules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setSchedules(result.data || []);
      } else {
        setError(`스케줄 로드 실패: ${response.status} ${response.statusText}`);
        setSchedules([]);
      }
    } catch (error) {
      console.error("스케줄 로드 실패:", error);
      setError("스케줄 로드 중 오류가 발생했습니다.");
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async () => {
    if (!scheduleForm.title.trim()) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "제목은 필수 항목입니다.",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      setError(null);
      const url = editingScheduleId
        ? `${getApiUrl()}/admin/schedules/${editingScheduleId}`
        : `${getApiUrl()}/admin/schedules`;
      const method = editingScheduleId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleForm),
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          title: "성공",
          message: editingScheduleId ? "스케줄이 수정되었습니다." : "스케줄이 추가되었습니다.",
          type: "success",
        });
        setScheduleForm({ id: 0, title: "", dayNumber: 1, startTime: "", endTime: "" });
        setEditingScheduleId(null);
        loadSchedules();
      } else {
        setModal({
          isOpen: true,
          title: "오류",
          message: "스케줄 저장에 실패했습니다.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("스케줄 저장 실패:", error);
      setModal({
        isOpen: true,
        title: "오류",
        message: "스케줄 저장 중 오류가 발생했습니다.",
        type: "error",
      });
    }
  };

  const deleteSchedule = async (id: number) => {
    setModal({
      isOpen: true,
      title: "삭제 확인",
      message: "정말 이 일정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      type: "warning",
      showConfirmButton: true,
      onConfirm: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setModal({
            isOpen: true,
            title: "오류",
            message: "인증 토큰이 없습니다.",
            type: "error",
          });
          return;
        }

        try {
          const response = await fetch(`${getApiUrl()}/admin/schedules/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          setModal({ isOpen: false, title: "", message: "", type: "info" });

          if (response.ok) {
            setModal({
              isOpen: true,
              title: "성공",
              message: "스케줄이 삭제되었습니다.",
              type: "success",
            });
            loadSchedules();
          } else {
            setModal({
              isOpen: true,
              title: "오류",
              message: "스케줄 삭제에 실패했습니다.",
              type: "error",
            });
          }
        } catch (error) {
          console.error("스케줄 삭제 실패:", error);
          setModal({
            isOpen: true,
            title: "오류",
            message: "스케줄 삭제 중 오류가 발생했습니다.",
            type: "error",
          });
        }
      },
    });
  };

  useEffect(() => {
    loadSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-full">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">스케줄 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedSchedules.length}개의 스케줄</p>
                </div>
                <button
                  onClick={loadSchedules}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (제목, 설명)..."
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

              {/* 스케줄 추가 / 수정 */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">{editingScheduleId ? "스케줄 수정" : "새 스케줄 추가"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="제목"
                    value={scheduleForm.title}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="장소"
                    value={scheduleForm.location ?? ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="datetime-local"
                    value={scheduleForm.startTime ?? ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="datetime-local"
                    value={scheduleForm.endTime ?? ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Day 번호"
                    value={scheduleForm.dayNumber}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayNumber: Number(e.target.value) })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <textarea
                    placeholder="설명"
                    value={scheduleForm.description ?? ""}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    rows={1}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={saveSchedule}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingScheduleId ? "수정" : "추가"}
                  </button>
                  {editingScheduleId && (
                    <button
                      onClick={() => {
                        setEditingScheduleId(null);
                        setScheduleForm({ id: 0, title: "", dayNumber: 1, startTime: "", endTime: "" });
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
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">장소</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">시간</th>
                        <th
                          className="px-6 py-4 text-left font-semibold text-gray-300 cursor-pointer hover:bg-gray-600 transition-colors"
                          onClick={() => {
                            if (sortKey === "dayNumber") {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortKey("dayNumber");
                              setSortOrder("asc");
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            Day {sortKey === "dayNumber" && (sortOrder === "asc" ? "▲" : "▼")}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-300">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSchedules.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                            스케줄이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedSchedules.map((sch) => (
                          <tr key={sch.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 text-gray-300 font-medium">{sch.title}</td>
                            <td className="px-6 py-4 text-gray-400">{sch.location ?? "-"}</td>
                            <td className="px-6 py-4 text-gray-400 text-sm">
                              <div>{sch.startTime?.replace("T", " ")}</div>
                              <div className="text-xs text-gray-500">~ {sch.endTime?.replace("T", " ")}</div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">Day {sch.dayNumber}</td>
                            <td className="px-6 py-4 space-x-3">
                              <button
                                onClick={() => {
                                  setScheduleForm(sch);
                                  setEditingScheduleId(sch.id);
                                }}
                                className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => deleteSchedule(sch.id)}
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
