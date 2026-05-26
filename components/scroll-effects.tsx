"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ScrollEffects() {
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("reveal-enabled");
    window.scrollTo(0, 0);
    const observed = new WeakSet<Element>();

    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };

    const revealIfInView = (element: Element) => {
      const rect = element.getBoundingClientRect();
      const isInInitialView = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
      if (isInInitialView) {
        element.classList.add("is-visible");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    const observeReveals = () => {
      document.querySelectorAll("[data-reveal]").forEach((element) => {
        if (!observed.has(element)) {
          observed.add(element);
          observer.observe(element);
        }
        revealIfInView(element);
      });
    };

    const frame = window.requestAnimationFrame(() => {
      observeReveals();
      updateProgress();
    });
    const laterFrame = window.setTimeout(observeReveals, 120);
    const mutationObserver = new MutationObserver(observeReveals);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(laterFrame);
      observer.disconnect();
      mutationObserver.disconnect();
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
