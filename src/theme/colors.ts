/**
 * Yogi Samaj Sambandh Theme - Brand Colors
 * Premium Gujarati Matrimony App Design System
 */

export const colors = {
  // Primary Brand Colors
  mint: '#9FD7C1',
  deepBlue: '#0B4F6C',
  white: '#FFFFFF',
  royalGold: '#D4AF37',
  
  // Semantic Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFB',
    gradient: {
      start: '#0B4F6C',
      end: '#1A8FA3',
    }
  },
  
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    gold: '#D4AF37',
  },
  
  card: {
    background: '#FFFFFF',
    border: '#E5E7EB',
    shadow: 'rgba(159, 215, 193, 0.15)',
  },
  
  button: {
    primary: '#9FD7C1',
    primaryHover: '#8BC5AF',
    secondary: '#0B4F6C',
    secondaryHover: '#094360',
    gold: '#D4AF37',
    goldHover: '#C29F30',
  },
  
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  accent: {
    mint: '#9FD7C1',
    mintLight: '#C8EBE0',
    gold: '#D4AF37',
    goldLight: '#E8D088',
  }
} as const;

export type ColorKey = keyof typeof colors;
