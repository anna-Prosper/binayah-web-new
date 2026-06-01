export function DirhemSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-2 0 24 26"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      className={className}
      aria-hidden="true"
    >
      {/* D letterform: outer shape minus inner hollow */}
      <path d="M1 0 L10 0 C19 0 21 5.5 21 13 C21 20.5 19 26 10 26 L1 26 Z M5 4 L9 4 C16 4 17 8 17 13 C17 18 16 22 9 22 L5 22 Z" />
      {/* Two horizontal bars extending slightly left of the D */}
      <rect x="-2" y="9.5" width="23" height="2.5" />
      <rect x="-2" y="14" width="23" height="2.5" />
    </svg>
  );
}
