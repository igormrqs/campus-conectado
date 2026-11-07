import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { ThemedText } from './ThemedText';
import { colors, radius, spacing, typography } from '@/src/design/tokens';
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
        duration: 400,
        easing: easings.easeOut,
      });
    }
  }, [percentage, reducedMotion]);

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`,
    };
  });

  const getStatusMessage = () => {
    if (total === 0) return 'Nenhuma atividade cadastrada ainda.';
    if (percentage === 100) return 'Tudo em dia! Semestre impecável.';
    if (overdueCount > 0) return `${overdueCount} atividade atrasada precisa de atenção.`;
    if (percentage >= 70) return 'Semestre sob controle. Excelente ritmo.';
    if (percentage >= 40) return 'Em ritmo constante. Mantenha o foco.';
    return 'Começando as entregas. Seu semestre tem ritmo.';
  };

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.topRow}>
        <View style={styles.headlineGroup}>
          <ThemedText variant="caption" color="rgba(255, 255, 255, 0.7)" style={styles.eyebrow}>
            RITMO DO SEMESTRE
          </ThemedText>
          <ThemedText variant="headline" color={colors.white} style={styles.ratioText}>
            {completed} de {total} atividades
          </ThemedText>
        </View>

        <View style={styles.percentageBadge}>
          <ThemedText variant="title" color={colors.lime} style={styles.percentageText}>
            {percentage}%
          </ThemedText>
        </View>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fill, animatedFillStyle]} />
      </View>

      <View style={styles.bottomRow}>
        <ThemedText variant="caption" color="rgba(255, 255, 255, 0.85)" style={styles.statusMessage}>
          {getStatusMessage()}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderCurve: 'continuous',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headlineGroup: {
    flex: 1,
    marginRight: spacing.md,
  },
  eyebrow: {
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  ratioText: {
    fontWeight: '600',
  },
  percentageBadge: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percentageText: {
    lineHeight: 34,
  },
  track: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: radius.pill,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.sm + 4,
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
  },
  statusMessage: {
    flex: 1,
  },
});
