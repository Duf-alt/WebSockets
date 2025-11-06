// Agregar producto
router.post("/", (req, res) => {
  const products = getProducts();
  const { title, price, description, stock } = req.body;

  if (!title || !price || !description || !stock) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  const newProduct = {
    id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
    title,
    price,
    description,
    stock,
  };

  products.push(newProduct);
  saveProducts(products);

  io.emit("updateProducts", products);

  res.json({ message: "Producto agregado", product: newProduct });
});
