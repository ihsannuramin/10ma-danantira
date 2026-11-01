/** Hard-court banner used where the showcase has a venue photo. */
export function CourtIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <rect width="400" height="160" fill="#1f5f3f" />
      <rect x="30" y="20" width="340" height="120" fill="#2e7d55" />
      <g fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9">
        <rect x="30" y="20" width="340" height="120" />
        <line x1="30" y1="36" x2="370" y2="36" />
        <line x1="30" y1="124" x2="370" y2="124" />
        <line x1="110" y1="36" x2="110" y2="124" />
        <line x1="290" y1="36" x2="290" y2="124" />
        <line x1="110" y1="80" x2="290" y2="80" />
      </g>
      <line x1="200" y1="14" x2="200" y2="146" stroke="#111" strokeWidth="4" />
      <circle cx="252" cy="58" r="7" fill="#D9FF00" stroke="#111" strokeWidth="1.5" />
    </svg>
  );
}
