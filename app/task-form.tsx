import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  useTasks,
  validateTaskInput,
  TaskInput,
  TaskFieldErrors,
  useTaskToday,
} from '@/src/features/tasks';
import { colors, spacing, radius, layout, fonts } from '@/src/design/tokens';
import {
  addDaysToDateString,
  formatDatePtBR,
  formatDateInput,
  parseDateInput,
  parseCivilDate,
  isValidDateString,
} from '@/src/design/date-utils';
import { confirmAction, triggerHaptic } from '@/src/design/platform-utils';
import { ThemedText } from '@/src/components/ThemedText';
import { Button } from '@/src/components/Button';
import { Toast } from '@/src/components/Toast';
import { Header } from '@/src/components/Header';
import { EmptyState } from '@/src/components/EmptyState';

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

  const { tasks, isHydrated, error, retryHydration, addTask, updateTask, deleteTask } = useTasks();

  const existingTask = useMemo(() => {
    if (!taskId) return null;
    return tasks.find((t) => t.id === taskId) || null;
  }, [taskId, tasks]);

  const today = useTaskToday();
  const tomorrow = useMemo(() => addDaysToDateString(today, 1), [today]);
  const in3Days = useMemo(() => addDaysToDateString(today, 3), [today]);
  const in7Days = useMemo(() => addDaysToDateString(today, 7), [today]);

  const initialDueAt = existingTask ? existingTask.dueAt : tomorrow;

  const [title, setTitle] = useState(existingTask ? existingTask.title : '');
  const [discipline, setDiscipline] = useState(existingTask ? existingTask.discipline : '');
  const [description, setDescription] = useState(existingTask ? existingTask.description : '');
  const [dueAt, setDueAt] = useState(initialDueAt);

  // Web input text formatted strictly as DD/MM/AAAA
  const [dateInputText, setDateInputText] = useState(formatDateInput(initialDueAt));

  const [errors, setErrors] = useState<TaskFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pickerDate = useMemo(() => {
    const parsed = parseCivilDate(dueAt);
    if (parsed) return new Date(parsed.year, parsed.month - 1, parsed.day, 12, 0, 0);
    return new Date();
  }, [dueAt]);

  // Sync state when existingTask becomes available after hydration
  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDiscipline(existingTask.discipline);
      setDescription(existingTask.description);
      setDueAt(existingTask.dueAt);
      setDateInputText(formatDateInput(existingTask.dueAt));
    }
  }, [existingTask]);

  // Loading state while waiting for hydration
  if (!isHydrated) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <View style={styles.contentConstraint}>
          <Header title="Carregando" showBack />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ink} />
            <ThemedText variant="body" color={colors.muted} style={{ marginTop: spacing.md }}>
              Carregando informações da atividade...
            </ThemedText>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-triangle" size={18} color={colors.coral} />
                <ThemedText variant="caption" color={colors.error} style={styles.errorBoxText}>
                  {error}
                </ThemedText>
                <Button
                  title="Tentar"
                  size="sm"
                  variant="outline"
                  onPress={() => retryHydration().catch(() => {})}
                />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  // Invalid ID guard: editing an ID that does not exist in tasks
  if (isEditing && !existingTask) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.paper }]}>
        <View style={styles.contentConstraint}>
          <Header title="Atividade não encontrada" showBack />
          <View style={styles.notFoundWrapper}>
            <EmptyState
              title="Atividade inexistente"
              description="O identificador fornecido não corresponde a nenhuma atividade cadastrada ou ela foi removida."
              actionTitle="Voltar ao início"
              onAction={() => router.replace('/')}
              iconName="alert-triangle"
            />
          </View>
        </View>
      </View>
    );
  }

  const handleDateQuickSelect = (isoDate: string) => {
    setDueAt(isoDate);
    setDateInputText(formatDateInput(isoDate));
    if (errors.dueAt) {
      setErrors((prev) => ({ ...prev, dueAt: undefined }));
    }
  };

  const handleWebDateChange = (raw: string) => {
    setDateInputText(raw);

    // Strictly parse DD/MM/AAAA. Invalid format sets invalid sentinel so validateTaskInput catches it.
    const parsedIso = parseDateInput(raw);
    if (parsedIso) {
      setDueAt(parsedIso);
      if (errors.dueAt) setErrors((prev) => ({ ...prev, dueAt: undefined }));
    } else {
      setDueAt(raw.trim() || 'invalida');
    }
  };

  const validate = (): boolean => {
    const input: TaskInput = {
      title: title.trim(),
      discipline: discipline.trim(),
      description: description.trim(),
      dueAt: dueAt.trim(),
    };

    const fieldErrors = validateTaskInput(input);
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSave = async () => {
    if (isSubmitting) return;

    if (!validate()) {
      await triggerHaptic('warning');
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

      await triggerHaptic('success');

      // Preserve reliable destination /activities (demo contract expectation)
      setTimeout(() => {
        router.replace('/activities');
      }, 400);
    } catch (err: any) {
      setGeneralError(err?.message || 'Falha ao salvar atividade no armazenamento local.');
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!taskId) return;
    confirmAction(
      'Excluir atividade',
      'Tem certeza de que deseja excluir esta atividade?',
      async () => {
        try {
          setIsSubmitting(true);
          await triggerHaptic('warning');
          await deleteTask(taskId);
          router.replace('/activities');
        } catch (err: any) {
          setGeneralError(err?.message || 'Não foi possível excluir a atividade.');
          setIsSubmitting(false);
        }
      },
      'Excluir',
      'Cancelar'
    );
  };

  const handleNativeDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const iso = `${year}-${month}-${day}`;
      setDueAt(iso);
      setDateInputText(formatDateInput(iso));
      if (errors.dueAt) {
        setErrors((prev) => ({ ...prev, dueAt: undefined }));
      }
    }
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/activities');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.paper }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 96, // Safe clearance for persistent fixed footer
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentConstraint}>
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

          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={18} color={colors.coral} />
              <ThemedText variant="caption" color={colors.error} style={styles.errorBoxText}>
                {error}
              </ThemedText>
              <Button
                title="Tentar"
                size="sm"
                variant="outline"
                onPress={() => retryHydration().catch(() => {})}
              />
            </View>
          )}

          {generalError && (
            <View style={styles.errorBox}>
              <Feather name="alert-triangle" size={18} color={colors.coral} />
              <ThemedText variant="label" color={colors.error} style={styles.errorBoxText}>
                {generalError}
              </ThemedText>
            </View>
          )}

          {/* Título da atividade */}
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
              <ThemedText variant="caption" color={colors.error} style={styles.fieldError}>
                {errors.title}
              </ThemedText>
            )}
          </View>

          {/* Disciplina com seletor compacto */}
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
              <ThemedText variant="caption" color={colors.error} style={styles.fieldError}>
                {errors.discipline}
              </ThemedText>
            )}

            {/* Suggestions horizontal scroll with >=44dp touch targets */}
            <ThemedText variant="caption" color={colors.muted} style={styles.suggestionsTitle}>
              Sugestões do semestre:
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
            >
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
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar disciplina ${d}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.suggestionChip, isSelected && styles.suggestionChipSelected]}
                  >
                    <ThemedText
                      variant="caption"
                      color={isSelected ? colors.white : colors.ink}
                      style={isSelected ? styles.suggestionChipTextSelected : undefined}
                    >
                      {d}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Prazo de entrega com controle único pt-BR */}
          <View style={styles.fieldGroup}>
            <ThemedText variant="label" style={styles.fieldLabel}>
              PRAZO DE ENTREGA *
            </ThemedText>

            {Platform.OS === 'web' ? (
              <View style={styles.webDateContainer}>
                <View style={styles.inputWithIcon}>
                  <Feather name="calendar" size={18} color={colors.blue} style={styles.inputIcon} />
                  <TextInput
                    value={dateInputText}
                    onChangeText={handleWebDateChange}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor={colors.muted}
                    accessibilityLabel="Prazo da atividade"
                    accessibilityHint="Informe o prazo no formato DD/MM/AAAA"
                    style={[styles.input, styles.inputWithPadding, errors.dueAt && styles.inputError]}
                  />
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setShowDatePicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Prazo da atividade"
                accessibilityHint="Toque para alterar a data"
                style={[styles.nativeDateButton, errors.dueAt && styles.inputError]}
              >
                <View style={styles.nativeDateLeft}>
                  <Feather name="calendar" size={18} color={colors.blue} />
                  <ThemedText variant="headline" style={styles.nativeDateText}>
                    {isValidDateString(dueAt) ? formatDatePtBR(dueAt, 'long') : 'Selecionar data'}
                  </ThemedText>
                </View>
                <Feather name="edit-3" size={16} color={colors.muted} />
              </Pressable>
            )}

            {/* Quick date chips in a single horizontal scroll strip */}
            <View style={styles.quickChipsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickChipsRow}
              >
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
                      onPress={() => handleDateQuickSelect(item.val)}
                      hitSlop={6}
                      accessibilityRole="button"
                      accessibilityLabel={`Prazo ${item.label}`}
                      accessibilityState={{ selected: isSelected }}
                      style={[styles.quickChip, isSelected && styles.quickChipSelected]}
                    >
                      <ThemedText
                        variant="caption"
                        color={isSelected ? colors.white : colors.ink}
                        style={isSelected ? styles.quickChipTextSelected : undefined}
                      >
                        {item.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {Platform.OS !== 'web' && showDatePicker && (
              <DateTimePicker
                value={pickerDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleNativeDateChange}
              />
            )}

            {errors.dueAt && (
              <ThemedText variant="caption" color={colors.error} style={styles.fieldError}>
                {errors.dueAt}
              </ThemedText>
            )}
          </View>

          {/* Descrição opcional */}
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

          {/* Cancel action inside scroll content */}
          <View style={styles.cancelWrapper}>
            <Button
              title="Cancelar"
              size="md"
              variant="ghost"
              fullWidth
              onPress={handleCancel}
            />
          </View>
        </View>
      </ScrollView>

      {/* Persistent Save Footer OUTSIDE ScrollView, positioned with insets */}
      <View
        style={[
          styles.persistentFooter,
          {
            paddingBottom: Math.max(insets.bottom, 14),
          },
        ]}
      >
        <View style={styles.footerConstraint}>
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
      </View>

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
  footerConstraint: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 200,
  },
  notFoundWrapper: {
    paddingVertical: spacing.md,
  },
  deleteHeaderBtn: {
    padding: spacing.xs,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderColor: 'rgba(230, 103, 77, 0.4)',
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
    marginBottom: spacing.md,
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
    paddingVertical: spacing.smd,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    minHeight: layout.touchTarget,
    borderCurve: 'continuous',
  },
  inputWithIcon: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  inputWithPadding: {
    paddingLeft: spacing.xl + 12,
  },
  inputError: {
    borderColor: colors.coral,
    backgroundColor: colors.errorTint,
  },
  textArea: {
    minHeight: 96,
    paddingTop: spacing.smd,
  },
  fieldError: {
    marginTop: spacing.xs,
    fontWeight: '600',
    fontSize: 12,
  },
  suggestionsTitle: {
    marginTop: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingVertical: 2,
  },
  suggestionChip: {
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.smd,
    paddingVertical: spacing.xs,
    minHeight: 44, // 44dp touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionChipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  suggestionChipTextSelected: {
    fontWeight: '600',
  },
  webDateContainer: {
    width: '100%',
  },
  nativeDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smd,
    minHeight: layout.touchTarget,
  },
  nativeDateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  nativeDateText: {
    fontSize: 15,
  },
  quickChipsWrapper: {
    marginTop: spacing.xs + 2,
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    paddingVertical: 2,
  },
  quickChip: {
    backgroundColor: colors.softPaper,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 44, // 44dp touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickChipSelected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  quickChipTextSelected: {
    fontWeight: '600',
  },
  cancelWrapper: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  persistentFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
});
