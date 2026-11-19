/**
 * Modern Smart Home Design System & Theme Tokens
 * Thiết kế chuẩn UI Smart Home hiện đại (Clean UI, Soft Shadows, Rounded Corners)
 * Tương đồng với giao diện mẫu của người dùng.
 */

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceVariant: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryGradient: [string, string];
  accent: string;
  accentLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  infoLight: string;
  
  // Specific device colors
  lampGold: string;
  lampGoldLight: string;
  pumpTeal: string;
  pumpTealLight: string;
  doorPurple: string;
  doorPurpleLight: string;

  // Elevation & Effects
  shadowColor: string;
  cardElevation: number;
}

export const LightTheme: ThemeColors = {
  background: '#F6F8FC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceVariant: '#E2E8F0',
  border: '#EEF2F6',
  borderLight: '#F8FAFC',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',         // Royal Modern Blue
  primaryLight: '#EFF6FF',
  primaryGradient: ['#3B82F6', '#1D4ED8'],
  accent: '#6366F1',
  accentLight: '#EEF2FF',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
  info: '#0284C7',
  infoLight: '#F0F9FF',

  lampGold: '#F59E0B',
  lampGoldLight: '#FEF3C7',
  pumpTeal: '#0D9488',
  pumpTealLight: '#CCFBF1',
  doorPurple: '#7C3AED',
  doorPurpleLight: '#EDE9FE',

  shadowColor: '#64748B',
  cardElevation: 3,
};

export const DarkTheme: ThemeColors = {
  background: '#0B0F19',
  surface: '#151D30',
  surfaceSubtle: '#1E293B',
  surfaceVariant: '#2A374D',
  border: '#1E293B',
  borderLight: '#151D30',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#38BDF8',
  primaryLight: 'rgba(56, 189, 248, 0.15)',
  primaryGradient: ['#38BDF8', '#0284C7'],
  accent: '#818CF8',
  accentLight: 'rgba(129, 140, 248, 0.15)',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  infoLight: 'rgba(56, 189, 248, 0.15)',

  lampGold: '#FBBF24',
  lampGoldLight: 'rgba(251, 191, 36, 0.15)',
  pumpTeal: '#2DD4BF',
  pumpTealLight: 'rgba(45, 212, 191, 0.15)',
  doorPurple: '#A78BFA',
  doorPurpleLight: 'rgba(167, 139, 250, 0.15)',

  shadowColor: '#000000',
  cardElevation: 4,
};

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};
