import { Link, useLocation } from "react-router";
import {
  LayoutDashboardIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
} from "lucide-react";

const ADMIN_NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboardIcon, exact: true },
  { label: "Products", to: "/admin/products", icon: PackageIcon },
  { label: "Orders", to: "/admin/orders", icon: ShoppingCartIcon },
  { label: "Users", to: "/admin/users", icon: UsersIcon },
];

export function AdminBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 backdrop-blur-lg safe-bottom md:hidden"
      role="navigation"
      aria-label="Admin mobile navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-0.5 px-1 py-1.5">
        {ADMIN_NAV.map((item) => {
          const isActive = item.exact
            ? pathname === item.to
            : pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-base-content/60 hover:text-base-content"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="size-5" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
