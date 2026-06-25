import { useAuth } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";

function useOrdersPage() {
  const { user, isSignedIn } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch("/api/orders"),
    enabled: isSignedIn,
  });

  const staff = user?.role === "support" || user?.role === "admin";

  const orders = data?.orders ?? [];

  return {
    isLoading,
    error,
    orders,
    staff,
  };
}

export default useOrdersPage;
