import { Link, useNavigate } from "react-router";
import { PlusIcon, HeartIcon } from "lucide-react";
import { formatPrice } from "../utils/format.js";
import { getCloudinaryUrl } from "../lib/cloudinaryUrl.js";
import { useCart } from "../store/cart.js";
import { useWishlist } from "../hooks/useWishlist.js";
import { useAuth } from "../context/AuthContext.jsx";

export function CatalogProductCard({ product }) {
  const addItem = useCart((s) => s.addItem);
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = wishlistIds.has(product.id);

  function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    toggleWishlist(product.id);
  }

  return (
    <article className="card group h-full overflow-hidden border border-base-300 bg-base-100 shadow-md transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-xl">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden">
        <figure className="aspect-4/3 bg-base-300">
          {product.imageUrl ? (
            <img
              src={getCloudinaryUrl(product.imageUrl, { width: 400, height: 300 })}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          ) : null}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 btn btn-circle btn-sm backdrop-blur-md ${
              isWishlisted
                ? "bg-primary text-primary-content border-primary hover:bg-primary/90"
                : "bg-base-100/70 text-base-content/70 hover:bg-base-100 border-none"
            }`}
          >
            <HeartIcon className={`size-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </figure>
        <span className="badge badge-sm absolute left-3 top-3 border-0 bg-base-100/90 text-xs font-medium text-base-content/80 backdrop-blur">
          {product.category ?? "General"}
        </span>
      </Link>
      <div className="card-body grow gap-3 p-5 text-left">
        <Link
          to={`/product/${product.slug}`}
          className="card-title line-clamp-2 text-lg transition group-hover:text-primary"
        >
          {product.name}
        </Link>
        <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">
          {product.description}
        </p>
        <div className="card-actions mt-auto items-center justify-between border-t border-base-200 pt-4">
          <span className="text-lg font-bold tabular-nums text-base-content">
            {formatPrice(product.priceCents, product.currency)}
          </span>
          <button
            type="button"
            onClick={() => addItem(product.id)}
            className="btn btn-primary btn-sm gap-1 shadow"
          >
            <PlusIcon className="size-4" aria-hidden />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
