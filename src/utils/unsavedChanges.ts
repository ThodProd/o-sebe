import { useResumeStore } from '../store/resumeStore';
import { appConfirm, appPrompt } from './dialog';

export async function handleUnsavedBeforeSwitch(
  message = 'Есть несохранённые изменения в текущем резюме. Сохранить перед открытием другого?'
): Promise<boolean> {
  const store = useResumeStore.getState();

  if (!store.hasUnsavedChanges()) {
    return true;
  }

  const shouldSave = await appConfirm(message);

  if (shouldSave) {
    if (store.activeConfigId) {
      store.updateActiveSaved();
    } else {
      const name = await appPrompt('Введите название для сохранения текущего резюме:');
      if (!name?.trim()) return false;
      store.saveCurrentAs(name.trim());
    }
  }

  return true;
}
