import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  FadeIn,
  FadeOut,
  useReducedMotion,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing } from '@/src/design/tokens';
import { easings } from '@/src/design/motion';

export interface ToastProps {
  message: string;
  visible: boolean;
  type?: 'success' | 'info' | 'error';
  onDismiss?: () => void;
  duration?: number;
}

export function Toast({
  message,
  visible,
  type = 'success',
  onDismiss,
  duration = 2400,
}: ToastProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!visible || !onDismiss) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  if (!visible) return null;

  const entering = reducedMotion
    ? FadeIn.duration(150)
    : FadeInDown.duration(280).easing(easings.easeOut);

  const exiting = reducedMotion
    ? FadeOut.duration(120)
    : FadeOutDown.duration(220).easing(easings.easeOut);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <Feather name="alert-circle" size={16} color={colors.coral} />;
      case 'info':
        return <Feather name="info" size={16} color={colors.blue} />;
      case 'success':
      default:
        return <Feather name="check-circle" size={16} color={colors.lime} />;
    }
  };

  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={[
        styles.container,
        { bottom: Math.max(insets.bottom, 16) + 16 },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={styles.iconWrapper}>{getIcon()}</View>
      <ThemedText variant="label" color={colors.white} style={styles.text}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 9999,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
  },
});
