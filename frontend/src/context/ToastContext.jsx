import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from "lucide-react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast toast-end toast-bottom z-[100]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`alert shadow-lg border gap-2 ${
              t.type === "success" ? "alert-success" :
              t.type === "error" ? "alert-error" :
              "alert-info"
            }`}
          >
            {t.type === "success" && <CheckCircleIcon className="size-5 shrink-0" />}
            {t.type === "error" && <XCircleIcon className="size-5 shrink-0" />}
            {t.type === "info" && <InfoIcon className="size-5 shrink-0" />}
            <span className="text-sm">{t.message}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
