import React, { useRef } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { appAlert, appConfirm } from '../utils/dialog';
import { SavedResumeConfig } from '../types/resume';
import {
  Plus,
  Upload,
  Download,
  Trash2,
  FileJson,
  FileDown,
  User,
} from 'lucide-react';

interface Props {
  onCreateNew: () => void | Promise<void>;
  onOpenResume: () => void;
  onExportPdf: (id: string) => void | Promise<void>;
}

const getFullName = (config: SavedResumeConfig) => {
  const { lastName, firstName, middleName } = config.data.personal;
  return `${lastName} ${firstName} ${middleName}`.trim() || config.name;
};

const HomeScreen: React.FC<Props> = ({ onCreateNew, onOpenResume, onExportPdf }) => {
  const store = useResumeStore();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await store.importConfigFile(file);
    if (result === 'error') {
      await appAlert('Не удалось импортировать файл. Проверьте формат .osebe.json');
    } else {
      onOpenResume();
    }

    event.target.value = '';
  };

  const handleOpen = async (id: string) => {
    if (await store.tryLoadSavedConfig(id)) {
      onOpenResume();
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60">
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
        <button
          type="button"
          onClick={onCreateNew}
          className="group relative flex flex-col items-center gap-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-2xl scale-150 group-hover:bg-blue-400/30 transition" />
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 flex items-center justify-center border-4 border-white">
              <Plus size={56} className="text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-800">Создать новое резюме</p>
            <p className="text-sm text-gray-500 mt-1">Начните с чистого шаблона</p>
          </div>
        </button>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
          <button
            type="button"
            onClick={() => importInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 transition"
          >
            <Upload size={16} className="text-blue-600" />
            Импорт
          </button>
          <button
            type="button"
            onClick={() => store.exportCurrentConfig()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 transition"
          >
            <Download size={16} className="text-indigo-600" />
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
      </div>

      <div className="flex-shrink-0 border-t border-white/80 bg-white/70 backdrop-blur-sm px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-800">Сохранённые резюме</p>
          <span className="text-xs text-gray-400">{store.savedConfigs.length}</span>
        </div>

        {store.savedConfigs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/80 py-8 text-center text-sm text-gray-400">
            Пока нет сохранённых резюме — создайте первое нажатием на плюс
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
            {store.savedConfigs.map((item) => {
              const fullName = getFullName(item);
              const { photo, position } = item.data.personal;
              const salary = item.data.main.desiredSalary;

              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 w-[220px] rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition overflow-hidden group"
                >
                  <button
                    type="button"
                    onClick={() => handleOpen(item.id)}
                    className="w-full text-left p-4 hover:bg-blue-50/40 transition"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {photo ? (
                        <img
                          src={photo}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border-2 border-blue-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                          <User size={20} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-800 truncate">{fullName}</p>
                        <p className="text-[11px] text-gray-500 truncate">{position || 'Без должности'}</p>
                      </div>
                    </div>
                    {salary && (
                      <p className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-lg">
                        {salary}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2 truncate">{item.name}</p>
                  </button>

                  <div className="flex border-t border-gray-100 bg-gray-50/80">
                    <button
                      type="button"
                      title="Экспорт JSON"
                      onClick={() => store.exportSavedConfig(item.id)}
                      className="flex-1 flex items-center justify-center py-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    >
                      <FileJson size={14} />
                    </button>
                    <button
                      type="button"
                      title="PDF"
                      onClick={() => onExportPdf(item.id)}
                      className="flex-1 flex items-center justify-center py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <FileDown size={14} />
                    </button>
                    <button
                      type="button"
                      title="Удалить"
                      onClick={async () => {
                        if (await appConfirm(`Удалить «${item.name}»?`)) {
                          store.deleteSavedConfig(item.id);
                        }
                      }}
                      className="flex-1 flex items-center justify-center py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={14} />
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

export default HomeScreen;
