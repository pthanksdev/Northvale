import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api.js";
import { Link } from "react-router";
import { ShoppingCartIcon } from "lucide-react";
import { formatPrice } from "../../utils/format.js";

function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => apiFetch("/api/admin/orders"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      apiFetch(`/api/admin/orders/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });

  const orders = data?.orders ?? [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-2">
        <ShoppingCartIcon className="size-7 text-primary" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold text-base-content">Orders</h1>
          <p className="text-sm text-base-content/60">Manage all customer orders</p>
        </div>
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          ) : (
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono text-xs">{order.id.slice(0, 8)}…</td>
                    <td>
                      <div>
                        <p className="font-medium">{order.userDisplayName || "Unknown"}</p>
                        <p className="text-xs text-base-content/50">{order.userEmail}</p>
                      </div>
                    </td>
                    <td>
                      <select
                        className="select select-bordered select-xs"
                        value={order.status}
                        onChange={(e) =>
                          statusMutation.mutate({ id: order.id, status: e.target.value })
                        }
                        disabled={statusMutation.isPending}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                      </select>
                    </td>
                    <td className="tabular-nums font-medium">
                      {formatPrice(order.totalCents, "usd")}
                    </td>
                    <td className="text-sm text-base-content/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="btn btn-ghost btn-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-base-content/50 py-8">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrdersPage;
