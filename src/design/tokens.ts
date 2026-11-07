/** Agenda em Movimento V2 — shared token exports aligned before parallel work. */
export const colors = {
  paper: '#F7F5EF', ink: '#171A21', blue: '#314BCE', lime: '#DBF57A',
  border: '#DADBD5', coral: '#E6674D', muted: '#62665E', white: '#FFFFFF',
  blueTint: '#E8ECFF', softPaper: '#EFEEE7', transparent: 'transparent',
  error: '#9B321F', errorTint: '#FCEAE5', onInkMuted: '#BCC1BB', limeTint: '#EDF5D1',
} as const;
export const spacing = { xs: 4, sm: 8, smd: 12, md: 16, mdl: 20, lg: 24, xl: 32, xxl: 48, xxxl: 64 } as const;
export const radius = { sm: 12, md: 20, lg: 28, pill: 9999 } as const;
export const fonts = {
  display: 'BricolageGrotesque_700Bold', displayHeavy: 'BricolageGrotesque_800ExtraBold',
  body: 'InstrumentSans_400Regular', medium: 'InstrumentSans_500Medium', semibold: 'InstrumentSans_600SemiBold',
} as const;
export const typography = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 34, lineHeight: 38 },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36 },
  section: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 },
} as const;
export const motion = { fast: 160, base: 260, slow: 320, stagger: 45, translate: 10 } as const;
export const layout = { touchTarget: 48, maxWidth: 640, borderWidth: 1 } as const;
export const tokens = { colors, spacing, radius, fonts, typography, motion, layout } as const;
