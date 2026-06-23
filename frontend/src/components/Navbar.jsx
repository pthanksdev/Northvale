import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router";

import {
  LogInIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StoreIcon,
  LogOutIcon,
  UserIcon,
} from "lucide-react";
import { useCart } from "../store/cart.js";

const Navbar = () => {
  const { user, isSignedIn, logout } = useAuth();

  const role = user?.role;

  const cartCount = useCart((s) => s.items.reduce((n, line) => n + line.quantity, 0));

  return (
    <header className="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 shadow-sm backdrop-blur-md">
      <div className="navbar mx-auto min-h-14 max-w-7xl px-4 py-2.5 md:px-6 md:py-3">
        <div className="flex-1">
          <Link
            to="/"
            className="btn btn-ghost gap-2 px-2 font-mono text-lg font-semibold uppercase tracking-wide md:text-xl"
          >
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 p-1 text-primary">
              <StoreIcon className="size-8" aria-hidden />
            </span>
            <span className="leading-none">Northvale</span>
          </Link>
        </div>

        <nav className="flex items-center gap-1 md:gap-1.5">
          <Link to="/shop" className="btn btn-ghost gap-2 font-medium">
            <ShoppingBagIcon className="size-6 opacity-90" aria-hidden />
            <span className="hidden sm:inline">Shop</span>
          </Link>

          {isSignedIn && (
            <>
              <Link to="/orders" className="btn btn-ghost gap-2 font-medium">
                <PackageIcon className="size-6 opacity-90" aria-hidden />
                <span className="hidden sm:inline">Orders</span>
              </Link>

              {role === "admin" && (
                <Link to="/admin" className="btn btn-ghost gap-2 font-medium text-secondary">
                  <SettingsIcon className="size-6" aria-hidden />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
            </>
          )}

          <Link
            to="/cart"
            className="btn btn-ghost gap-2 font-medium indicator"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          >
            {cartCount > 0 && (
              <span className="indicator-item badge badge-sm badge-primary min-w-2 px-1.5 font-sans text-xs tabular-nums">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
            <ShoppingCartIcon className="size-6 opacity-90" aria-hidden />
            <span className="hidden sm:inline">Cart</span>
          </Link>

          {!isSignedIn ? (
            <Link to="/login" className="btn btn-primary btn-sm gap-1.5 px-3 shadow-md ml-2">
              <LogInIcon className="size-4 drop-shadow-sm" aria-hidden />
              Sign in
            </Link>
          ) : (
            <div className="flex items-center gap-2 border-l border-base-300 pl-3 ml-2">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border border-base-300 ring-2 ring-base-300 hover:ring-primary">
                  <div className="w-10 rounded-full bg-base-200 text-base-content flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="object-cover" />
                    ) : (
                      <UserIcon className="size-5 m-auto mt-2 opacity-50" />
                    )}
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-xl border border-base-300">
                  <li className="menu-title px-4 py-2 border-b border-base-300 mb-2">
                    <span className="font-semibold text-base-content">{user?.displayName}</span>
                    <span className="text-xs text-base-content/60">{user?.email}</span>
                  </li>
                  <li>
                    <Link to="/profile" className="hover:bg-base-200">
                      <UserIcon className="size-4" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={logout} className="text-error mt-1 hover:bg-error/10">
                      <LogOutIcon className="size-4" />
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
              
              {(role === "support" || role === "admin") && (
                <span className="badge badge-primary badge-sm hidden capitalize md:inline-flex">
                  {role}
                </span>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
