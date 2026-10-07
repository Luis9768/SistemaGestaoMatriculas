import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fighterAttack = localFont({
  src: "./fonts/FighterAttack.ttf",
  variable: "--font-fighter-attack",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestão de Matrículas | Escolas Livres de Santo André",
  description: "Sistema Integrado de Gestão de Matrículas para ELT, ELD, ELCV e EMIA — Santo André",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${fighterAttack.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F7] dark:bg-[#000000]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
