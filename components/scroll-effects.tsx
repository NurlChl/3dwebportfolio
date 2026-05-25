"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ScrollEffects() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("reveal-enabled");
    window.scrollTo(0, 0);

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.16 }
    );

    const observeReveals = () => {
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        element.classList.remove("is-visible");
        observer.observe(element);
      });
    };

    const frame = window.requestAnimationFrame(observeReveals);
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-meter" style={{ transform: `scaleX(${progress / 100})` }} />
      <div className="scroll-percent">{Math.round(progress).toString().padStart(2, "0")}%</div>
    </>
  );
}
