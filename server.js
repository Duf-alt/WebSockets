import express from "express";
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import net from "net";

const app = express();

// Obtener rutas absolutas (para ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Archivo de productos (persistencia local)
const productsFile = path.join(__dirname, "products.json");

// Leer productos desde el archivo
const getProducts = () => {
  if (!fs.existsSync(productsFile)) return [];
  const data = fs.readFileSync(productsFile, "utf-8");
  return JSON.parse(data || "[]");
};

// Guardar productos en el archivo
const saveProducts = (products) => {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
};

// Rutas básicas
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/realtimeproducts", (req, res) => {
  const products = getProducts();
  res.render("realTimeProducts", { products });
});

// ------------------------------------------------------
// 🧠 Función para detectar el primer puerto disponible
// ------------------------------------------------------
const DEFAULT_PORT = 8080;

const findAvailablePort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.on("error", () => {
      resolve(findAvailablePort(port + 1)); // prueba el siguiente
    });
    server.listen(port, () => {
      server.close(() => {
        resolve(port);
      });
    });
  });
};

// ------------------------------------------------------
// 🚀 Iniciar el servidor con puerto disponible
// ------------------------------------------------------
findAvailablePort(DEFAULT_PORT).then((PORT) => {
  const httpServer = app.listen(PORT, () =>
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`)
  );

  // ------------------------------------------------------
  // 🔌 WebSockets (Socket.io)
  // ------------------------------------------------------
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("🟢 Nuevo cliente conectado");

    // Escucha de producto nuevo
    socket.on("newProduct", (product) => {
      const products = getProducts();
      products.push(product);
      saveProducts(products);
      io.emit("updateProducts", products);
    });

    // Escucha de eliminación
    socket.on("deleteProduct", (id) => {
      let products = getProducts();
      products = products.filter((p) => p.id !== id);
      saveProducts(products);
      io.emit("updateProducts", products);
    });
  });
});
