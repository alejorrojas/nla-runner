export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      fill="none"
    >
      <ellipse cx="12" cy="12" rx="9" ry="5.5" stroke="currentColor" strokeWidth="1.2" />
      <ellipse
        cx="12"
        cy="12"
        rx="5.5"
        ry="9"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.45"
      />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}
