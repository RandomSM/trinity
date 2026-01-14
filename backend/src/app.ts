import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users";
import routeProducts from "./routes/products";
import routerPaypal from "./routes/paypal";
import invoiceRoutes from "./routes/invoices";
import routeReport from "./routes/reports";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

// Log de toutes les requêtes (MUST BE BEFORE ROUTES)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Route de test pour vérifier que le serveur fonctionne
app.get("/health", (req, res) => {
  console.log("=== HEALTH CHECK appelé ===");
  res.json({ status: "OK", message: "Backend is running", port: 4000 });
});

app.use("/users", usersRoutes);
app.use("/products", routeProducts);
app.use("/paypal", routerPaypal);
app.use("/invoices", invoiceRoutes);
app.use("/reports", routeReport);

export default app;
