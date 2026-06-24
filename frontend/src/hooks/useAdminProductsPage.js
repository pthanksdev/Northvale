import { useAuth } from "../context/AuthContext.jsx";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { apiFetch } from "../lib/api.js";

export function useAdminProductsPage() {
  const { user, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const isAdmin = user?.role === "admin";

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => apiFetch("/api/admin/products"),
    enabled: isSignedIn && isAdmin,
  });

  // this mutation will either update or create a product
  const saveMutation = useMutation({
    mutationFn: async ({ body, id }) => {
      if (id) {
        return apiFetch(`/api/admin/products/${id}`, {
          method: "PATCH",
          body,
        });
      }
      return apiFetch("/api/admin/products", { method: "POST", body });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
      setModalOpen(false);
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId) =>
      apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-categories"] });
    },
    onError: (err) => {
      console.log(err);
      window.alert(err instanceof Error ? err.message : "Delete failed");
    },
  });

  return {
    isSignedIn,
    meData: { user },
    modalOpen,
    setModalOpen,
    editing,
    setEditing,
    products: data?.products ?? [],
    isLoading,
    saveMutation,
    deleteMutation,
  };
}
