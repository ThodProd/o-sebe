import React, { useCallback, useState } from 'react';
import SpellContextMenu from './SpellContextMenu';
import {
  getSpellSuggestions,
  getWordAtCaret,
  replaceWordInField,
} from '../utils/spellSuggestions';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

interface TextAreaProps extends InputProps {
  rows?: number;
  resizable?: boolean;
}

interface SpellMenuState {
  x: number;
  y: number;
  suggestions: string[];
  target: HTMLInputElement | HTMLTextAreaElement;
  range: { start: number; end: number };
}

const fieldClassName =
  'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition';

function useSpellContextMenu(value: string, onChange: (value: string) => void) {
  const [menu, setMenu] = useState<SpellMenuState | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const target = event.currentTarget;
      const wordInfo = getWordAtCaret(target);
      if (!wordInfo) return;

      const suggestions = getSpellSuggestions(wordInfo.word);
      if (suggestions.length === 0) return;

      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        suggestions,
        target,
        range: { start: wordInfo.start, end: wordInfo.end },
      });
    },
    []
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const menuElement = menu ? (
    <SpellContextMenu
      x={menu.x}
      y={menu.y}
      suggestions={menu.suggestions}
      onClose={closeMenu}
      onSelect={(replacement) => {
        replaceWordInField(menu.target, menu.range, replacement, onChange);
        closeMenu();
      }}
    />
  ) : null;

  return { handleContextMenu, menuElement };
}

export const FormInput: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text' }) => {
  const { handleContextMenu, menuElement } = useSpellContextMenu(value, onChange);

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onContextMenu={handleContextMenu}
        placeholder={placeholder}
        spellCheck
        lang="ru"
        className={fieldClassName}
      />
      {menuElement}
    </div>
  );
};

export const FormTextarea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  resizable = false,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { handleContextMenu, menuElement } = useSpellContextMenu(value, onChange);

  React.useEffect(() => {
    if (resizable) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, rows * 24)}px`;
  }, [value, rows, resizable]);

  const textareaClassName = resizable
    ? `${fieldClassName} min-h-[72px] resize-y`
    : `${fieldClassName} min-h-[72px] resize-y overflow-hidden`;

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onContextMenu={handleContextMenu}
        placeholder={placeholder}
        rows={rows}
        spellCheck
        lang="ru"
        className={textareaClassName}
      />
      {menuElement}
    </div>
  );
};

export const FormSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClassName}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface SelectWithCustomProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  customLabel?: string;
  customPlaceholder?: string;
}

export const FormSelectWithCustom: React.FC<SelectWithCustomProps> = ({
  label,
  value,
  onChange,
  options,
  customLabel = 'Свой вариант',
  customPlaceholder = 'Введите свой вариант',
}) => {
  const presetValues = options as readonly string[];
  const isPreset = value !== '' && presetValues.includes(value);
  const [customMode, setCustomMode] = React.useState(!isPreset && value !== '');
  const { handleContextMenu, menuElement } = useSpellContextMenu(value, onChange);

  React.useEffect(() => {
    if (value !== '' && presetValues.includes(value)) {
      setCustomMode(false);
    }
  }, [value, presetValues]);

  const selectValue = customMode ? customLabel : isPreset ? value : '';

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <select
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value;
          if (next === customLabel) {
            setCustomMode(true);
            if (isPreset) onChange('');
            return;
          }
          setCustomMode(false);
          onChange(next);
        }}
        className={fieldClassName}
      >
        <option value="">Не указано</option>
        {presetValues.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
        <option value={customLabel}>{customLabel}</option>
      </select>
      {customMode && (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onContextMenu={handleContextMenu}
            placeholder={customPlaceholder}
            spellCheck
            lang="ru"
            className={`mt-2 ${fieldClassName}`}
          />
          {menuElement}
        </>
      )}
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-xl">{icon}</span>
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
  </div>
);
