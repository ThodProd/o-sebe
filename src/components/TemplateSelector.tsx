import React from 'react';
import { useResumeStore } from '../store/resumeStore';
import { TemplateType } from '../types/resume';
import { Check } from 'lucide-react';

const templates: { id: TemplateType; name: string; desc: string; colors: string[] }[] = [
  { id: 'classic', name: 'Классический', desc: 'Трёхколонный как в примере', colors: ['#5ba8a0', '#2d6b65', '#f0f9f8'] },
  { id: 'modern', name: 'Современный', desc: 'Боковая панель + контент', colors: ['#3b82f6', '#1e40af', '#eff6ff'] },
  { id: 'minimal', name: 'Минималист', desc: 'Чистый и лаконичный', colors: ['#6366f1', '#4338ca', '#eef2ff'] },
  { id: 'dark', name: 'Тёмный', desc: 'Тёмный фон с акцентами', colors: ['#f59e0b', '#b45309', '#1a1a2e'] },
  { id: 'elegant', name: 'Элегантный', desc: 'Классика с засечками', colors: ['#be185d', '#9d174d', '#fdf2f8'] },
  { id: 'white', name: 'Белый', desc: 'Чистый лист, только чёрные линии', colors: ['#111111', '#111111', '#ffffff'] },
];

const colorPresets = [
  '#5ba8a0', '#3b82f6', '#6366f1', '#f59e0b', '#be185d',
  '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#1d4ed8',
];

const TemplateSelector: React.FC = () => {
  const { template, accentColor, setTemplate, setAccentColor } = useResumeStore();

  return (
    <div className="space-y-4">
      {/* Template grid */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Шаблон дизайна</p>
        <div className="grid grid-cols-1 gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTemplate(t.id);
                setAccentColor(t.colors[0]);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left ${
                template === t.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {/* Mini preview swatch */}
              <div className="w-12 h-10 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: t.colors[2] }}>
                <div className="h-2" style={{ background: t.colors[0] }} />
                <div className="p-1 space-y-0.5">
                  <div className="h-1 rounded" style={{ background: t.colors[0], width: '70%' }} />
                  <div className="h-0.5 rounded bg-gray-200 w-full" />
                  <div className="h-0.5 rounded bg-gray-200 w-4/5" />
                  <div className="h-0.5 rounded bg-gray-200 w-3/5" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{t.desc}</p>
              </div>
              {template === t.id && <Check size={16} className="text-blue-500 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Основной цвет</p>
        <div className={`grid grid-cols-5 gap-2 mb-3 ${template === 'white' ? 'opacity-40 pointer-events-none' : ''}`}>
          {colorPresets.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              disabled={template === 'white'}
              className="w-8 h-8 rounded-full border-2 transition hover:scale-110"
              style={{
                background: color,
                borderColor: accentColor === color ? '#1d4ed8' : 'transparent',
                boxShadow: accentColor === color ? '0 0 0 2px white, 0 0 0 4px #1d4ed8' : 'none',
              }}
            />
          ))}
        </div>
        <div className={`flex items-center gap-2 ${template === 'white' ? 'opacity-40 pointer-events-none' : ''}`}>
          <label className="text-xs text-gray-500">Свой цвет:</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            disabled={template === 'white'}
            className="w-8 h-8 rounded cursor-pointer border border-gray-200"
          />
          <span className="text-xs text-gray-400 font-mono">{accentColor}</span>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
