import { Link } from "react-router";
import { ProductPageSkeleton } from "../components/LoadingSkeletons.jsx";
import { PageError } from "../components/PageError.jsx";
import { useProductPage } from "../hooks/useProductPage.js";
import { getCloudinaryUrl } from "../lib/cloudinaryUrl.js";
import { useCart } from "../store/cart.js";
import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, ShoppingCartIcon, HeartIcon } from "lucide-react";
import { formatPrice } from "../utils/format.js";
import { useWishlist } from "../hooks/useWishlist.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router";

const HIGHLIGHTS = [
  "Secure checkout",
  "Support from your order after payment",
  "Specs listed for this catalog",
];

function ProductDetailPage() {
  const addItem = useCart((s) => s.addItem);
  const { product, isLoading, error } = useProductPage();
  const { wishlistIds, toggleWishlist, isToggling } = useWishlist();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return <PageError message="Product not found." action={{ to: "/", label: "Back to shop" }} />;
  }

  const p = product;
  const category = p.category ?? "General";
  const watermarkedFullUrl = p.imageUrl
    ? getCloudinaryUrl(p.imageUrl)
    : null;

  return (
    <div>
      <nav className="breadcrumbs text-sm text-base-content/60">
        <ul>
          <li>
            <Link to="/">Shop</Link>
          </li>
          <li>
            <Link to={`/?category=${encodeURIComponent(category)}`}>{category}</Link>
          </li>
          <li className="text-base-content">{p.name}</li>
        </ul>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="card overflow-hidden border border-base-300 bg-base-100 shadow-lg">
          <figure className="aspect-square bg-base-300">
            {p.imageUrl ? (
              <img
                src={getCloudinaryUrl(p.imageUrl, { width: 800, height: 800 })}
                alt=""
                className="h-full w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
            ) : (
              <div className="h-full w-full" />
            )}
          </figure>

          {watermarkedFullUrl ? (
            <div className="flex flex-wrap items-center gap-2 border-t border-base-300 bg-base-200/40 px-3 py-2">
              <a
                className="btn btn-ghost btn-xs gap-1"
                href={watermarkedFullUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden />
                Open full size
              </a>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-primary badge-outline">{category}</span>
            <span className="text-xs font-mono text-base-content/45">{p.slug}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-base-content md:text-4xl">
            {p.name}
          </h1>

          <p className="mt-3 text-3xl font-bold tabular-nums text-primary md:text-4xl">
            {formatPrice(p.priceCents, p.currency)}
          </p>

          <p className="mt-6 text-base leading-relaxed text-base-content/85">{p.description}</p>

          <ul className="mt-6 space-y-2 rounded-box border border-base-300 bg-base-200/50 p-4">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-base-content/80">
                <CheckIcon className="size-4 shrink-0 text-success" aria-hidden />
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => addItem(p.id)}
              className="btn btn-primary btn-lg gap-2 shadow-lg"
            >
              <ShoppingCartIcon className="size-5" aria-hidden />
              Add to cart
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isSignedIn) {
                  navigate("/login");
                  return;
                }
                toggleWishlist(p.id);
              }}
              disabled={isToggling}
              className={`btn btn-lg gap-2 ${
                wishlistIds.has(p.id)
                  ? "bg-rose-100 text-rose-600 border-rose-200 hover:bg-rose-200 hover:border-rose-300 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/50"
                  : "btn-outline border-base-300"
              }`}
            >
              <HeartIcon className={`size-5 ${wishlistIds.has(p.id) ? "fill-current" : ""}`} aria-hidden />
              {wishlistIds.has(p.id) ? "Saved" : "Save"}
            </button>

            <Link to="/" className="btn btn-ghost btn-lg gap-2 border border-base-300 hidden sm:flex">
              <ArrowLeftIcon className="size-4" aria-hidden />
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
