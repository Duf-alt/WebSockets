const express = require("express");
const router = express.Router();

let products = [
  { id: 1, title: "Mouse", price: 50 },
  { id: 2, title: "Teclado", price: 80 }
];

// Obtener todos
router.get("/", (req, res) => res.json(products));

// Obtener por ID
router.get("/:pid", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.pid));
  product ? res.json(product) : res.status(404).json({ error: "Producto no encontrado" });
});

// Crear nuevo
router.post("/", (req, res) => {
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Actualizar
router.put("/:pid", (req, res) => {
  const pid = parseInt(req.params.pid);
  const index = products.findIndex(p => p.id === pid);
  if (index === -1) return res.status(404).json({ error: "Producto no encontrado" });
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

// Eliminar
router.delete("/:pid", (req, res) => {
  const pid = parseInt(req.params.pid);
  products = products.filter(p => p.id !== pid);
  res.json({ message: "Producto eliminado" });
});

module.exports = router;
