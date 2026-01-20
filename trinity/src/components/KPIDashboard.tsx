'use client';

import React, { useEffect, useState } from 'react';
import { reportsAPI } from '@/lib/api';

interface KPIData {
  _id: string;
  timestamp: string;
  avgPurchaseValue: number;
  totalPurchases30Days: number;
  topProducts: Array<{
    _id: string;
    name: string;
    brand?: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  salesByPeriod: {
    last24Hours: { revenue: number; orderCount: number };
    last7Days: { revenue: number; orderCount: number };
    last30Days: { revenue: number; orderCount: number };
  };
  customerMetrics: {
    totalCustomers: number;
    activeCustomers: number;
    customerActivityRate: number;
  };
  revenueTrends: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  trendingProducts: Array<{
    _id: string;
    name: string;
    brand?: string;
    image_front_url?: string;
    totalSold: number;
  }>;
  totalRevenue: number;
  totalOrders: number;
  avgItemsPerOrder: number;
  revenueGrowthRate: number;
  orderStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  topCategories: Array<{
    _id: string;
    totalSales: number;
  }>;
}

export default function KPIDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsAPI.getLatest();
      setKpiData(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des KPIs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKPIs = async () => {
    try {
      setUpdating(true);
      await reportsAPI.updateKPIs();
      await fetchKPIs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des KPIs');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error}</span>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>Aucune donnée KPI disponible. Cliquez sur &quot;Mettre à jour les KPIs&quot; pour générer les statistiques.</span>
        <button className="btn btn-sm btn-primary" onClick={handleUpdateKPIs} disabled={updating}>
          {updating ? <span className="loading loading-spinner loading-sm"></span> : 'Mettre à jour'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Update Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tableau de bord KPI</h2>
          <p className="text-sm text-gray-600">
            Dernière mise à jour: {new Date(kpiData.timestamp).toLocaleString('fr-FR')}
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleUpdateKPIs}
          disabled={updating}
        >
          {updating ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Mise à jour...
            </>
          ) : (
            'Actualiser les KPIs'
          )}
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Revenu Total</div>
            <div className="stat-value text-primary">{kpiData.totalRevenue.toFixed(2)}€</div>
            <div className="stat-desc">Sur 30 derniers jours</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div className="stat-title">Commandes</div>
            <div className="stat-value text-secondary">{kpiData.totalOrders}</div>
            <div className="stat-desc">Total des commandes</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-accent">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
              </svg>
            </div>
            <div className="stat-title">Panier Moyen</div>
            <div className="stat-value text-accent">{kpiData.avgPurchaseValue.toFixed(2)}€</div>
            <div className="stat-desc">{kpiData.avgItemsPerOrder.toFixed(1)} articles/commande</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="stat-title">Croissance</div>
            <div className="stat-value text-success">{kpiData.revenueGrowthRate.toFixed(1)}%</div>
            <div className="stat-desc">Semaine actuelle vs précédente</div>
          </div>
        </div>
      </div>

      {/* Sales by Period */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Ventes par Période</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">24 Heures</div>
              <div className="stat-value text-sm">{kpiData.salesByPeriod.last24Hours.revenue.toFixed(2)}€</div>
              <div className="stat-desc">{kpiData.salesByPeriod.last24Hours.orderCount} commandes</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">7 Jours</div>
              <div className="stat-value text-sm">{kpiData.salesByPeriod.last7Days.revenue.toFixed(2)}€</div>
              <div className="stat-desc">{kpiData.salesByPeriod.last7Days.orderCount} commandes</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">30 Jours</div>
              <div className="stat-value text-sm">{kpiData.salesByPeriod.last30Days.revenue.toFixed(2)}€</div>
              <div className="stat-desc">{kpiData.salesByPeriod.last30Days.orderCount} commandes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Métriques Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Total Clients</div>
              <div className="stat-value text-primary">{kpiData.customerMetrics.totalCustomers}</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Clients Actifs</div>
              <div className="stat-value text-secondary">{kpiData.customerMetrics.activeCustomers}</div>
              <div className="stat-desc">Ont commandé récemment</div>
            </div>
            <div className="stat bg-base-200 rounded-lg">
              <div className="stat-title">Taux d&apos;Activité</div>
              <div className="stat-value text-accent">{kpiData.customerMetrics.customerActivityRate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Top 10 Produits</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Produit</th>
                  <th>Marque</th>
                  <th>Vendus</th>
                  <th>Revenu</th>
                </tr>
              </thead>
              <tbody>
                {kpiData.topProducts.slice(0, 10).map((product, index) => (
                  <tr key={product._id}>
                    <td className="font-bold">{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.brand || 'N/A'}</td>
                    <td>{product.totalSold}</td>
                    <td className="font-semibold">{product.totalRevenue.toFixed(2)}€</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Trending Products */}
      {kpiData.trendingProducts.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Produits Tendance (7 derniers jours)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {kpiData.trendingProducts.slice(0, 5).map((product) => (
                <div key={product._id} className="card bg-base-200 shadow-sm">
                  {product.image_front_url && (
                    <figure className="px-4 pt-4">
                      <img 
                        src={product.image_front_url} 
                        alt={product.name}
                        className="rounded-xl h-24 w-24 object-cover"
                      />
                    </figure>
                  )}
                  <div className="card-body items-center text-center p-4">
                    <h3 className="text-xs font-semibold line-clamp-2">{product.name}</h3>
                    {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                    <div className="badge badge-primary">{product.totalSold} vendus</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Categories */}
      {kpiData.topCategories.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Top Catégories</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Catégorie</th>
                    <th>Ventes Totales</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.topCategories.map((category, index) => (
                    <tr key={category._id}>
                      <td className="font-bold">{index + 1}</td>
                      <td>{category._id || 'Non catégorisé'}</td>
                      <td className="font-semibold">{category.totalSales.toFixed(2)}€</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Trends Chart */}
      {kpiData.revenueTrends.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Tendance du Revenu (7 derniers jours)</h2>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Revenu</th>
                    <th>Commandes</th>
                  </tr>
                </thead>
                <tbody>
                  {kpiData.revenueTrends.map((trend) => (
                    <tr key={trend.date}>
                      <td>{new Date(trend.date).toLocaleDateString('fr-FR')}</td>
                      <td className="font-semibold">{trend.revenue.toFixed(2)}€</td>
                      <td>{trend.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
