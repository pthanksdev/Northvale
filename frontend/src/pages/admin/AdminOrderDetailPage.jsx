import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api.js";
import { useParams, Link } from "react-router";
import { ArrowLeftIcon, PackageIcon } from "lucide-react";
import { formatPrice } from "../../utils/format.js";
import { getCloudinaryUrl } from "../../lib/cloudinaryUrl.js";

function AdminOrderDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => apiFetch(`/api/admin/orders/${id}`),
    enabled: Boolean(id),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }) =>
      apiFetch(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  const order = data?.order;
  const items = data?.items ?? [];

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-base-content/60">Order not found</p>
        <Link to="/admin/orders" className="btn btn-ghost btn-sm mt-4">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="btn btn-ghost btn-sm btn-circle">
            <ArrowLeftIcon className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-base-content">
              Order #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-base-content/60">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <select
          className="select select-bordered select-sm"
          value={order.status}
          onChange={(e) => statusMutation.mutate({ status: e.target.value })}
          disabled={statusMutation.isPending}
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card border border-base-300 bg-base-100 p-5">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">Customer</h3>
          <p className="font-medium">{order.userDisplayName || "Unknown"}</p>
          <p className="text-sm text-base-content/60">{order.userEmail}</p>
        </div>
        <div className="card border border-base-300 bg-base-100 p-5">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wider mb-3">Summary</h3>
          <p className="text-2xl font-bold tabular-nums text-primary">
            {formatPrice(order.totalCents, "usd")}
          </p>
          <span className={`badge badge-sm mt-2 ${
            order.status === "paid" ? "badge-success" :
            order.status === "failed" ? "badge-error" :
            "badge-warning"
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100">
        <div className="border-b border-base-300 px-5 py-4">
          <h2 className="font-bold text-base-content">Line Items</h2>
        </div>
        <ul className="divide-y divide-base-300">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-base-300 bg-base-200">
                {item.productImageUrl ? (
                  <img
                    src={getCloudinaryUrl(item.productImageUrl, { width: 60, height: 60 })}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PackageIcon className="size-5 text-base-content/30" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.productName}</p>
                <p className="text-sm text-base-content/60">
                  Qty {item.quantity} × {formatPrice(item.unitPriceCents, "usd")}
                </p>
              </div>
              <p className="font-semibold tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity, "usd")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminOrderDetailPage;
