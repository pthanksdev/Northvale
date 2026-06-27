import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api.js";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  TrendingUpIcon,
} from "lucide-react";
import { formatPrice } from "../../utils/format.js";

function StatCard({ icon: Icon, label, value, color = "text-primary" }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-sm">
      <div className="card-body flex-row items-center gap-4 p-5">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-base-200 ${color}`}>
          <Icon className="size-6" aria-hidden />
        </div>
        <div>
          <p className="text-sm text-base-content/60">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-base-content">{value}</p>
        </div>
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiFetch("/api/admin/dashboard"),
  });

  const stats = data?.stats;
  const recentOrders = data?.recentOrders ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <LayoutDashboardIcon className="size-7 text-primary" aria-hidden />
          <h1 className="text-2xl font-bold text-base-content">Dashboard</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card border border-base-300 bg-base-100 shadow-sm">
              <div className="card-body p-5">
                <div className="skeleton h-6 w-20"></div>
                <div className="skeleton h-8 w-28 mt-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-2">
        <LayoutDashboardIcon className="size-7 text-primary" aria-hidden />
        <h1 className="text-2xl font-bold text-base-content">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUpIcon}
          label="Total Revenue"
          value={formatPrice(stats?.totalRevenue ?? 0, "usd")}
          color="text-success"
        />
        <StatCard
          icon={ShoppingCartIcon}
          label="Total Orders"
          value={stats?.totalOrders ?? 0}
          color="text-info"
        />
        <StatCard
          icon={PackageIcon}
          label="Products"
          value={stats?.totalProducts ?? 0}
          color="text-secondary"
        />
        <StatCard
          icon={UsersIcon}
          label="Users"
          value={stats?.totalUsers ?? 0}
          color="text-warning"
        />
      </div>

      <div className="card border border-base-300 bg-base-100 shadow-sm">
        <div className="card-body p-0">
          <div className="border-b border-base-300 px-5 py-4">
            <h2 className="text-lg font-bold text-base-content">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <div>
                        <p className="font-medium">{order.userDisplayName || "Unknown"}</p>
                        <p className="text-xs text-base-content/50">{order.userEmail}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${
                        order.status === "paid" ? "badge-success" :
                        order.status === "failed" ? "badge-error" :
                        "badge-warning"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="tabular-nums">{formatPrice(order.totalCents, "usd")}</td>
                    <td className="text-sm text-base-content/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-base-content/50 py-8">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
