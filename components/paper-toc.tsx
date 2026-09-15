"use client";

import { useEffect, useState } from "react";

type TocItem = {
  href: string;
  label: string;
  nested?: boolean;
};

export function PaperToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((section): section is HTMLElement => section !== null);

    let frame = 0;

    function updateActiveSection() {
      const marker = window.scrollY + 120;
      let nextId = "";

      for (const section of sections) {
        const sectionTop =
          section.getBoundingClientRect().top + window.scrollY;
        if (sectionTop > marker) break;
        nextId = section.id;
      }

      if (nextId) setActiveId(nextId);
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    }

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [items]);

  return (
    <nav className="max-h-[calc(100vh-5rem)] overflow-y-auto">
      {items.map((item) => {
        const id = item.href.slice(1);
        const active = id === activeId;

        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? "location" : undefined}
            className={`block py-1 text-[13px] leading-[18.2px] hover:text-[var(--ink)] ${
              item.nested ? "pl-[14px] text-[12px] leading-[16.8px]" : ""
            } ${
              active
                ? "font-semibold text-[var(--ink)]"
                : "font-normal text-[var(--muted)]"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
