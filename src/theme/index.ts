/**
 * Theme System Entry Point
 * Yogi Samaj Sambandh Design System
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';

export const shadows = {
  mint: '0 4px 12px rgba(159, 215, 193, 0.15)',
  gold: '0 4px 12px rgba(212, 175, 55, 0.15)',
  card: '0 2px 8px rgba(0, 0, 0, 0.06)',
  elevated: '0 8px 24px rgba(0, 0, 0, 0.12)',
} as const;

export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  }
} as const;
