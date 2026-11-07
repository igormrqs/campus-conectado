import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing, layout } from '@/src/design/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'lime';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const isInteractive = !disabled && !loading;

  const getVariantStyles = (): { container: ViewStyle; textColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: colors.blue,
            borderColor: colors.blue,
          },
          textColor: colors.white,
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: colors.ink,
            borderColor: colors.ink,
          },
          textColor: colors.white,
        };
      case 'lime':
        return {
          container: {
            backgroundColor: colors.lime,
            borderColor: colors.lime,
          },
          textColor: colors.ink,
        };
      case 'destructive':
        return {
          container: {
            backgroundColor: colors.error,
            borderColor: colors.error,
          },
          textColor: colors.white,
        };
      case 'outline':
        return {
          container: {
            backgroundColor: colors.transparent,
            borderColor: colors.border,
            borderWidth: 1.5,
          },
          textColor: colors.ink,
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: colors.transparent,
            borderColor: colors.transparent,
          },
          textColor: colors.ink,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; textVariant: 'label' | 'headline' | 'caption' } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            minHeight: layout.touchTarget,
            paddingVertical: spacing.xs + 2,
            paddingHorizontal: spacing.md,
            borderRadius: radius.sm,
          },
          textVariant: 'caption',
        };
      case 'lg':
        return {
          container: {
            minHeight: 54,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            borderRadius: radius.md,
          },
          textVariant: 'headline',
        };
      case 'md':
      default:
        return {
          container: {
            minHeight: layout.touchTarget,
            paddingVertical: spacing.sm + 4,
            paddingHorizontal: spacing.lg,
            borderRadius: radius.md,
          },
          textVariant: 'label',
        };
    }
  };

  const { container: variantContainer, textColor } = getVariantStyles();
  const { container: sizeContainer, textVariant } = getSizeStyles();

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variantContainer,
        sizeContainer,
        fullWidth && styles.fullWidth,
        pressed && isInteractive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <ThemedText variant={textVariant} color={textColor} style={styles.buttonText}>
            {title}
          </ThemedText>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderCurve: 'continuous',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  buttonText: {
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.45,
  },
});
