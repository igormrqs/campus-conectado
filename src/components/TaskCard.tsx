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
import { colors, radius, spacing, layout, motion } from '@/src/design/tokens';
import { isOverdue, formatFriendlyDate } from '@/src/design/date-utils';
import { confirmAction, showAlert, triggerHaptic } from '@/src/design/platform-utils';

export interface TaskCardProps {
  task: Task;
  index?: number;
  variant?: 'default' | 'focus' | 'compact';
  onToggle: (id: string) => void | Promise<void>;
  onPress: (task: Task) => void;
  onDelete: (id: string) => void | Promise<void>;
}

export function TaskCard({
  task,
  index = 0,
  variant = 'default',
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

  const handleDeletePrompt = () => {
    confirmAction(
      'Excluir atividade',
      `Tem certeza que deseja excluir "${task.title}"?`,
      async () => {
        await triggerHaptic('warning');
        try {
          await onDelete(task.id);
        } catch (err: any) {
          showAlert('Erro ao excluir', err?.message || 'Falha ao remover a atividade.');
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const enteringAnimation = useMemo(() => {
    if (reducedMotion) {
      return FadeIn.duration(150);
    }
    const delay = Math.min(index * motion.stagger, 320);
    return FadeInDown.duration(motion.base).delay(delay);
  }, [index, reducedMotion]);

  return (
    <Animated.View entering={enteringAnimation} style={styles.wrapper}>
      {/* Container maintains full opacity even when completed for WCAG AA contrast compliance */}
      <View
        style={[
          styles.card,
          variant === 'focus' && styles.cardFocus,
          overdue && styles.cardOverdue,
          task.completed && styles.cardCompleted,
        ]}
      >
        <View style={styles.cardHeader}>
          {/* Micro-label: Discipline badge */}
          <View style={[styles.disciplineBadge, overdue && styles.disciplineBadgeOverdue]}>
            <Feather
              name="book-open"
              size={11}
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

          {/* Delete button: subtle secondary action, not visually dominant */}
          <Pressable
            onPress={handleDeletePrompt}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={`Excluir ${task.title}`}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
          >
            <Feather name="trash-2" size={14} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.bodyRow}>
          {/* Checkbox: independent sibling pressable with >=48dp touch target */}
          <Pressable
            onPress={handleToggle}
            hitSlop={8}
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

          {/* Text content: independent sibling pressable for editing with clear affordance */}
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
            <View style={styles.titleRow}>
              <ThemedText
                variant="headline"
                color={task.completed ? colors.muted : colors.ink}
                style={[styles.title, task.completed && styles.titleCompleted]}
                numberOfLines={2}
              >
                {task.title}
              </ThemedText>
              <Feather name="chevron-right" size={16} color={colors.muted} style={styles.editChevron} />
            </View>

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

            <View style={styles.metaRow}>
              <View style={[styles.dateChip, overdue && styles.dateChipOverdue]}>
                <Feather
                  name={overdue ? 'alert-circle' : 'calendar'}
                  size={12}
                  color={overdue ? colors.coral : colors.muted}
                  style={styles.dateIcon}
                />
                <ThemedText
                  variant="caption"
                  color={overdue ? colors.error : colors.ink}
                  style={[styles.dateText, overdue && styles.dateTextOverdue]}
                >
                  {friendlyDate}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
    width: '100%',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.smd,
    borderWidth: 1,
    borderColor: colors.border,
    borderCurve: 'continuous',
  },
  cardFocus: {
    borderColor: 'rgba(49, 75, 206, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: colors.blue,
  },
  cardOverdue: {
    borderColor: 'rgba(230, 103, 77, 0.35)',
    borderLeftWidth: 3,
    borderLeftColor: colors.coral,
    backgroundColor: '#FFFDFD',
  },
  cardCompleted: {
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    // Note: No global opacity reduction to maintain WCAG AA text contrast
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  disciplineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blueTint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    maxWidth: '80%',
  },
  disciplineBadgeOverdue: {
    backgroundColor: colors.errorTint,
  },
  disciplineIcon: {
    marginRight: spacing.xs,
  },
  disciplineText: {
    fontWeight: '600',
    fontSize: 11,
  },
  deleteBtn: {
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
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
  },
  contentPressed: {
    opacity: 0.75,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
  },
  editChevron: {
    opacity: 0.5,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 2,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softPaper,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  dateChipOverdue: {
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(230, 103, 77, 0.3)',
    borderWidth: 1,
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
