import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { StyledComponentsRegistry } from "./StyledComponentsRegistry";
import "./globals.css";
import { AppThemeProvider } from "./theme/ThemeContext";
import { appConfig } from "@/lib/app-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: appConfig.seoTitle,
  description: appConfig.seoDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <StyledComponentsRegistry>
          <AppThemeProvider>{children}</AppThemeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
