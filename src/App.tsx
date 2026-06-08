import { useCallback, useEffect, useRef, useState } from 'react';
import EditorPanel from './components/EditorPanel';
import HomeScreen from './components/HomeScreen';
import ResumePreview from './components/ResumePreview';
import SavedResumesPanel from './components/SavedResumesPanel';
import TemplateSelector from './components/TemplateSelector';
import { useResumeStore } from './store/resumeStore';
import { exportResumePDF } from './utils/resumeExport';
import { appAlert, appConfirm, restoreAppFocus } from './utils/dialog';
import { handleUnsavedBeforeSwitch } from './utils/unsavedChanges';
import {
  Download, Eye, Settings, Palette, RotateCcw,
  ChevronLeft, ChevronRight, Loader2, FileDown, FolderOpen, Home, Plus, Minus, Save
} from 'lucide-react';

type Tab = 'editor' | 'saved' | 'template';
type MainView = 'home' | 'editor';
type PanelState = 'open' | 'closed';

function App() {
  const resumeRef = useRef<HTMLDivElement>(null);
  const store = useResumeStore();
  const { savedConfigs, activeConfigId, configsReady, initConfigs, pendingDraftRecovery } = store;
  const activeResumeName = savedConfigs.find((item) => item.id === activeConfigId)?.name;

  const [mainView, setMainView] = useState<MainView>('home');
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [panelState, setPanelState] = useState<PanelState>('open');
  const [isExporting, setIsExporting] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const draftRecoveryHandled = useRef(false);

  const zoomIn = () => setPreviewZoom((value) => Math.min(2, Math.round((value + 0.1) * 10) / 10));
  const zoomOut = () => setPreviewZoom((value) => Math.max(0.5, Math.round((value - 0.1) * 10) / 10));

  useEffect(() => {
    void initConfigs();
  }, [initConfigs]);

  useEffect(() => {
    if (!configsReady || !pendingDraftRecovery || draftRecoveryHandled.current) return;

    draftRecoveryHandled.current = true;

    void (async () => {
      const shouldRestore = await appConfirm(
        'Программа была закрыта с несохранённым резюме. Восстановить последние изменения?'
      );

      if (shouldRestore) {
        store.restoreDraft(pendingDraftRecovery);
        setMainView('editor');
        setPanelState('open');
      } else {
        store.dismissDraftRecovery(pendingDraftRecovery);
      }

      store.clearPendingDraftRecovery();
    })();
  }, [configsReady, pendingDraftRecovery, store]);

  const openEditor = () => {
    setMainView('editor');
    setPanelState('open');
  };
  const openHome = () => setMainView('home');

  const handleCreateNew = async () => {
    const canProceed = await handleUnsavedBeforeSwitch(
      'Есть несохранённые изменения. Сохранить текущее резюме перед созданием нового?'
    );
    if (!canProceed) return;

    store.createNewResume();
    setActiveTab('editor');
    openEditor();
  };

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      await store.saveCurrentResume();
    } finally {
      setIsSaving(false);
    }
  };

  const waitForResumePreview = useCallback(async () => {
    await new Promise<void>((resolve) => {
      const start = Date.now();
      const check = () => {
        const element = document.getElementById('resume-preview');
        if (element && element.offsetHeight > 100) {
          window.setTimeout(resolve, 800);
        } else if (Date.now() - start < 8000) {
          window.setTimeout(check, 150);
        } else {
          resolve();
        }
      };
      check();
    });
  }, []);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      await exportResumePDF();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка печати';
      await appAlert(message);
    } finally {
      setIsExporting(false);
      restoreAppFocus();
    }
  }, [isExporting]);

  const handleExportFromSaved = useCallback(
    async (configId: string) => {
      if (!(await store.tryLoadSavedConfig(configId))) return;

      setActiveTab('editor');
      setMainView('editor');
      setPanelState('open');

      await waitForResumePreview();
      await handleExportPDF();
    },
    [store, waitForResumePreview, handleExportPDF]
  );

  if (!configsReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={28} className="animate-spin text-blue-600" />
          <p className="text-sm">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (mainView === 'home') {
    return (
      <div className="h-screen w-screen overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
        <HomeScreen
          onCreateNew={handleCreateNew}
          onOpenResume={openEditor}
          onExportPdf={(id) => handleExportFromSaved(id)}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div
        className={`print-hidden flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          panelState === 'open' ? 'w-[400px]' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={openHome} className="flex-shrink-0">
              <img
                src="./ICON.ico"
                alt="О себе"
                className="w-9 h-9 rounded-xl object-cover border border-gray-200 shadow-sm hover:shadow-md transition"
              />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-gray-900 text-[15px] leading-tight">О себе</h1>
              <p className="text-[10px] text-gray-400">Генератор резюме</p>
            </div>
            <button
              type="button"
              onClick={openHome}
              title="На главную"
              className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              <Home size={16} />
            </button>
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${
                activeTab === 'editor'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings size={13} />
              Редактор
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${
                activeTab === 'template'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Palette size={13} />
              Шаблон
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${
                activeTab === 'saved'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FolderOpen size={13} />
              Сохранённые
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {activeTab === 'editor' && <EditorPanel />}
          {activeTab === 'saved' && <SavedResumesPanel onOpenResume={openEditor} />}
          {activeTab === 'template' && <TemplateSelector />}
        </div>

        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-white text-center space-y-0.5">
          <p className="text-[10px] text-gray-400 pt-2">Автор: Спиркин В.А.</p>
          <a
            href="https://github.com/ThodProd"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-blue-600 hover:text-blue-800 hover:underline"
          >
            github.com/ThodProd
          </a>
          <a
            href="https://www.donationalerts.com/r/notonly1"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-[10px] text-pink-600 hover:text-pink-800 hover:underline pb-1"
          >
            Поддержать автора
          </a>
        </div>

        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleExportPDF()}
              disabled={isExporting}
              title="Печать / PDF — формат A4"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-semibold text-xs text-white transition shadow hover:shadow-md active:scale-95 disabled:opacity-60"
              style={{
                background: isExporting
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              }}
            >
              {isExporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Печать...
                </>
              ) : (
                <>
                  <Download size={14} />
                  PDF
                </>
              )}
            </button>

            <button
              onClick={handleCreateNew}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-gray-600 border border-gray-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition font-medium"
            >
              <RotateCcw size={13} />
              Новое
            </button>
          </div>
        </div>
      </div>

      <div className="print-hidden relative flex-shrink-0">
        <button
          onClick={() => setPanelState(panelState === 'open' ? 'closed' : 'open')}
          className="absolute top-1/2 -translate-y-1/2 z-10 w-6 h-12 bg-white border border-gray-200 rounded-r-xl shadow-md flex items-center justify-center hover:bg-gray-50 transition"
        >
          {panelState === 'open' ? <ChevronLeft size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>
      </div>

      <div className="resume-preview-area flex-1 overflow-auto relative">
        <>
            <div className="print-hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye size={15} />
                <span className="font-medium text-gray-700">
                  {activeResumeName ? `«${activeResumeName}»` : 'Предпросмотр резюме'}
                </span>
                <span className="text-xs text-gray-400">· A4 (210 × 297 мм)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-1 px-1 py-1 rounded-xl bg-gray-100 border border-gray-200 shadow-sm">
                  <button
                    type="button"
                    onClick={zoomOut}
                    disabled={previewZoom <= 0.5}
                    title="Уменьшить"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <span className="min-w-[42px] text-center text-xs font-bold text-gray-600 tabular-nums">
                    {Math.round(previewZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={zoomIn}
                    disabled={previewZoom >= 2}
                    title="Увеличить"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSaveResume()}
                  disabled={isSaving || isExporting}
                  title="Сохранить резюме"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition shadow hover:shadow-md active:scale-95 disabled:opacity-60"
                  style={{ background: isSaving ? '#9ca3af' : '#16a34a' }}
                >
                  {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Сохранить
                </button>
                <button
                  onClick={() => void handleExportPDF()}
                  disabled={isExporting}
                  title="Печать / PDF — формат A4"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition shadow hover:shadow-md active:scale-95 disabled:opacity-60"
                  style={{ background: isExporting ? '#9ca3af' : '#ef4444' }}
                >
                  {isExporting ? <Loader2 size={13} className="animate-spin" /> : <FileDown size={13} />}
                  PDF
                </button>
              </div>
            </div>
            <ResumePreview ref={resumeRef} zoom={previewZoom} />
        </>
      </div>
    </div>
  );
}

export default App;
