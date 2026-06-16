
/* GLOBAL ELEMENTS */
const cartIcon=document.querySelector(".cart-icon");
const cartTab=document.querySelector(".cart-tab");
const closeBtn=document.querySelector(".close-btn");
const cardList=document.querySelector(".card-list");
const cartList=document.querySelector(".cart-list");
const cartTotal=document.querySelector(".cart-total");
const cartValue=document.querySelector(".cart-value");
const hamburger=document.querySelector(".hamburger");
const mobileMenu=document.querySelector(".mobile-menu");

if(cartIcon) cartIcon.onclick=()=>cartTab.classList.add("cart-tab-active");
if(closeBtn) closeBtn.onclick=()=>cartTab.classList.remove("cart-tab-active");
if(hamburger) hamburger.onclick=()=>mobileMenu.classList.toggle("mobile-menu-active");

let productList=[];
let cartProduct=[];

const updateTotals=()=>{
let total=0,qty=0;
document.querySelectorAll(".item").forEach(item=>{
    const price=parseFloat(item.querySelector(".item-total").textContent.replace("Rs.",""));
    const q=parseInt(item.querySelector(".quantity-value").textContent);
    total+=price; qty+=q;
});
cartTotal.textContent=`Rs.${total.toFixed(2)}`;
cartValue.textContent=qty;
};

/* ADD PRODUCTS HOME PAGE */
const loadHomeProducts=()=>{

if(!cardList) return;

productList.forEach(p=>{
    const card=document.createElement("div");
    card.className="order-card";
    card.innerHTML=`
        <div class="card-image"><img src="${p.image}"> </div>
        <h5>${p.name}</h5>
        <h5 class="price">${p.price}</h5>
        <a class="btn card-btn">Add to Cart</a>
    `;
    cardList.appendChild(card);

    card.querySelector(".card-btn").onclick=e=>{
        e.preventDefault(); addToCart(p);
    };
});
};

/* ADD TO CART */
function addToCart(p){
if(cartProduct.some(i=>i.id===p.id)) return alert("Already in cart!");

cartProduct.push(p);
let qty=1, price=parseFloat(p.price.replace("Rs.",""));

const item=document.createElement("div");
item.className="item";
item.innerHTML=`
 <div class="item-image"><img src="${p.image}"></div>
 <div><h5>${p.name}</h5><h5 class="item-total">${p.price}</h5></div>
 <div class="flex">
   <a class="minus"><i class="fa-solid fa-minus"></i></a>
   <h5 class="quantity-value">1</h5>
   <a class="plus"><i class="fa-regular fa-plus"></i></a>
 </div>
`;
cartList.appendChild(item);
updateTotals();

item.querySelector(".plus").onclick=()=>{
 qty++;
 item.querySelector(".quantity-value").textContent=qty;
 item.querySelector(".item-total").textContent=`Rs.${(qty*price).toFixed(2)}`;
 updateTotals();
};

item.querySelector(".minus").onclick=()=>{
 if(qty>1){
    qty--;
    item.querySelector(".quantity-value").textContent=qty;
    item.querySelector(".item-total").textContent=`Rs.${(qty*price).toFixed(2)}`;
 }
 else{
    item.remove();
    cartProduct=cartProduct.filter(i=>i.id!==p.id);
 }
 updateTotals();
};
}

/* SEARCH RESULT DISPLAY */
function showResults(list){
const box=document.getElementById("results-container");
if(!box) return;

box.innerHTML="";

if(list.length===0){
 box.innerHTML="<p>No products found</p>";
 return;
}

list.forEach(p=>{
 let card=document.createElement("div");
 card.className="order-card";
 card.innerHTML=`
     <div class="card-image"><img src="${p.image}"></div>
     <h5>${p.name}</h5>
     <h5>${p.price}</h5>
     <a class="btn card-btn">Add to Cart</a>
 `;
 box.appendChild(card);

 card.querySelector(".card-btn").onclick=e=>{
     e.preventDefault(); addToCart(p);
 };
});
}

