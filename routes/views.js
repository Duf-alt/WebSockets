import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsFile = path.join(__dirname, "../data/products.json");

// Obtener productos
const getProducts = () => {
  if (!fs.existsSync(productsFile)) return [];
  const data = fs.readFileSync(productsFile, "utf-8");
  return JSON.parse(data || "[]");
};

// Vista principal
router.get("/", (req, res) => {
  const products = getProducts();
  res.render("home", { products });
});

// Vista con WebSockets
router.get("/realtimeproducts", (req, res) => {
  const products = getProducts();
  res.render("realTimeProducts", { products });
});

export default router;
