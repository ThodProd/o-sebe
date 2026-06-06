import { AppConfigPayload } from './resume';

export interface SaveDialogFilter {
  name: string;
  extensions: string[];
}

export interface ElectronAPI {
  loadConfigs: () => Promise<AppConfigPayload>;
  saveConfigs: (payload: AppConfigPayload) => Promise<string>;
  getConfigPath: () => Promise<string>;
  focusWindow: () => Promise<void>;
  createTempFile: (ext: string) => Promise<{ tempPath: string }>;
  writeTempChunk: (opts: {
    tempPath: string;
    chunk: number[];
    append: boolean;
  }) => Promise<{ ok: boolean; error?: string }>;
  saveFileWithDialog: (opts: {
    defaultName: string;
    filters: SaveDialogFilter[];
    tempPath: string;
  }) => Promise<{ canceled: boolean; filePath?: string; error?: string }>;
  printToPDF: (opts: {
    defaultName: string;
  }) => Promise<{ canceled: boolean; filePath?: string; error?: string }>;
  printResume: () => Promise<{ success: boolean; failureReason?: string | null }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
