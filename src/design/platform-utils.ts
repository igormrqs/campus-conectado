import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Cross-platform confirmation dialog.
 * Uses window.confirm on Web, and native multi-button Alert.alert on iOS/Android.
 */
export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText = 'Excluir',
  cancelText = 'Cancelar'
) {
  if (Platform.OS === 'web') {
    const promptText = message ? `${title}\n\n${message}` : title;
    const ok = typeof window !== 'undefined' ? window.confirm(promptText) : true;
    if (ok) {
      Promise.resolve(onConfirm()).catch((err) => {
        console.error('Error executing confirmed action:', err);
      });
    }
  } else {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel' },
      {
        text: confirmText,
        style: 'destructive',
        onPress: () => {
          Promise.resolve(onConfirm()).catch((err) => {
            console.error('Error executing confirmed action:', err);
          });
        },
      },
    ]);
  }
}

/**
 * Cross-platform alert message.
 */
export function showAlert(title: string, message?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(message ? `${title}\n\n${message}` : title);
    }
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Safe haptic feedback with await and catch for all platforms.
 */
export async function triggerHaptic(
  type: 'light' | 'medium' | 'success' | 'warning' | 'selection'
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
    }
  } catch {
    // Non-blocking catch on unsupported devices or web
  }
}
