export const EXPERIENCE_CONFIG = {
  scroll: {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth exponential
    smoothTouch: false,
  },

  motion: {
    revealDuration: 0.9,
    stagger: 0.08,
    parallaxStrength: 0.15,
    velocitySkew: 0.02,
  },

  webgl: {
    desktopNodeCount: 120,
    tabletNodeCount: 70,
    mobileNodeCount: 35,
    pixelRatio: 1.5,
    driftSpeed: 0.15,
    connectionDistance: 3.2,
    connectionOpacity: 0.18,
  },

  theme: {
    light: {
      grainIntensity: 0.025,
      fieldOpacity: 0.45,
      fieldBrightness: 0.2,
      pointColor: "#263B67", // Midnight indigo
      lineColor: "#686C7A",  // Muted slate
      bgColor: "#FBF9F5",    // Warm alabaster
    },
    dark: {
      grainIntensity: 0.045,
      fieldOpacity: 0.75,
      fieldBrightness: 0.85,
      pointColor: "#7893D0", // Soft indigo
      lineColor: "#8C91A3",  // Cool silver / subtle line
      bgColor: "#121214",    // Deep obsidian
    },
  },

  timeline: {
    scrubDistance: 1.5,
  },
} as const;
