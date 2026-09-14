export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#141413" />
      <g fill="#d97757" transform="translate(16 16)">
        <ellipse cx="0" cy="-5.4" rx="3.6" ry="5.8" transform="rotate(-28)" />
        <ellipse cx="5.4" cy="0" rx="5.8" ry="3.6" transform="rotate(-28)" />
        <ellipse cx="0" cy="5.4" rx="3.6" ry="5.8" transform="rotate(-28)" />
        <ellipse cx="-5.4" cy="0" rx="5.8" ry="3.6" transform="rotate(-28)" />
      </g>
    </svg>
  );
}
