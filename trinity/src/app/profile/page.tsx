"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@shop/store";
import { setUser, logout } from "@shop/userSlice";
import { useRouter } from "next/navigation";
import { authAPI, usersAPI, invoicesAPI } from "@/lib/api";
import Image from "next/image";

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return "/placeholder.png";
  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);
  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    billing: {
      address: "",
      zipCode: "",
      city: "",
      country: "",
    },
    password: "",
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        // Check if user is authenticated
        if (!authAPI.isAuthenticated()) {
          router.push("/login");
          return;
        }

        try {
          // Get current user from backend
          const userData = await authAPI.getCurrentUser();
          dispatch(setUser({ 
            email: userData.email, 
            id: userData._id, 
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            billing: userData.billing,
            isAdmin: userData.isAdmin 
          }));
        } catch (error) {
          console.error("Error loading user data:", error);
          router.push("/login");
        }
      } else {
        setFormData({
          email: user.email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          billing: {
            address: user.billing?.address || "",
            zipCode: user.billing?.zipCode || "",
            city: user.billing?.city || "",
            country: user.billing?.country || ""
          },
          password: "",
        });

        // Load user's purchase history
        loadOrders();
      }
    };

    loadUserData();
  }, [user, dispatch, router]);

  const loadOrders = async () => {
    if (!user) return;
    
    setLoadingOrders(true);
    try {
      const userOrders = await invoicesAPI.getByUserId(user.id);
      setOrders(userOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const updatedUser = await usersAPI.update(user.id, formData);

      dispatch(setUser({ 
        id: user.id, 
        email: updatedUser.email, 
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        billing: updatedUser.billing,
        isAdmin: user.isAdmin 
      }));
      
      setEditing(false);
      setSuccess("Profil mis à jour avec succès !");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.error || "Impossible de mettre à jour le profil";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
          </div>

          <div className="p-8">
            {/* Success/Error Messages */}
            {success && (
              <div className="alert alert-success mb-6 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}
            
            {error && (
              <div className="alert alert-error mb-6 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {!editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Prénom</p>
                    <p className="text-lg font-semibold text-gray-800">{user.firstName || "Non renseigné"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Nom</p>
                    <p className="text-lg font-semibold text-gray-800">{user.lastName || "Non renseigné"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                    <p className="text-lg font-semibold text-gray-800">{user.phone || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Adresse de facturation</h2>
                  <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                    <p className="text-gray-700"><strong>Adresse:</strong> {user.billing?.address || "Non renseignée"}</p>
                    <p className="text-gray-700"><strong>Code postal:</strong> {user.billing?.zipCode || "Non renseigné"}</p>
                    <p className="text-gray-700"><strong>Ville:</strong> {user.billing?.city || "Non renseignée"}</p>
                    <p className="text-gray-700"><strong>Pays:</strong> {user.billing?.country || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setEditing(true)}
                    className="btn bg-[#FF6F00] hover:bg-[#FF8F00] text-white border-none rounded-full px-8 flex-1"
                    disabled={loading}
                  >
                    Modifier mes informations
                  </button>
                  <button
                    onClick={() => authAPI.logout()}
                    className="btn bg-[#52B46B] hover:bg-[#449958] text-white border-none rounded-full px-8"
                    disabled={loading}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Email</span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered rounded-full"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Prénom</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered rounded-full"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Nom</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered rounded-full"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Téléphone</span>
                    </label>
                    <input
                      type="tel"
                      className="input input-bordered rounded-full"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Adresse de facturation</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Adresse</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered rounded-full"
                        value={formData.billing.address}
                        onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, address: e.target.value } })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Code postal</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered rounded-full"
                          value={formData.billing.zipCode}
                          onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, zipCode: e.target.value } })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-semibold">Ville</span>
                        </label>
                        <input
                          type="text"
                          className="input input-bordered rounded-full"
                          value={formData.billing.city}
                          onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, city: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Pays</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered rounded-full"
                        value={formData.billing.country}
                        onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, country: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nouveau mot de passe (optionnel)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Laissez vide pour ne pas changer"
                    className="input input-bordered rounded-full"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSave}
                    className="btn bg-[#52B46B] hover:bg-[#449958] text-white border-none rounded-full px-8 flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Enregistrement...
                      </>
                    ) : (
                      "Sauvegarder"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError("");
                      setFormData({
                        email: user?.email || "",
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || "",
                        phone: user?.phone || "",
                        billing: {
                          address: user?.billing?.address || "",
                          zipCode: user?.billing?.zipCode || "",
                          city: user?.billing?.city || "",
                          country: user?.billing?.country || ""
                        },
                        password: "",
                      });
                    }}
                    className="btn bg-gray-500 hover:bg-gray-600 text-white border-none rounded-full px-8"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Purchase History Section */}
          <div className="card bg-white shadow-2xl rounded-3xl p-8 mt-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Historique des achats</h1>
            
            {loadingOrders ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Aucune commande pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Commande #{order._id.slice(-8)}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#FF6F00]">{(order.total || 0).toFixed(2)}€</p>
                        <span className={`badge ${
                          order.status === 'livrée' ? 'badge-success' :
                          order.status === 'en préparation' ? 'badge-warning' :
                          order.status === 'remboursée' ? 'badge-error' :
                          'badge-info'
                        } text-white`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-semibold text-gray-700">Articles ({order.items?.length || 0}):</p>
                      {order.items?.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                          <Image
                            src={getOpenFoodFactsImageUrl(item.productId) || "/placeholder.png"}
                            alt={item.name || "Product"}
                            width={60}
                            height={60}
                            className="object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="text-gray-700 font-medium">{item.name || item.productId}</p>
                            <p className="text-sm text-gray-500">
                              {(item.price || 0).toFixed(2)}€ × {item.quantity || 0}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              {((item.quantity || 0) * (item.price || 0)).toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
