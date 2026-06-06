import { useDialogStore } from '../store/dialogStore';

export function restoreAppFocus() {
  requestAnimationFrame(() => {
    window.focus();
    void window.electronAPI?.focusWindow?.();
  });
}

export async function appAlert(message: string): Promise<void> {
  await useDialogStore.getState().alert(message);
  restoreAppFocus();
}

export async function appConfirm(message: string): Promise<boolean> {
  const result = await useDialogStore.getState().confirm(message);
  restoreAppFocus();
  return result;
}

export async function appPrompt(message: string, defaultValue = ''): Promise<string | null> {
  const result = await useDialogStore.getState().prompt(message, defaultValue);
  restoreAppFocus();
  return result;
}
