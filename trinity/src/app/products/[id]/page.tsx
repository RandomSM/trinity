"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addToCart } from "@shop/cartSlice";
import { productsAPI } from "@/lib/api";

interface Product {
  _id: string;
  product_name: string;
  brands?: string;
  quantity?: string;
  nutriscore_grade?: string;
  price: number;
  image_front_url?: string;
  image_url?: string;
  categories_tags?: string[];
  categories?: string;
  code?: string;
  ingredients_text?: string;
  allergens?: string;
  nutrition_data?: any;
  stock?: number;
}

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return "/placeholder.png";
  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);
  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      console.log("=== FRONTEND: Chargement du produit ===");
      console.log("Product ID:", productId);
      console.log("Type:", typeof productId);
      console.log("Longueur:", productId.length);
      console.log("======================================");

      try {
        const data = await productsAPI.getById(productId);
        setProduct(data);
      } catch (err: any) {
        console.error("Erreur lors du chargement du produit:", err);
        const errorMessage = err.response?.data?.error || "Produit non trouvé";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    dispatch(
      addToCart({
        id: product._id,
        name: product.product_name,
        price: product.price,
        quantity: quantity,
      })
    );
    alert(`${quantity} × ${product.product_name} ajouté au panier !`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-2xl text-gray-600 mb-4">Produit non trouvé</p>
        <button onClick={() => router.push("/products")} className="btn bg-[#FF6F00] text-white rounded-full">
          Retour aux produits
        </button>
      </div>
    );
  }

  const imageUrl = product.image_front_url || product.image_url || getOpenFoodFactsImageUrl(product.code || product._id);
  const stock = product.stock ?? 0;
  const stockPercentage = Math.min((stock / 100) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="btn btn-sm bg-gray-200 text-gray-800 border-none rounded-full mb-6 h-auto py-2 px-4"
        >
          ← Retour
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left: Image */}
            <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-8 min-h-[700px]">
              <Image
                src={imageUrl}
                alt={product.product_name}
                width={700}
                height={700}
                className="object-contain w-full h-full"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.png";
                }}
              />
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.product_name}</h1>
                {product.brands && (
                  <p className="text-xl text-gray-600 mb-2">Marque: {product.brands}</p>
                )}
                {product.quantity && (
                  <p className="text-lg text-gray-500 mb-4">Poids: {product.quantity}</p>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <p className="text-5xl font-bold text-[#FF6F00]">{product.price ? product.price.toFixed(2) : "N/A"}€</p>
                  {product.nutriscore_grade && (
                    <span className={`text-white font-bold rounded-lg h-auto py-2 px-4 text-sm ${
                      product.nutriscore_grade.toLowerCase() === "a" ? "bg-green-600" :
                      product.nutriscore_grade.toLowerCase() === "b" ? "bg-lime-500" :
                      product.nutriscore_grade.toLowerCase() === "c" ? "bg-yellow-500" :
                      product.nutriscore_grade.toLowerCase() === "d" ? "bg-orange-500" :
                      "bg-red-500"
                    }`}>
                      Nutriscore {product.nutriscore_grade.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Stock Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-gray-700">Stock disponible</p>
                    <p className="text-lg font-bold text-[#FF6F00]">{stock} unités</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] h-full rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-bold"
                      style={{ width: `${stockPercentage}%` }}
                    >
                      {stock > 0 && `${stock}`}
                    </div>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="label">
                    <span className="label-text font-semibold text-lg">Quantité</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn bg-gray-200 border-none text-gray-800 hover:bg-gray-300 rounded-full h-auto py-3 px-5 min-w-[3rem]"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                      className="btn bg-gray-200 border-none text-gray-800 hover:bg-gray-300 rounded-full h-auto py-3 px-5 min-w-[3rem]"
                      disabled={quantity >= stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0}
                  className="btn w-full bg-[#52B46B] hover:bg-[#449958] text-white text-xl border-none rounded-full py-4 h-auto shadow-lg disabled:bg-gray-300 disabled:text-gray-500"
                >
                  {stock === 0 ? "Rupture de stock" : "Ajouter au panier"}
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Détails du produit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.categories && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-700 mb-2">Catégories</p>
                  <p className="text-gray-600">{product.categories}</p>
                </div>
              )}
              {product.ingredients_text && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-700 mb-2">Ingrédients</p>
                  <p className="text-gray-600 text-sm">{product.ingredients_text}</p>
                </div>
              )}
              {product.allergens && (
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="font-semibold text-gray-700 mb-2">Allergènes</p>
                  <p className="text-gray-600">{product.allergens}</p>
                </div>
              )}
              <div className="bg-gray-50 p-6 rounded-xl">
                <p className="font-semibold text-gray-700 mb-2">Code-barres</p>
                <p className="text-gray-600 font-mono">{product.code || product._id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
