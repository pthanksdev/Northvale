import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../lib/api.js";

export function useOrderDetailPage() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => apiFetch(`/api/orders/${id}`),
    enabled: Boolean(id),
  });

  const order = data?.order ?? null;
  const items = data?.items ?? [];
  const paid = order?.status === "paid";

  return {
    id,
    order,
    items,
    paid,
    isLoading,
    error,
  };
}
