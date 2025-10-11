const express = require("express");
const router = express.Router();

let carts = [];

// Crear carrito
router.post("/", (req, res) => {
  const newCart = { id: Date.now(), products: [] };
  carts.push(newCart);
  res.status(201).json(newCart);
});

// Obtener carrito por ID
router.get("/:cid", (req, res) => {
  const cart = carts.find(c => c.id === parseInt(req.params.cid));
  cart ? res.json(cart) : res.status(404).json({ error: "Carrito no encontrado" });
});

// Agregar producto a carrito
router.post("/:cid/product/:pid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const pid = parseInt(req.params.pid);
  const cart = carts.find(c => c.id === cid);
  if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
  cart.products.push({ productId: pid });
  res.json(cart);
});

module.exports = router;
