"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { fetchProductsPage } from "@shop/ProductList";
import { RootState, AppDispatch } from "@shop/store";
import ProductCard from "@components/ProductCard";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || undefined;
  
  const { items: products, loading, error, page, total, limit } = useSelector(
    (state: RootState) => state.products
  );

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    // Charge les produits à chaque changement de catégorie
    dispatch(fetchProductsPage({ page: 1, category }));
  }, [dispatch, category]);

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages) return;
    console.log("goToPage ->", target);
    dispatch(fetchProductsPage({ page: target, category }));
    // optional: scroll top to show user the grid
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-base-200 min-h-screen">
      <div className="container mx-auto py-8">
        {loading && products.length === 0 && ( // ✅ Show only if nothing loaded yet
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-4 items-center">
          <button
            className="btn btn-md bg-[#FF6F00] text-white text-lg border-none hover:bg-[#FF8F00] hover:scale-105 transition-all duration-300 shadow-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            ◀ Précédent
          </button>
          <span className="text-lg font-semibold">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn btn-md bg-[#FF6F00] text-white text-lg border-none hover:bg-[#FF8F00] hover:scale-105 transition-all duration-300 shadow-lg rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Suivant ▶
          </button>
        </div>
      </div>
    </div>
  );
}
