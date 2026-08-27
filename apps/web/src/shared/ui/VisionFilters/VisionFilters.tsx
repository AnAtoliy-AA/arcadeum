export function VisionFilters() {
  return (
    <svg className="sr-only" aria-hidden="true" width="0" height="0">
      <defs>
        <filter
          id="arcadeum-vision-deuteranopia"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"
          />
        </filter>
        <filter
          id="arcadeum-vision-protanopia"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"
          />
        </filter>
        <filter
          id="arcadeum-vision-tritanopia"
          colorInterpolationFilters="sRGB"
        >
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
