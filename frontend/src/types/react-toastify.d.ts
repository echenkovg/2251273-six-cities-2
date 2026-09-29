declare module 'react-toastify' {
  import type { ReactNode } from 'react';

  export const toast: {
    (message: ReactNode): void;
    dismiss(): void;
    warn(message: ReactNode): void;
    error(message: ReactNode): void;
    success(message: ReactNode): void;
    info(message: ReactNode): void;
  };

  export const ToastContainer: (props: Record<string, unknown>) => JSX.Element;
}
