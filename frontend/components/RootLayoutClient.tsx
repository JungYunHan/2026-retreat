'use client';

import QueryProvider from '@/components/QueryProvider';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QueryProvider>{children}</QueryProvider>;
}
