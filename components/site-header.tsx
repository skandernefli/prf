"use client";

import { useEffect, useState } from "react";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="SN home">
        SN
      </a>
      <button
        className="menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? "CLOSE" : "MENU"}
      </button>
      <nav
        id="primary-navigation"
        className="primary-navigation"
        aria-label="Primary navigation"
        data-open={menuOpen}
      >
        <a href="#capabilities" onClick={() => setMenuOpen(false)}>
          CAPABILITIES
        </a>
        <a href="#projects" onClick={() => setMenuOpen(false)}>
          PROJECTS
        </a>
        <a href="#conclusion" onClick={() => setMenuOpen(false)}>
          ABOUT
        </a>
        <a href="#footer" onClick={() => setMenuOpen(false)}>
          CONTACT
        </a>
      </nav>
    </header>
  );
}
