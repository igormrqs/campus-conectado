import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
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
import { ThemedText } from './ThemedText';
import { Task } from '@/src/features/tasks';
import { colors, radius, spacing, layout, fonts, motion } from '@/src/design/tokens';
import { isOverdue, formatFriendlyDate, getDateBlock } from '@/src/design/date-utils';
import { showAlert, triggerHaptic } from '@/src/design/platform-utils';

export interface TaskCardProps {
  task: Task;
  index?: number;
  variant?: 'default' | 'focus' | 'compact';
  onToggle: (id: string) => void | Promise<void>;
  onPress: (task: Task) => void;
  onDelete?: (id: string) => void | Promise<void>;
}

export function TaskCard({
  task,
  index = 0,
  variant = 'default',
  onToggle,
  onPress,
}: TaskCardProps) {
  const reducedMotion = useReducedMotion();
  const overdue = isOverdue(task.dueAt, task.completed);
  const friendlyDate = formatFriendlyDate(task.dueAt, task.completed);
  const dateBlock = useMemo(() => getDateBlock(task.dueAt), [task.dueAt]);

  // Checkbox microanimation scale: 1 -> 0.92 -> 1.08 -> 1
  const checkScale = useSharedValue(1);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleToggle = async () => {
    await triggerHaptic('light');

    if (!reducedMotion) {
      checkScale.value = withSequence(
        withSpring(0.92, { duration: 100, dampingRatio: 0.7 }),
        withSpring(1.08, { duration: 150, dampingRatio: 0.6 }),
        withSpring(1, { duration: 150, dampingRatio: 0.8 })
      );
    }

    try {
      await onToggle(task.id);
    } catch (err: any) {
      showAlert('Erro ao atualizar', err?.message || 'Falha ao sincronizar alteração.');
    }
  };

  const enteringAnimation = useMemo(() => {
    if (reducedMotion) {
      return FadeIn.duration(150);
    }
    const delay = Math.min(index * motion.stagger, 300);
    return FadeInDown.duration(motion.base).delay(delay);
  }, [index, reducedMotion]);

  return (
    <Animated.View entering={enteringAnimation} style={styles.wrapper}>
      {/* Agenda line container with fine bottom divider */}
      <View
        style={[
          styles.rowContainer,
          overdue && styles.rowOverdue,
          task.completed && styles.rowCompleted,
        ]}
      >
        {/* Fixed-width Typographic Date Block on Left */}
        <View style={[styles.dateBlock, overdue && styles.dateBlockOverdue]}>
          <ThemedText
            variant="headline"
            color={overdue ? colors.error : colors.ink}
            style={[styles.dateDay, task.completed && styles.dateCompleted]}
          >
            {dateBlock.day}
          </ThemedText>
          <ThemedText
            variant="caption"
            color={overdue ? colors.error : colors.muted}
            style={styles.dateMonth}
          >
            {dateBlock.month.toUpperCase()}
          </ThemedText>
          {overdue && (
            <View style={styles.overdueDot} />
          )}
        </View>

        {/* Divider hairline between date and content */}
        <View style={[styles.dateDivider, overdue && styles.dateDividerOverdue]} />

        {/* Checkbox with >=48dp touch target */}
        <Pressable
          onPress={handleToggle}
          hitSlop={4}
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
            {task.completed && <Feather name="check" size={14} color={colors.white} />}
          </Animated.View>
        </Pressable>

        {/* Text content column: touchable to edit */}
        <Pressable
          onPress={() => onPress(task)}
          accessibilityRole="button"
          accessibilityLabel={`Editar atividade ${task.title}`}
          accessibilityHint="Toque para editar"
          style={({ pressed }) => [
            styles.contentColumn,
            pressed && styles.contentPressed,
          ]}
        >
          <View style={styles.headerInfo}>
            {/* Micro-label: Discipline */}
            <View style={[styles.disciplineBadge, overdue && styles.disciplineBadgeOverdue]}>
              <Feather
                name="book-open"
                size={10}
                color={overdue ? colors.error : colors.blue}
                style={styles.disciplineIcon}
              />
              <ThemedText
                variant="caption"
                color={overdue ? colors.error : colors.blue}
                numberOfLines={1}
                style={styles.disciplineText}
              >
                {task.discipline}
              </ThemedText>
            </View>

            {/* Micro deadline label on the right */}
            <View style={[styles.deadlinePill, overdue && styles.deadlinePillOverdue]}>
              <Feather
                name={overdue ? 'alert-circle' : 'calendar'}
                size={11}
                color={overdue ? colors.coral : colors.muted}
                style={styles.deadlineIcon}
              />
              <ThemedText
                variant="caption"
                color={overdue ? colors.error : colors.muted}
                style={[styles.deadlineText, overdue && styles.deadlineTextOverdue]}
              >
                {friendlyDate}
              </ThemedText>
            </View>
          </View>

          {/* Title dominant */}
          <ThemedText
            variant="headline"
            color={task.completed ? colors.muted : colors.ink}
            style={[styles.title, task.completed && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </ThemedText>

          {/* Description: max 1 line */}
          {task.description ? (
            <ThemedText
              variant="body"
              color={colors.muted}
              numberOfLines={1}
              style={styles.description}
            >
              {task.description}
            </ThemedText>
          ) : null}
        </Pressable>

        {/* Clear edit affordance (chevron / pencil button) */}
        <Pressable
          onPress={() => onPress(task)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Editar atividade ${task.title}`}
          style={({ pressed }) => [styles.editAction, pressed && styles.editActionPressed]}
        >
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.smd,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
    minHeight: 104,
  },
  rowOverdue: {
    backgroundColor: '#FFFDFD',
    borderLeftWidth: 3,
    borderLeftColor: colors.coral,
  },
  rowCompleted: {
    backgroundColor: colors.softPaper,
  },
  dateBlock: {
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  dateBlockOverdue: {},
  dateDay: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  dateMonth: {
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  dateCompleted: {
    color: colors.muted,
  },
  overdueDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.coral,
    marginTop: 2,
  },
  dateDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  dateDividerOverdue: {
    backgroundColor: 'rgba(230, 103, 77, 0.3)',
  },
  checkTouchArea: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
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
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  contentPressed: {
    opacity: 0.7,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    flexWrap: 'wrap',
    gap: 4,
  },
  disciplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueTint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    maxWidth: '58%',
  },
  disciplineBadgeOverdue: {
    backgroundColor: colors.errorTint,
  },
  disciplineIcon: {
    marginRight: 4,
  },
  disciplineText: {
    fontWeight: '600',
    fontSize: 10,
  },
  deadlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deadlinePillOverdue: {},
  deadlineIcon: {
    marginRight: 1,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deadlineTextOverdue: {
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  editAction: {
    minWidth: 44,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionPressed: {
    opacity: 0.5,
  },
});
