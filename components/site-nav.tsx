"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Menu, X } from "lucide-react";
import type { SerializedProfile } from "@/lib/mongodb";

export function SiteNav({ profile }: { profile?: SerializedProfile }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const navigation = profile?.navigation;
  const items = navigation?.items?.length
    ? navigation.items
    : [
        { label: "Home", url: "/" },
        { label: "Portfolio", url: "/portfolio" },
        { label: "About", url: "/about" },
        { label: "Contact", url: "/contact" }
      ];

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`nav shell${open ? " is-open" : ""}${scrolled ? " is-scrolled" : ""}`}>
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          {navigation?.logo ? <span className="brand-logo" style={{ backgroundImage: `url(${navigation.logo})` }} /> : <Box size={19} />}
        </span>
        <span>{navigation?.brand || profile?.name || "Arka Wisesa"}</span>
      </Link>
      <button className="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        {items.map((item) => (
          <Link
            className={pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)) ? "active" : ""}
            href={item.url}
            key={`${item.label}-${item.url}`}
            onClick={() => setOpen(false)}
            target={item.isExternal ? "_blank" : undefined}
            rel={item.isExternal ? "noreferrer" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
