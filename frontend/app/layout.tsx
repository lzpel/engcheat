import fullHeight from "@/src/fullHeight";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_REPO,
  description: "learn english",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	return <html lang="en" style={fullHeight}>
		<body className={`${geistSans.variable} ${geistMono.variable}`} style={fullHeight}>
			{children}
		</body>
	</html>
}
