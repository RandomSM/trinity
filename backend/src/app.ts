import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users";
import routeProducts from "./routes/products";
import routerPaypal from "./routes/paypal";
import invoiceRoutes from "./routes/invoices";
import routeReport from "./routes/reports";
import logger from "./lib/logger";

const app = express();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  logger.info("HEALTH CHECK appele");
  res.json({ status: "OK", message: "Backend is running", port: 4000 });
});

app.use("/users", usersRoutes);
app.use("/products", routeProducts);
app.use("/paypal", routerPaypal);
app.use("/invoices", invoiceRoutes);
app.use("/reports", routeReport);

export default app;
