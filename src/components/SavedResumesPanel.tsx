import React, { useRef, useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { appAlert, appConfirm } from '../utils/dialog';
import {
  Save,
  Upload,
  Download,
  Trash2,
  Pencil,
  Check,
  X,
  FileJson,
  RefreshCw,
} from 'lucide-react';

interface Props {
  onOpenResume?: () => void;
}

const SavedResumesPanel: React.FC<Props> = ({ onOpenResume }) => {
  const store = useResumeStore();
  const importInputRef = useRef<HTMLInputElement>(null);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeConfig = store.savedConfigs.find((item) => item.id === store.activeConfigId);

  const handleSave = async () => {
    if (!saveName.trim()) {
      await appAlert('Введите название резюме');
      return;
    }

    const duplicate = store.savedConfigs.find(
      (item) => item.name.toLowerCase() === saveName.trim().toLowerCase()
    );

    if (duplicate && duplicate.id !== store.activeConfigId) {
      if (!(await appConfirm(`Резюме «${saveName.trim()}» уже есть. Перезаписать?`))) {
        return;
      }
      store.saveCurrentAs(saveName.trim(), duplicate.id);
      setSaveName('');
      return;
    }

    store.saveCurrentAs(saveName.trim());
    setSaveName('');
  };

  const handleUpdate = () => {
    if (!store.activeConfigId) return;
    store.updateActiveSaved();
  };

  const handleOpen = async (id: string) => {
    if (await store.tryLoadSavedConfig(id)) {
      onOpenResume?.();
    }
  };

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const submitRename = async () => {
    if (!editingId || !editingName.trim()) return;
    await store.renameSavedConfig(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await store.importConfigFile(file);
    if (result === 'error') {
      await appAlert('Не удалось импортировать файл. Проверьте формат .osebe.json');
    } else {
      onOpenResume?.();
    }

    event.target.value = '';
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-4 mt-2">
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700 mb-1">
          Текущее резюме
        </p>
        <p className="text-sm font-semibold text-gray-800">
          {activeConfig ? activeConfig.name : 'Новое (не сохранено)'}
        </p>
        {store.hasUnsavedChanges() && (
          <p className="text-[10px] text-amber-600 mt-1 font-medium">● Есть несохранённые изменения</p>
        )}
        {activeConfig && (
          <p className="text-[10px] text-gray-500 mt-1">
            Обновлено: {formatDate(activeConfig.updatedAt)}
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Сохранить в программе</p>
        <input
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Название резюме"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="flex gap-2">
          {store.activeConfigId && (
            <button
              type="button"
              onClick={handleUpdate}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition"
            >
              <RefreshCw size={13} />
              Обновить
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition ml-auto"
          >
            <Save size={13} />
            Сохранить
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => importInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <Upload size={14} />
          Импорт
        </button>
        <button
          type="button"
          onClick={() => store.exportCurrentConfig()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <Download size={14} />
          Экспорт
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".json,.osebe.json,application/json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-700">Список</p>
          <span className="text-[10px] text-gray-400">{store.savedConfigs.length}</span>
        </div>

        {store.savedConfigs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
            Пока нет сохранённых резюме
          </div>
        ) : (
          <div className="space-y-2">
            {store.savedConfigs.map((item) => {
              const isActive = item.id === store.activeConfigId;

              return (
                <div
                  key={item.id}
                  className={`rounded-xl border p-3 transition ${
                    isActive ? 'border-blue-300 bg-blue-50/50' : 'border-gray-200 bg-white'
                  }`}
                >
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button type="button" onClick={submitRename} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50">
                        <Check size={14} />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(item.updatedAt)}</p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full flex-shrink-0">
                          Открыто
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpen(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-medium text-gray-700 transition"
                    >
                      Открыть
                    </button>
                    <button
                      type="button"
                      onClick={() => startRename(item.id, item.name)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-medium text-gray-700 transition"
                    >
                      <Pencil size={12} />
                      Имя
                    </button>
                    <button
                      type="button"
                      onClick={() => store.exportSavedConfig(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] font-medium text-gray-700 transition"
                    >
                      <FileJson size={12} />
                      Экспорт
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (await appConfirm(`Удалить «${item.name}»?`)) {
                          store.deleteSavedConfig(item.id);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[11px] font-medium text-red-600 transition"
                    >
                      <Trash2 size={12} />
                      Удалить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedResumesPanel;
