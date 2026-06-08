import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { FormInput } from './FormField';

interface Props {
  displayTitle: string;
  entryTitle?: string;
  onEntryTitleChange?: (value: string) => void;
  titleFieldLabel?: string;
  titleFieldPlaceholder?: string;
  showTitleField?: boolean;
  onRemove: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleEntryCard: React.FC<Props> = ({
  displayTitle,
  entryTitle = '',
  onEntryTitleChange,
  titleFieldLabel = 'Название в списке',
  titleFieldPlaceholder = 'Как показывать в свёрнутом виде',
  showTitleField = true,
  onRemove,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="flex items-center gap-1 px-2 py-2 bg-gray-50 border-b border-gray-100">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex-1 flex items-center gap-2 min-w-0 px-1 py-1 rounded-md hover:bg-white transition text-left"
        >
          {open ? (
            <ChevronDown size={15} className="text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight size={15} className="text-gray-400 flex-shrink-0" />
          )}
          <span className="font-semibold text-xs text-gray-700 truncate">{displayTitle}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition flex-shrink-0"
          title="Удалить"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {open && (
        <div className="p-3">
          {showTitleField && onEntryTitleChange && (
            <FormInput
              label={titleFieldLabel}
              value={entryTitle}
              onChange={onEntryTitleChange}
              placeholder={titleFieldPlaceholder}
            />
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleEntryCard;
