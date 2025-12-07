"use client";

import { useEffect, useState, useCallback } from "react";
import Modal from "@/components/Modal";

interface VehicleItem {
  id: number;
  name: string;
  vehicleNumber: string;
  capacity: number;
  driverName: string;
  driverPhone: string;
  departureTime: string;
  departureLoc: string;
  memo: string;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  showConfirmButton?: boolean;
  onConfirm?: () => void;
}

export default function VehiclesAdminPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [sortKey, setSortKey] = useState<keyof VehicleItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [vehicleForm, setVehicleForm] = useState<VehicleItem>({
    id: 0,
    name: "",
    vehicleNumber: "",
    capacity: 45,
    driverName: "",
    driverPhone: "",
    departureTime: "",
    departureLoc: "",
    memo: "",
  });
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return "http://localhost:8080/api";
      }
      return `${window.location.origin.replace(/\/$/, "")}/api`;
    }
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  }, []);

  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchLower = searchText.toLowerCase();
    return (
      vehicle.name.toLowerCase().includes(searchLower) ||
      vehicle.vehicleNumber.toLowerCase().includes(searchLower) ||
      (vehicle.driverName?.toLowerCase().includes(searchLower) ?? false) ||
      (vehicle.departureLoc?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return sortOrder === "asc" ? -1 : 1;
    if (bVal == null) return sortOrder === "asc" ? 1 : -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const loadVehicles = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiUrl()}/admin/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setVehicles(result.data || []);
      } else {
        setError("차량 목록을 불러오는데 실패했습니다.");
      }
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof VehicleItem) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleEdit = (vehicle: VehicleItem) => {
    setEditingVehicleId(vehicle.id);
    setVehicleForm(vehicle);
  };

  const handleCancel = () => {
    setEditingVehicleId(null);
    setVehicleForm({
      id: 0,
      name: "",
      vehicleNumber: "",
      capacity: 45,
      driverName: "",
      driverPhone: "",
      departureTime: "",
      departureLoc: "",
      memo: "",
    });
  };

  const handleSave = async () => {
    if (!vehicleForm.name.trim()) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "차량명은 필수 항목입니다.",
        type: "error",
      });
      return;
    }

    if (!vehicleForm.capacity || vehicleForm.capacity < 1) {
      setModal({
        isOpen: true,
        title: "입력 오류",
        message: "정원은 1명 이상이어야 합니다.",
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
      setLoading(true);
      setError(null);

      const method = editingVehicleId ? "PUT" : "POST";
      const url = editingVehicleId
        ? `${getApiUrl()}/admin/vehicles/${editingVehicleId}`
        : `${getApiUrl()}/admin/vehicles`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehicleForm),
      });

      if (response.ok) {
        setModal({
          isOpen: true,
          title: "성공",
          message: editingVehicleId ? "차량이 수정되었습니다." : "차량이 추가되었습니다.",
          type: "success",
        });
        await loadVehicles();
        handleCancel();
      } else {
        setModal({
          isOpen: true,
          title: "오류",
          message: "차량 저장에 실패했습니다.",
          type: "error",
        });
      }
    } catch (err) {
      setModal({
        isOpen: true,
        title: "오류",
        message: "차량 저장 중 오류가 발생했습니다.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setModal({
      isOpen: true,
      title: "삭제 확인",
      message: "정말로 이 차량을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.",
      type: "warning",
      showConfirmButton: true,
      onConfirm: async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("인증 토큰이 없습니다. 로그인 후 다시 시도해주세요.");
          return;
        }

        try {
          setLoading(true);
          setError(null);
          const response = await fetch(`${getApiUrl()}/admin/vehicles/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          setModal({ isOpen: false, title: "", message: "", type: "info" });

          if (response.ok) {
            setModal({
              isOpen: true,
              title: "성공",
              message: "차량이 삭제되었습니다.",
              type: "success",
            });
            await loadVehicles();
          } else {
            setModal({
              isOpen: true,
              title: "오류",
              message: "차량 삭제에 실패했습니다.",
              type: "error",
            });
          }
        } catch (err) {
          setModal({
            isOpen: true,
            title: "오류",
            message: "차량 삭제 중 오류가 발생했습니다.",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-full">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold">차량 관리</h1>
                  <p className="text-gray-400 mt-2">총 {sortedVehicles.length}대의 차량</p>
                </div>
                <button
                  onClick={loadVehicles}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  새로고침
                </button>
              </div>

              {/* 검색 */}
              <div>
                <input
                  type="text"
                  placeholder="검색 (차량명, 번호, 기사명, 메모)..."
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

              {/* 차량 추가 / 수정 */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg">{editingVehicleId ? "차량 수정" : "새 차량 추가"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="차량명"
                    value={vehicleForm.name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="차량 번호"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="정원"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: Number(e.target.value) })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="기사명"
                    value={vehicleForm.driverName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverName: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="기사 연락처"
                    value={vehicleForm.driverPhone}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, driverPhone: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="출발지"
                    value={vehicleForm.departureLoc}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, departureLoc: e.target.value })}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                  <div className="col-span-2">
                    <textarea
                      placeholder="메모"
                      value={vehicleForm.memo}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, memo: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-600 border border-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading || !vehicleForm.name.trim()}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    {loading ? "저장 중..." : "저장"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>

              {/* 테이블 */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-600">
                      <tr>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("id")}
                        >
                          ID {sortKey === "id" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("name")}
                        >
                          차량명 {sortKey === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("vehicleNumber")}
                        >
                          차량 번호 {sortKey === "vehicleNumber" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("capacity")}
                        >
                          정원 {sortKey === "capacity" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("driverName")}
                        >
                          기사명 {sortKey === "driverName" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("driverPhone")}
                        >
                          연락처 {sortKey === "driverPhone" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th
                          className="px-4 py-3 text-left cursor-pointer hover:bg-gray-500"
                          onClick={() => handleSort("departureLoc")}
                        >
                          출발지 {sortKey === "departureLoc" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="px-4 py-3 text-left">메모</th>
                        <th className="px-4 py-3 text-center">액션</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && vehicles.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-400">로딩 중...</p>
                          </td>
                        </tr>
                      ) : sortedVehicles.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                            차량이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sortedVehicles.map((vehicle) => (
                          <tr key={vehicle.id} className="border-t border-gray-600 hover:bg-gray-650">
                            <td className="px-4 py-3">{vehicle.id}</td>
                            <td className="px-4 py-3">{vehicle.name}</td>
                            <td className="px-4 py-3">{vehicle.vehicleNumber || "-"}</td>
                            <td className="px-4 py-3">{vehicle.capacity || "-"}</td>
                            <td className="px-4 py-3">{vehicle.driverName || "-"}</td>
                            <td className="px-4 py-3">{vehicle.driverPhone || "-"}</td>
                            <td className="px-4 py-3">{vehicle.departureLoc || "-"}</td>
                            <td className="px-4 py-3 max-w-xs truncate" title={vehicle.memo}>
                              {vehicle.memo || "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleEdit(vehicle)}
                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm mr-2 transition-colors"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(vehicle.id)}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm transition-colors"
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
