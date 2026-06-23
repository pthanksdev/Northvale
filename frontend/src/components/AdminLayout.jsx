import { Link, Outlet, useLocation, Navigate } from "react-router";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  StoreIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { AdminBottomNav } from "./AdminBottomNav.jsx";

const ADMIN_NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboardIcon, exact: true },
  { label: "Products", to: "/admin/products", icon: PackageIcon },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Users", to: "/admin/users", icon: UsersIcon },
];

export function AdminLayout() {
  const { user, isLoaded } = useAuth();
  const { pathname } = useLocation();

  if (!isLoaded) return null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-svh bg-base-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-base-300 bg-base-100">
        <div className="flex items-center gap-2 border-b border-base-300 px-5 py-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <StoreIcon className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-bold text-base-content leading-none">Northvale</p>
            <p className="text-xs text-base-content/50 mt-0.5">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1" role="navigation" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => {
            const isActive = item.exact
              ? pathname === item.to
              : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="size-5 shrink-0" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-base-300 px-3 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-base-content/60 hover:bg-base-200 hover:text-base-content transition-colors"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-base-300 bg-base-100/95 backdrop-blur-md px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <StoreIcon className="size-4" aria-hidden />
            </span>
            <span className="text-sm font-bold text-base-content">Admin</span>
          </div>
          <Link
            to="/"
            className="btn btn-ghost btn-sm gap-1"
          >
            <ArrowLeftIcon className="size-4" aria-hidden />
            Store
          </Link>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <AdminBottomNav />
    </div>
  );
}
