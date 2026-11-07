import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import {
  useTasks,
  Task,
  getTaskStats,
  selectFocusTasks,
  useTaskToday,
} from '@/src/features/tasks';
import { colors, spacing, radius, layout } from '@/src/design/tokens';
import { formatEditorialDate, getDateBlock } from '@/src/design/date-utils';
import { confirmAction, showAlert, triggerHaptic } from '@/src/design/platform-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { ProgressCard } from '@/src/components/ProgressCard';
import { TaskCard } from '@/src/components/TaskCard';
import { EmptyState } from '@/src/components/EmptyState';
import { Header } from '@/src/components/Header';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, isHydrated, error, retryHydration, toggleTask, deleteTask, resetDemo } = useTasks();

  const today = useTaskToday();
  const dateBlock = useMemo(() => getDateBlock(today), [today]);
  const editorialDate = useMemo(() => formatEditorialDate(), []);

  // Compute stats strictly via shared selector
  const stats = useMemo(() => getTaskStats(tasks, today), [tasks, today]);

  // Focus tasks strictly via shared selector: pending only, prioritized by overdue > today > future
  const focusTasks = useMemo(() => selectFocusTasks(tasks, today, 3), [tasks, today]);

  const isAllCompleted = stats.total > 0 && stats.pending === 0;

  const handleTaskPress = (task: Task) => {
    router.push({
      pathname: '/task-form',
      params: { id: task.id },
    });
  };

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id);
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Falha ao atualizar status da atividade.');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (err: any) {
      showAlert('Erro', err?.message || 'Falha ao excluir a atividade.');
    }
  };

  const handleResetDemoPrompt = () => {
    confirmAction(
      'Reiniciar demonstração',
      'Deseja restaurar as atividades iniciais do semestre?',
      async () => {
        try {
          await triggerHaptic('warning');
          await resetDemo();
          await triggerHaptic('success');
        } catch (err: any) {
          showAlert('Aviso', 'Não foi possível reiniciar a demo.');
        }
      },
      'Restaurar',
      'Cancelar'
    );
  };

  if (!isHydrated) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <ActivityIndicator size="large" color={colors.ink} />
        <ThemedText variant="headline" style={styles.loadingTitle}>
          Campus Conectado
        </ThemedText>
        <ThemedText variant="body" color={colors.muted}>
          Carregando caderno do semestre...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 20) + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentConstraint}>
          {/* Header with brand and editorial date stamp */}
          <Header
            eyebrow={editorialDate}
            dateBlock={dateBlock}
            rightAction={
              error ? null : (
                <Button
                  title="Nova"
                  size="sm"
                  variant="primary"
                  onPress={() => router.push('/task-form')}
                  leftIcon={<Feather name="plus" size={16} color={colors.white} />}
                />
              )
            }
          />

          {/* Hero headline with tight vertical rhythm: max 2 lines */}
          <View style={styles.heroSection}>
            <ThemedText variant="hero" style={styles.heroTitle}>
              Seu semestre{'\n'}tem ritmo.
            </ThemedText>
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorIcon}>
                <Feather name="alert-triangle" size={20} color={colors.coral} />
              </View>
              <View style={styles.errorContent}>
                <ThemedText variant="headline" color={colors.error}>
                  Erro de armazenamento
                </ThemedText>
                <ThemedText variant="caption" color={colors.muted}>
                  {error}
                </ThemedText>
              </View>
              <Button
                title="Tentar novamente"
                size="sm"
                variant="outline"
                onPress={() => retryHydration().catch(() => {})}
              />
            </View>
          ) : (
            <>
              {/* Compact horizontal progress strip */}
              <ProgressCard
                total={stats.total}
                completed={stats.completed}
                overdueCount={stats.overdue}
              />

              {/* Section: Em foco */}
              <View style={styles.sectionHeaderRow}>
                <View>
                  <ThemedText variant="section" style={styles.sectionTitle}>
                    Em foco
                  </ThemedText>
                  <ThemedText variant="caption" color={colors.muted}>
                    Prioridades imediatas do semestre
                  </ThemedText>
                </View>
                <Button
                  title="Ver todas"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push('/activities')}
                  rightIcon={<Feather name="chevron-right" size={16} color={colors.ink} />}
                />
              </View>

              {/* Focus list: Strictly pending tasks or 100% completed celebration */}
              {isAllCompleted ? (
                <View style={styles.allCompletedCard}>
                  <View style={styles.completedIconCircle}>
                    <Feather name="check" size={24} color={colors.ink} />
                  </View>
                  <ThemedText variant="headline" style={styles.allCompletedTitle}>
                    Tudo em dia!
                  </ThemedText>
                  <ThemedText variant="body" color={colors.muted} align="center" style={styles.allCompletedBody}>
                    Todas as atividades do semestre foram entregues. Acesse o histórico completo para rever suas conquistas.
                  </ThemedText>
                  <View style={styles.allCompletedAction}>
                    <Button
                      title="Ver histórico de atividades"
                      variant="secondary"
                      size="md"
                      onPress={() => router.push('/activities')}
                      rightIcon={<Feather name="arrow-right" size={16} color={colors.white} />}
                    />
                  </View>
                </View>
              ) : stats.total === 0 ? (
                <EmptyState
                  title="Tudo tranquilo no radar"
                  description="Você não possui atividades pendentes urgentes para hoje."
                  actionTitle="Adicionar atividade"
                  onAction={() => router.push('/task-form')}
                  iconName="check-circle"
                />
              ) : focusTasks.length === 0 ? (
                <EmptyState
                  title="Nenhuma pendência urgente"
                  description="Suas próximas atividades estão com prazos mais distantes."
                  actionTitle="Ver todas as atividades"
                  onAction={() => router.push('/activities')}
                  iconName="calendar"
                />
              ) : (
                focusTasks.map((task, idx) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={idx}
                    variant="focus"
                    onToggle={handleToggleTask}
                    onPress={handleTaskPress}
                    onDelete={handleDeleteTask}
                  />
                ))
              )}

              {/* Bottom action near the thumb */}
              <View style={styles.bottomActionsRow}>
                <Button
                  title="Ver todas as atividades"
                  size="lg"
                  variant="secondary"
                  fullWidth
                  onPress={() => router.push('/activities')}
                  rightIcon={<Feather name="arrow-right" size={18} color={colors.white} />}
                />
              </View>
            </>
          )}

          {__DEV__ && (
            <View style={styles.devSection}>
              <Button
                title="Restaurar dados da demo"
                variant="ghost"
                size="sm"
                onPress={handleResetDemoPrompt}
                leftIcon={<Feather name="refresh-cw" size={14} color={colors.muted} />}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  contentConstraint: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heroSection: {
    marginTop: spacing.xs,
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.smd,
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  bottomActionsRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(230, 103, 77, 0.4)',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  errorIcon: {
    marginRight: spacing.sm,
  },
  errorContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  allCompletedCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.sm,
    borderCurve: 'continuous',
  },
  completedIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  allCompletedTitle: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  allCompletedBody: {
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
    marginBottom: spacing.md,
  },
  allCompletedAction: {
    width: '100%',
    maxWidth: 280,
  },
  devSection: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
