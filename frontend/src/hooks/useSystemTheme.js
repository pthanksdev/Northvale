import { useEffect } from "react";

/**
 * System theme detection hook.
 * Syncs data-theme on <html> with user's OS light/dark preference.
 * No toggle needed — automatically follows the device setting.
 */
export function useSystemTheme() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(dark) {
      document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    }

    apply(mq.matches);

    function handler(e) {
      apply(e.matches);
    }

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
}
