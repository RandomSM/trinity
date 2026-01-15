import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { ObjectId } from "mongodb";
import logger from "../lib/logger";

const routeReport = Router();

// GET / - Get latest KPIs (must be first!)
routeReport.get("/", async (req, res) => {
  logger.info("GET /reports appele");
  try {
    const eshopDb = await connectDB("eshop");
    const kpisCollection = eshopDb.collection("kpis");

    logger.info("Recherche du dernier KPI...");

    // Get the most recent KPI snapshot
    const latestKpi = await kpisCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (latestKpi.length === 0) {
      // Retourne des valeurs par défaut avec la structure complète
      return res.json({
        timestamp: new Date(),
        avgPurchaseValue: 0,
        totalPurchases30Days: 0,
        topProducts: [],
        salesByPeriod: {
          last24Hours: { revenue: 0, orders: 0 },
          last7Days: { revenue: 0, orders: 0 },
          last30Days: { revenue: 0, orders: 0 }
        },
        customerMetrics: {
          totalCustomers: 0,
          activeCustomersLast30Days: 0,
          customerActivityRate: 0
        },
        revenueTrends: [],
        trendingProducts: [],
        totalRevenue: 0,
        totalOrders: 0,
        avgItemsPerOrder: 0,
        revenueGrowthRate: 0,
        orderStatusDistribution: [],
        topCategories: []
      });
    }

    res.json(latestKpi[0]);
  } catch (error) {
    logger.error("Error fetching KPIs:", error);
    res.status(500).json({ 
      error: "Failed to fetch KPIs", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Update KPIs (should be called periodically or after purchases)
// Fixed: productId as strings not ObjectId - FORCED RELOAD
const updateKpisHandler = async (req: any, res: any) => {
  try {
    logger.info("UPDATE KPIs START V2");
    const db = await connectDB();
    const eshopDb = await connectDB("eshop");
    const invoicesCollection = db.collection("invoices");
    const productsCollection = eshopDb.collection("products");
    const usersCollection = db.collection("users");
    const kpisCollection = eshopDb.collection("kpis");

    // Calculate time ranges
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    logger.info("Calculating KPI 1: Average Purchase Value");
    // KPI 1: Average Purchase Value (Last 30 Days)
    const avgPurchaseResult = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last30Days },
          status: { $ne: "remboursée" }
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgValue: { $avg: "$total" },
          count: { $sum: 1 }
        } 
      }
    ]).toArray();

    const avgPurchase = avgPurchaseResult[0]?.avgValue || 0;
    const totalPurchases30Days = avgPurchaseResult[0]?.count || 0;
    logger.info("KPI 1 done:", avgPurchase, totalPurchases30Days);

    logger.info("Calculating KPI 2: Top Products");
    // KPI 2: Top 10 Most Bought Products (All Time)
    const topProductsResult = await invoicesCollection.aggregate([
      { $match: { status: { $ne: "remboursée" } } },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.productId", 
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        } 
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]).toArray();

    logger.info("Top products aggregation result:", JSON.stringify(topProductsResult.slice(0, 2)));

    // Enrich with product details
    const topProducts = await Promise.all(
      topProductsResult.map(async (item: any) => {
        logger.info("Processing product ID:", item._id, "type:", typeof item._id);
        // Les productId sont des strings (codes-barres), pas des ObjectId
        const product = await productsCollection.findOne({ _id: item._id } as any);
        return {
          productId: item._id,
          productName: product?.product_name || "Unknown",
          productImage: product?.image_url || product?.image_front_url || "",
          brand: product?.brands || "",
          totalQuantity: item.totalQuantity,
          totalRevenue: parseFloat((item.totalRevenue || 0).toFixed(2))
        };
      })
    );

    // KPI 3: Total Sales by Period
    const salesLast24h = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last24Hours },
          status: { $ne: "remboursée" }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]).toArray();

    const salesLast7Days = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days },
          status: { $ne: "remboursée" }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]).toArray();

    const salesLast30Days = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last30Days },
          status: { $ne: "remboursée" }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }
    ]).toArray();

    const salesByPeriod = {
      last24Hours: {
        revenue: parseFloat((salesLast24h[0]?.total || 0).toFixed(2)),
        orders: salesLast24h[0]?.count || 0
      },
      last7Days: {
        revenue: parseFloat((salesLast7Days[0]?.total || 0).toFixed(2)),
        orders: salesLast7Days[0]?.count || 0
      },
      last30Days: {
        revenue: parseFloat((salesLast30Days[0]?.total || 0).toFixed(2)),
        orders: salesLast30Days[0]?.count || 0
      }
    };

    // KPI 4: Customer Count and Activity
    const totalCustomers = await usersCollection.countDocuments();
    const activeCustomers = await invoicesCollection.distinct("userId", {
      createdAt: { $gte: last30Days }
    });

    // Additional KPIs
    logger.info("Calculating additional KPIs");
    
    // Total Revenue (All Time)
    const totalRevenueResult = await invoicesCollection.aggregate([
      { $match: { status: { $ne: "remboursée" } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // Total Orders (All Time)
    const totalOrders = await invoicesCollection.countDocuments({ status: { $ne: "remboursée" } });

    // Average Items Per Order
    const avgItemsResult = await invoicesCollection.aggregate([
      { $match: { status: { $ne: "remboursée" } } },
      { $unwind: "$items" },
      { $group: { _id: "$_id", itemCount: { $sum: 1 } } },
      { $group: { _id: null, avgItems: { $avg: "$itemCount" } } }
    ]).toArray();
    const avgItemsPerOrder = avgItemsResult[0]?.avgItems || 0;

    // Order Status Distribution
    const statusDistribution = await invoicesCollection.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();

    // Revenue Growth Rate (compare last 7 days vs previous 7 days)
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const revenueLastWeek = salesLast7Days[0]?.total || 0;
    const revenuePreviousWeek = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: previous7Days, $lt: last7Days },
          status: { $ne: "remboursée" }
        } 
      },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ]).toArray();
    const prevWeekTotal = revenuePreviousWeek[0]?.total || 0;
    const revenueGrowthRate = prevWeekTotal > 0 
      ? parseFloat((((revenueLastWeek - prevWeekTotal) / prevWeekTotal) * 100).toFixed(2))
      : 0;

    // Best Selling Categories
    const categoryStats = await invoicesCollection.aggregate([
      { $match: { status: { $ne: "remboursée" } } },
      { $unwind: "$items" },
      { $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productInfo"
        }
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
      { $group: {
          _id: "$productInfo.categories",
          totalSales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          totalQuantity: { $sum: "$items.quantity" }
        }
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { totalSales: -1 } },
      { $limit: 5 }
    ]).toArray();

    logger.info("Additional KPIs calculated");

    // KPI 5: Revenue Trends (Daily for last 7 days)
    const revenueTrends = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days },
          status: { $ne: "remboursée" }
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const formattedTrends = revenueTrends.map((day: any) => ({
      date: day._id,
      revenue: parseFloat(day.revenue.toFixed(2)),
      orders: day.orders
    }));

    // Bonus: Trending Products (High sales in last 7 days)
    const trendingProducts = await invoicesCollection.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days },
          status: { $ne: "remboursée" }
        } 
      },
      { $unwind: "$items" },
      { 
        $group: { 
          _id: "$items.productId", 
          recentQuantity: { $sum: "$items.quantity" },
          recentRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        } 
      },
      { $sort: { recentQuantity: -1 } },
      { $limit: 20 }
    ]).toArray();

    const trendingProductsEnriched = await Promise.all(
      trendingProducts.map(async (item: any) => {
        // Les productId sont des strings (codes-barres), pas des ObjectId
        const product = await productsCollection.findOne({ _id: item._id } as any);
        return {
          productId: item._id,
          product: product ? {
            _id: product._id,
            code: product.code,
            product_name: product.product_name,
            brands: product.brands,
            image_url: product.image_url || product.image_front_url,
            price: product.price,
            nutriscore_grade: product.nutriscore_grade,
            categories: product.categories,
            stock: product.stock
          } : null,
          recentQuantity: item.recentQuantity,
          recentRevenue: parseFloat((item.recentRevenue || 0).toFixed(2))
        };
      })
    );

    // Store KPIs in database
    const kpiDocument = {
      timestamp: now,
      avgPurchaseValue: parseFloat(avgPurchase.toFixed(2)),
      totalPurchases30Days,
      topProducts,
      salesByPeriod,
      customerMetrics: {
        totalCustomers,
        activeCustomersLast30Days: activeCustomers.length,
        customerActivityRate: totalCustomers > 0 
          ? parseFloat(((activeCustomers.length / totalCustomers) * 100).toFixed(2))
          : 0
      },
      revenueTrends: formattedTrends,
      trendingProducts: trendingProductsEnriched.filter((p: any) => p.product !== null),
      // Additional KPIs
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      avgItemsPerOrder: parseFloat(avgItemsPerOrder.toFixed(2)),
      revenueGrowthRate,
      orderStatusDistribution: statusDistribution,
      topCategories: categoryStats.map((cat: any) => ({
        category: cat._id?.split(',')[0]?.trim() || 'Non catégorisé',
        totalSales: parseFloat((cat.totalSales || 0).toFixed(2)),
        totalQuantity: cat.totalQuantity
      }))
    };

    await kpisCollection.insertOne(kpiDocument);

    // Keep only last 30 KPI snapshots
    const kpiCount = await kpisCollection.countDocuments();
    if (kpiCount > 30) {
      const oldestKpis = await kpisCollection
        .find()
        .sort({ timestamp: 1 })
        .limit(kpiCount - 30)
        .toArray();
      
      const idsToDelete = oldestKpis.map((k: any) => k._id);
      await kpisCollection.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.json({ 
      success: true, 
      message: "KPIs updated successfully",
      kpis: kpiDocument
    });
  } catch (error) {
    logger.error("Error updating KPIs:", error);
    res.status(500).json({ 
      error: "Failed to update KPIs", 
      details: error instanceof Error ? error.message : "Unknown error" 
    });
  }
};

routeReport.post("/update-kpis", updateKpisHandler);
routeReport.get("/update-kpis", updateKpisHandler);

// Get trending products for homepage
routeReport.get("/trending-products", async (req, res) => {
  try {
    const eshopDb = await connectDB("eshop");
    const kpisCollection = eshopDb.collection("kpis");

    const latestKpi = await kpisCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (latestKpi.length === 0 || !latestKpi[0] || !latestKpi[0].trendingProducts) {
      return res.json([]);
    }

    res.json(latestKpi[0].trendingProducts);
  } catch (error) {
    logger.error("Error fetching trending products:", error);
    res.status(500).json({ error: "Failed to fetch trending products" });
  }
});

// Get KPI history
routeReport.get("/history", async (req, res) => {
  try {
    const eshopDb = await connectDB("eshop");
    const kpisCollection = eshopDb.collection("kpis");
    const limit = parseInt(req.query.limit as string) || 7;

    const history = await kpisCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    res.json(history);
  } catch (error) {
    logger.error("Error fetching KPI history:", error);
    res.status(500).json({ error: "Failed to fetch KPI history" });
  }
});

export default routeReport;