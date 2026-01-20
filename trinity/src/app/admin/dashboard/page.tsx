"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI, reportsAPI } from "@/lib/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface KPIData {
  timestamp: string;
  avgPurchaseValue: number;
  totalPurchases30Days: number;
  topProducts: Array<{
    productName: string;
    brand: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  salesByPeriod: {
    last24Hours: { revenue: number; orders: number };
    last7Days: { revenue: number; orders: number };
    last30Days: { revenue: number; orders: number };
  };
  customerMetrics: {
    totalCustomers: number;
    activeCustomersLast30Days: number;
    customerActivityRate: number;
  };
  revenueTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      // Check if user is authenticated and is admin
      if (!authAPI.isAuthenticated()) {
        router.push("/login");
        return;
      }

      if (!authAPI.isAdmin()) {
        router.push("/");
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
        await fetchKPIData();
      } catch (error) {
        console.error("Error loading user data:", error);
        router.push("/login");
      }
    };

    checkAuthAndLoad();
  }, []);

  const fetchKPIData = async () => {
    try {
      const data = await reportsAPI.getLatest();
      setKpiData(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No KPI data available yet
        setKpiData(null);
      } else {
        console.error("Error fetching KPI data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKPIs = async () => {
    setUpdating(true);
    try {
      await reportsAPI.updateKPIs();
      await fetchKPIData();
      alert("KPIs mis à jour avec succès !");
    } catch (error: any) {
      console.error("Error updating KPIs:", error);
      const errorMessage = error.response?.data?.error || "Erreur lors de la mise à jour des KPIs";
      alert(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-[#FF6F00]"></span>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="min-h-screen bg-base-200 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <ChartBarIcon className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold mb-4">Aucune donnée KPI disponible</h2>
            <p className="text-gray-600 mb-8">
              Veuillez générer les KPIs pour voir le tableau de bord.
            </p>
            <button
              onClick={handleUpdateKPIs}
              disabled={updating}
              className="btn btn-primary btn-lg gap-2"
            >
              {updating ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Génération en cours...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-6 h-6" />
                  Générer les KPIs
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const revenueTrendData = {
    labels: kpiData.revenueTrends.map((d) => new Date(d.date).toLocaleDateString("fr-FR")),
    datasets: [
      {
        label: "Revenu (€)",
        data: kpiData.revenueTrends.map((d) => d.revenue),
        borderColor: "#FF6F00",
        backgroundColor: "rgba(255, 111, 0, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const topProductsData = {
    labels: kpiData.topProducts.slice(0, 5).map((p) => p.productName.substring(0, 20)),
    datasets: [
      {
        label: "Quantité vendue",
        data: kpiData.topProducts.slice(0, 5).map((p) => p.totalQuantity),
        backgroundColor: [
          "#FF6F00",
          "#FF8F00",
          "#52B46B",
          "#4A90E2",
          "#9B59B6",
        ],
      },
    ],
  };

  const salesDistributionData = {
    labels: ["24h", "7 jours", "30 jours"],
    datasets: [
      {
        label: "Nombre de commandes",
        data: [
          kpiData.salesByPeriod.last24Hours.orders,
          kpiData.salesByPeriod.last7Days.orders,
          kpiData.salesByPeriod.last30Days.orders,
        ],
        backgroundColor: ["#FF6F00", "#FF8F00", "#52B46B"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Tableau de Bord KPI</h1>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date(kpiData.timestamp).toLocaleString("fr-FR")}
            </p>
          </div>
          <button
            onClick={handleUpdateKPIs}
            disabled={updating}
            className="btn btn-primary gap-2"
          >
            {updating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Mise à jour...
              </>
            ) : (
              <>
                <ArrowPathIcon className="w-5 h-5" />
                Actualiser
              </>
            )}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Average Purchase Value */}
          <div className="stat bg-white shadow rounded-lg">
            <div className="stat-figure text-[#FF6F00]">
              <BanknotesIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Panier Moyen</div>
            <div className="stat-value text-[#FF6F00]">{kpiData.avgPurchaseValue.toFixed(2)}€</div>
            <div className="stat-desc">Sur les 30 derniers jours</div>
          </div>

          {/* Total Orders */}
          <div className="stat bg-white shadow rounded-lg">
            <div className="stat-figure text-[#52B46B]">
              <ShoppingCartIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Commandes (30j)</div>
            <div className="stat-value text-[#52B46B]">{kpiData.totalPurchases30Days}</div>
            <div className="stat-desc">{kpiData.salesByPeriod.last7Days.orders} sur 7 jours</div>
          </div>

          {/* Total Customers */}
          <div className="stat bg-white shadow rounded-lg">
            <div className="stat-figure text-[#4A90E2]">
              <UsersIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Clients Total</div>
            <div className="stat-value text-[#4A90E2]">{kpiData.customerMetrics.totalCustomers}</div>
            <div className="stat-desc">
              {kpiData.customerMetrics.activeCustomersLast30Days} actifs (30j)
            </div>
          </div>

          {/* Revenue 30 Days */}
          <div className="stat bg-white shadow rounded-lg">
            <div className="stat-figure text-[#9B59B6]">
              <ArrowTrendingUpIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Revenu (30j)</div>
            <div className="stat-value text-[#9B59B6]">
              {kpiData.salesByPeriod.last30Days.revenue.toFixed(2)}€
            </div>
            <div className="stat-desc">
              {kpiData.salesByPeriod.last7Days.revenue.toFixed(2)}€ sur 7 jours
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Tendance du Revenu (7 derniers jours)</h3>
            <Line
              data={revenueTrendData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => value + "€",
                    },
                  },
                },
              }}
            />
          </div>

          {/* Sales Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Répartition des Commandes</h3>
            <Doughnut
              data={salesDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Top Products Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-xl font-bold mb-4">Top 5 Produits (Quantité Vendue)</h3>
          <Bar
            data={topProductsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Top Products Table */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Top 10 Produits les Plus Vendus</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Produit</th>
                  <th>Marque</th>
                  <th>Quantité Vendue</th>
                  <th>Revenu Total</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.topProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td className="font-medium">{product.productName}</td>
                    <td>{product.brand}</td>
                    <td>
                      <span className="badge badge-primary">{product.totalQuantity}</span>
                    </td>
                    <td className="font-bold text-[#52B46B]">
                      {product.totalRevenue.toFixed(2)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Activity Rate */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h3 className="text-xl font-bold mb-4">Taux d'Activité des Clients</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <progress
                className="progress progress-primary w-full h-6"
                value={kpiData.customerMetrics.customerActivityRate}
                max="100"
              ></progress>
            </div>
            <div className="text-2xl font-bold">
              {kpiData.customerMetrics.customerActivityRate}%
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            {kpiData.customerMetrics.activeCustomersLast30Days} clients actifs sur{" "}
            {kpiData.customerMetrics.totalCustomers} au total
          </p>
        </div>
      </div>
    </div>
  );
}
