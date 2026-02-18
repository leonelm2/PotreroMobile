import { colors } from './colors';

export const theme = {
  colors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  typography: {
    title: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: 0.8,
    },
    subtitle: {
      fontSize: 24,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
  },
};

export type AppTheme = typeof theme;
