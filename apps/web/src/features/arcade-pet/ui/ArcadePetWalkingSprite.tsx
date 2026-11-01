import React from 'react';
import type { PetSpecies } from '@arcadeum/games-core';
import styles from './arcade-pet-companion.module.scss';

interface ArcadePetWalkingSpriteProps {
  species: PetSpecies;
  state: 'walking' | 'idle' | 'happy' | 'sleeping';
  className?: string;
}

export function ArcadePetWalkingSprite({
  species,
  state,
  className = '',
}: ArcadePetWalkingSpriteProps) {
  const isWalking = state === 'walking';
  const isHappy = state === 'happy';
  const isSleeping = state === 'sleeping';

  const animationClass = isHappy
    ? styles.petBounceAnimation
    : isWalking
      ? styles.petWalkAnimation
      : isSleeping
        ? styles.petSleepAnimation
        : styles.petSmileAnimation;

  if (species === 'cyber_cat') {
    return (
      <div className={`${animationClass} ${className} w-14 h-14`}>
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-lg"
          aria-hidden="true"
        >
          <g className={styles.tailWag}>
            <path d="M 16 46 Q 8 36 12 28 Q 16 32 18 42 Z" fill="#ec4899" />
            <circle cx="12" cy="28" r="2.5" fill="#f472b6" />
          </g>

          <g className={isWalking ? styles.pawStepLeft : ''}>
            <ellipse cx="26" cy="56" rx="5" ry="3.5" fill="#be185d" />
          </g>
          <g className={isWalking ? styles.pawStepRight : ''}>
            <ellipse cx="40" cy="56" rx="5" ry="3.5" fill="#be185d" />
          </g>

          <rect x="20" y="24" width="26" height="30" rx="13" fill="#f43f5e" />
          <ellipse cx="33" cy="40" rx="8" ry="11" fill="#fecdd3" />

          <polygon points="21,26 25,12 32,24" fill="#be185d" />
          <polygon points="24,24 26,16 30,24" fill="#fda4af" />
          <polygon points="45,26 41,12 34,24" fill="#be185d" />
          <polygon points="42,24 40,16 36,24" fill="#fda4af" />

          {isSleeping ? (
            <>
              <path
                d="M 26 31 Q 29 33 32 31"
                stroke="#881337"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 36 31 Q 39 33 42 31"
                stroke="#881337"
                strokeWidth="2"
                fill="none"
              />
            </>
          ) : isHappy ? (
            <>
              <path
                d="M 26 33 Q 29 29 32 33"
                stroke="#881337"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 36 33 Q 39 29 42 33"
                stroke="#881337"
                strokeWidth="2.5"
                fill="none"
              />
            </>
          ) : (
            <>
              <circle cx="28" cy="30" r="2.8" fill="#881337" />
              <circle cx="27" cy="29" r="1" fill="#ffffff" />
              <circle cx="38" cy="30" r="2.8" fill="#881337" />
              <circle cx="37" cy="29" r="1" fill="#ffffff" />
            </>
          )}

          <polygon points="32,35 34,35 33,37" fill="#be185d" />
          <path
            d="M 31 38 Q 33 41 35 38"
            stroke="#881337"
            strokeWidth="1.5"
            fill="none"
          />

          <line
            x1="16"
            y1="33"
            x2="23"
            y2="34"
            stroke="#fda4af"
            strokeWidth="1.2"
          />
          <line
            x1="15"
            y1="37"
            x2="23"
            y2="36"
            stroke="#fda4af"
            strokeWidth="1.2"
          />
          <line
            x1="50"
            y1="33"
            x2="43"
            y2="34"
            stroke="#fda4af"
            strokeWidth="1.2"
          />
          <line
            x1="51"
            y1="37"
            x2="43"
            y2="36"
            stroke="#fda4af"
            strokeWidth="1.2"
          />

          <circle cx="23" cy="35" r="2" fill="#fda4af" opacity="0.6" />
          <circle cx="43" cy="35" r="2" fill="#fda4af" opacity="0.6" />
        </svg>
      </div>
    );
  }

  if (species === 'dragon') {
    return (
      <div className={`${animationClass} ${className} w-14 h-14`}>
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-lg"
          aria-hidden="true"
        >
          <g className={styles.tailWag}>
            <path d="M 18 44 Q 10 40 8 32 Q 13 36 17 40 Z" fill="#4f46e5" />
            <polygon points="8,32 5,28 11,29" fill="#fbbf24" />
          </g>

          <g className={styles.wingFlap}>
            <path
              d="M 38 24 Q 48 12 56 18 Q 48 26 40 28 Z"
              fill="#818cf8"
              opacity="0.9"
            />
            <path d="M 40 24 L 50 18" stroke="#312e81" strokeWidth="1" />
          </g>

          <g className={isWalking ? styles.pawStepLeft : ''}>
            <ellipse cx="26" cy="56" rx="5" ry="3.5" fill="#312e81" />
          </g>
          <g className={isWalking ? styles.pawStepRight : ''}>
            <ellipse cx="40" cy="56" rx="5" ry="3.5" fill="#312e81" />
          </g>

          <rect x="20" y="22" width="28" height="32" rx="14" fill="#6366f1" />
          <ellipse cx="32" cy="40" rx="8" ry="11" fill="#c7d2fe" />

          <polygon points="26,20 23,10 30,16" fill="#fbbf24" />
          <polygon points="38,20 41,10 34,16" fill="#fbbf24" />

          {isSleeping ? (
            <>
              <path
                d="M 25 31 Q 28 33 31 31"
                stroke="#1e1b4b"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 35 31 Q 38 33 41 31"
                stroke="#1e1b4b"
                strokeWidth="2"
                fill="none"
              />
            </>
          ) : isHappy ? (
            <>
              <path
                d="M 25 33 Q 28 29 31 33"
                stroke="#1e1b4b"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 35 33 Q 38 29 41 33"
                stroke="#1e1b4b"
                strokeWidth="2.5"
                fill="none"
              />
            </>
          ) : (
            <>
              <circle cx="28" cy="30" r="3" fill="#1e1b4b" />
              <circle cx="27" cy="29" r="1.2" fill="#ffffff" />
              <circle cx="38" cy="30" r="3" fill="#1e1b4b" />
              <circle cx="37" cy="29" r="1.2" fill="#ffffff" />
            </>
          )}

          <ellipse cx="30" cy="36" rx="1.5" ry="1.2" fill="#1e1b4b" />
          <ellipse cx="36" cy="36" rx="1.5" ry="1.2" fill="#1e1b4b" />
          <path
            d="M 30 40 Q 33 43 36 40"
            stroke="#1e1b4b"
            strokeWidth="1.8"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  if (species === 'dino') {
    return (
      <div className={`${animationClass} ${className} w-14 h-14`}>
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full drop-shadow-lg"
          aria-hidden="true"
        >
          <g className={styles.tailWag}>
            <path d="M 16 46 Q 8 46 6 38 Q 12 42 18 44 Z" fill="#10b981" />
            <polygon points="12,42 9,36 15,39" fill="#f59e0b" />
          </g>

          <g className={isWalking ? styles.pawStepLeft : ''}>
            <ellipse cx="25" cy="56" rx="5.5" ry="3.5" fill="#047857" />
          </g>
          <g className={isWalking ? styles.pawStepRight : ''}>
            <ellipse cx="41" cy="56" rx="5.5" ry="3.5" fill="#047857" />
          </g>

          <rect x="18" y="22" width="28" height="32" rx="13" fill="#34d399" />
          <ellipse cx="30" cy="39" rx="8" ry="11" fill="#d1fae5" />

          <polygon points="26,18 29,11 32,18" fill="#f59e0b" />
          <polygon points="33,18 36,12 39,18" fill="#f59e0b" />

          {isSleeping ? (
            <>
              <path
                d="M 26 29 Q 29 31 32 29"
                stroke="#064e3b"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M 36 29 Q 39 31 42 29"
                stroke="#064e3b"
                strokeWidth="2"
                fill="none"
              />
            </>
          ) : isHappy ? (
            <>
              <path
                d="M 26 31 Q 29 27 32 31"
                stroke="#064e3b"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 36 31 Q 39 27 42 31"
                stroke="#064e3b"
                strokeWidth="2.5"
                fill="none"
              />
            </>
          ) : (
            <>
              <circle cx="29" cy="28" r="3" fill="#064e3b" />
              <circle cx="28" cy="27" r="1.2" fill="#ffffff" />
              <circle cx="39" cy="28" r="3" fill="#064e3b" />
              <circle cx="38" cy="27" r="1.2" fill="#ffffff" />
            </>
          )}

          <path
            d="M 30 36 Q 34 39 38 36"
            stroke="#064e3b"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="23" cy="33" r="2.2" fill="#a7f3d0" />
          <circle cx="43" cy="33" r="2.2" fill="#a7f3d0" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${animationClass} ${className} w-14 h-14`}>
      <svg
        viewBox="0 0 64 64"
        className="w-full h-full drop-shadow-lg"
        aria-hidden="true"
      >
        <g className={isWalking ? styles.pawStepLeft : ''}>
          <ellipse cx="25" cy="56" rx="5" ry="3" fill="#0284c7" />
        </g>
        <g className={isWalking ? styles.pawStepRight : ''}>
          <ellipse cx="39" cy="56" rx="5" ry="3" fill="#0284c7" />
        </g>

        <path
          d="M 18 42 C 16 26 24 16 32 16 C 40 16 48 26 46 42 C 45 52 19 52 18 42 Z"
          fill="#38bdf8"
        />
        <ellipse cx="26" cy="22" rx="4" ry="2" fill="#7dd3fc" opacity="0.8" />

        {isSleeping ? (
          <>
            <path
              d="M 25 32 Q 28 34 31 32"
              stroke="#075985"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 33 32 Q 36 34 39 32"
              stroke="#075985"
              strokeWidth="2"
              fill="none"
            />
          </>
        ) : isHappy ? (
          <>
            <path
              d="M 25 34 Q 28 30 31 34"
              stroke="#075985"
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M 33 34 Q 36 30 39 34"
              stroke="#075985"
              strokeWidth="2.5"
              fill="none"
            />
          </>
        ) : (
          <>
            <circle cx="28" cy="32" r="2.8" fill="#075985" />
            <circle cx="27" cy="31" r="1.1" fill="#ffffff" />
            <circle cx="36" cy="32" r="2.8" fill="#075985" />
            <circle cx="35" cy="31" r="1.1" fill="#ffffff" />
          </>
        )}

        <path
          d="M 29 38 Q 32 41 35 38"
          stroke="#075985"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="23" cy="37" r="2" fill="#bae6fd" />
        <circle cx="41" cy="37" r="2" fill="#bae6fd" />
      </svg>
    </div>
  );
}
