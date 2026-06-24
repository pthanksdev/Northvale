import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Sync token to localStorage and API headers
  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("auth_token");
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, [token]);

  // Load user profile if we have a token
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoaded(true);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setToken(null);
      } finally {
        setIsLoaded(true);
      }
    }
    loadUser();
  }, [token]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email, password, displayName) => {
    const { data } = await api.post("/auth/register", { email, password, displayName });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const googleAuth = useCallback(async (googleToken) => {
    const { data } = await api.post("/auth/google", { token: googleToken });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  const value = {
    user,
    isLoaded,
    isSignedIn: !!user,
    token,
    login,
    register,
    googleAuth,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
