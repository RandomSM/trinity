"use client";
import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RootState } from "@shop/store";
import { removeFromCart, updateQuantity, clearCart } from "@shop/cartSlice";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { authAPI, paypalAPI } from "@/lib/api";

export default function CartPage() {
  const items = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const total = parseFloat(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));

  useEffect(() => {
    const loadUserId = async () => {
      if (user?.id) {
        setUserId(user.id);
      } else if (authAPI.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUserId(userData._id);
        } catch (error) {
          console.error("Error loading user:", error);
        }
      }
    };
    
    loadUserId();
  }, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 mb-2">Votre panier est vide 🛒</p>
          <a href="/products" className="btn bg-[#FF6F00] hover:bg-[#FF8F00] text-white border-none rounded-full px-8 mt-4">
            Découvrir nos produits
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Mon Panier</h1>
          </div>

          <div className="p-8">
            {error && (
              <div className="alert alert-error mb-6 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="card bg-base-100 shadow-md p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{item.name}</p>
                    <p className="text-sm text-gray-500 mb-2">{item.price.toFixed(2)} €</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Quantité:</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          dispatch(
                            updateQuantity({
                              id: item.id,
                              quantity: Number(e.target.value),
                            })
                          )
                        }
                        className="input input-bordered input-sm w-20 text-center font-semibold focus:outline-[#FF6F00] focus:border-[#FF6F00] cursor-pointer"
                        placeholder="Qty"
                      />
                      <span className="text-sm text-gray-600">=</span>
                      <span className="font-bold text-lg text-[#FF6F00]">{(item.price * item.quantity).toFixed(2)} €</span>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="btn btn-sm btn-error"
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Total: {total.toFixed(2)} €</h2>
                <button className="btn btn-warning" onClick={() => dispatch(clearCart())}>
                  Vider le panier
                </button>
              </div>

              {/* PayPal Button */}
              <PayPalScriptProvider options={{ "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: "EUR" }}>
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                  createOrder={async () => {
                    try {
                      setError("");
                      const data = await paypalAPI.createOrder({ total });
                      return data.id;
                    } catch (err: any) {
                      console.error("Error creating PayPal order:", err);
                      const errorMessage = err.response?.data?.error || "Erreur lors de la création de la commande";
                      setError(errorMessage);
                      throw err;
                    }
                  }}
                  onApprove={async (data) => {
                    if (!userId) {
                      setError("Vous devez être connecté pour payer !");
                      return;
                    }

                    try {
                      setError("");
                      const result = await paypalAPI.captureOrder(
                        data.orderID,
                        userId,
                        items.map((i) => ({
                          productId: i.id,
                          name: i.name,
                          quantity: i.quantity,
                          price: i.price,
                        }))
                      );

                      if (result.capture && result.invoice) {
                        const shipping = result.capture.purchase_units?.[0]?.shipping;
                        dispatch(clearCart());
                        // Redirection après succès
                        alert(`Paiement réussi ! Commande enregistrée. Livraison : ${shipping?.address?.address_line_1}, ${shipping?.address?.admin_area_2}`);
                        router.push('/profile'); // Redirige vers le profil où l'utilisateur voit ses commandes
                      } else {
                        setError("Erreur lors du paiement.");
                      }
                    } catch (err: any) {
                      console.error("Error capturing PayPal order:", err);
                      const errorMessage = err.response?.data?.error || "Erreur lors de la capture du paiement";
                      setError(errorMessage);
                    }
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}