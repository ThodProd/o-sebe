import React, { useEffect, useRef } from 'react';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

interface TextAreaProps extends InputProps {
  rows?: number;
}

export const FormInput: React.FC<InputProps> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
    />
  </div>
);

export const FormTextarea: React.FC<TextAreaProps> = ({ label, value, onChange, placeholder, rows = 3 }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(textarea.scrollHeight, rows * 24)}px`;
  }, [value, rows]);

  return (
    <div className="mb-3">
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full min-h-[72px] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition resize-y overflow-hidden"
      />
    </div>
  );
};

export const FormSelect: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export const SectionHeader: React.FC<{ title: string; icon: string }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-xl">{icon}</span>
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
  </div>
);
