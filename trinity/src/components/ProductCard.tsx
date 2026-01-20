import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { addToCart } from "@shop/cartSlice";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    brand?: string;
    quantity?: string;
    nutriscore?: string;
    price: number;
  };
}

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return "/placeholder.png";

  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);

  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

export default function ProductCard({ product }: ProductCardProps) {
  
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    console.log("Ajout au panier déclenché !", product);
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      })
    );
  };

  const productWithImage = product as any;
  const imageUrl = productWithImage.image_url || productWithImage.image_front_url || getOpenFoodFactsImageUrl(product.id);

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card w-60 bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden cursor-pointer">
        {/* Image */}
        <figure>
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={product.name || product.brand || "Product image"}
            width={240}
            height={160}
            className="object-cover rounded-t-lg"
            priority={true} // optional: improves LCP for first images
          />
        </figure>

        {/* Card body */}
        <div className="card-body">
          <h2 className="card-title">{product.name}</h2>
          {product.brand && <p className="text-sm text-gray-500">Marque: {product.brand}</p>}
          {product.quantity && <p className="text-sm text-gray-500">Quantité: {product.quantity}</p>}
          {product.nutriscore && (
            <div className="mt-2">
              <span
                className={`badge badge-sm ${
                  product.nutriscore.toLowerCase() === "a"
                    ? "badge-success"
                    : product.nutriscore.toLowerCase() === "b"
                    ? "badge-primary"
                    : product.nutriscore.toLowerCase() === "c"
                    ? "badge-warning"
                    : product.nutriscore.toLowerCase() === "d"
                    ? "badge-accent"
                    : "badge-error"
                }`}
              >
                Nutriscore: {product.nutriscore.toUpperCase()}
              </span>
            </div>
          )}
          <p className="text-lg font-bold mt-2">{product.price.toFixed(2)}€</p>
          <div className="card-actions mt-3">
            <button 
              className="btn btn-sm w-full bg-[#FF6F00] text-white border-none hover:bg-[#FF8F00] hover:scale-105 transition-all duration-300 shadow-md rounded-full"
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
            >
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
