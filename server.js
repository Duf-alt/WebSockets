import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import productsRouter from "./routes/products.router.js";
import ProductModel from "./models/Product.js";

dotenv.config();

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// -------------------------
// 🔧 CONFIGURACIÓN BASE
// -------------------------
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// 🧩 RUTAS
// -------------------------
app.use("/api/products", productsRouter);

// Vista principal (home)
app.get("/", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("home", { products });
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
    res.status(500).send("Error al cargar productos");
  }
});

// Vista de productos en tiempo real (WebSockets)
app.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    res.render("realTimeProducts", { products });
  } catch (err) {
    console.error("❌ Error al cargar productos:", err);
    res.status(500).send("Error al cargar productos");
  }
});

// -------------------------
// 💾 CONEXIÓN A MONGODB
// -------------------------
const mongoURL = process.env.MONGO_URL;

if (!mongoURL) {
  console.error("❌ ERROR: No se encontró la variable MONGO_URL en tu archivo .env");
  process.exit(1);
}

try {
  await mongoose.connect(mongoURL);
  console.log("✅ Conectado correctamente a MongoDB");

  // Log de productos al iniciar
  const productos = await ProductModel.find();
  console.log(`🛒 Productos cargados desde MongoDB: ${productos.length}`);
} catch (error) {
  console.error("❌ Error al conectar con MongoDB:", error.message);
}

// -------------------------
// 🚀 SERVIDOR EXPRESS + SOCKET.IO
// -------------------------
const DEFAULT_PORT = 8080;

const startServer = async (port) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Servidor activo en http://localhost:${port}`);
  });

  server.on("error", async (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  El puerto ${port} está en uso. Probando otro...`);
      startServer(port + 1); // intenta el siguiente
    } else {
      console.error("❌ Error al iniciar el servidor:", err);
    }
  });

  // WebSockets
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("🟢 Cliente conectado vía WebSocket");

    // Escuchar creación de producto en tiempo real
    socket.on("nuevoProducto", async (data) => {
      try {
        const nuevoProducto = new ProductModel(data);
        await nuevoProducto.save();
        const productosActualizados = await ProductModel.find().lean();
        io.emit("actualizarProductos", productosActualizados);
      } catch (err) {
        console.error("❌ Error al agregar producto vía socket:", err);
      }
    });

    // Escuchar eliminación de producto
    socket.on("eliminarProducto", async (id) => {
      try {
        await ProductModel.findByIdAndDelete(id);
        const productosActualizados = await ProductModel.find().lean();
        io.emit("actualizarProductos", productosActualizados);
      } catch (err) {
        console.error("❌ Error al eliminar producto vía socket:", err);
      }
    });
  });

  // Middleware para tener acceso a io desde rutas
  app.use((req, res, next) => {
    req.io = io;
    next();
  });
};

startServer(DEFAULT_PORT);
