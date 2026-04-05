import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'English Learning',
  description: 'Learn English with synced audio processing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full">
        {children}
      </body>
    </html>
  );
}
