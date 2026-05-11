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

/* ─── Variant config ────────────────────────────────────────────────────────
   accentBar  → thin top-border stripe (always visible, no bg tint needed)
   iconColor  → icon colour that works on any surface
   confirmBtn → button classes (explicit colour, never depends on surface)
   ─────────────────────────────────────────────────────────────────────── */
const variantStyles: Record<ConfirmVariant, {
  icon: string;
  iconColor: string;
  confirmBtn: string;
  accentBar: string;
}> = {
  danger: {
    icon: 'warning',
    iconColor: 'text-red-500',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
    accentBar: 'bg-red-500',
  },
  warning: {
    icon: 'error_outline',
    iconColor: 'text-amber-400',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white',
    accentBar: 'bg-amber-400',
  },
  success: {
    icon: 'check_circle',
    iconColor: 'text-emerald-400',
    confirmBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    accentBar: 'bg-emerald-500',
  },
  info: {
    icon: 'info',
    iconColor: 'text-blue-400',
    confirmBtn: 'gradient-btn text-white',
    accentBar: 'bg-blue-500',
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Dialog — uses CSS variables so it respects light/dark theme properly */}
          <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/20">

            {/* Coloured top accent bar — replaces tinted header bg */}
            <div className={`h-1 w-full ${styles.accentBar}`} />

            {/* Body */}
            <div className="px-6 pt-5 pb-6 bg-surface-container-low">
              <div className="flex items-start gap-4">
                <span className={`material-symbols-outlined text-[32px] shrink-0 mt-0.5 ${styles.iconColor}`}>
                  {styles.icon}
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-on-surface leading-snug">{options.title}</h2>
                  <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{options.message}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-outline-variant/20" />

            {/* Footer actions */}
            <div className="px-6 py-4 flex items-center justify-end gap-3 bg-surface-container">
              <button
                type="button"
                onClick={() => closeModal(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/25 transition-colors"
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
