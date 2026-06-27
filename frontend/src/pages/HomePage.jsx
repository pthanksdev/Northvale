import { HomeHero } from "../components/HomeHero.jsx";
import { TrustStrip } from "../components/TrustStrip.jsx";
import { useHomeCatalog } from "../hooks/useHomeCatalog.js";
import { CatalogProductCard } from "../components/CatalogProductCard.jsx";

function HomePage() {
  const { products, loadingList, error } = useHomeCatalog();

  const featuredProducts = products?.slice(0, 3) || [];

  return (
    <div className="space-y-12">
      <HomeHero />

      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-content">Featured Products</h2>
            <p className="text-base-content/70">Handpicked selections from our catalog.</p>
          </div>
        </div>

        {loadingList ? (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <div className="skeleton h-96 w-full rounded-box" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="text-error">Failed to load products.</div>
        ) : featuredProducts.length === 0 ? (
          <div className="rounded-box border border-base-300 bg-base-100 py-16 text-center text-base-content/60">
            No products available.
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {featuredProducts.map((p) => (
              <li key={p.id}>
                <CatalogProductCard product={p} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <TrustStrip />
    </div>
  );
}
export default HomePage;
