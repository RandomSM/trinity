"use client";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@shop/store";
import { setUser } from "@shop/userSlice";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { authAPI, usersAPI, invoicesAPI } from "@/lib/api";

function getOpenFoodFactsImageUrl(barcode: string) {
  if (!barcode || barcode.length < 13) return "/placeholder.png";
  const part1 = barcode.slice(0, 3);
  const part2 = barcode.slice(3, 6);
  const part3 = barcode.slice(6, 9);
  const part4 = barcode.slice(9);
  return `https://images.openfoodfacts.org/images/products/${part1}/${part2}/${part3}/${part4}/front_fr.4.400.jpg`;
}

interface UserDetail {
  _id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  billing: {
    address: string | null;
    zipCode: string | null;
    city: string | null;
    country: string | null;
  };
  isAdmin: boolean;
}

interface InvoiceItem {
  name: string;
  barcode: string;
  productId: string;
  price: number;
  quantity: number;
}

interface Shipping {
  name?: {
    full_name?: string;
  };
  address?: {
    address_line_1?: string;
    admin_area_2?: string;
    postal_code?: string;
    country_code?: string;
  };
}

interface Invoice {
  _id: string;
  userId: string;
  amount: number;
  status: string;
  deliveryStatus?: string;
  paypalCaptureId?: string;
  createdAt: string;
  items: InvoiceItem[];
  shipping?: Shipping;
}

