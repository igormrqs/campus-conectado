import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { colors, radius, spacing } from '@/src/design/tokens';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  iconName?: keyof typeof Feather.glyphMap;
}

export function EmptyState({
  title,
  description,
  actionTitle,
  onAction,
  iconName = 'clipboard',
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name={iconName} size={28} color={colors.ink} />
      </View>

      <ThemedText variant="headline" style={styles.title} align="center">
        {title}
      </ThemedText>

      <ThemedText variant="body" color={colors.muted} style={styles.description} align="center">
        {description}
      </ThemedText>

      {actionTitle && onAction && (
        <View style={styles.actionWrapper}>
          <Button
            title={actionTitle}
            onPress={onAction}
            variant="secondary"
            size="md"
            leftIcon={<Feather name="plus" size={16} color={colors.white} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md,
    borderCurve: 'continuous',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    maxWidth: 280,
    marginBottom: spacing.lg,
  },
  actionWrapper: {
    marginTop: spacing.xs,
  },
});
