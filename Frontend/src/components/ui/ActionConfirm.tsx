import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

export type ConfirmVariant = 'danger' | 'warning' | 'success' | 'info';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
};

type ConfirmContextType = {
  requestConfirmation: (options: ConfirmOptions) => Promise<boolean>;
};

type InternalConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: ConfirmVariant;
};

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

const DEFAULT_OPTIONS: Omit<InternalConfirmOptions, 'message'> = {
  title: 'Are you sure?',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'danger',
};

const variantStyles: Record<ConfirmVariant, { icon: string; iconColor: string; confirmBtn: string; headerAccent: string }> = {
  danger: {
    icon: 'warning',
    iconColor: 'text-error',
    confirmBtn: 'bg-error hover:bg-error/90 text-white',
    headerAccent: 'border-error/20 bg-error/5',
  },
  warning: {
    icon: 'error_outline',
    iconColor: 'text-amber-500',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
    headerAccent: 'border-amber-200/40 bg-amber-50/60',
  },
  success: {
    icon: 'check_circle',
    iconColor: 'text-emerald-500',
    confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    headerAccent: 'border-emerald-200/40 bg-emerald-50/60',
  },
  info: {
    icon: 'info',
    iconColor: 'text-primary',
    confirmBtn: 'gradient-btn text-white',
    headerAccent: 'border-primary/20 bg-primary/5',
  },
};

export const ActionConfirmProvider = ({ children }: { children: ReactNode }) => {
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<InternalConfirmOptions>({
    ...DEFAULT_OPTIONS,
    message: '',
  });

  const closeModal = useCallback((confirmed: boolean) => {
    setIsOpen(false);
    if (resolverRef.current) {
      resolverRef.current(confirmed);
      resolverRef.current = null;
    }
  }, []);

  const requestConfirmation = useCallback((incoming: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setOptions({
        title: incoming.title || DEFAULT_OPTIONS.title,
        message: incoming.message,
        confirmLabel: incoming.confirmLabel || DEFAULT_OPTIONS.confirmLabel,
        cancelLabel: incoming.cancelLabel || DEFAULT_OPTIONS.cancelLabel,
        variant: incoming.variant || DEFAULT_OPTIONS.variant,
      });
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  const styles = variantStyles[options.variant];

  return (
    <ConfirmContext.Provider value={{ requestConfirmation }}>
      {children}

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(false); }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Dialog */}
          <div className="relative w-full max-w-sm rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className={`px-6 pt-6 pb-5 border-b border-outline-variant/10 ${styles.headerAccent}`}>
              <div className="flex items-start gap-3">
                <span className={`material-symbols-outlined text-3xl shrink-0 mt-0.5 ${styles.iconColor}`}>
                  {styles.icon}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-on-surface leading-tight">{options.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">{options.message}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex items-center justify-end gap-3 bg-surface-container-low/50">
              <button
                type="button"
                onClick={() => closeModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors border border-outline-variant/20"
              >
                {options.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => closeModal(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-sm ${styles.confirmBtn}`}
              >
                {options.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useActionConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useActionConfirm must be used within ActionConfirmProvider');
  }
  return context;
};
