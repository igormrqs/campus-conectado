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
      {/* Top brand or navigation row with safe 16px horizontal margins */}
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

        {rightAction ? (
          <View style={styles.rightActionContainer}>{rightAction}</View>
        ) : null}
      </View>

      {/* Editorial date row with badge if dateBlock is provided */}
      {dateBlock || eyebrow ? (
        <View style={styles.metaRow}>
          {dateBlock && (
            <View style={styles.dateBadge} accessibilityLabel={`Hoje, ${dateBlock.day} de ${dateBlock.month}`}>
              <ThemedText variant="caption" color={colors.ink} style={styles.dateBadgeDay}>
                {dateBlock.day}
              </ThemedText>
              <ThemedText variant="caption" color={colors.muted} style={styles.dateBadgeMonth}>
                {dateBlock.month.toUpperCase()}
              </ThemedText>
            </View>
          )}
          {eyebrow && (
            <ThemedText variant="caption" color={colors.muted} style={styles.eyebrow}>
              {eyebrow.toUpperCase()}
            </ThemedText>
          )}
        </View>
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
    paddingHorizontal: spacing.md, // Strict 16px margin from viewport edges
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget - 4,
    marginBottom: spacing.xs,
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
  rightActionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  dateBadgeDay: {
    fontWeight: '700',
    fontSize: 11,
  },
  dateBadgeMonth: {
    fontWeight: '600',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  eyebrow: {
    letterSpacing: 1.1,
    fontWeight: '600',
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
});
