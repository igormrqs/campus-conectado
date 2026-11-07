import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  FadeInDown,
  FadeIn,
  useReducedMotion,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { Task } from '@/src/features/tasks';
import { colors, radius, spacing, layout, motion } from '@/src/design/tokens';
import { isOverdue, formatFriendlyDate } from '@/src/design/date-utils';

export interface TaskCardProps {
  task: Task;
  index?: number;
  onToggle: (id: string) => void | Promise<void>;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function TaskCard({
  task,
  index = 0,
  onToggle,
  onPress,
  onDelete,
}: TaskCardProps) {
  const reducedMotion = useReducedMotion();
  const overdue = isOverdue(task.dueAt, task.completed);
  const friendlyDate = formatFriendlyDate(task.dueAt, task.completed);

  // Checkbox microanimation scale: 1 -> 0.92 -> 1.08 -> 1
  const checkScale = useSharedValue(1);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics safe fallback
    }

    if (!reducedMotion) {
      checkScale.value = withSequence(
        withSpring(0.92, { duration: 100, dampingRatio: 0.7 }),
        withSpring(1.08, { duration: 150, dampingRatio: 0.6 }),
        withSpring(1, { duration: 150, dampingRatio: 0.8 })
      );
    }

    await onToggle(task.id);
  };

  const handleDeletePrompt = () => {
    Alert.alert(
      'Excluir atividade',
      `Tem certeza que deseja excluir "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch {
              // safe fallback
            }
            await onDelete(task.id);
          },
        },
      ]
    );
  };

  const enteringAnimation = useMemo(() => {
    if (reducedMotion) {
      return FadeIn.duration(150);
    }
    const delay = Math.min(index * motion.stagger, 350);
    return FadeInDown.duration(motion.base).delay(delay);
  }, [index, reducedMotion]);

  return (
    <Animated.View entering={enteringAnimation} style={styles.wrapper}>
      <Pressable
        onPress={() => onPress(task)}
        accessibilityRole="button"
        accessibilityLabel={`Atividade: ${task.title}, disciplina ${task.discipline}, prazo ${friendlyDate}`}
        accessibilityHint="Toque para editar"
        style={({ pressed }) => [
          styles.card,
          overdue && styles.cardOverdue,
          task.completed && styles.cardCompleted,
          pressed && styles.cardPressed,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.disciplineBadge, overdue && styles.disciplineBadgeOverdue]}>
            <Feather
              name="book-open"
              size={12}
              color={overdue ? colors.coral : colors.blue}
              style={styles.disciplineIcon}
            />
            <ThemedText
              variant="caption"
              color={overdue ? colors.coral : colors.blue}
              numberOfLines={1}
              style={styles.disciplineText}
            >
              {task.discipline}
            </ThemedText>
          </View>

          <View style={styles.headerRightActions}>
            <Pressable
              onPress={handleDeletePrompt}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`Excluir ${task.title}`}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
            >
              <Feather name="trash-2" size={16} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <Pressable
            onPress={handleToggle}
            hitSlop={12}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            accessibilityLabel={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
            style={styles.checkTouchArea}
          >
            <Animated.View
              style={[
                styles.checkbox,
                task.completed && styles.checkboxCompleted,
                overdue && !task.completed && styles.checkboxOverdue,
                animatedCheckStyle,
              ]}
            >
              {task.completed && <Feather name="check" size={15} color={colors.white} />}
            </Animated.View>
          </Pressable>

          <View style={styles.contentColumn}>
            <ThemedText
              variant="headline"
              color={task.completed ? colors.muted : colors.ink}
              style={[styles.title, task.completed && styles.titleCompleted]}
              numberOfLines={2}
            >
              {task.title}
            </ThemedText>

            {task.description ? (
              <ThemedText
                variant="body"
                color={colors.muted}
                numberOfLines={2}
                style={styles.description}
              >
                {task.description}
              </ThemedText>
            ) : null}

            <View style={styles.metaRow}>
              <View style={[styles.dateChip, overdue && styles.dateChipOverdue]}>
                <Feather
                  name={overdue ? 'alert-circle' : 'calendar'}
                  size={13}
                  color={overdue ? colors.coral : colors.muted}
                  style={styles.dateIcon}
                />
                <ThemedText
                  variant="caption"
                  color={overdue ? colors.coral : colors.muted}
                  style={[styles.dateText, overdue && styles.dateTextOverdue]}
                >
                  {friendlyDate}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs + 2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderCurve: 'continuous',
  },
  cardOverdue: {
    borderColor: 'rgba(230, 103, 77, 0.45)',
    backgroundColor: '#FFFDFD',
  },
  cardCompleted: {
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    opacity: 0.85,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  disciplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueTint,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs - 1,
    borderRadius: radius.sm,
    maxWidth: '75%',
  },
  disciplineBadgeOverdue: {
    backgroundColor: 'rgba(230, 103, 77, 0.12)',
  },
  disciplineIcon: {
    marginRight: spacing.xs,
  },
  disciplineText: {
    fontWeight: '600',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    opacity: 0.5,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkTouchArea: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.xs,
    marginRight: spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  checkboxOverdue: {
    borderColor: colors.coral,
  },
  contentColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softPaper,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dateChipOverdue: {
    backgroundColor: 'rgba(230, 103, 77, 0.12)',
  },
  dateIcon: {
    marginRight: spacing.xs,
  },
  dateText: {
    fontSize: 12,
  },
  dateTextOverdue: {
    fontWeight: '600',
  },
});
