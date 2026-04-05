import type { Metadata } from 'next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';

export const metadata: Metadata = {
  title: 'engcheat',
  description: 'engcheat - English learning with synced audio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full">
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
