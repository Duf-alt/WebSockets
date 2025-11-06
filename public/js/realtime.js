const socket = io();

const productList = document.getElementById("productList");
const form = document.getElementById("realtimeForm");

socket.on("products", (products) => {
  productList.innerHTML = "";

  products.forEach((p) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    li.innerHTML = `
      <div><strong>${p.title}</strong> - ${p.description} ($${p.price})</div>
      <button class="btn btn-danger btn-sm delete-btn" data-id="${p._id}">Eliminar</button>
    `;
    productList.appendChild(li);
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      socket.emit("deleteProduct", id);
    });
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("rtTitle").value;
  const description = document.getElementById("rtDescription").value;
  const price = document.getElementById("rtPrice").value;
  socket.emit("newProduct", { title, description, price });
  form.reset();
});
