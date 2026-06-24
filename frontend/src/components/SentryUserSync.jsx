import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import * as Sentry from "@sentry/react";

/** keeps Sentry user context in sync with auth (errors and replays show which user). */
export function SentryUserSync() {
  const { isLoaded, user } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    Sentry.setUser(user?.id ? { id: user.id, email: user.email } : null);
  }, [isLoaded, user]);

  return null;
}
