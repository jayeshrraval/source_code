/**
 * Typography System with Gujarati Support
 * Using Noto Sans Gujarati for native language content
 */

export const typography = {
  fonts: {
    gujarati: "'Noto Sans Gujarati', sans-serif",
    english: "'Inter', 'system-ui', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },
  
  sizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
  }
} as const;

export type TypographySize = keyof typeof typography.sizes;
