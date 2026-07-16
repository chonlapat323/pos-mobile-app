import { Anuphan, Noto_Serif_Thai } from "next/font/google";

import { Toast } from "@heroui/react";
import type { Metadata } from "next";

import "./globals.css";

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-noto-serif-thai",
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "POS Services — หน้าร้าน",
  description: "ระบบขายบริการหน้าร้าน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`dark ${anuphan.variable} ${notoSerifThai.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <Toast.Provider />
      </body>
    </html>
  );
}
