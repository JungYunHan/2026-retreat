"use client";

import { useLayoutEffect } from "react";
import "./admin.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useLayoutEffect(() => {
    // data attribute 추가 (CSS에서 선택하기 위함)
    document.documentElement.setAttribute("data-admin", "true");
    document.body.setAttribute("data-admin", "true");
    
    // inline style로도 강제 적용
    document.documentElement.style.setProperty("max-width", "100%", "important");
    document.documentElement.style.setProperty("width", "100%", "important");
    document.documentElement.style.setProperty("margin", "0", "important");
    document.documentElement.style.setProperty("overflow-y", "scroll", "important");
    document.documentElement.style.setProperty("scrollbar-gutter", "stable both-edges", "important");
    document.body.style.setProperty("max-width", "100%", "important");
    document.body.style.setProperty("width", "100%", "important");
    document.body.style.setProperty("margin", "0", "important");
    document.body.style.setProperty("padding-bottom", "0", "important");
    document.body.style.setProperty("overflow-y", "scroll", "important");
    document.body.style.setProperty("scrollbar-gutter", "stable both-edges", "important");

    return () => {
      // 클린업
      document.documentElement.removeAttribute("data-admin");
      document.body.removeAttribute("data-admin");
      document.documentElement.style.removeProperty("max-width");
      document.documentElement.style.removeProperty("width");
      document.documentElement.style.removeProperty("margin");
      document.documentElement.style.removeProperty("overflow-y");
      document.documentElement.style.removeProperty("scrollbar-gutter");
      document.body.style.removeProperty("max-width");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("margin");
      document.body.style.removeProperty("padding-bottom");
      document.body.style.removeProperty("overflow-y");
      document.body.style.removeProperty("scrollbar-gutter");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white w-full" style={{ width: "100%", maxWidth: "none" }}>
      <style>{`
        /* Admin 페이지 전용 최우선 스타일 (이 페이지에서만 주입) */
        html {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          overflow-y: scroll !important;
          scrollbar-gutter: stable both-edges !important;
        }
        
        body {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding-bottom: 0 !important;
          overflow-y: scroll !important;
          scrollbar-gutter: stable both-edges !important;
        }

        /* Admin 영역에만 다크 테마 적용 */
        #admin-root {
          background-color: #111827; /* bg-gray-900 */
          color: white;
          width: 100%;
        }
        
        #admin-root input,
        #admin-root textarea,
        #admin-root select {
          background-color: #374151; /* bg-gray-700 */
          border-color: #4b5563; /* border-gray-600 */
          color: white;
        }
        
        #admin-root input::placeholder,
        #admin-root textarea::placeholder {
          color: #9ca3af; /* placeholder-gray-400 */
        }
        
        #admin-root button {
          transition: all 0.2s ease;
        }
        
        /* 스크롤바 스타일 */
        #admin-root ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        #admin-root ::-webkit-scrollbar-track {
          background: #1f2937; /* gray-800 */
        }
        
        #admin-root ::-webkit-scrollbar-thumb {
          background: #4b5563; /* gray-600 */
          border-radius: 4px;
        }
        
        #admin-root ::-webkit-scrollbar-thumb:hover {
          background: #6b7280; /* gray-500 */
        }
      `}</style>
      <div id="admin-root" className="min-h-screen bg-gray-900 w-full">
        {children}
      </div>
    </div>
  );
}
