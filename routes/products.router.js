import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

// ✅ Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

// ✅ Obtener un producto por ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error al obtener producto por ID:", error.message);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
});

// ✅ Crear un nuevo producto
router.post("/", async (req, res) => {
  try {
    const { title, description, price, stock, category, thumbnail } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: "Título y precio son obligatorios" });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      stock,
      category,
      thumbnail,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("❌ Error al crear producto:", error.message);
    res.status(500).json({ error: "Error al crear el producto" });
  }
});

// ✅ Actualizar un producto
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error.message);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

// ✅ Eliminar un producto
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error.message);
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
