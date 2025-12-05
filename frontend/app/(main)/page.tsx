"use client";

import Link from "next/link";
import HomeCarousel from "@/components/HomeCarousel";
import { pageApi, type HomeData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type ScheduleItem = {
  id: number;
  title: string;
  startTime: string; // HH:mm
};

type Menu = {
  breakfast?: { mainDish: string; sideDishes?: string } | null;
  lunch?: { mainDish: string; sideDishes?: string } | null;
  dinner?: { mainDish: string; sideDishes?: string } | null;
} | null;

type Notice = { id: number; title: string };

function computeDDayToJan23() {
  const now = new Date();
  const year = now.getMonth() > 0 || (now.getMonth() === 0 && now.getDate() > 23)
    ? now.getFullYear() + 1
    : now.getFullYear();
  const target = new Date(year, 0, 23); // Jan is 0
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

function formatTime(value: string): string {
  if (!value) return '';
  // Try ISO or date-like strings
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  // Fallback: extract HH:MM from string like '2026-01-20T09:30:00'
  const match = value.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : value;
}

function normalizeDish(value: unknown): { mainDish: string; sideDishes?: string } | null {
  if (!value) return null;
  if (typeof value === 'string') return { mainDish: value };
  if (typeof value === 'object') {
    const v = value as { mainDish?: unknown; sideDishes?: unknown };
    const mainDish = typeof v.mainDish === 'string' ? v.mainDish : v.mainDish != null ? String(v.mainDish) : '';
    const sideDishes = typeof v.sideDishes === 'string' ? v.sideDishes : undefined;
    return { mainDish, sideDishes };
  }
  return { mainDish: String(value) };
}

export default function HomePage() {
  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const res = await pageApi.getHomeData();
      if (res.success && res.data) {
        const data: HomeData = res.data;
        const scheduleItems: ScheduleItem[] = (data.scheduleItems || []).map((s: { time?: string; startTime?: string; title?: string }, idx) => ({
          id: idx + 1,
          title: s.title ?? '',
          startTime: s.time ?? s.startTime ?? '',
        }));
        const menu: Menu = {
          breakfast: normalizeDish(data.menu?.breakfast),
          lunch: normalizeDish(data.menu?.lunch),
          dinner: normalizeDish(data.menu?.dinner),
        };
        const latestNotices: Notice[] = (data.latestNotices || []).map((n) => ({
          id: n.id,
          title: n.title,
        }));
        return {
          username: "사용자",
          dDay: computeDDayToJan23(),
          scheduleItems,
          menu,
          latestNotices,
          transportationInfo: undefined,
        };
      }
      return {
        username: "사용자",
        dDay: computeDDayToJan23(),
        scheduleItems: [],
        menu: null,
        latestNotices: [],
        transportationInfo: undefined,
      };
    },
  });

  const {
    username = "사용자",
    dDay = computeDDayToJan23(),
    scheduleItems = [],
    menu = null,
    latestNotices = [],
    transportationInfo,
  } = homeData || {};

  if (isLoading) {
    return (
      <main className="min-h-screen px-4 py-6 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <HomeCarousel />

        <header className="py-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            2026 느헤미야 동계 수련회 
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">함께 만들어가는 기쁨의 여정</p>
        </header>

        <div className="my-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-white to-indigo-50 p-5 text-sm shadow-lg">
          <span className="font-bold text-indigo-600">{username}</span>님, 환영합니다! 🎉
        </div>

        {/* D-Day 카드 */}
        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-orange-400 to-pink-500 mb-6 overflow-hidden">
          <div className="p-8 text-center text-white">
            <h5 className="text-white/90 mb-3 text-lg font-medium">수련회까지</h5>
            <p className="text-6xl font-extrabold drop-shadow-lg">D-{dDay}</p>
            <p className="mt-2 text-white/80 text-sm">기대되는 시간이 다가오고 있어요!</p>
          </div>
        </div>

        {/* 오늘의 주요 일정 */}
        <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100 flex items-center justify-between">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span>오늘의 주요 일정</span>
            </h5>
            <Link href="/timetable" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
              전체 보기 →
            </Link>
          </div>
          <div className="p-2">
            {scheduleItems && scheduleItems.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {scheduleItems.map((item) => (
                  <li key={item.id} className="p-4 flex items-center gap-4 hover:bg-indigo-50 transition-colors rounded-lg">
                    <span className="inline-flex items-center justify-center min-w-[4rem] h-12 rounded-xl bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold text-sm shadow-md">
                      {formatTime(item.startTime)}
                    </span>
                    <Link href="/timetable" className="flex-1 text-gray-800 hover:text-indigo-700 font-semibold text-base">
                      {item.title}
                    </Link>
                    <span className="text-indigo-400 text-lg">›</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 p-6 text-center">등록된 일정이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 오늘의 메뉴 */}
        <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-100">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span>오늘의 메뉴</span>
            </h5>
          </div>
          <div className="p-6">
            {menu ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200">
                  <h6 className="text-orange-600 font-bold mb-2 text-sm">아침</h6>
                  {menu.breakfast ? (
                    <>
                      <p className="font-bold text-gray-800">{menu.breakfast.mainDish}</p>
                      {menu.breakfast.sideDishes && (
                        <small className="text-gray-500 text-xs">{menu.breakfast.sideDishes}</small>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <h6 className="text-green-600 font-bold mb-2 text-sm">점심</h6>
                  {menu.lunch ? (
                    <>
                      <p className="font-bold text-gray-800">{menu.lunch.mainDish}</p>
                      {menu.lunch.sideDishes && (
                        <small className="text-gray-500 text-xs">{menu.lunch.sideDishes}</small>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200">
                  <h6 className="text-indigo-600 font-bold mb-2 text-sm">저녁</h6>
                  {menu.dinner ? (
                    <>
                      <p className="font-bold text-gray-800">{menu.dinner.mainDish}</p>
                      {menu.dinner.sideDishes && (
                        <small className="text-gray-500 text-xs">{menu.dinner.sideDishes}</small>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-400">-</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">오늘의 메뉴 정보가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 차량 안내 카드 */}
        <div className="rounded-2xl shadow-lg bg-white mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">🚌</span>
              <span>차량 안내</span>
            </h5>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <span className="text-3xl">🚌</span>
              <span className="text-gray-700 text-sm flex-1">
                {transportationInfo ?? "차량 정보가 곧 업데이트될 예정입니다."}
              </span>
            </div>
          </div>
        </div>

        {/* 최신 공지 */}
        <div className="rounded-2xl shadow-lg bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-pink-100">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="text-xl">📢</span>
              <span>최신 공지</span>
            </h5>
          </div>
          <div className="p-2">
            {latestNotices && latestNotices.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {latestNotices.map((n) => (
                  <li key={n.id} className="px-4 py-3 hover:bg-pink-50 transition-colors">
                    <Link
                      href={`/community/${n.id}`}
                      className="block w-full whitespace-nowrap overflow-hidden text-ellipsis hover:text-pink-600 font-medium transition-colors"
                    >
                      {n.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 p-6 text-center">등록된 공지사항이 없습니다.</p>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 text-right border-t border-gray-100">
            <Link href="/community" className="text-sm text-pink-600 hover:text-pink-800 font-semibold transition-colors">
              더보기 →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