/* FETCH PRODUCTS + CONTROL PAGE */
fetch("products.json")
.then(res=>res.json())
.then(data=>{
 productList=data;

 if(document.getElementById("results-container")){  // Search Page
   let q=new URLSearchParams(location.search).get("q")?.toLowerCase()||"";
   let filtered=data.filter(p=>p.name.toLowerCase().includes(q));
   showResults(filtered);
   return;
 }

 loadHomeProducts(); // Home Page
});

/* RECENT SEARCH */

function saveRecent(search){
    let list = JSON.parse(localStorage.getItem("recentSearch")) || [];
    list.unshift(search);
    list = [...new Set(list)].slice(0,5);    // keep max 5 & no duplicates
    localStorage.setItem("recentSearch",JSON.stringify(list));
    loadRecent();
}

function loadRecent(){
    const box = document.getElementById("recentList");
    if(!box) return;

    let list = JSON.parse(localStorage.getItem("recentSearch")) || [];
   box.innerHTML = list.length === 0
? "<p style='color:gray;'>No recent searches</p>"
: list.map(v=>`
    <div class="recent-item" onclick="searchDirect('${v}')">
        <i class="fa-regular fa-clock recent-icon"></i> ${v}
    </div>`).join("");

}

function searchDirect(q){
    window.location = `search.html?q=${q}`;
}

function startSearch(){
    let q = document.getElementById("search-input").value.trim();
    if(q==="") return;
    saveRecent(q);
    searchDirect(q);
}

loadRecent();

/* CHECKOUT PAGE DATA LOAD */

function loadCheckout(){
    const box = document.getElementById("checkout-items");
    if(!box) return; // means not checkout page

    let data = JSON.parse(localStorage.getItem("checkoutCart") || "[]");

    if(data.length===0){
        box.innerHTML="<p style='text-align:center;color:gray;'>Your cart is empty.</p>";
        document.getElementById("chk-subtotal").textContent="Rs.0";
        document.getElementById("chk-total").textContent="Rs.0";
        return;
    }

    let total=0;
    box.innerHTML="";

    data.forEach(item=>{
        let price=parseFloat(item.price.replace("Rs.",""));
        total+=price;

        box.innerHTML+=`
        <div class="checkout-item">
            <img src="${item.img}">
            <h4>${item.name}</h4>
            <span class="checkout-price">${item.price}</span>
        </div>`;
    });

    document.getElementById("chk-subtotal").textContent=`Rs.${total.toFixed(2)}`;
    document.getElementById("chk-total").textContent=`Rs.${(total+30).toFixed(2)}`;
}

/* Auto-run on checkout page */
loadCheckout();

/* After placing order */
function placeOrder(){
    alert("🎉 Order Placed Successfully!");
    location.href="index.html";
}

/* CART → CHECKOUT redirection */

function goToCheckout(){
    // Save cart items before redirect
    let save = [];
    document.querySelectorAll(".item").forEach(i=>{
        save.push({
            name: i.querySelector("h5").textContent,
            price: i.querySelector(".item-total").textContent,
            img: i.querySelector("img").src,
            qty: i.querySelector(".quantity-value").textContent
        });
    });

    localStorage.setItem("checkoutCart", JSON.stringify(save));
    window.location.href="checkout.html";
}

/* SIGNUP & LOGIN */

// Get forms
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

// Switch Forms Display
document.getElementById("goLogin").onclick = () =>{
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
};
document.getElementById("goSignup").onclick = () =>{
    loginForm.classList.add("hidden");
    signupForm.classList.remove("hidden");
};

// SIGNUP
signupForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    let email=document.getElementById("su-email").value;
    let password=document.getElementById("su-password").value;
    let username=document.getElementById("su-username").value;

    localStorage.setItem("userData", JSON.stringify({email,password,username}));

    alert("🎉 Sign Up Successful! You can Login now.");
    signupForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
});

// LOGIN
loginForm.addEventListener("submit",(e)=>{
    e.preventDefault();

    let data=JSON.parse(localStorage.getItem("userData"));
    let username=document.getElementById("li-username").value;
    let password=document.getElementById("li-password").value;

    if(data && username===data.username && password===data.password){
        alert("💗 Logged in Successfully!");
        window.location.href="index.html";   // redirect to home
    }else{
        alert("❌ Incorrect username or password");
    }
});



