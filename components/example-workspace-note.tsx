import Link from "next/link";

export function ExampleWorkspaceNote({ href = "/datasets" }: { href?: string }) {
  return (
    <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--active)] px-4 py-3 text-[13px] leading-relaxed text-[var(--ink)]">
      Everything labeled <span className="font-medium">Example</span> is a
      preloaded walkthrough: a prompt list, a few judges, and one finished run.
      Rename them, delete them, or add your own.{" "}
      <Link href={href} className="font-medium text-[var(--accent)] hover:underline">
        Open the example dataset
      </Link>
    </div>
  );
}
