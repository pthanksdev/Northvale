import { CatalogProductCard } from "../components/CatalogProductCard.jsx";
import { PageError } from "../components/PageError.jsx";
import { useHomeCatalog } from "../hooks/useHomeCatalog.js";
import { SearchIcon } from "lucide-react";

function ShopPage() {
  const {
    products,
    categories,
    categoryChipsLoading,
    categoryFilter,
    searchQuery,
    setSearchQuery,
    error,
    loadingList,
    setCategory,
  } = useHomeCatalog();

  return (
    <div className="space-y-12">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-base-content md:text-4xl">
          Shop Our Catalog
        </h1>
        <p className="mt-4 text-base-content/70 max-w-2xl mx-auto">
          Browse our entire selection of hardware, wearables, workspace gear, and travel essentials.
        </p>
      </div>

      <section id="catalog">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="input input-bordered w-full pl-9 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`btn btn-sm ${!categoryFilter ? "btn-primary" : "btn-ghost border border-base-300"}`}
              onClick={() => setCategory("")}
            >
              All
            </button>

            {categoryChipsLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-8 w-20 rounded-lg" aria-hidden />
                ))
              : categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm ${categoryFilter === c ? "btn-primary" : "btn-ghost border border-base-300"}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
          </div>
        </div>

        {loadingList ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i}>
                <div className="skeleton h-96 w-full rounded-box" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <PageError message="We couldn't load products. Please try again in a moment." />
        ) : products.length === 0 ? (
          <div className="rounded-box border border-base-300 bg-base-100 py-16 text-center text-base-content/60">
            No products in this category yet.
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <li key={p.id}>
                <CatalogProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default ShopPage;
