import React from 'react';

interface WinkingBirdIconProps {
  className?: string;
  size?: number;
}

/**
 * A charming, stylish SVG icon depicting a cute winking bird (眨眼的小鸟).
 * Features a joyful crest, a winking left eye, a bright sparkling right eye,
 * adorable little beak, gentle rosy cheeks, and soft wing curves.
 * Perfectly embodies "ChatterNest" (chirping/chatting birds in their nest).
 */
export const WinkingBirdIcon: React.FC<WinkingBirdIconProps> = ({
  className = 'h-5 w-5',
  size,
}) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="ChatterNest Winking Bird"
    >
      <defs>
        {/* Soft body gradient */}
        <linearGradient id="birdBodyGrad" x1="8" y1="8" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff4d4d" />
          <stop offset="45%" stopColor="#990000" />
          <stop offset="100%" stopColor="#700000" />
        </linearGradient>

        {/* Belly gradient */}
        <linearGradient id="birdBellyGrad" x1="16" y1="20" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE0B2" />
          <stop offset="100%" stopColor="#FFCC80" />
        </linearGradient>

        {/* Wing gradient */}
        <linearGradient id="birdWingGrad" x1="6" y1="22" x2="22" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d32f2f" />
          <stop offset="100%" stopColor="#7f0000" />
        </linearGradient>

        {/* Beak gradient */}
        <linearGradient id="birdBeakGrad" x1="30" y1="21" x2="44" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
      </defs>

      {/* Head Crest Feathers (Playful feather tuft on top) */}
      <path
        d="M20 7C19 3 14 3 15 8C12 5 8 7 11 11C13 13 17 14 19 13"
        fill="#ff4d4d"
        stroke="#700000"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bird Body / Head (Plump, round, cute silhouette) */}
      <circle cx="23" cy="25" r="17" fill="url(#birdBodyGrad)" />

      {/* Soft Light Breast / Belly */}
      <path
        d="M17 22C17 22 22 20 28 24C34 28 35 36 29 40C24 43 17 41 15 37C13 32 14 26 17 22Z"
        fill="url(#birdBellyGrad)"
        opacity="0.9"
      />

      {/* Little Cute Wing */}
      <path
        d="M10 24C12 21 18 22 20 27C22 32 18 37 13 37C8 37 7 30 10 24Z"
        fill="url(#birdWingGrad)"
        stroke="#ffffff"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />

      {/* Beak (Cute perky orange beak) */}
      <path
        d="M33 21L42 25L33 29C34 26 34 24 33 21Z"
        fill="url(#birdBeakGrad)"
        stroke="#E65100"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* LEFT EYE: THE PLAYFUL WINK (^_~) */}
      {/* Curved wink line with cute eyelashes */}
      <path
        d="M16 19C17.5 16 21.5 16 23 19"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Left wink eyelashes */}
      <path
        d="M15 18L13.5 16.5M24 18L25.5 16.5"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* RIGHT EYE: OPEN, BRIGHT & SPARKLING */}
      {/* Outer eye white */}
      <circle cx="30" cy="18" r="4.5" fill="#ffffff" />
      {/* Dark pupil */}
      <circle cx="31" cy="18" r="2.8" fill="#1A1A1A" />
      {/* Catchlight twinkle (big sparkle) */}
      <circle cx="32" cy="17" r="1.3" fill="#ffffff" />
      {/* Little secondary catchlight */}
      <circle cx="30" cy="19.2" r="0.6" fill="#ffffff" />

      {/* Rosy Pink Cheeks (Blush) */}
      <ellipse cx="18" cy="24" rx="2.5" ry="1.5" fill="#FF8A80" opacity="0.85" />
      <ellipse cx="32" cy="24" rx="2.5" ry="1.5" fill="#FF8A80" opacity="0.85" />

      {/* Sweet smile curve under beak */}
      <path
        d="M32 29C30.5 30.5 28 30.5 26.5 29.5"
        stroke="#700000"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
};
