const CATEGORIES = ["All","Nigerian Dishes","Rice Dishes","Swallow and Soups","Pasta and Noodles","Snacks and Small Chops","Cakes and Pastries","Continental Dishes","Drinks"];
const initialMeals = [
 {id:1,name:"Jollof Rice & Chicken",category:"Rice Dishes",price:4500,description:"Smoky party-style jollof served with juicy chicken.",image:"https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=800&q=80",available:true,tag:"Customer favourite"},
 {id:2,name:"Ofada Rice & Sauce",category:"Nigerian Dishes",price:5000,description:"Local rice paired with rich, tasty ayamase sauce.",image:"https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",available:true,tag:""},
 {id:3,name:"Egusi Soup & Pounded Yam",category:"Swallow and Soups",price:5500,description:"A hearty Nigerian classic with a rich, savoury soup.",image:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",available:true,tag:""},
 {id:4,name:"Creamy Chicken Pasta",category:"Pasta and Noodles",price:4800,description:"Creamy pasta tossed with seasoned chicken.",image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",available:true,tag:""},
 {id:5,name:"Small Chops Platter",category:"Snacks and Small Chops",price:6500,description:"A tempting mix of party bites for sharing.",image:"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",available:true,tag:"Perfect for sharing"},
 {id:6,name:"Chocolate Cake Slice",category:"Cakes and Pastries",price:2500,description:"Soft, rich chocolate cake for your sweet moments.",image:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",available:true,tag:""},
 {id:7,name:"Grilled Chicken & Chips",category:"Continental Dishes",price:7000,description:"Well-seasoned grilled chicken with golden fries.",image:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80",available:true,tag:""},
 {id:8,name:"Fresh Fruit Smoothie",category:"Drinks",price:2200,description:"A refreshing fruity blend, served chilled.",image:"https://images.unsplash.com/photo-1502741224143-703d8b4ca3d0?auto=format&fit=crop&w=800&q=80",available:true,tag:""}
];
const money = n => new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
const read = (key,fallback) => { try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback} };
let meals = read("emasMeals",initialMeals);
let cart = read("emasCart",[]);
let orders = read("emasOrders",[]);
let activeCategory = "All", lastOrderText = "";
const $ = s => document.querySelector(s);
const menuGrid=$("#menuGrid"), cartDrawer=$("#cartDrawer"), cartOverlay=$("#cartOverlay");

function save(){localStorage.setItem("emasMeals",JSON.stringify(meals));localStorage.setItem("emasCart",JSON.stringify(cart));localStorage.setItem("emasOrders",JSON.stringify(orders))}
function renderCategories(){
 $("#categoryList").innerHTML=CATEGORIES.map(c=>`<button class="category-chip ${c===activeCategory?"active":""}" data-category="${c}">${c}</button>`).join("");
 $("#adminCategory").innerHTML=CATEGORIES.filter(c=>c!=="All").map(c=>`<option>${c}</option>`).join("");
}
function renderMenu(){
 const q=$("#searchInput").value.trim().toLowerCase();
 const filtered=meals.filter(m=>(activeCategory==="All"||m.category===activeCategory)&&(`${m.name} ${m.description} ${m.category}`).toLowerCase().includes(q));
 menuGrid.innerHTML=filtered.length?filtered.map(m=>`<article class="food-card ${m.available?"":"sold-out"}"><div class="food-image"><img src="${escapeAttr(m.image)}" alt="${escapeAttr(m.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'">${m.tag?`<span class="food-tag">${escapeHtml(m.tag)}</span>`:""}</div><div class="food-info"><h3>${escapeHtml(m.name)}</h3><p>${escapeHtml(m.description)}</p><div class="food-bottom"><span class="food-price">${money(m.price)}</span><button class="add-button" data-add="${m.id}" ${m.available?"":"disabled"} aria-label="Add ${escapeAttr(m.name)} to cart">${m.available?"+":"–"}</button></div></div></article>`).join(""):`<div class="empty-state">No meals found. Try another search or category.</div>`;
}
function escapeHtml(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s=""){return escapeHtml(s)}
function addToCart(id){const meal=meals.find(m=>m.id===id);if(!meal||!meal.available)return;const item=cart.find(i=>i.id===id);if(item)item.qty++;else cart.push({id,qty:1});save();renderCart();toast(`${meal.name} added to your cart.`)}
function changeQty(id,delta){const item=cart.find(i=>i.id===id);if(!item)return;item.qty+=delta;if(item.qty<=0)cart=cart.filter(i=>i.id!==id);save();renderCart()}
function subtotal(){return cart.reduce((sum,i)=>sum+(meals.find(m=>m.id===i.id)?.price||0)*i.qty,0)}
function renderCart(){
 const count=cart.reduce((s,i)=>s+i.qty,0);$("#cartCount").textContent=count;$("#cartSubtotal").textContent=money(subtotal());
 $("#cartItems").innerHTML=cart.length?cart.map(i=>{const m=meals.find(x=>x.id===i.id);if(!m)return"";return `<div class="cart-row"><img src="${escapeAttr(m.image)}" alt=""><div><strong>${escapeHtml(m.name)}</strong><small>${money(m.price)} each</small><div class="qty-controls"><button data-qty="${m.id}" data-delta="-1">−</button><span>${i.qty}</span><button data-qty="${m.id}" data-delta="1">+</button></div></div><button class="remove-item" data-remove="${m.id}">Remove</button></div>`}).join(""):`<div class="empty-state">Your cart is empty.<br>Find something delicious on our menu.</div>`;
}
function openCart(){cartDrawer.classList.add("open");cartOverlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false")}
function closeCart(){cartDrawer.classList.remove("open");cartOverlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true")}
function showModal(id){$("#"+id).classList.add("show");document.body.style.overflow="hidden"}
function hideModal(id){$("#"+id).classList.remove("show");if(!document.querySelector(".modal-backdrop.show"))document.body.style.overflow=""}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2500)}
function renderAdmin(){
 $("#adminItemCount").textContent=meals.length;$("#adminOrderCount").textContent=orders.length;
 $("#adminMenuList").innerHTML=meals.map(m=>`<div class="admin-menu-row"><span><strong>${escapeHtml(m.name)}</strong><br><small>${escapeHtml(m.category)} · ${money(m.price)}</small></span><span><button data-toggle="${m.id}">${m.available?"Mark sold out":"Mark available"}</button> <button data-delete="${m.id}">Remove</button></span></div>`).join("");
 $("#adminOrders").innerHTML=orders.length?orders.slice().reverse().map(o=>`<div class="admin-order-row"><span><strong>${escapeHtml(o.name)}</strong><br><small>${escapeHtml(o.reference)} · ${escapeHtml(o.phone)} · ${money(o.total)}</small></span><span>${escapeHtml(o.status)}</span></div>`).join(""):"<p class='menu-footnote'>No demo orders yet.</p>";
}
function deliveryFee(){return document.querySelector('[name="fulfilment"]:checked').value==="delivery"?1500:0}
function updateCheckoutTotal(){$("#checkoutTotal").textContent=money(subtotal()+deliveryFee())}
function toggleAddress(){const pickup=document.querySelector('[name="fulfilment"]:checked').value==="pickup";$("#deliveryAddress").required=!pickup;$("#addressLabel").style.display=pickup?"none":"block";updateCheckoutTotal()}
function orderMessage(order){
 const lines=order.items.map(i=>`${i.qty} x ${i.name} — ${money(i.price*i.qty)}`).join("\n");
 return `Hello Ema's Kitchen, I would like to place this order.\nOrder: ${order.reference}\nName: ${order.name}\nPhone: ${order.phone}\nType: ${order.fulfilment}\n${order.address?`Address: ${order.address}\n`:""}Items:\n${lines}\nSubtotal: ${money(order.subtotal)}\nDelivery: ${money(order.delivery)}\nTotal: ${money(order.total)}\nPayment preference: ${order.payment}\nDate/time: ${order.date} / ${order.time}\nNotes: ${order.notes||"None"}`;
}
$("#menuToggle").addEventListener("click",()=>{const nav=$("#mainNav");nav.classList.toggle("open");$("#menuToggle").setAttribute("aria-expanded",nav.classList.contains("open"))});
$("#mainNav").addEventListener("click",e=>{if(e.target.closest("a"))$("#mainNav").classList.remove("open")});
$("#categoryList").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;renderCategories();renderMenu()});
$("#searchInput").addEventListener("input",renderMenu);
menuGrid.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(b)addToCart(Number(b.dataset.add))});
$("#cartOpen").addEventListener("click",openCart);$("#cartClose").addEventListener("click",closeCart);cartOverlay.addEventListener("click",closeCart);
$("#cartItems").addEventListener("click",e=>{const q=e.target.closest("[data-qty]"),r=e.target.closest("[data-remove]");if(q)changeQty(Number(q.dataset.qty),Number(q.dataset.delta));if(r){cart=cart.filter(i=>i.id!==Number(r.dataset.remove));save();renderCart()}});
$("#checkoutStart").addEventListener("click",()=>{if(!cart.length){toast("Add a meal to your cart first.");return}closeCart();$("#orderDate").min=new Date().toISOString().slice(0,10);$("#orderDate").value=new Date().toISOString().slice(0,10);toggleAddress();showModal("checkoutModal")});
document.querySelectorAll('[name="fulfilment"]').forEach(r=>r.addEventListener("change",toggleAddress));
$("#checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();if(!cart.length){hideModal("checkoutModal");toast("Your cart is empty.");return}
 const f=new FormData(e.currentTarget),fulfilment=f.get("fulfilment"),sub=subtotal(),fee=fulfilment==="delivery"?1500:0;
 const order={reference:"EMA-"+Date.now().toString().slice(-7),name:f.get("name"),phone:f.get("phone"),email:f.get("email"),fulfilment,address:fulfilment==="delivery"?f.get("address"):"",date:f.get("date"),time:f.get("time"),payment:f.get("payment"),notes:f.get("notes"),items:cart.map(i=>{const m=meals.find(x=>x.id===i.id);return{name:m.name,price:m.price,qty:i.qty}}),subtotal:sub,delivery:fee,total:sub+fee,status:"Awaiting confirmation"};
 orders.push(order);save();lastOrderText=orderMessage(order);cart=[];save();renderCart();renderAdmin();hideModal("checkoutModal");
 $("#confirmationText").textContent=`Your demo order ${order.reference} has been prepared. Send the order details to the restaurant through WhatsApp to confirm it. No payment has been taken.`;
 showModal("confirmationModal");e.currentTarget.reset();toggleAddress();
});
$("#whatsappOrder").addEventListener("click",()=>{const phone="2340000000000";window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lastOrderText)}`,"_blank","noopener")});
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>hideModal(b.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(back=>back.addEventListener("click",e=>{if(e.target===back)hideModal(back.id)}));
$("#adminOpen").addEventListener("click",()=>{renderAdmin();showModal("adminModal")});
$("#addItemForm").addEventListener("submit",e=>{e.preventDefault();const f=new FormData(e.currentTarget);meals.push({id:Date.now(),name:f.get("name"),category:f.get("category"),price:Number(f.get("price")),description:"Freshly prepared at Ema’s Kitchen.",image:f.get("image")||initialMeals[0].image,available:true,tag:""});save();renderMenu();renderAdmin();e.currentTarget.reset();toast("Menu item added.")});
$("#adminMenuList").addEventListener("click",e=>{const t=e.target.closest("[data-toggle]"),d=e.target.closest("[data-delete]");if(t){const m=meals.find(x=>x.id===Number(t.dataset.toggle));m.available=!m.available}if(d)meals=meals.filter(x=>x.id!==Number(d.dataset.delete));save();renderMenu();renderAdmin()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();document.querySelectorAll(".modal-backdrop.show").forEach(m=>hideModal(m.id))}});
$("#whatsappLink").href="https://wa.me/2340000000000";
$("#year").textContent=new Date().getFullYear();
renderCategories();renderMenu();renderCart();renderAdmin();
