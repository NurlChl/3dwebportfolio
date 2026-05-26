import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { PageTransition } from "@/components/page-transition";
import { ScrollEffects } from "@/components/scroll-effects";
import { getProfile } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Arka Wisesa - 3D Artist Portfolio",
    template: "%s | Arka Wisesa"
  },
  description: "Portfolio 3D artist untuk asset Blender, Unreal Engine, dan realtime GLB preview di web.",
  keywords: ["3D artist", "Blender artist", "Unreal Engine asset", "3D portfolio", "GLB viewer"],
  openGraph: {
    title: "Arka Wisesa - 3D Artist Portfolio",
    description: "Lihat asset 3D langsung di browser dengan realtime Three.js viewer.",
    type: "website"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  const design = profile.design ?? {};
  const style = {
    "--heading-font": design.headingFont ? `"${design.headingFont}", "Trebuchet MS", sans-serif` : "\"Space Grotesk\", \"Trebuchet MS\", sans-serif",
    "--body-font": design.bodyFont ? `"${design.bodyFont}", "Segoe UI", sans-serif` : "\"Inter\", \"Segoe UI\", sans-serif",
    "--lime": design.accentColor,
    "--ink": design.backgroundColor,
    "--paper": design.textColor,
    "--button-radius": design.buttonRadius,
    "--h1-size": design.h1Size,
    "--h2-size": design.h2Size,
    "--h3-size": design.h3Size,
    "--h4-size": design.h4Size,
    "--h5-size": design.h5Size,
    "--h6-size": design.h6Size,
    "--body-size": design.bodySize,
    "--small-size": design.smallSize,
    "--button-size": design.buttonSize,
    "--badge-size": design.badgeSize
  } as CSSProperties;

  return (
    <html lang="id">
      <body style={style}>
        <PageTransition />
        <ScrollEffects />
        {children}
      </body>
    </html>
  );
}
