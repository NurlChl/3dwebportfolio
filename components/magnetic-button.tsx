"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function MagneticButton({ href, children, className = "btn primary" }: { href: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(event: MouseEvent<HTMLAnchorElement>) {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.22;
    element.style.setProperty("--magnetic-x", `${x}px`);
    element.style.setProperty("--magnetic-y", `${y}px`);
  }

  function handleLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--magnetic-x", "0px");
    element.style.setProperty("--magnetic-y", "0px");
  }

  return (
    <Link ref={ref} className={cn("magnetic", className)} href={href} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </Link>
  );
}
