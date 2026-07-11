/* ============================================================
   SHRISHA ENTERPRISES — cart engine
   Cart state lives in localStorage so it survives navigation
   between pages of the site (Home / Products / Contact).
============================================================ */

const SHRISHA = {
  phone: "919482977380", // whatsapp format, country code no plus
  phoneDisplay: "+91 94829 77380",
  email: "enquiry@shrishaenterprises.com",
  address: "Urvija, 50, 10th Cross, Balaji Krupa Layout, Hegde Nagar, Bengaluru 560077, Karnataka, India"
};

const PRODUCTS = [
  {
    id: "bamboo-balcooa",
    category: "bamboo",
    name: "Bambusa Balcooa",
    sci: "Bambusa balcooa",
    tag: "Bamboo sapling",
    desc: "Bambusa Balcooa is a premium commercial bamboo variety known for its thick-walled culms, vigorous growth, and strong long-term returns. Widely cultivated for construction, furniture, and agroforestry applications, it enjoys consistent industrial demand, making it an ideal choice for farmers seeking a profitable and sustainable plantation crop.",
    img: "images/products/balcooa.webp",
    price: 45,
    unit: "sapling"
  },
  {
    id: "bamboo-tulda",
    category: "bamboo",
    name: "Bambusa Tulda",
    sci: "Bambusa tulda",
    tag: "Bamboo sapling",
    desc: "Bambusa tulda, popularly known as Indian Timber Bamboo, is a fast-growing and highly versatile bamboo variety prized for its straight, durable culms. Strong demand from furniture, handicrafts, paper production, and plantation sectors makes it an excellent choice for growers seeking sustainable long-term returns.",
    img: "images/products/tulda.webp",
    price: 38,
    unit: "sapling"
  },
  {
    id: "banana-yelakki",
    category: "banana",
    name: "Yelakki Banana",
    sci: "Musa cultivar",
    tag: "Banana sapling",
    desc: "Yelakki Banana is a premium, high-value variety known for strong market demand and attractive price realization. With healthy growth, consistent yields, and excellent profitability potential, it is well suited for farmers looking to maximize returns from intensive banana cultivation.",
    img: "images/products/yelakki-banana.webp",
    price: 24,
    unit: "plantlet"
  },
  {
    id: "banana-g9",
    category: "banana",
    name: "G9 Banana",
    sci: "Musa Acuminata (Grand Nain)",
    tag: "Banana sapling",
    desc: "G9 Banana is a proven commercial variety favored by farmers for its high yield potential, uniform bunch quality, and reliable performance. Easy to manage and widely cultivated, it offers dependable harvests, excellent market acceptance and strong returns for both small and large-scale growers.",
    img: "images/products/g9-banana.webp",
    price: 22,
    unit: "plantlet"
  }
];

function getCart(){
  try{
    const raw = localStorage.getItem("shrisha_cart");
    return raw ? JSON.parse(raw) : {};
  }catch(e){ return {}; }
}
function setCart(cart){
  try{ localStorage.setItem("shrisha_cart", JSON.stringify(cart)); }catch(e){}
  updateCartCount();
}
function addToCart(id, qty){
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  setCart(cart);
  showToast(PRODUCTS.find(p=>p.id===id).name + " added to cart");
  renderCartDrawer();
}
function removeFromCart(id){
  const cart = getCart();
  delete cart[id];
  setCart(cart);
  renderCartDrawer();
}
function cartCount(){
  const cart = getCart();
  return Object.values(cart).reduce((a,b)=>a+b,0);
}
function cartTotal(){
  const cart = getCart();
  let total = 0;
  Object.entries(cart).forEach(([id,qty])=>{
    const p = PRODUCTS.find(p=>p.id===id);
    if(p) total += p.price*qty;
  });
  return total;
}
function updateCartCount(){
  document.querySelectorAll("[data-cart-count]").forEach(el=>{
    el.textContent = cartCount();
  });
}

function showToast(msg){
  let t = document.querySelector(".toast");
  if(!t){
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.classList.remove("show"), 2400);
}

