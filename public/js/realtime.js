const socket = io();
const form = document.getElementById("productForm");
const list = document.getElementById("productList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  if (!title || isNaN(price)) return alert("Completa todos los campos");

  socket.emit("newProduct", { title, price });
  form.reset();
});

socket.on("productList", (products) => {
  list.innerHTML = "";
  products.forEach((p) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${p.title}</strong> - $${p.price} 
      <button onclick="deleteProduct(${p.id})">❌ Eliminar</button>`;
    list.appendChild(li);
  });
});

function deleteProduct(id) {
  socket.emit("deleteProduct", id);
}
