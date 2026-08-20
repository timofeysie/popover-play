/// <reference types="vite/client" />

declare global {
  const __APP_VERSION__: string;

  namespace React {
    interface HTMLAttributes<T> {
      popover?: string | boolean;
      popoverTarget?: string;
      popoverTargetAction?: "show" | "hide" | "toggle";
    }

    interface ButtonHTMLAttributes<T> {
      popoverTarget?: string;
      popoverTargetAction?: "show" | "hide" | "toggle";
    }
  }
}

export {};
