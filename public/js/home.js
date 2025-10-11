const socket = io();
const form = document.getElementById("productForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const price = parseFloat(document.getElementById("price").value);
  if (!title || isNaN(price)) return alert("Completa todos los campos");

  socket.emit("newProduct", { title, price });
  form.reset();
});
