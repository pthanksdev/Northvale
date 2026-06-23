import { Link, useLocation } from "react-router";
import {
  HomeIcon,
  ShoppingCartIcon,
  PackageIcon,
  UserIcon,
  LogInIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../store/cart.js";

const NAV_ITEMS = [
  { label: "Shop", to: "/", icon: HomeIcon, auth: false },
  { label: "Cart", to: "/cart", icon: ShoppingCartIcon, auth: false, showBadge: true },
  { label: "Orders", to: "/orders", icon: PackageIcon, auth: true },
  { label: "Account", to: "/login", icon: UserIcon, auth: false, accountItem: true },
];

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isSignedIn, user } = useAuth();
  const cartCount = useCart((s) => s.items.reduce((n, line) => n + line.quantity, 0));

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 backdrop-blur-lg safe-bottom md:hidden"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-0.5 px-1 py-1.5">
        {NAV_ITEMS.map((item) => {
          // Hide auth-required items when signed out
          if (item.auth && !isSignedIn) return null;

          // Account item logic
          let to = item.to;
          let label = item.label;
          let Icon = item.icon;

          if (item.accountItem) {
            if (isSignedIn) {
              to = "/profile";
              label = user?.displayName?.split(" ")[0] || "Me";
              Icon = UserIcon;
            } else {
              to = "/login";
              label = "Sign in";
              Icon = LogInIcon;
            }
          }

          const isActive =
            to === "/" ? pathname === "/" : pathname.startsWith(to);

          return (
            <Link
              key={item.label}
              to={to}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-xs font-medium transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-base-content/60 hover:text-base-content"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {item.showBadge && cartCount > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-content">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
