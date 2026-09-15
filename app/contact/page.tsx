import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/mark";

export const metadata: Metadata = {
  title: "Contact",
  description: "Authors of the NLASmith research prototype.",
};

const PEOPLE = [
  {
    name: "Alejo Ivan Rojas",
    email: "alejoivanrojas@gmail.com",
    site: "alejorrojas.com",
    href: "https://alejorrojas.com",
  },
  {
    name: "Juan Ignacio Rodriguez Leiva",
    email: "juanignaciorodriguezleiva5@gmail.com",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-dvh bg-[#faf9f5] text-[#141413]">
      <header className="mx-auto flex max-w-[1180px] items-center px-6 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Mark className="h-8 w-8" />
          <span className="text-[15px] font-semibold tracking-tight">
            NLASmith
          </span>
        </Link>
      </header>
      <main className="mx-auto max-w-[640px] px-6 pb-28 pt-20 md:px-8">
        <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
          Contact
        </p>
        <h1 className="mt-4 font-display text-[clamp(36px,5vw,52px)] leading-[1.02]">
          Write us.
        </h1>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">
          NLASmith is a research prototype. For the work, the paper, or the
          prototype, reach either author.
        </p>
        <ul className="mt-16 divide-y divide-[#d1cfc5] border-y border-[#d1cfc5]">
          {PEOPLE.map((person) => (
            <li key={person.email} className="py-8">
              <p className="text-[20px] font-medium tracking-tight">{person.name}</p>
              <p className="mt-3 flex flex-col gap-1 text-[15px] text-[var(--muted)]">
                <a href={`mailto:${person.email}`} className="hover:text-[var(--ink)]">
                  {person.email}
                </a>
                {person.site && person.href ? (
                  <a
                    href={person.href}
                    className="hover:text-[var(--ink)]"
                  >
                    {person.site}
                  </a>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
