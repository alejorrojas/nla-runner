type Kind =
  | "nodes"
  | "globe"
  | "puzzle"
  | "path"
  | "scribble"
  | "hands"
  | "constellation"
  | "spark";

const ink = "#141413";

export function LineArt({
  kind,
  className,
  onWarm = false,
}: {
  kind: Kind;
  className?: string;
  onWarm?: boolean;
}) {
  const clay = onWarm ? "#faf9f5" : "#d4a08a";
  const clayDeep = onWarm ? "#f0eee6" : "#c4785a";

  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      aria-hidden
      className={className}
    >
      {kind === "nodes" || kind === "constellation" ? (
        <>
          <circle cx="78" cy="54" r="16" fill={clay} opacity="0.88" />
          <circle cx="132" cy="38" r="11" fill={clayDeep} opacity="0.72" />
          <circle cx="168" cy="72" r="14" fill={clay} opacity="0.8" />
          <circle cx="118" cy="96" r="18" fill={clayDeep} />
          <circle cx="62" cy="108" r="10" fill={clay} opacity="0.62" />
          <path
            d="M78 54L132 38M132 38L168 72M168 72L118 96M118 96L78 54M118 96L62 108"
            stroke={ink}
            strokeWidth="1.55"
            strokeLinejoin="round"
          />
          <path
            d="M46 132c16-18 22-8 34-22 8-9 10 6 22 2 14-5 16-24 36-18"
            stroke={ink}
            strokeWidth="1.65"
            strokeLinecap="round"
          />
          <path
            d="M52 118c4 10 2 18-2 26M64 112c8 8 8 18 4 28"
            stroke={ink}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "globe" ? (
        <>
          <circle cx="120" cy="78" r="46" stroke={ink} strokeWidth="1.7" />
          <ellipse cx="120" cy="78" rx="22" ry="46" stroke={ink} strokeWidth="1.5" />
          <path d="M74 78h92M86 52h68M86 104h68" stroke={ink} strokeWidth="1.5" />
          <path
            d="M78 128c18 14 66 14 84 0"
            stroke={ink}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M68 136c10 4 18-2 28 6"
            stroke={ink}
            strokeWidth="1.55"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "puzzle" ? (
        <>
          <path
            d="M58 52h42c0 10 14 10 14 0h28v32c-10 0-10 14 0 14v28H98c0-10-14-10-14 0H58V84c10 0 10-14 0-14V52Z"
            stroke={ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M128 78h42c0 10 14 10 14 0h22v48c-10 0-10 14 0 14v22H156c0-10-14-10-14 0h-14V78Z"
            fill={clay}
            stroke={ink}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </>
      ) : null}
      {kind === "path" ? (
        <>
          <path
            d="M48 118 L92 78 L128 98 L176 44"
            stroke={ink}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="48" cy="118" r="8" fill={clayDeep} />
          <circle cx="92" cy="78" r="7" fill={clay} opacity="0.85" />
          <circle cx="128" cy="98" r="7" fill={clay} opacity="0.7" />
          <circle cx="176" cy="44" r="10" fill={clayDeep} />
          <path
            d="M168 58c10 8 18 6 28 18"
            stroke={ink}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "scribble" ? (
        <path
          d="M52 88c18-28 28 24 46-8 16-28 22 22 40-4 14-20 24 18 42-10"
          stroke={ink}
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      ) : null}
      {kind === "hands" ? (
        <>
          <path
            d="M70 118c8-28 22-46 50-50 18-2 36 8 48 24"
            stroke={ink}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M86 70c6-18 22-28 38-18 10 6 12 20 8 32"
            stroke={ink}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <circle cx="156" cy="54" r="11" fill={clayDeep} opacity="0.9" />
          <circle cx="176" cy="78" r="7" fill={clay} opacity="0.7" />
        </>
      ) : null}
      {kind === "spark" ? (
        <>
          <circle cx="120" cy="80" r="22" fill={clay} opacity="0.85" />
          <circle cx="92" cy="58" r="10" fill={clayDeep} opacity="0.7" />
          <circle cx="154" cy="54" r="8" fill={clay} />
          <circle cx="148" cy="104" r="12" fill={clayDeep} opacity="0.75" />
          <path
            d="M120 80L92 58M120 80L154 54M120 80L148 104"
            stroke={ink}
            strokeWidth="1.55"
          />
          <path
            d="M78 122c16-10 28 8 44 0 14-7 22-22 40-16"
            stroke={ink}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      ) : null}
    </svg>
  );
}
