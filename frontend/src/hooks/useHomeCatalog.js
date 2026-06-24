import { useSearchParams } from "react-router";
import { apiFetch } from "../lib/api.js";
import { useQuery } from "@tanstack/react-query";

export function useHomeCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category")?.trim() ?? "";
  const searchQuery = searchParams.get("search")?.trim() ?? "";

  const setCategory = (category) => {
    const next = new URLSearchParams(searchParams);

    if (!category) next.delete("category");
    else next.set("category", category);

    // Reset search when picking a category
    next.delete("search");

    setSearchParams(next, { replace: true });
  };

  const setSearchQuery = (search) => {
    const next = new URLSearchParams(searchParams);
    
    if (!search) next.delete("search");
    else next.set("search", search);

    // Optional: reset category when searching
    next.delete("category");

    setSearchParams(next, { replace: true });
  };

  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: () => apiFetch("/api/products/categories"),
  });

  const {
    data: productsData,
    isLoading: loadingList,
    error,
  } = useQuery({
    queryKey: ["products", categoryFilter, searchQuery],
    queryFn: () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      if (searchQuery) params.set("search", searchQuery);
      const q = params.toString();
      return apiFetch(q ? `/api/products?${q}` : "/api/products");
    },
  });

  const categories = categoriesData?.categories ?? [];
  const products = productsData?.products ?? [];
  const categoryChipsLoading = loadingCategories && categories.length === 0;

  return {
    categoryFilter,
    searchQuery,
    setCategory,
    setSearchQuery,
    categories,
    products,
    categoryChipsLoading,
    loadingCategories,
    loadingList,
    error,
  };
}
