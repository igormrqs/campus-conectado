/** Caderno em Movimento v1 — frozen before parallel work. */
export const colors = {
  paper: '#F7F5EF', ink: '#171A21', blue: '#314BCE', lime: '#DBF57A',
  border: '#DADBD5', coral: '#E6674D', muted: '#62665E', white: '#FFFFFF',
  blueTint: '#E8ECFF', softPaper: '#EFEEE7', transparent: 'transparent',
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const;
export const radius = { sm: 12, md: 20, lg: 28, pill: 9999 } as const;
export const fonts = {
  display: 'BricolageGrotesque_700Bold', displayHeavy: 'BricolageGrotesque_800ExtraBold',
  body: 'InstrumentSans_400Regular', medium: 'InstrumentSans_500Medium', semibold: 'InstrumentSans_600SemiBold',
} as const;
export const typography = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 42, lineHeight: 46 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38 },
  section: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  headline: { fontFamily: fonts.semibold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
} as const;
export const motion = { fast: 180, base: 260, slow: 420, stagger: 70, translate: 12 } as const;
export const layout = { touchTarget: 48, maxWidth: 640, borderWidth: 1 } as const;
export const tokens = { colors, spacing, radius, fonts, typography, motion, layout } as const;
