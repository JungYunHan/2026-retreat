"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

interface DashboardStats {
  totalVehicles: any;
  totalUsers: number;
  totalPosts: number;
  totalMenus: number;
  totalSchedules: number;
  totalRooms: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalMenus: 0,
    totalSchedules: 0,
    totalRooms: 0,
    totalVehicles: 0,
  });
  const [loading, setLoading] = useState(false);

  const getApiUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") return "http://localhost:8080/api";
    }
    return "http://localhost:8080/api";
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      });
      if (response.ok) {
        const result = await response.json();
        // API 응답이 ApiResponse 래퍼로 감싸져 있음
        setStats(result.data || {
          totalUsers: 0,
          totalPosts: 0,
          totalMenus: 0,
          totalSchedules: 0,
          totalRooms: 0,
          totalVehicles: 0,
        });
      } else {
        console.error("통계 로드 실패:", response.statusText);
      }
    } catch (error) {
      console.error("통계 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adminItems = [
    {
      title: "사용자 관리",
      description: "사용자 정보 관리",
      href: "/admin/users",
      icon: "👥",
      count: stats.totalUsers,
      color: "bg-blue-900 border-blue-700",
      textColor: "text-blue-400",
    },
    {
      title: "게시글 관리",
      description: "게시글 CRUD",
      href: "/admin/posts",
      icon: "📝",
      count: stats.totalPosts,
      color: "bg-purple-900 border-purple-700",
      textColor: "text-purple-400",
    },
    {
      title: "메뉴 관리",
      description: "메뉴 정보 관리",
      href: "/admin/menus",
      icon: "🍽️",
      count: stats.totalMenus,
      color: "bg-green-900 border-green-700",
      textColor: "text-green-400",
    },
    {
      title: "스케줄 관리",
      description: "스케줄 정보 관리",
      href: "/admin/schedules",
      icon: "📅",
      count: stats.totalSchedules,
      color: "bg-orange-900 border-orange-700",
      textColor: "text-orange-400",
    },
    {
      title: "숙소 관리",
      description: "숙소 정보 관리",
      href: "/admin/rooms",
      icon: "🏨",
      count: stats.totalRooms,
      color: "bg-pink-900 border-pink-700",
      textColor: "text-pink-400",
    },
        {
      title: "차량 관리",
      description: "차량 정보 관리",
      href: "/admin/vehicles",
      icon: "🚗",
      count: stats.totalVehicles,
      color: "bg-pink-900 border-pink-700",
      textColor: "text-pink-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="max-w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">관리자 대시보드</h1>
          <p className="text-gray-400 mt-2">2026 겨울 수련회 전체 관리 시스템</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-400">로딩 중...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6 mb-12">
              {adminItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`${item.color} border rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`text-4xl ${item.textColor}`}>{item.icon}</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${item.textColor}`}>
                        {item.count}개
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-100 mb-1">{item.title}</h3>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* 빠른 액션 */}
          </>
        )}
      </div>
    </div>
  );
}