export default function AdminUserDetailPage() {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editing, setEditing] = useState(false);
  const [expandedInvoices, setExpandedInvoices] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Map<string, Map<number, number>>>(new Map()); // invoiceId -> Map(itemIndex -> quantity)
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
    isAdmin: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        if (!authAPI.isAuthenticated()) {
          router.push("/login");
          return;
        }

        try {
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
          
          if (!userData.isAdmin) {
            router.push("/");
            return;
          }
          
          setCheckingAuth(false);
        } catch (err) {
          console.error(err);
          router.push("/login");
        }
        return;
      }
      
      if (!user.isAdmin) {
        router.push("/");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [user, dispatch, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (checkingAuth || !user?.isAdmin || !userId) return;

      try {
        setLoading(true);
        console.log(`Chargement des données pour l'utilisateur: ${userId}`);
        
        const [userData, userInvoices] = await Promise.all([
          usersAPI.getById(userId),
          invoicesAPI.getByUserId(userId)
        ]);

        console.log("Données utilisateur reçues:", userData);
        setUserDetail(userData);
        setFormData({
          email: userData.email,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          phone: userData.phone || "",
          billing: userData.billing || { address: "", zipCode: "", city: "", country: "" },
          isAdmin: userData.isAdmin || false,
        });
        
        console.log("Factures reçues:", userInvoices);
        setInvoices(userInvoices);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Utilisateur non trouvé";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [checkingAuth, user, userId]);

  const handleSave = async () => {
    try {
      await usersAPI.adminEdit(userId, formData);
      setUserDetail({ _id: userId, ...formData });
      setEditing(false);
      alert("Utilisateur mis à jour avec succès !");
    } catch (err) {
      console.error(err);
      const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Impossible de mettre à jour l'utilisateur";
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    try {
      await usersAPI.adminDelete(userId);
      alert("Utilisateur supprimé avec succès !");
      router.push("/admin");
    } catch (err) {
      console.error(err);
      const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Impossible de supprimer l'utilisateur";
      alert(errorMessage);
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette commande ?")) return;

    try {
      await invoicesAPI.delete(invoiceId);
      setInvoices(invoices.filter((inv) => inv._id !== invoiceId));
      alert("Commande supprimée avec succès !");
    } catch (err) {
      console.error(err);
      const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Impossible de supprimer la commande";
      alert(errorMessage);
    }
  };

  const toggleInvoice = (invoiceId: string) => {
    const newExpanded = new Set(expandedInvoices);
    if (newExpanded.has(invoiceId)) {
      newExpanded.delete(invoiceId);
    } else {
      newExpanded.add(invoiceId);
    }
    setExpandedInvoices(newExpanded);
  };

  const toggleItemSelection = (invoiceId: string, itemIndex: number, maxQuantity: number) => {
    const newSelected = new Map(selectedItems);
    const itemMap = newSelected.get(invoiceId) || new Map<number, number>();
    
    if (itemMap.has(itemIndex)) {
      itemMap.delete(itemIndex);
    } else {
      itemMap.set(itemIndex, maxQuantity); // Default to full quantity
    }
    
    if (itemMap.size > 0) {
      newSelected.set(invoiceId, itemMap);
    } else {
      newSelected.delete(invoiceId);
    }
    
    setSelectedItems(newSelected);
  };

  const updateRefundQuantity = (invoiceId: string, itemIndex: number, quantity: number, maxQuantity: number) => {
    const newSelected = new Map(selectedItems);
    const itemMap = newSelected.get(invoiceId) || new Map<number, number>();
    
    const clampedQty = Math.max(1, Math.min(quantity, maxQuantity));
    itemMap.set(itemIndex, clampedQty);
    newSelected.set(invoiceId, itemMap);
    setSelectedItems(newSelected);
  };

  const selectAllItems = (invoiceId: string, items: InvoiceItem[]) => {
    const newSelected = new Map(selectedItems);
    const itemMap = new Map<number, number>();
    items.forEach((item, idx) => {
      itemMap.set(idx, item.quantity);
    });
    newSelected.set(invoiceId, itemMap);
    setSelectedItems(newSelected);
  };

  const deselectAllItems = (invoiceId: string) => {
    const newSelected = new Map(selectedItems);
    newSelected.delete(invoiceId);
    setSelectedItems(newSelected);
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "payée" || status === "paid") return "badge-success";
    if (status === "remboursée") return "badge-error";
    if (status === "partiellement remboursée") return "badge-warning";
    return "badge-warning";
  };

  const getDeliveryStatusBadgeClass = (deliveryStatus: string) => {
    if (deliveryStatus === "en préparation") return "badge-info";
    if (deliveryStatus === "expédiée") return "badge-primary";
    if (deliveryStatus === "livrée") return "badge-success";
    if (deliveryStatus === "annulée") return "badge-error";
    return "badge-ghost";
  };

  const handleRefund = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv._id === invoiceId);
    
    if (invoice?.deliveryStatus !== "en préparation") {
      alert("Le remboursement n’est possible que pour les commandes en préparation (produits alimentaires)");
      return;
    }

    const selected = selectedItems.get(invoiceId);
    const itemsToRefund: Array<{index: number, quantity: number}> = [];

    if (selected && selected.size > 0 && invoice) {
      selected.forEach((qty, idx) => {
        const item = invoice.items[idx];
        if (item) {
          itemsToRefund.push({ index: idx, quantity: qty });
        }
      });
    }

    const refundMessage = itemsToRefund.length > 0
      ? `Voulez-vous rembourser ${itemsToRefund.length} article(s) sélectionné(s) ?`
      : `Voulez-vous vraiment rembourser toute la commande ?`;

    if (!confirm(refundMessage)) return;

    try {
      const response = await invoicesAPI.refund(invoiceId, itemsToRefund.length > 0 ? itemsToRefund : undefined);

      const updatedInvoices = await invoicesAPI.getByUserId(userId);
      setInvoices(updatedInvoices);
      
      deselectAllItems(invoiceId);
      
      const refundAmountMsg = response.refundAmount ? ` (${response.refundAmount}€)` : '';
      alert(`${response.message || "Remboursement effectué avec succès !"}${refundAmountMsg}`);
    } catch (err) {
      console.error(err);
      const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Impossible d'effectuer le remboursement";
      alert(errorMessage);
    }
  };

  const updateDeliveryStatus = async (invoiceId: string, newStatus: string) => {
    try {
      await invoicesAPI.update(invoiceId, { deliveryStatus: newStatus });

      setInvoices(invoices.map(inv => 
        inv._id === invoiceId ? { ...inv, deliveryStatus: newStatus } : inv
      ));
      
      alert("Statut de livraison mis à jour !");
    } catch (err) {
      console.error(err);
      const errorMessage = (err as {response?: {data?: {error?: string}}})?.response?.data?.error || "Impossible de mettre à jour le statut";
      alert(errorMessage);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  if (!userDetail) {
    return <p className="text-center mt-10">Utilisateur non trouvé</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin" className="btn btn-sm bg-gray-200 text-gray-800 border-none rounded-full mb-6 h-auto py-2 px-4">
          ← Retour à la liste
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] px-8 py-6">
            <h1 className="text-3xl font-bold text-white">Détails de l&apos;utilisateur</h1>
          </div>

          <div className="p-8">
            {editing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label" htmlFor="email"><span className="label-text font-semibold">Email</span></label>
                    <input
                      id="email"
                      type="email"
                      className="input input-bordered rounded-full"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label" htmlFor="firstName"><span className="label-text font-semibold">Prénom</span></label>
                    <input
                      id="firstName"
                      type="text"
                      className="input input-bordered rounded-full"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label" htmlFor="lastName"><span className="label-text font-semibold">Nom</span></label>
                    <input
                      id="lastName"
                      type="text"
                      className="input input-bordered rounded-full"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label" htmlFor="phone"><span className="label-text font-semibold">Téléphone</span></label>
                    <input
                      id="phone"
                      type="tel"
                      className="input input-bordered rounded-full"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.isAdmin}
                      onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                    />
                    <span className="label-text font-semibold">Administrateur</span>
                  </label>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Adresse de facturation</h3>
                  <div className="space-y-4">
                    <div className="form-control">
                      <label className="label" htmlFor="address"><span className="label-text font-semibold">Adresse</span></label>
                      <input
                        id="address"
                        type="text"
                        className="input input-bordered rounded-full"
                        value={formData.billing.address}
                        onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, address: e.target.value } })}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="form-control">
                        <label className="label" htmlFor="zipCode"><span className="label-text font-semibold">Code postal</span></label>
                        <input
                          id="zipCode"
                          type="text"
                          className="input input-bordered rounded-full"
                          value={formData.billing.zipCode}
                          onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, zipCode: e.target.value } })}
                        />
                      </div>
                      <div className="form-control">
                        <label className="label" htmlFor="city"><span className="label-text font-semibold">Ville</span></label>
                        <input
                          id="city"
                          type="text"
                          className="input input-bordered rounded-full"
                          value={formData.billing.city}
                          onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, city: e.target.value } })}
                        />
                      </div>
                    </div>
                    <div className="form-control">
                      <label className="label" htmlFor="country"><span className="label-text font-semibold">Pays</span></label>
                      <input
                        id="country"
                        type="text"
                        className="input input-bordered rounded-full"
                        value={formData.billing.country}
                        onChange={(e) => setFormData({ ...formData, billing: { ...formData.billing, country: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleSave}
                    className="btn bg-[#52B46B] hover:bg-[#449958] text-white border-none rounded-full px-8 flex-1"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn btn-outline rounded-full px-8"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-800">{userDetail.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Prénom</p>
                    <p className="text-lg font-semibold text-gray-800">{userDetail.firstName || "Non renseigné"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Nom</p>
                    <p className="text-lg font-semibold text-gray-800">{userDetail.lastName || "Non renseigné"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                    <p className="text-lg font-semibold text-gray-800">{userDetail.phone || "Non renseigné"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Statut</p>
                    {userDetail.isAdmin ? (
                      <span className="badge badge-success text-white">Administrateur</span>
                    ) : (
                      <span className="badge badge-ghost">Utilisateur</span>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Adresse de facturation</h2>
                  <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                    <p className="text-gray-700"><strong>Adresse:</strong> {userDetail.billing?.address || "Non renseignée"}</p>
                    <p className="text-gray-700"><strong>Code postal:</strong> {userDetail.billing?.zipCode || "Non renseigné"}</p>
                    <p className="text-gray-700"><strong>Ville:</strong> {userDetail.billing?.city || "Non renseignée"}</p>
                    <p className="text-gray-700"><strong>Pays:</strong> {userDetail.billing?.country || "Non renseigné"}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setEditing(true)}
                    className="btn bg-[#FF6F00] hover:bg-[#FF8F00] text-white border-none rounded-full px-8"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn bg-red-500 hover:bg-red-600 text-white border-none rounded-full px-8 h-auto py-3"
                  >
                    Supprimer l&apos;utilisateur
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#52B46B] to-[#449958] px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Historique des commandes</h2>
          </div>

          <div className="p-8">
            {invoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune commande</p>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => {
                  const isExpanded = expandedInvoices.has(invoice._id);
                  return (
                    <div key={invoice._id} className="bg-gray-50 rounded-xl overflow-hidden">
                      {/* Header */}
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">Commande #{invoice._id.slice(-6)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className={`badge ${getStatusBadgeClass(invoice.status)}`}>
                              {invoice.status}
                            </span>
                            {invoice.deliveryStatus && (
                              <span className={`badge ${getDeliveryStatusBadgeClass(invoice.deliveryStatus)}`}>
                                {invoice.deliveryStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleInvoice(invoice._id)}
                            className="btn btn-sm bg-[#FF6F00] hover:bg-[#FF8F00] text-white border-none rounded-full h-auto py-2 px-4"
                          >
                            {isExpanded ? "Réduire" : "Détails"}
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice._id)}
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none rounded-full h-auto py-2 px-4"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-6 bg-white">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">Articles commandés</h3>
                            {invoice.deliveryStatus === "en préparation" && invoice.status !== "remboursée" && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => selectAllItems(invoice._id, invoice.items)}
                                  className="btn btn-sm btn-outline"
                                >
                                  Tout sélectionner
                                </button>
                                <button
                                  onClick={() => deselectAllItems(invoice._id)}
                                  className="btn btn-sm btn-outline"
                                >
                                  Tout désélectionner
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3 mb-6">
                            {invoice.items.map((item, idx) => {
                              const itemMap = selectedItems.get(invoice._id);
                              const isSelected = itemMap?.has(idx) || false;
                              const refundQty = itemMap?.get(idx) || item.quantity;
                              return (
                              <div key={`${invoice._id}-item-${idx}`} className={`flex items-center gap-4 p-4 rounded-lg ${isSelected ? 'bg-orange-50 border-2 border-orange-300' : 'bg-gray-50'}`}>
                                {invoice.deliveryStatus === "en préparation" && invoice.status !== "remboursée" && (
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleItemSelection(invoice._id, idx, item.quantity)}
                                    className="checkbox checkbox-warning"
                                  />
                                )}
                                <Image
                                  src={getOpenFoodFactsImageUrl(item.productId)}
                                  alt={item.name || "Product"}
                                  width={80}
                                  height={80}
                                  className="rounded-lg object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder.png";
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-800">{item.name}</p>
                                  <p className="text-sm text-gray-500">ID: {item.productId}</p>
                                  {item.price && (
                                    <p className="text-sm text-gray-500">
                                      {(item.price || 0).toFixed(2)}€ × {item.quantity || 0}
                                    </p>
                                  )}
                                </div>
                                {isSelected && invoice.deliveryStatus === "en préparation" && (
                                  <div className="flex flex-col items-center gap-1">
                                    <label htmlFor={`refund-qty-${invoice._id}-${idx}`} className="text-xs text-gray-600">Qté à rembourser</label>
                                    <input
                                      id={`refund-qty-${invoice._id}-${idx}`}
                                      type="number"
                                      min="1"
                                      max={item.quantity}
                                      value={refundQty}
                                      onChange={(e) => updateRefundQuantity(invoice._id, idx, Number.parseInt(e.target.value) || 1, item.quantity)}
                                      className="input input-bordered input-sm w-20 text-center"
                                    />
                                  </div>
                                )}
                                <div className="text-right">
                                  <p className="font-semibold text-gray-800">Quantité: {item.quantity}</p>
                                  {item.price && (
                                    <p className="font-semibold text-gray-800">
                                      {((item.quantity || 0) * (item.price || 0)).toFixed(2)}€
                                    </p>
                                  )}
                                  {isSelected && item.price && refundQty < item.quantity && (
                                    <p className="text-sm text-orange-600 font-semibold">
                                      Remb: {((refundQty || 0) * (item.price || 0)).toFixed(2)}€
                                    </p>
                                  )}
                                </div>
                              </div>
                            )})}
                          </div>

                          {invoice.shipping && (
                            <div className="mb-6">
                              <h3 className="font-semibold text-gray-800 mb-3">Adresse de livraison</h3>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700"><strong>Nom:</strong> {invoice.shipping.name?.full_name || "N/A"}</p>
                                <p className="text-gray-700"><strong>Adresse:</strong> {invoice.shipping.address?.address_line_1 || "N/A"}</p>
                                <p className="text-gray-700">
                                  <strong>Ville:</strong> {invoice.shipping.address?.admin_area_2 || "N/A"}, {invoice.shipping.address?.postal_code || "N/A"}
                                </p>
                                <p className="text-gray-700"><strong>Pays:</strong> {invoice.shipping.address?.country_code || "N/A"}</p>
                              </div>
                            </div>
                          )}

                          <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">Statut de livraison</h3>
                            <select 
                              className="select select-bordered w-full max-w-xs"
                              value={invoice.deliveryStatus || "en préparation"}
                              onChange={(e) => updateDeliveryStatus(invoice._id, e.target.value)}
                              disabled={invoice.status === "remboursée"}
                            >
                              <option value="en préparation">En préparation</option>
                              <option value="expédiée">Expédiée</option>
                              <option value="livrée">Livrée</option>
                              <option value="annulée">Annulée</option>
                            </select>
                          </div>

                          <div className="flex gap-3">
                            {invoice.deliveryStatus === "en préparation" && invoice.status !== "remboursée" && (
                              <>
                                <button
                                  onClick={() => handleRefund(invoice._id)}
                                  className="btn bg-yellow-500 hover:bg-yellow-600 text-white border-none rounded-full h-auto py-2 px-6"
                                >
                                  {selectedItems.get(invoice._id)?.size 
                                    ? `Rembourser ${selectedItems.get(invoice._id)?.size} article(s)`
                                    : "Rembourser tout"}
                                </button>
                                {selectedItems.get(invoice._id)?.size && selectedItems.get(invoice._id)!.size < invoice.items.length && (
                                  <span className="text-sm text-gray-600 flex items-center">
                                    (Remboursement partiel)
                                  </span>
                                )}
                              </>
                            )}
                            {invoice.deliveryStatus !== "en préparation" && invoice.status !== "remboursée" && (
                              <p className="text-sm text-gray-500 italic">
                                Le remboursement n&apos;est plus possible (produits alimentaires déjà expédiés ou livrés)
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
