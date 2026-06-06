import { create } from 'zustand';

type DialogType = 'alert' | 'confirm' | 'prompt';

interface DialogRequest {
  type: DialogType;
  message: string;
  defaultValue?: string;
  resolve: (value: boolean | string | null) => void;
}

interface DialogStore {
  request: DialogRequest | null;
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
  prompt: (message: string, defaultValue?: string) => Promise<string | null>;
  close: (value: boolean | string | null) => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  request: null,

  alert: (message) =>
    new Promise<void>((resolve) => {
      set({
        request: {
          type: 'alert',
          message,
          resolve: () => resolve(),
        },
      });
    }),

  confirm: (message) =>
    new Promise<boolean>((resolve) => {
      set({
        request: {
          type: 'confirm',
          message,
          resolve: (value) => resolve(Boolean(value)),
        },
      });
    }),

  prompt: (message, defaultValue = '') =>
    new Promise<string | null>((resolve) => {
      set({
        request: {
          type: 'prompt',
          message,
          defaultValue,
          resolve: (value) => resolve(typeof value === 'string' ? value : null),
        },
      });
    }),

  close: (value) => {
    const { request } = get();
    request?.resolve(value);
    set({ request: null });
  },
}));
