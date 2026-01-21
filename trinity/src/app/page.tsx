"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChartBarIcon, FireIcon, SparklesIcon } from "@heroicons/react/24/solid";
import { reportsAPI } from "@/lib/api";

interface TrendingProduct {
  productId: string;
  product: {
    _id: string;
    code: string;
    product_name: string;
    brands: string;
    image_url: string;
    price: number;
    nutriscore_grade: string;
    categories: string;
    stock: number;
  };
  recentQuantity: number;
  recentRevenue: number;
}

interface KPIData {
  avgPurchaseValue: number;
  salesByPeriod: {
    last24Hours: { revenue: number; orders: number };
    last7Days: { revenue: number; orders: number };
  };
  trendingProducts: TrendingProduct[];
}

export default function HomePage() {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch trending products and KPIs
        const trending = await reportsAPI.getTrendingProducts();
        
        setTrendingProducts(trending.slice(0, 12));
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-base-200 min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-[500px] bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="hero-content text-center w-full relative z-10">
          <div className="max-w-2xl mx-auto px-4 flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
              Bienvenue sur OpenFoodMarket
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Découvrez nos produits de qualité à des prix imbattables !
            </p>

            <Link 
              href="/products" 
              className="btn btn-lg bg-white text-[#FF6F00] border-none hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl rounded-full px-8 py-4 min-h-[3.5rem] h-auto"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </div>

      {/* Trending Products Section */}
      {!loading && trendingProducts.length > 0 && (
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center gap-3 mb-8">
            <FireIcon className="w-8 h-8 text-[#FF6F00]" />
            <h2 className="text-4xl font-bold text-center">Produits Tendances</h2>
            <SparklesIcon className="w-8 h-8 text-[#FF6F00]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingProducts.map((item) => (
              <div key={item.productId} className="relative">
                {/* Trending Badge */}
                <div className="absolute top-2 right-2 z-10 badge badge-error gap-1 text-white font-bold">
                  <FireIcon className="w-4 h-4" />
                  {item.recentQuantity} vendus
                </div>
                <ProductCard product={item.product} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="container mx-auto py-12">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && trendingProducts.length === 0 && (
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Aucune donnée disponible</h3>
            <p className="text-gray-600 mb-6">
              Les statistiques seront disponibles une fois que les KPIs seront générés.
            </p>
            <Link href="/products" className="btn btn-primary">
              Voir tous les produits
            </Link>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-white py-16 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi nous choisir ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#FF6F00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Qualité garantie</h3>
              <p className="text-gray-600">Tous nos produits sont soigneusement sélectionnés</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#52B46B] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Prix compétitifs</h3>
              <p className="text-gray-600">Les meilleurs prix du marché</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#FF6F00] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Livraison rapide</h3>
              <p className="text-gray-600">Expédition sous 24-48h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-[#52B46B] py-16 w-full">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4 text-white">Prêt à commencer ?</h2>
          <p className="text-lg mb-8 text-white/90">Parcourez notre collection complète de produits</p>
          <Link 
            href="/products" 
            className="btn btn-lg bg-white text-[#52B46B] border-none hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-xl rounded-full px-8 py-4 min-h-[3.5rem] h-auto"
          >
            Explorer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}