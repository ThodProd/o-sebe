import React, { useEffect, useRef } from 'react';
import { useDialogStore } from '../store/dialogStore';
import { restoreAppFocus } from '../utils/dialog';

const AppDialog: React.FC = () => {
  const { request, close } = useDialogStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!request) return;

    const timer = window.setTimeout(() => {
      if (request.type === 'prompt') {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        confirmButtonRef.current?.focus();
      }
    }, 0);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (request.type === 'alert') {
          close(true);
        } else if (request.type === 'confirm') {
          close(false);
        } else {
          close(null);
        }
        restoreAppFocus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [request, close]);

  if (!request) return null;

  const handleBackdropMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const finish = (value: boolean | string | null) => {
    close(value);
    restoreAppFocus();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="px-5 py-4">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{request.message}</p>

          {request.type === 'prompt' && (
            <input
              ref={inputRef}
              type="text"
              defaultValue={request.defaultValue ?? ''}
              className="mt-4 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  finish(event.currentTarget.value);
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100">
          {request.type === 'alert' && (
            <button
              ref={confirmButtonRef}
              type="button"
              onClick={() => finish(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
            >
              OK
            </button>
          )}

          {request.type === 'confirm' && (
            <>
              <button
                type="button"
                onClick={() => finish(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition"
              >
                Нет
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => finish(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Да
              </button>
            </>
          )}

          {request.type === 'prompt' && (
            <>
              <button
                type="button"
                onClick={() => finish(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-white transition"
              >
                Отмена
              </button>
              <button
                ref={confirmButtonRef}
                type="button"
                onClick={() => finish(inputRef.current?.value ?? '')}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                OK
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppDialog;
