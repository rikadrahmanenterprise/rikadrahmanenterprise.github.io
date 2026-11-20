/* Edit RR_SITES when a domain goes live (set live:true). */
var RR_SITES=[
 {id:"pers",t:"Personal site",u:"https://rikadrahman.dpdns.org",live:true},
 {id:"persbk",t:"Personal · GitHub backup",u:"https://rikadrahman.github.io",live:true},
 {id:"ent",t:"Enterprise site (EU.org)",u:"https://rikadrahmanenterprise.eu.org",live:false},
 {id:"entbk",t:"Enterprise · GitHub backup",u:"https://rikadrahmanenterprise.github.io",live:true}
];
(function(){
var API="https://api.rikadrahman.dpdns.org/cgi-bin/order";
var y=document.getElementById("year");if(y)y.textContent=new Date().getFullYear();
function pick(a,b){var A=RR_SITES.filter(function(s){return s.id===a})[0],B=RR_SITES.filter(function(s){return s.id===b})[0];return A.live?A.u:B.u}
document.querySelectorAll("[data-go]").forEach(function(a){a.href=a.dataset.go==="ent"?pick("ent","entbk"):pick("pers","persbk")});
var g=document.getElementById("sitesGrid");
if(g)g.innerHTML=RR_SITES.map(function(s){
 var h=s.u.replace("https://","");
 return s.live?'<a class="item" href="'+s.u+'" target="_blank" rel="noopener"><span class="ico">↗</span><span><small>'+s.t+'</small><strong>'+h+'</strong></span></a>'
 :'<div class="item" style="opacity:.65"><span class="ico">…</span><span><small>'+s.t+' · pending approval</small><strong>'+h+'</strong></span></div>'}).join("");
window.rrSend=async function(p){
 p.site=document.body.dataset.site||location.hostname;
 var c=new AbortController(),t=setTimeout(function(){c.abort()},20000);
 try{var r=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},body:JSON.stringify(p),signal:c.signal});
  var j=await r.json().catch(function(){return{}});return r.ok&&j.ok===true}
 catch(e){return false}finally{clearTimeout(t)}
};
var f=document.getElementById("reqForm");
if(f)f.addEventListener("submit",async function(e){e.preventDefault();
 var st=document.getElementById("reqStatus"),b=f.querySelector("button"),d=Object.fromEntries(new FormData(f));
 b.disabled=true;st.textContent="Sending…";
 var ok=await rrSend({kind:d.kind,name:d.name,contact:d.contact,message:d.message,hp:d.hp});
 st.textContent=ok?"Thank you — your message was sent. I will get back to you soon.":"Could not send right now. Please call, WhatsApp or email instead.";
 if(ok)f.reset();b.disabled=false});
})();
