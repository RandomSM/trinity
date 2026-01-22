"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  brand?: string;
  quantity?: string;
  nutriscore?: string;
  price: number;
  image?: string;
}

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev + itemsPerPage >= products.length ? 0 : prev + itemsPerPage
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, products.length - itemsPerPage) : prev - itemsPerPage
    );
  };

  const visibleProducts = products.slice(currentIndex, currentIndex + itemsPerPage);

  return (
    <div className="relative w-full py-8">
      <h2 className="text-3xl font-bold text-center mb-8">Produits en Vedette</h2>
      
      <div className="relative px-12">
        {/* Bouton Précédent */}
        <button
          onClick={handlePrev}
          className="btn btn-circle btn-primary absolute left-0 top-1/2 -translate-y-1/2 z-10"
          aria-label="Précédent"
        >
          ❮
        </button>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={handleNext}
          className="btn btn-circle btn-primary absolute right-0 top-1/2 -translate-y-1/2 z-10"
          aria-label="Suivant"
        >
          ❯
        </button>
      </div>

      {/* Indicateurs de pagination */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: Math.ceil(products.length / itemsPerPage) }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx * itemsPerPage)}
            className={`w-3 h-3 rounded-full transition-all ${
              Math.floor(currentIndex / itemsPerPage) === idx
                ? "bg-primary w-8"
                : "bg-gray-300"
            }`}
            aria-label={`Page ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
