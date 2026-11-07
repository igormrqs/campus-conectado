import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTasks, validateTaskInput, TaskInput, TaskFieldErrors } from '@/src/features/tasks';
import { colors, spacing, radius, layout } from '@/src/design/tokens';
import {
  getTodayDateString,
  addDaysToDateString,
  formatFriendlyDate,
  parseCivilDate,
} from '@/src/design/date-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { Toast } from '@/src/components/Toast';
import { Header } from '@/src/components/Header';

const SUGGESTED_DISCIPLINES = [
  'Desenvolvimento Mobile',
  'Engenharia de Software',
  'Banco de Dados',
  'Estruturas de Dados',
  'Cálculo',
  'Redes de Computadores',
];

export default function TaskFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const taskId = params.id;
  const isEditing = !!taskId;

  const { tasks, addTask, updateTask, deleteTask } = useTasks();

  const existingTask = useMemo(() => {
    if (!taskId) return null;
    return tasks.find((t) => t.id === taskId) || null;
  }, [taskId, tasks]);

  const today = useMemo(() => getTodayDateString(), []);
  const tomorrow = useMemo(() => addDaysToDateString(today, 1), [today]);
  const in3Days = useMemo(() => addDaysToDateString(today, 3), [today]);
  const in7Days = useMemo(() => addDaysToDateString(today, 7), [today]);

  const [title, setTitle] = useState(existingTask ? existingTask.title : '');
  const [discipline, setDiscipline] = useState(existingTask ? existingTask.discipline : '');
  const [description, setDescription] = useState(existingTask ? existingTask.description : '');
  const [dueAt, setDueAt] = useState(existingTask ? existingTask.dueAt : tomorrow);

  const [errors, setErrors] = useState<TaskFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state if existingTask loads asynchronously
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDiscipline(existingTask.discipline);
      setDescription(existingTask.description);
      setDueAt(existingTask.dueAt);
    }
  }, [existingTask]);

  const validate = (): boolean => {
    const input: TaskInput = {
      title: title.trim(),
      discipline: discipline.trim(),
      description: description.trim(),
      dueAt: dueAt.trim(),
    };

    let fieldErrors: TaskFieldErrors = {};
    try {
      fieldErrors = validateTaskInput(input);
    } catch {
      // In case Worker A validation throws or is pending
      if (!input.title) fieldErrors.title = 'Título é obrigatório';
      if (!input.discipline) fieldErrors.discipline = 'Disciplina é obrigatória';
      if (!input.dueAt) fieldErrors.dueAt = 'Prazo é obrigatório';
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    if (!validate()) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // safe fallback
      }
      return;
    }

    setIsSubmitting(true);
    setGeneralError(null);

    const input: TaskInput = {
      title: title.trim(),
      discipline: discipline.trim(),
      description: description.trim(),
      dueAt: dueAt.trim(),
    };

    try {
      if (isEditing && taskId) {
        await updateTask(taskId, input);
        setToastMessage('Atividade atualizada com sucesso!');
      } else {
        await addTask(input);
        setToastMessage('Atividade cadastrada com sucesso!');
      }

      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // safe fallback
      }

      setTimeout(() => {
        router.back();
      }, 500);
    } catch (err: any) {
      setGeneralError(err?.message || 'Falha ao salvar atividade. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!taskId) return;
    Alert.alert(
      'Excluir atividade',
      'Tem certeza de que deseja excluir esta atividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await deleteTask(taskId);
              try {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              } catch {
                // safe fallback
              }
              router.back();
            } catch (err: any) {
              setGeneralError('Não foi possível excluir a atividade.');
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDueAt(`${year}-${month}-${day}`);
      if (errors.dueAt) {
        setErrors((prev) => ({ ...prev, dueAt: undefined }));
      }
    }
  };

  const pickerDate = useMemo(() => {
    const parsed = parseCivilDate(dueAt);
    if (parsed) return new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
    return new Date();
  }, [dueAt]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.paper }]}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={isEditing ? 'Editar atividade' : 'Nova atividade'}
          subtitle="Preencha os dados da entrega acadêmica"
          showBack
          rightAction={
            isEditing ? (
              <Pressable
                onPress={handleDelete}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Excluir atividade"
                style={({ pressed }) => [styles.deleteHeaderBtn, pressed && styles.pressed]}
              >
                <Feather name="trash-2" size={18} color={colors.coral} />
              </Pressable>
            ) : null
          }
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {generalError && (
          <View style={styles.errorBox}>
            <Feather name="alert-triangle" size={18} color={colors.coral} />
            <ThemedText variant="label" color={colors.coral} style={styles.errorBoxText}>
              {generalError}
            </ThemedText>
          </View>
        )}

        {/* Título */}
        <View style={styles.fieldGroup}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            TÍTULO DA ATIVIDADE *
          </ThemedText>
          <TextInput
            value={title}
            onChangeText={(txt) => {
              setTitle(txt);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            placeholder="Ex.: Revisar árvores binárias"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Título da atividade"
            style={[styles.input, errors.title && styles.inputError]}
          />
          {errors.title && (
            <ThemedText variant="caption" color={colors.coral} style={styles.fieldError}>
              {errors.title}
            </ThemedText>
          )}
        </View>

        {/* Disciplina */}
        <View style={styles.fieldGroup}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            DISCIPLINA *
          </ThemedText>
          <TextInput
            value={discipline}
            onChangeText={(txt) => {
              setDiscipline(txt);
              if (errors.discipline) setErrors((prev) => ({ ...prev, discipline: undefined }));
            }}
            placeholder="Ex.: Desenvolvimento Mobile"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Disciplina"
            style={[styles.input, errors.discipline && styles.inputError]}
          />
          {errors.discipline && (
            <ThemedText variant="caption" color={colors.coral} style={styles.fieldError}>
              {errors.discipline}
            </ThemedText>
          )}

          {/* Quick suggestions */}
          <ThemedText variant="caption" color={colors.muted} style={styles.suggestionsTitle}>
            Sugestões do semestre:
          </ThemedText>
          <View style={styles.chipsContainer}>
            {SUGGESTED_DISCIPLINES.map((d) => {
              const isSelected = discipline.toLowerCase() === d.toLowerCase();
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    setDiscipline(d);
                    if (errors.discipline) setErrors((prev) => ({ ...prev, discipline: undefined }));
                  }}
                  hitSlop={6}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <ThemedText
                    variant="caption"
                    color={isSelected ? colors.white : colors.ink}
                    style={isSelected ? styles.chipTextSelected : undefined}
                  >
                    {d}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Prazo */}
        <View style={styles.fieldGroup}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            PRAZO DE ENTREGA *
          </ThemedText>

          <View style={styles.dateSelectorRow}>
            <View style={styles.dateSelectedDisplay}>
              <Feather name="calendar" size={16} color={colors.blue} />
              <ThemedText variant="headline" style={styles.dateDisplayText}>
                {formatFriendlyDate(dueAt)} ({dueAt})
              </ThemedText>
            </View>

            <Button
              title="Outra data"
              size="sm"
              variant="outline"
              onPress={() => setShowDatePicker(true)}
              leftIcon={<Feather name="edit-3" size={14} color={colors.ink} />}
            />
          </View>

          {/* Quick Date Chips */}
          <View style={styles.chipsContainer}>
            {[
              { label: 'Hoje', val: today },
              { label: 'Amanhã', val: tomorrow },
              { label: 'Em 3 dias', val: in3Days },
              { label: 'Em 1 semana', val: in7Days },
            ].map((item) => {
              const isSelected = dueAt === item.val;
              return (
                <Pressable
                  key={item.label}
                  onPress={() => {
                    setDueAt(item.val);
                    if (errors.dueAt) setErrors((prev) => ({ ...prev, dueAt: undefined }));
                  }}
                  hitSlop={8}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                >
                  <ThemedText
                    variant="caption"
                    color={isSelected ? colors.white : colors.ink}
                    style={isSelected ? styles.chipTextSelected : undefined}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {errors.dueAt && (
            <ThemedText variant="caption" color={colors.coral} style={styles.fieldError}>
              {errors.dueAt}
            </ThemedText>
          )}
        </View>

        {/* Descrição */}
        <View style={styles.fieldGroup}>
          <ThemedText variant="label" style={styles.fieldLabel}>
            DESCRIÇÃO (OPCIONAL)
          </ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Detalhes, requisitos ou links da entrega..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            accessibilityLabel="Descrição da atividade"
            style={[styles.input, styles.textArea]}
          />
        </View>

        {/* CTA Salvar */}
        <View style={styles.actionRow}>
          <Button
            title={isEditing ? 'Salvar alterações' : 'Cadastrar atividade'}
            size="lg"
            variant="primary"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSave}
            leftIcon={<Feather name="check" size={20} color={colors.white} />}
          />
        </View>

        <View style={styles.cancelRow}>
          <Button
            title="Cancelar"
            size="md"
            variant="ghost"
            fullWidth
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>

      <Toast
        message={toastMessage || ''}
        visible={!!toastMessage}
        type="success"
        onDismiss={() => setToastMessage(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  deleteHeaderBtn: {
    padding: spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F3',
    borderColor: colors.coral,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorBoxText: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: 16,
    color: colors.ink,
    minHeight: layout.touchTarget,
    borderCurve: 'continuous',
  },
  inputError: {
    borderColor: colors.coral,
    backgroundColor: '#FFFDFC',
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  fieldError: {
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  suggestionsTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipTextSelected: {
    fontWeight: '600',
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  dateSelectedDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateDisplayText: {
    fontSize: 15,
  },
  actionRow: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  cancelRow: {
    marginBottom: spacing.md,
  },
});
