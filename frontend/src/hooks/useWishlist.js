import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export function useWishlist() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => apiFetch("/api/wishlist"),
    enabled: isSignedIn,
  });

  const toggleMutation = useMutation({
    mutationFn: (productId) =>
      apiFetch("/api/wishlist/toggle", { method: "POST", body: { productId } }),
    onMutate: async (productId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousData = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old) => {
        if (!old) return old;
        const exists = old.wishlist.some((p) => p.id === productId);
        if (exists) {
          return { wishlist: old.wishlist.filter((p) => p.id !== productId) };
        } else {
          // Add a dummy item
          return { wishlist: [{ id: productId }, ...old.wishlist] };
        }
      });

      return { previousData };
    },
    onError: (err, productId, context) => {
      queryClient.setQueryData(["wishlist"], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const wishlist = data?.wishlist ?? [];
  const wishlistIds = new Set(wishlist.map((p) => p.id));

  return {
    wishlist,
    wishlistIds,
    isLoading,
    toggleWishlist: (productId) => toggleMutation.mutate(productId),
    isToggling: toggleMutation.isPending,
  };
}
