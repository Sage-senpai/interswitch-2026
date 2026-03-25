// ─── Purse Theme System ──────────────────────────────────────
// Dark:  Lavender + Black
// Light: Pink + White

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  warning: string;
  warningLight: string;
  text: string;
  textSecondary: string;
  textLight: string;
  textInverse: string;
  border: string;
  borderLight: string;
  interswitch: string;
  walletBg: string;
  walletText: string;
  walletTextMuted: string;
  tabBar: string;
  tabBarBorder: string;
  statusBar: 'light' | 'dark';
  headerBg: string;
  headerText: string;
  shadow: string;
}

// ─── Dark Theme: Lavender + Black ────────────────────────────
export const darkTheme: ThemeColors = {
  background: '#0A0A0F',
  surface: '#161622',
  surfaceSecondary: '#1E1E2F',
  primary: '#B39DDB',
  primaryLight: '#CE93D8',
  primaryDark: '#7E57C2',
  accent: '#E1BEE7',
  accentLight: 'rgba(179,157,219,0.15)',
  success: '#81C784',
  successLight: 'rgba(129,199,132,0.15)',
  danger: '#EF5350',
  dangerLight: 'rgba(239,83,80,0.15)',
  warning: '#FFB74D',
  warningLight: 'rgba(255,183,77,0.15)',
  text: '#EDE7F6',
  textSecondary: '#9FA8DA',
  textLight: '#7986CB',
  textInverse: '#0A0A0F',
  border: '#2A2A3E',
  borderLight: '#1E1E2F',
  interswitch: '#7C8CF8',
  walletBg: '#7E57C2',
  walletText: '#FFFFFF',
  walletTextMuted: 'rgba(255,255,255,0.7)',
  tabBar: '#111118',
  tabBarBorder: '#2A2A3E',
  statusBar: 'light',
  headerBg: '#111118',
  headerText: '#EDE7F6',
  shadow: 'rgba(0,0,0,0.4)',
};

// ─── Light Theme: Pink + White ───────────────────────────────
export const lightTheme: ThemeColors = {
  background: '#FFF8FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#FDF2F8',
  primary: '#EC407A',
  primaryLight: '#F48FB1',
  primaryDark: '#C2185B',
  accent: '#F06292',
  accentLight: 'rgba(236,64,122,0.08)',
  success: '#66BB6A',
  successLight: 'rgba(102,187,106,0.1)',
  danger: '#EF5350',
  dangerLight: 'rgba(239,83,80,0.08)',
  warning: '#FFA726',
  warningLight: 'rgba(255,167,38,0.1)',
  text: '#1A1A2E',
  textSecondary: '#78717C',
  textLight: '#A1979B',
  textInverse: '#FFFFFF',
  border: '#F3E5F5',
  borderLight: '#FDF2F8',
  interswitch: '#0066FF',
  walletBg: '#C2185B',
  walletText: '#FFFFFF',
  walletTextMuted: 'rgba(255,255,255,0.75)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#F3E5F5',
  statusBar: 'dark',
  headerBg: '#FFFFFF',
  headerText: '#1A1A2E',
  shadow: 'rgba(0,0,0,0.06)',
};

// ─── Shared Constants ────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

export const BorderRadius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

// Backward compat — default export as light theme colors
// Components should use useTheme() hook instead
export const Colors = lightTheme;