/* ---------------- cart drawer ---------------- */
function renderCartDrawer(){
  const itemsEl = document.querySelector(".cart-items");
  const totalEl = document.querySelector("[data-cart-total]");
  if(!itemsEl) return;
  const cart = getCart();
  const entries = Object.entries(cart);
  if(entries.length === 0){
    itemsEl.innerHTML = '<div class="cart-empty">Your cart is empty.<br>Browse the products page to add saplings.</div>';
  } else {
    itemsEl.innerHTML = entries.map(([id,qty])=>{
      const p = PRODUCTS.find(p=>p.id===id);
      if(!p) return "";
      return `<div class="cart-line">
        <div class="cart-line-art"><img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;"></div>
        <div class="cart-line-info">
          <h4>${p.name}</h4>
          <div class="cart-line-meta">${qty} × ₹${p.price} = ₹${qty*p.price}</div>
          <button class="cart-line-remove" onclick="removeFromCart('${id}')">Remove</button>
        </div>
      </div>`;
    }).join("");
  }
  if(totalEl) totalEl.textContent = "₹" + cartTotal();
  document.querySelectorAll("[data-checkout-btn]").forEach(b=> b.disabled = entries.length===0);
}

function toggleCartDrawer(open){
  const drawer = document.querySelector(".cart-drawer");
  const overlay = document.querySelector(".cart-overlay");
  if(!drawer) return;
  const shouldOpen = open !== undefined ? open : !drawer.classList.contains("open");
  drawer.classList.toggle("open", shouldOpen);
  overlay.classList.toggle("open", shouldOpen);
  if(shouldOpen) renderCartDrawer();
}

/* ---------------- order message builders ---------------- */
function buildOrderText(name, phone, place, notes){
  const cart = getCart();
  const entries = Object.entries(cart);
  let lines = [`New order enquiry — Shrisha Enterprises`, ``];
  if(name) lines.push(`Name: ${name}`);
  if(phone) lines.push(`Phone: ${phone}`);
  if(place) lines.push(`Delivery location: ${place}`);
  lines.push(``, `Order:`);
  entries.forEach(([id,qty])=>{
    const p = PRODUCTS.find(p=>p.id===id);
    if(p) lines.push(`- ${p.name} x ${qty} ${p.unit}s = ₹${qty*p.price}`);
  });
  lines.push(``, `Total: ₹${cartTotal()}`);
  if(notes) lines.push(``, `Notes: ${notes}`);
  return lines.join("\n");
}

function sendOrderWhatsapp(name, phone, place, notes){
  const text = buildOrderText(name, phone, place, notes);
  const url = `https://wa.me/${SHRISHA.phone}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
}
function sendOrderEmail(name, phone, place, notes){
  const text = buildOrderText(name, phone, place, notes);
  const subject = encodeURIComponent("Order enquiry — Shrisha Enterprises");
  const body = encodeURIComponent(text);
  window.location.href = `mailto:${SHRISHA.email}?subject=${subject}&body=${body}`;
}

/* ---------------- init on every page ---------------- */
document.addEventListener("DOMContentLoaded", ()=>{
  updateCartCount();
  const openBtns = document.querySelectorAll("[data-open-cart]");
  openBtns.forEach(b=> b.addEventListener("click", ()=> toggleCartDrawer(true)));
  const closeBtn = document.querySelector(".cart-close");
  if(closeBtn) closeBtn.addEventListener("click", ()=> toggleCartDrawer(false));
  const overlay = document.querySelector(".cart-overlay");
  if(overlay) overlay.addEventListener("click", ()=> toggleCartDrawer(false));

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  if(navToggle && navLinks){
    navToggle.addEventListener("click", ()=>{
      const isOpen = navLinks.style.display === "flex";
      navLinks.style.display = isOpen ? "none" : "flex";
      navLinks.style.cssText += isOpen ? "" : "position:absolute;top:64px;left:0;right:0;background:#14231A;flex-direction:column;padding:10px 24px 20px;gap:2px;";
    });
  }

  renderCartDrawer();
});
