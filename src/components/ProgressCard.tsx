import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing } from '@/src/design/tokens';
import { easings } from '@/src/design/motion';

export interface ProgressCardProps {
  total: number;
  completed: number;
  overdueCount?: number;
}

export function ProgressCard({ total, completed, overdueCount = 0 }: ProgressCardProps) {
  const reducedMotion = useReducedMotion();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressWidth = useSharedValue(reducedMotion ? percentage : 0);

  useEffect(() => {
    if (reducedMotion) {
      progressWidth.value = percentage;
    } else {
      progressWidth.value = withTiming(percentage, {
        duration: 350,
        easing: easings.easeOut,
      });
    }
  }, [percentage, reducedMotion]);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const getStatusCaption = () => {
    if (total === 0) return 'Nenhuma atividade cadastrada';
    if (percentage === 100) return 'Tudo em dia • Semestre impecável';
    if (overdueCount > 0) {
      return `${overdueCount} atividade${overdueCount > 1 ? 's' : ''} atrasada${overdueCount > 1 ? 's' : ''}`;
    }
    return 'Ritmo constante no semestre';
  };

  return (
    <View
      style={styles.strip}
      accessibilityRole="summary"
      accessibilityLabel={`Progresso: ${completed} de ${total} atividades, ${percentage}%`}
    >
      {/* Row 1: Brand label on left, percentage badge on right */}
      <View style={styles.topRow}>
        <View style={styles.labelGroup}>
          <View style={styles.dot} />
          <ThemedText variant="caption" color="rgba(255, 255, 255, 0.72)" style={styles.eyebrow}>
            RITMO DO SEMESTRE
          </ThemedText>
        </View>

        <ThemedText variant="headline" color={colors.lime} style={styles.percentageText}>
          {percentage}%
        </ThemedText>
      </View>

      {/* Row 2: Smooth animated progress track */}
      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedFillStyle]} />
      </View>

      {/* Row 3: Status caption on left, count summary on right */}
      <View style={styles.bottomRow}>
        <ThemedText
          variant="caption"
          color="rgba(255, 255, 255, 0.9)"
          numberOfLines={1}
          style={styles.statusMessage}
        >
          {getStatusCaption()}
        </ThemedText>

        <ThemedText
          variant="caption"
          color="rgba(255, 255, 255, 0.75)"
          style={styles.countText}
        >
          {completed} de {total} atividades
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: colors.ink,
    borderRadius: radius.md,
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.md, // 16px internal margin
    marginVertical: spacing.xs + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderCurve: 'continuous',
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
    marginRight: spacing.xs + 2,
  },
  eyebrow: {
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '600',
    fontSize: 11,
  },
  percentageText: {
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 22,
  },
  track: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
    marginVertical: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.lime,
    borderRadius: radius.pill,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  statusMessage: {
    fontSize: 12,
    flex: 1,
    marginRight: spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
