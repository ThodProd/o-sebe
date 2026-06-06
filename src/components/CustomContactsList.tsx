import React from 'react';
import { Globe } from 'lucide-react';
import { CustomContact } from '../types/resume';
import { hasText } from '../utils/resumeFormat';

type Variant = 'classic' | 'modern' | 'minimal' | 'elegant' | 'dark' | 'white';

interface Props {
  contacts: CustomContact[];
  variant: Variant;
  accentColor: string;
}

const CustomContactsList: React.FC<Props> = ({ contacts, variant, accentColor }) => {
  const visibleContacts = contacts.filter((contact) => hasText(contact.value));
  if (visibleContacts.length === 0) return null;

  return (
    <>
      {visibleContacts.map((contact) => {
        const text = hasText(contact.label) ? `${contact.label}: ${contact.value}` : contact.value;

        if (variant === 'classic') {
          return (
            <div
              key={contact.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-white text-[10px]"
              style={{ background: accentColor }}
            >
              <Globe size={9} />
              <span>{text}</span>
            </div>
          );
        }

        if (variant === 'modern') {
          return (
            <div key={contact.id} className="flex items-center gap-2 text-[10px]">
              <Globe size={10} className="flex-shrink-0" />
              <span className="break-all">{text}</span>
            </div>
          );
        }

        if (variant === 'minimal') {
          return <span key={contact.id}>🔗 {text}</span>;
        }

        if (variant === 'elegant') {
          return <span key={contact.id}>⊕ {text}</span>;
        }

        if (variant === 'white') {
          return <span key={contact.id}>{text}</span>;
        }

        return (
          <div key={contact.id} className="flex items-center gap-2 text-[10px]">
            <Globe size={9} style={{ color: accentColor }} />
            <span>{text}</span>
          </div>
        );
      })}
    </>
  );
};

export default CustomContactsList;
