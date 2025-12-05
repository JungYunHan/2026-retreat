"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname() || "";

  const items = [
    { href: "/admin", label: "대시보드", icon: "📊" },
    { href: "/admin/users", label: "사용자 관리", icon: "👥" },
    { href: "/admin/posts", label: "게시글 관리", icon: "📝" },
    { href: "/admin/menus", label: "메뉴 관리", icon: "🍽️" },
    { href: "/admin/schedules", label: "스케줄 관리", icon: "📅" },
    { href: "/admin/rooms", label: "숙소 관리", icon: "🏨" },
    { href: "/admin/vehicles", label: "차량 관리", icon: "🚗" },
  ];

  return (
    <aside className={`w-64 bg-gray-800 border-r border-gray-700 p-6 fixed h-screen overflow-y-auto ${className ?? ""}`}>
      <h2 className="text-2xl font-bold mb-8">관리 메뉴</h2>
      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                active ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
