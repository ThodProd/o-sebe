import React, { useEffect } from 'react';

interface Props {
  x: number;
  y: number;
  suggestions: string[];
  onSelect: (word: string) => void;
  onClose: () => void;
}

const SpellContextMenu: React.FC<Props> = ({ x, y, suggestions, onSelect, onClose }) => {
  useEffect(() => {
    const handleClick = () => onClose();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleClick, true);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleClick, true);
    };
  }, [onClose]);

  return (
    <div
      className="fixed z-[9999] min-w-[180px] max-w-[260px] rounded-lg border border-gray-200 bg-white shadow-xl py-1"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
    >
      <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Варианты написания
      </p>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSelect(suggestion)}
          className="w-full px-3 py-1.5 text-left text-sm text-gray-800 hover:bg-blue-50 transition"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
};

export default SpellContextMenu;
