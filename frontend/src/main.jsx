import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import * as Sentry from "@sentry/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "./context/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router";
import { SentryErrorFallback } from "./components/SentryErrorFallback.jsx";
import { SentryUserSync } from "./components/SentryUserSync.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

const queryClient = new QueryClient();

const apiBase = import.meta.env.VITE_API_URL ?? "";
const tracePropagationTargets =
  apiBase.length > 0 ? [apiBase] : typeof window !== "undefined" ? [window.location.origin] : [];

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: tracePropagationTargets,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <SentryUserSync />
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Sentry.ErrorBoundary fallback={<SentryErrorFallback />}>
                <App />
              </Sentry.ErrorBoundary>
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);

// In simple terms, 'browserTracingIntegration' lets Sentry see things like:
// page load timing
// route/navigation timing
// slow frontend interactions
// outgoing fetch / API requests
// frontend-to-backend trace linking
