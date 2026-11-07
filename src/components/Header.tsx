import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from './ThemedText';
import { colors, spacing, layout, radius } from '@/src/design/tokens';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  dateBlock?: { day: string; month: string; year?: string };
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  eyebrow,
  dateBlock,
  showBack = false,
  onBack,
  rightAction,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Feather name="arrow-left" size={22} color={colors.ink} />
          </Pressable>
        ) : (
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <ThemedText variant="caption" color={colors.ink} style={styles.brandText}>
              CAMPUS CONECTADO
            </ThemedText>
          </View>
        )}

        <View style={styles.rightCluster}>
          {dateBlock && (
            <View style={styles.dateStamp} accessibilityLabel={`Data de hoje: ${dateBlock.day} de ${dateBlock.month}`}>
              <ThemedText variant="caption" color={colors.ink} style={styles.dateStampDay}>
                {dateBlock.day}
              </ThemedText>
              <View style={styles.dateStampDivider} />
              <ThemedText variant="caption" color={colors.muted} style={styles.dateStampMonth}>
                {dateBlock.month.toUpperCase()}
              </ThemedText>
            </View>
          )}
          {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
        </View>
      </View>

      {eyebrow ? (
        <ThemedText variant="caption" color={colors.muted} style={styles.eyebrow}>
          {eyebrow.toUpperCase()}
        </ThemedText>
      ) : null}

      {title ? (
        <ThemedText variant="title" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}

      {subtitle ? (
        <ThemedText variant="body" color={colors.muted} style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget - 8,
    marginBottom: 2,
  },
  backButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  pressed: {
    opacity: 0.6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.blue,
    marginRight: spacing.xs + 2,
  },
  brandText: {
    letterSpacing: 1.4,
    fontWeight: '700',
    fontSize: 12,
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  dateStampDay: {
    fontWeight: '700',
    fontSize: 12,
  },
  dateStampDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  dateStampMonth: {
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  eyebrow: {
    letterSpacing: 1.1,
    fontWeight: '600',
    marginTop: spacing.xs,
    fontSize: 11,
  },
  title: {
    marginTop: 2,
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
  },
  rightAction: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
