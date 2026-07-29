const prizes=[
  {name:"Трава",icon:"🌿",rarity:"Обычный",color:"#62b445",value:10},
  {name:"Железо",icon:"⛓",rarity:"Редкий",color:"#bac8d2",value:35},
  {name:"Золото",icon:"🟨",rarity:"Эпический",color:"#ffc928",value:85},
  {name:"Алмаз",icon:"💎",rarity:"Легендарный",color:"#2fe4f4",value:240},
  {name:"Тотем",icon:"🗿",rarity:"Мифический",color:"#ff812d",value:500}
];
const packs={gems:[[30,39],[100,99],[300,249],[1000,699]],coins:[[500,29],[1500,69],[5000,179],[15000,449]]};
const ranking=[["Player775587",1560],["AlexCraft",1420],["StevePro",1290],["Creeper713",1185],["EVA_POKER",960]];
let state={coins:2215,gems:3000,inventory:[],claimed:1,sound:true,particles:true,screen:"lobby",currency:"gems",busy:false,result:null,rotation:-8};
try{Object.assign(state,JSON.parse(localStorage.getItem("blockcase-state")||"{}"))}catch{}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const screen=$("#screen"),hero=$("#hero"),toast=$("#toast");
function save(){localStorage.setItem("blockcase-state",JSON.stringify({coins:state.coins,gems:state.gems,inventory:state.inventory,claimed:state.claimed}));updateWallet()}
function updateWallet(){$$("[data-coins]").forEach(x=>x.textContent=state.coins.toLocaleString("ru-RU"));$$("[data-gems]").forEach(x=>x.textContent=state.gems.toLocaleString("ru-RU"))}
function notify(text){toast.textContent=text;toast.classList.add("show");clearTimeout(notify.t);notify.t=setTimeout(()=>toast.classList.remove("show"),2200)}
function show(name){
  state.screen=name;$$(".rail [data-screen]").forEach(x=>x.classList.toggle("active",x.dataset.screen===name));
  if(name==="lobby"){hero.hidden=false;screen.hidden=true;return}
  hero.hidden=true;screen.hidden=false;render(name)
}
function closeButton(){return `<button class="close" data-screen="lobby">← НАЗАД</button>`}
function render(name){
  if(name==="cases"){
    const reel=Array.from({length:24},(_,i)=>prizes[i%5]).map(p=>`<div class="prize" style="--c:${p.color}"><i>${p.icon}</i><b>${p.name}</b><small>${p.rarity}</small></div>`).join("");
    screen.innerHTML=`${closeButton()}<h1>АЛМАЗНЫЙ КЕЙС</h1><p>Открой кейс и получи редкую награду</p><div class="big-case">💎<span>✦</span></div><div class="reel"><div class="marker"></div><div class="reel-track ${state.busy?"spinning":""}">${reel}</div></div><div class="result">${state.result?`ТВОЙ ПРИЗ: <b style="color:${state.result.color}">${state.result.icon} ${state.result.name}</b>`:""}</div><button class="action" id="openCase" ${state.busy?"disabled":""}>${state.busy?"КРУТИМ...":"ОТКРЫТЬ · 🪙 100"}</button>`;
  }
  if(name==="inventory")screen.innerHTML=`${closeButton()}<h1>ИНВЕНТАРЬ</h1><p>Нажми на предмет, чтобы продать его</p><div class="inventory">${state.inventory.length?state.inventory.map((p,i)=>`<button data-sell="${i}" style="--c:${p.color}"><i>${p.icon}</i><b>${p.name}</b><small>Продать · 🪙 ${p.value}</small></button>`).join(""):`<div class="empty">Здесь пока пусто. Открой первый кейс!</div>`}</div>`;
  if(name==="shop")screen.innerHTML=`${closeButton()}<h1>МАГАЗИН</h1><div class="tabs"><button data-currency="gems" class="${state.currency==="gems"?"active":""}">💚 ИЗУМРУДЫ</button><button data-currency="coins" class="${state.currency==="coins"?"active":""}">🪙 МОНЕТЫ</button></div><div class="packs">${packs[state.currency].map(([amount,price])=>`<button data-pack="${amount}"><i>${state.currency==="gems"?"💚":"🪙"}</i><b>${amount}</b><span>${price} ₽</span></button>`).join("")}</div><small class="test-note">Демонстрационный магазин — реальные деньги не списываются</small>`;
  if(name==="bonuses")screen.innerHTML=`${closeButton()}<h1>ЕЖЕДНЕВНЫЕ БОНУСЫ</h1><div class="bonus-grid">${["✓","🪙 100","💚 25","🟨 Кейс","💚 100"].map((x,i)=>`<button data-day="${i+1}" class="${i+1<=state.claimed?"claimed":""}"><i>${x}</i><b>ДЕНЬ ${i+1}</b><span>${i+1<=state.claimed?"ПОЛУЧЕНО":"ЗАБРАТЬ"}</span></button>`).join("")}</div>`;
  if(name==="leaders")screen.innerHTML=`${closeButton()}<h1>ТОП ИГРОКИ</h1><div class="leader-list">${ranking.map(([n,s],i)=>`<div><i>${["🥇","🥈","🥉"][i]||i+1}</i><b>${n}</b><span>🏆 ${s}</span></div>`).join("")}</div>`;
  if(name==="settings")screen.innerHTML=`${closeButton()}<h1>НАСТРОЙКИ</h1><div class="settings-list"><button data-toggle="sound"><span>Звук</span><i>${state.sound?"ВКЛ":"ВЫКЛ"}</i></button><button data-toggle="particles"><span>Частицы и огонь</span><i>${state.particles?"ВКЛ":"ВЫКЛ"}</i></button><button data-reset><span>Сбросить прогресс</span><i>СБРОС</i></button></div>`;
  if(name==="chat")screen.innerHTML=`${closeButton()}<h1>ЧАТ ИГРОКОВ</h1><div class="chat"><p><b>Player9007:</b> кому сегодня выпал алмаз?</p><p><b>AlexCraft:</b> мне тотем с третьего кейса!</p><p><b>StevePro:</b> всем удачи 👋</p></div><form id="chatForm"><input id="chatInput" placeholder="Написать сообщение..."><button class="action">ОТПРАВИТЬ</button></form>`;
}
function openCase(){
  if(state.busy)return;if(state.coins<100){notify("Недостаточно монет");return}
  state.coins-=100;state.busy=true;state.result=null;save();render("cases");
  setTimeout(()=>{const r=Math.random(),p=prizes[r<.5?0:r<.75?1:r<.9?2:r<.98?3:4];state.result=p;state.inventory.unshift(p);state.busy=false;save();render("cases");notify(`Получено: ${p.name}`)},2800)
}
function claim(day){
  if(day<=state.claimed){notify("Награда уже получена");return}if(day!==state.claimed+1){notify("Сначала забери предыдущий день");return}
  if(day===2)state.coins+=100;if(day===3)state.gems+=25;if(day===4)state.inventory.unshift(prizes[2]);if(day===5)state.gems+=100;
  state.claimed=day;save();render(state.screen);renderDaily();notify(`Награда за день ${day} получена!`)
}
function renderDaily(){$("#dailyMini").innerHTML=["✓","🪙","💚","▣","?"].map((x,i)=>`<button data-day="${i+1}" class="${i+1<=state.claimed?"claimed":""}"><i>${x}</i><small>ДЕНЬ ${i+1}</small></button>`).join("")}
document.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.screen)show(b.dataset.screen);
  if(b.dataset.buy){state.currency=b.dataset.buy;show("shop")}
  if(b.dataset.currency){state.currency=b.dataset.currency;render("shop")}
  if(b.id==="openCase")openCase();
  if(b.dataset.pack){const amount=+b.dataset.pack;state[state.currency]+=amount;save();notify(`Тестовая покупка: +${amount}`)}
  if(b.dataset.sell!==undefined){const i=+b.dataset.sell,p=state.inventory[i];state.coins+=p.value;state.inventory.splice(i,1);save();render("inventory");notify(`Продано за ${p.value} монет`)}
  if(b.dataset.day)claim(+b.dataset.day);
  if(b.dataset.toggle){state[b.dataset.toggle]=!state[b.dataset.toggle];if(b.dataset.toggle==="particles")$("#embers").hidden=!state.particles;render("settings")}
  if(b.hasAttribute("data-reset")){localStorage.removeItem("blockcase-state");location.reload()}
});
document.addEventListener("submit",e=>{if(e.target.id==="chatForm"){e.preventDefault();const input=$("#chatInput");if(input.value.trim()){const p=document.createElement("p");p.innerHTML=`<b>Player775587:</b> ${input.value.replace(/[<>]/g,"")}`;$(".chat").append(p);input.value=""}}});
const drag=$("#characterDrag"),character=$("#character");let pointer=false,startX=0,startRot=0;
drag.addEventListener("pointerdown",e=>{pointer=true;startX=e.clientX;startRot=state.rotation;drag.setPointerCapture(e.pointerId)});
drag.addEventListener("pointermove",e=>{if(pointer){state.rotation=startRot+(e.clientX-startX)*.7;character.style.transform=`rotateY(${state.rotation}deg)`}});
drag.addEventListener("pointerup",()=>pointer=false);drag.addEventListener("pointercancel",()=>pointer=false);
$("#embers").innerHTML="<i></i>".repeat(8);$("#embers").hidden=!state.particles;character.style.transform=`rotateY(${state.rotation}deg)`;
renderDaily();updateWallet();
