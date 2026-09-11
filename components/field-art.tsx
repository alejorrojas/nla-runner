import Image from "next/image";

export function FieldArt({
  src,
  className,
  priority = false,
}: {
  src: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      className={className ? `object-cover ${className}` : "object-cover"}
      sizes="(max-width: 1024px) 100vw, 1180px"
    />
  );
}
