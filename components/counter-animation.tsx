"use client";

import { useEffect, useRef, useState } from "react";

export function CounterAnimation({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const number = Number.parseFloat(value);
    if (!Number.isFinite(number)) return;
    const suffix = value.replace(String(number), "");
    const element = ref.current;
    if (!element) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1100);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(`${Math.round(number * eased)}${suffix}`);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      observer.disconnect();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{display}</span>;
}
