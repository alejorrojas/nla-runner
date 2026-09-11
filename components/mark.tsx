import Image from "next/image";

export function Mark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt=""
      width={32}
      height={32}
      className={className}
    />
  );
}
