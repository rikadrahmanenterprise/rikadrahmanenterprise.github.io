(function(){
var $=function(s){return document.querySelector(s)};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var PL={win:"Windows",mac:"macOS"},SYM={USD:"$",BDT:"৳"};
var items=[],cat="All",plat="Any",cart=[];
try{cart=JSON.parse(localStorage.getItem("rr-cart")||"[]")}catch(e){}
function save(){try{localStorage.setItem("rr-cart",JSON.stringify(cart))}catch(e){}}
function money(p,c){return p==null?"Ask for price":(SYM[c]||c+" ")+Number(p).toLocaleString("en-US")}
function totals(){var t={},ask=false;cart.forEach(function(i){if(i.price==null)ask=true;else t[i.currency]=(t[i.currency]||0)+i.price});
 var s=Object.keys(t).map(function(c){return money(t[c],c)}).join(" + ");if(ask)s+=(s?" + ":"")+"price on request";return s||"—"}
function render(){
 var list=items.filter(function(i){return(cat==="All"||i.category===cat)&&(plat==="Any"||i.platforms.indexOf(plat)>-1)});
 $("#shop").innerHTML=list.map(function(i){
  var sel=i.platforms.length>1?'<select data-p="'+esc(i.id)+'">'+i.platforms.map(function(p){return'<option value="'+p+'">'+PL[p]+'</option>'}).join("")+'</select>':'<span>'+i.platforms.map(function(p){return'<span class="rr-badge">'+PL[p]+' only</span>'}).join("")+'</span>';
  return'<article class="rr-prod"><div class="top"><span>'+esc(i.category).toUpperCase()+'</span><span>'+i.platforms.map(function(p){return'<span class="rr-badge">'+PL[p]+'</span>'}).join("")+'</span></div><h3>'+esc(i.title)+'</h3><p>'+esc(i.description)+'</p><div class="row"><span class="price">'+money(i.price,i.currency)+'</span>'+sel+'</div><button class="rr-btn" data-add="'+esc(i.id)+'">Add to order</button></article>'}).join("")||'<p class="rr-note">Nothing matches this filter.</p>';
 $("#cartCount").textContent=cart.length;$("#cartTotal").textContent=totals();
 $("#cartBar").classList.toggle("hidden",!cart.length);
 $("#orderList").innerHTML=cart.map(function(i,n){return'<li><span>'+esc(i.title)+' · '+PL[i.platform]+'</span><span>'+money(i.price,i.currency)+' <button data-rm="'+n+'">remove</button></span></li>'}).join("");
 if(!cart.length)$("#orderPanel").classList.add("hidden");
}
document.addEventListener("click",function(e){var t=e.target;
 if(t.dataset.add){var it=items.filter(function(x){return x.id===t.dataset.add})[0],s=document.querySelector('select[data-p="'+it.id+'"]'),p=s?s.value:it.platforms[0];
  if(!cart.some(function(c){return c.id===it.id&&c.platform===p}))cart.push({id:it.id,title:it.title,platform:p,price:it.price,currency:it.currency});save();render()}
 if(t.dataset.rm){cart.splice(+t.dataset.rm,1);save();render()}
 if(t.dataset.cat){cat=t.dataset.cat;document.querySelectorAll("[data-cat]").forEach(function(b){b.classList.toggle("on",b===t)});render()}
 if(t.dataset.plat){plat=t.dataset.plat;document.querySelectorAll("[data-plat]").forEach(function(b){b.classList.toggle("on",b===t)});render()}
 if(t.id==="review")$("#orderPanel").classList.toggle("hidden")});
$("#orderForm").addEventListener("submit",async function(e){e.preventDefault();
 var f=e.target,d=Object.fromEntries(new FormData(f)),st=$("#orderStatus"),b=f.querySelector("button");
 if(!cart.length)return;b.disabled=true;st.textContent="Sending…";
 var txt=cart.map(function(i){return i.title+" ["+PL[i.platform]+"] "+money(i.price,i.currency)}).join("; ")+" | Total: "+totals();
 var ok=await rrSend({kind:"order",name:d.name,contact:d.contact,message:d.message,items:txt,hp:d.hp});
 if(ok){cart=[];save();f.reset();st.textContent="Order request received — I will contact you to confirm price, availability and delivery.";render();$("#orderPanel").classList.remove("hidden");$("#orderList").innerHTML=""}
 else st.textContent="Could not send right now. Please call, WhatsApp or email your order instead.";
 b.disabled=false});
fetch("/shop/products.json",{cache:"no-store"}).then(function(r){return r.json()}).then(function(d){items=d.items||[];render()}).catch(function(){$("#shop").innerHTML='<p class="rr-note">Catalogue could not be loaded.</p>'});
})();
