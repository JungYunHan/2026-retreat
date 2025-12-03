"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import QueryProvider from "@/components/QueryProvider";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/login") ?? false;

  return (
    <QueryProvider>
      {children}
      {!hideFooter && <Footer />}
    </QueryProvider>
  );
}
