'use client';

interface Props { size?: number; className?: string }

export default function MandooLogo({ size = 40, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="200" height="200" rx="44" fill="#13103A"/>
      <rect width="200" height="200" rx="44" fill="none" stroke="#5B21B6" strokeWidth="1.5"/>
      <polyline
        points="30,75 56,100 30,125"
        fill="none"
        stroke="#7C3AED"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="78,132 78,68 118,100 158,68 158,132"
        fill="none"
        stroke="#C4B5FD"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
