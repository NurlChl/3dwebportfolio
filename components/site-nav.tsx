"use client";

import Link from "next/link";
import { useState } from "react";
import { Box, Menu, X } from "lucide-react";

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={open ? "nav shell is-open" : "nav shell"}>
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <span className="brand-mark">
          <Box size={19} />
        </span>
        <span>Arka Wisesa</span>
      </Link>
      <button className="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <nav className="nav-links" aria-label="Primary navigation">
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/portfolio" onClick={() => setOpen(false)}>Portfolio</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
      </nav>
    </header>
  );
}
