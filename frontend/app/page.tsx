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
    <main className="min-h-screen px-4 py-6">
      <HomeCarousel />

      <header className="py-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">2026 선목젊은이 동계수련회</h1>
        <p className="text-gray-600">함께 만들어가는 기쁨의 여정</p>
      </header>

      <div className="my-4 rounded-lg border bg-white p-4 text-sm shadow-sm">
        <span className="font-semibold">{username}</span>님, 환영합니다!
      </div>

      {/* D-Day 단일 카드 */}
      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="p-6 text-center">
          <h5 className="text-gray-500 mb-2">수련회까지</h5>
          <p className="text-4xl font-bold text-orange-600">D-{dDay}</p>
        </div>
      </div>

      {/* 오늘의 주요 일정 단일 카드 (스타일 강화) */}
      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="border-b p-4 flex items-center justify-between">
          <h5 className="font-semibold">오늘의 주요 일정</h5>
          <Link href="/timetable" className="text-sm text-indigo-600 hover:underline">
            전체 일정 보기 →
          </Link>
        </div>
        <div className="p-2">
          {scheduleItems && scheduleItems.length > 0 ? (
            <ul className="divide-y">
              {scheduleItems.map((item) => (
                <li key={item.id} className="p-3 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-orange-50 text-orange-600 font-semibold">
                    {formatTime(item.startTime)}
                  </span>
                  <Link href="/timetable" className="flex-1 text-zinc-800 hover:text-indigo-700 hover:underline font-medium">
                    {item.title}
                  </Link>
                  <span className="text-zinc-400 text-sm">›</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 p-4">등록된 일정이 없습니다.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="border-b p-4">
          <h5 className="font-semibold">오늘의 메뉴</h5>
        </div>
        <div className="p-4">
          {menu ? (
            <div className="grid grid-cols-3 text-center divide-x">
              <div className="px-2">
                <h6 className="text-gray-500">아침</h6>
                {menu.breakfast ? (
                  <>
                    <p className="font-bold">{menu.breakfast.mainDish}</p>
                    {menu.breakfast.sideDishes && (
                      <small className="text-gray-500">{menu.breakfast.sideDishes}</small>
                    )}
                  </>
                ) : (
                  <p>-</p>
                )}
              </div>
              <div className="px-2">
                <h6 className="text-gray-500">점심</h6>
                {menu.lunch ? (
                  <>
                    <p className="font-bold">{menu.lunch.mainDish}</p>
                    {menu.lunch.sideDishes && (
                      <small className="text-gray-500">{menu.lunch.sideDishes}</small>
                    )}
                  </>
                ) : (
                  <p>-</p>
                )}
              </div>
              <div className="px-2">
                <h6 className="text-gray-500">저녁</h6>
                {menu.dinner ? (
                  <>
                    <p className="font-bold">{menu.dinner.mainDish}</p>
                    {menu.dinner.sideDishes && (
                      <small className="text-gray-500">{menu.dinner.sideDishes}</small>
                    )}
                  </>
                ) : (
                  <p>-</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">오늘의 메뉴 정보가 없습니다.</p>
          )}
        </div>
      </div>

      {/* 차량 안내 카드 */}
      <div className="rounded-lg shadow-sm bg-white mb-4">
        <div className="border-b p-4">
          <h5 className="font-semibold">차량 안내</h5>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
            <span className="text-orange-600">🚌</span>
            <span className="text-gray-600 text-sm overflow-hidden text-ellipsis">
              {transportationInfo ?? "차량 정보가 곧 업데이트될 예정입니다."}
            </span>
          </div>
        </div>
      </div>

      {/* 최신 공지 카드 */}
      <div className="rounded-lg shadow-sm bg-white">
        <div className="border-b p-4">
          <h5 className="font-semibold">최신 공지</h5>
        </div>
        <div className="p-2">
          {latestNotices && latestNotices.length > 0 ? (
            <ul>
              {latestNotices.map((n) => (
                <li key={n.id} className="px-3 py-2">
                  <Link
                    href={`/community/${n.id}`}
                    className="block w-full whitespace-nowrap overflow-hidden text-ellipsis hover:underline"
                  >
                    {n.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 p-2">등록된 공지사항이 없습니다.</p>
          )}
        </div>
        <div className="p-4 text-right">
          <Link href="/community" className="text-sm text-gray-600 hover:text-gray-800">
            더보기 →
          </Link>
        </div>
      </div>
    </main>
  );
}
