import { StatusBar } from "expo-status-bar";
import {
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Crosshair,
  MapPin,
  Moon,
  Navigation,
  Pencil,
  Phone,
  Route,
  Search,
  SlidersHorizontal,
  Sun,
  Trash2,
  Globe2,
  Eye,
  CircleDashed,
  GitCompareArrows,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import * as Location from "expo-location";
import { useColorScheme } from "nativewind";
import {
  Alert,
  Image,
  Linking,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { filterMalls, getMallBounds, getMallStatus, mockMallRepository, type Mall } from "@phoenix/core";
import "./global.css";

type EditMode = "marker" | "data";
type MapAction =
  | "edit-marker"
  | "delete"
  | "edit-data"
  | "route"
  | "radius"
  | "website"
  | "street-view"
  | "directions"
  | "phone"
  | "match";

function createMapDocument(malls: Mall[], selectedCountry: string | null) {
  const now = new Date();
  const countryMalls = selectedCountry
    ? malls.filter((mall) => mall.country === selectedCountry)
    : [];
  const countryBounds = getMallBounds(countryMalls) ?? [[8, 68], [35.8, 97.5]];
  const payload = JSON.stringify(
    countryMalls.map((mall) => {
      const status = getMallStatus(mall, now);
      return { ...mall, ...status };
    }),
  ).replace(/</g, "\\u003c");
  const indiaOutline = JSON.stringify([
    [35.5, 74.8], [35, 77.8], [32.7, 78.8], [31, 79], [30, 80],
    [28.5, 88], [27, 89], [26.5, 92], [24, 94], [22, 93.5],
    [21, 90], [20, 87], [21, 85], [20, 82], [18, 84], [16, 82],
    [13, 80], [10, 77], [8, 77], [8.5, 75], [11, 74], [14, 73],
    [16, 72], [19, 72], [21, 69], [23, 68], [25, 70], [28, 70],
    [30, 70], [32, 74], [35.5, 74.8],
  ]);
  return `<!doctype html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
*{box-sizing:border-box}html,body,#map-shell,#map{height:100%;width:100%;margin:0;background:#e9eee8}
#map-shell{position:relative;overflow:hidden;background:linear-gradient(145deg,#e8eee8,#dce9e7)}
#map{position:absolute;inset:0;z-index:1;background:transparent}
#map-fallback{position:absolute;inset:0;width:100%;height:100%;z-index:0}
#fallback-country{position:absolute;z-index:2;left:70%;top:46%;width:54px;height:54px;border:0;border-radius:50%;background:#168957;color:#fff;font:700 12px Arial;box-shadow:0 0 0 8px #16895725,0 3px 12px #18322255}
#fallback-country[hidden],#fallback-markers[hidden],#fallback-popup[hidden]{display:none}
#fallback-markers{position:absolute;inset:0;z-index:2}
.fallback-marker{position:absolute;width:38px;height:38px;transform:translate(-50%,-50%);border:3px solid #fff;border-radius:50%;background:#188c63;color:#fff;font:700 12px Arial;box-shadow:0 3px 12px #18322250}
.fallback-marker.closed{background:#d75d53}
.fallback-marker.active{transform:translate(-50%,-50%) scale(1.14);box-shadow:0 0 0 7px #188c6330,0 4px 12px #18322250}
#fallback-popup{position:absolute;z-index:4;left:50%;top:12px;width:min(300px,calc(100% - 24px));max-height:calc(100% - 24px);overflow:auto;transform:translateX(-50%);border-radius:18px;background:#fff;box-shadow:0 14px 36px #18322238}
#fallback-popup:after{position:sticky;display:block;bottom:0;height:0;border-top:12px solid #fff;border-left:12px solid transparent;border-right:12px solid transparent;width:0;margin:0 auto}
.fallback-hint{position:absolute;z-index:3;left:12px;top:12px;padding:8px 10px;border:1px solid #ffffffbb;border-radius:10px;background:#ffffffea;color:#50675a;font:700 9px Arial;letter-spacing:.7px}
#map-shell.has-leaflet #fallback-country,#map-shell.has-leaflet #fallback-markers,#map-shell.has-leaflet .fallback-hint,#map-shell.has-leaflet #fallback-popup{display:none}
.leaflet-container{position:relative;overflow:hidden;outline:0;-webkit-tap-highlight-color:transparent}
.leaflet-pane,.leaflet-tile,.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-tile-container,.leaflet-pane>svg,.leaflet-pane>canvas,.leaflet-zoom-box,.leaflet-image-layer,.leaflet-layer{position:absolute;left:0;top:0}
.leaflet-pane{z-index:400}.leaflet-tile-pane{z-index:200}.leaflet-overlay-pane{z-index:400}.leaflet-shadow-pane{z-index:500}.leaflet-marker-pane{z-index:600}.leaflet-tooltip-pane{z-index:650}.leaflet-popup-pane{z-index:700}
.leaflet-container img,.leaflet-container svg{max-width:none!important;max-height:none!important}.leaflet-tile{visibility:hidden}.leaflet-tile-loaded{visibility:inherit}.leaflet-zoom-animated{transform-origin:0 0}
.leaflet-container.leaflet-touch-zoom{touch-action:pan-x pan-y}.leaflet-container.leaflet-touch-drag{touch-action:pinch-zoom}.leaflet-container.leaflet-touch-drag.leaflet-touch-zoom{touch-action:none}
.leaflet-marker-icon,.leaflet-marker-shadow,.leaflet-image-layer,.leaflet-pane>svg path,.leaflet-tile-container{pointer-events:none}.leaflet-marker-icon.leaflet-interactive,.leaflet-image-layer.leaflet-interactive,.leaflet-pane>svg path.leaflet-interactive{pointer-events:auto}
.leaflet-marker-icon,.leaflet-marker-shadow{display:block}.leaflet-container.leaflet-grab{cursor:grab}.leaflet-container.leaflet-dragging{cursor:grabbing}.leaflet-fade-anim .leaflet-popup{opacity:0;transition:opacity .2s linear}.leaflet-fade-anim .leaflet-map-pane .leaflet-popup{opacity:1}
.leaflet-control{position:relative;z-index:800;pointer-events:auto}.leaflet-top,.leaflet-bottom{position:absolute;z-index:1000;pointer-events:none}.leaflet-top{top:0}.leaflet-right{right:0}.leaflet-bottom{bottom:0}.leaflet-left{left:0}.leaflet-control-attribution{padding:0 5px;margin:0}.leaflet-popup{position:absolute;text-align:center;margin-bottom:20px}.leaflet-popup-content-wrapper{position:relative;text-align:left}.leaflet-popup-content{word-wrap:break-word}.leaflet-popup-tip-container{width:40px;height:20px;position:absolute;left:50%;margin-left:-20px;overflow:hidden;pointer-events:none}.leaflet-popup-tip{width:17px;height:17px;margin:-10px auto 0;transform:rotate(45deg)}
.leaflet-container{font-family:Arial,sans-serif;background:transparent}
.leaflet-control-attribution{font-size:8px!important;background:rgba(255,255,255,.8)!important}
.leaflet-control-attribution a{color:#4c7259!important}
.leaflet-popup-content-wrapper{padding:0;border-radius:18px;overflow:hidden;box-shadow:0 14px 36px #18322238}
.leaflet-popup-content{width:min(330px,calc(100vw - 24px))!important;max-height:min(340px,68vh);margin:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
.leaflet-popup-tip{box-shadow:0 3px 8px #18322220}
.leaflet-popup-close-button{display:none!important}
.mall-popup{overflow:hidden;background:#fff;color:#24382b}
.popup-image{position:relative;height:72px;background:#315541 center/cover no-repeat}
.popup-image:after{position:absolute;inset:0;background:linear-gradient(180deg,#0b1d1230,transparent 45%,#0b1d1240);content:""}
.popup-close{position:absolute;z-index:1;top:8px;right:8px;width:30px;height:30px;border:1px solid #ffffff88;border-radius:50%;background:#102318bb;color:#fff;font-size:20px;line-height:26px}
.popup-status{position:absolute;z-index:1;bottom:8px;left:10px;border-radius:20px;background:#fff;padding:5px 9px;color:#26734f;font-size:9px;font-weight:800;letter-spacing:.4px}
.popup-status.closed{color:#b65e55}
.popup-info{padding:8px 11px 7px}
.popup-eyebrow{color:#728579;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.popup-title{margin:3px 26px 6px 0;font-size:14px;line-height:17px;font-weight:750}
.popup-line{display:flex;gap:7px;margin-top:5px;color:#68796e;font-size:10px;line-height:13px}
.popup-line b{color:#53695a;font-size:11px}
.popup-phone{padding:0;border:0;background:transparent;color:#3b7857;font:inherit;text-align:left}
.popup-local{display:block;margin:2px 0 0 20px;color:#89958c;font-size:9px}
.popup-toolbar{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:7px 10px;border-top:1px solid #edf1ed}
.popup-toolbar,.popup-route,.popup-directions{display:none!important}
.popup-action{min-height:39px;border:1px solid #e7ece8;border-radius:9px;background:#fff;color:#52685a;font-size:8px;font-weight:600;line-height:11px}
.popup-action:active{background:#edf6ef}
.popup-action .action-icon{display:block;margin-bottom:2px;color:#317650;font-size:15px;font-weight:700}
.popup-action.danger{border-color:#f0e1df;background:#fffafa;color:#ac625b}
.popup-action.danger .action-icon{color:#ac625b}
.popup-route{display:none;padding:0 13px 10px;color:#39825d;font-size:9px}
.popup-route.visible{display:block}
.popup-directions{display:flex;min-height:32px;align-items:center;justify-content:center;gap:7px;margin:0 10px 8px;border:0;border-radius:9px;background:#176b4b;color:#fff;font-size:10px;font-weight:750;text-decoration:none}
.popup-directions:active{background:#105a3e}
.country-outline{fill:#3bac7c;fill-opacity:.18;stroke:#187c58;stroke-width:2}
.pin-wrap{background:transparent;border:0}
.pin{position:relative;width:38px;height:38px;border:3px solid white;border-radius:50%;background:#d75d53;box-shadow:0 3px 12px #18322250;display:grid;place-items:center;color:#fff;font-size:12px;font-weight:700;transition:transform .2s}
.pin.open{background:#188c63}.pin.active{transform:scale(1.18);box-shadow:0 0 0 7px #188c6330,0 4px 12px #18322250}
.pin.open:not(.active):after{position:absolute;inset:-3px;border:1px solid #188c6377;border-radius:50%;content:"";animation:pulse 2.4s ease-out infinite}
@keyframes pulse{to{transform:scale(1.8);opacity:0}}
.leaflet-bottom.leaflet-right{bottom:2px;right:4px}
.radius{fill:#3bac7c;fill-opacity:.12;stroke:#187c58;stroke-opacity:.7}
</style></head>
<body><div id="map-shell">
<svg id="map-fallback" viewBox="0 0 720 480" preserveAspectRatio="xMidYMid slice" aria-label="Phoenix Malls map">
<defs><linearGradient id="water" x2="0" y2="1"><stop stop-color="#d5e8e7"/><stop offset="1" stop-color="#c9e1e1"/></linearGradient></defs>
<rect width="720" height="480" fill="url(#water)"/>
<path d="M0 35 66 20 105 40 123 69 160 81 175 119 151 148 127 163 117 191 92 211 73 246 48 262 28 309 0 324ZM181 0 226 16 250 42 274 46 295 75 278 97 254 103 239 124 220 120 210 141 194 129 178 99 159 80ZM263 151 293 139 322 147 339 168 369 176 388 194 384 222 361 242 348 272 333 305 313 334 296 321 288 287 271 261 263 228 244 207 248 182ZM363 72 404 61 435 72 463 66 494 81 528 72 554 87 580 82 612 95 641 90 677 108 720 104 720 168 685 174 662 190 638 181 620 205 592 201 574 221 551 210 532 229 510 218 488 195 466 187 449 165 421 157 403 138 379 130ZM504 258 531 247 552 260 560 285 548 311 535 337 519 324 513 298ZM611 238 638 227 661 237 670 256 656 273 631 269Z" fill="#edf0e4" stroke="#c2d2c7" stroke-width="2"/>
<path d="M490 176 507 169 517 176 513 187 526 197 522 210 512 217 505 207 497 203Z" fill="#42a879" fill-opacity=".62" stroke="#187c58" stroke-width="2"/>
<path d="M490 176 507 169 517 176 513 187 526 197 522 210 512 217 505 207 497 203Z" fill="none" stroke="#187c58" stroke-opacity=".18" stroke-width="12"/>
</svg>
<div class="fallback-hint">${selectedCountry ? "PHOENIX MALLS · WESTERN INDIA" : "WORLD MAP · TAP INDIA"}</div>
<button id="fallback-country" aria-label="Explore Phoenix Malls in India" ${selectedCountry ? "hidden" : ""}>IND</button>
<div id="fallback-markers" ${selectedCountry ? "" : "hidden"}></div>
<div id="fallback-popup" hidden></div>
<div id="map"></div></div>
<script>
const leafletCss=document.createElement('link');leafletCss.rel='stylesheet';leafletCss.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';leafletCss.onerror=()=>{leafletCss.onerror=null;leafletCss.href='https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css'};document.head.appendChild(leafletCss);
function loadLeaflet(sources,index){if(index>=sources.length){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('network:degraded');return}const script=document.createElement('script');let settled=false;const timeout=window.setTimeout(()=>{if(settled)return;settled=true;script.remove();loadLeaflet(sources,index+1)},4500);script.onload=()=>{if(settled)return;settled=true;window.clearTimeout(timeout);if(window.initializeMallMap)window.initializeMallMap()};script.onerror=()=>{if(settled)return;settled=true;window.clearTimeout(timeout);loadLeaflet(sources,index+1)};script.src=sources[index];document.head.appendChild(script)}
function postMapMessage(message){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(message)}
</script>
<script>
const malls=${payload};
const selectedCountry=${JSON.stringify(selectedCountry)};
const countryBounds=${JSON.stringify(countryBounds)};
function fallbackPopupHtml(mall){const live=currentStatuses[mall.id]||mall;const status=live.hoursValid?(live.isHoliday?'CLOSED FOR HOLIDAY':live.isOpen?'OPEN NOW':'CLOSED'):'HOURS UNAVAILABLE';return '<article class="mall-popup"><div class="popup-image" style="background-image:url(&quot;'+String(mall.image).replace(/["<>]/g,'')+'&quot;)"><span class="popup-status '+(live.hoursValid&&live.isOpen?'':'closed')+'">'+status+'</span><button class="popup-close" aria-label="Close details">×</button></div><div class="popup-info"><div class="popup-eyebrow">'+mall.city+' · '+mall.country+'</div><div class="popup-title">'+mall.name+'</div><div class="popup-line"><b>⌖</b><span>'+mall.address+'</span></div><div class="popup-line"><b>◷</b><span>Today · '+mall.openingTime+' – '+mall.closingTime+'</span></div><span class="popup-local">'+live.localTime+' local time · '+mall.timezone+'</span><div class="popup-line"><b>☎</b><button class="popup-phone" data-action="phone">'+mall.phone+'</button></div></div><div class="popup-toolbar">'+[['edit-marker','✎','Edit marker'],['delete','×','Delete'],['edit-data','▤','Edit data'],['route','↗','Add to route'],['radius','◎','Radius'],['website','↗','Website'],['street-view','⌖','Street view'],['match','⇄','Match data']].map(([id,icon,label])=>'<button class="popup-action '+(id==='delete'?'danger':'')+'" data-action="'+id+'"><span class="action-icon">'+icon+'</span>'+label+'</button>').join('')+'</div><div class="popup-route '+(routedMallIds.includes(mall.id)?'visible':'')+'">'+(routedMallIds.includes(mall.id)?'✓ Added to your route':'')+'</div><button class="popup-directions" data-action="directions">Get directions ↗</button></article>'}
let fallbackSelectedMallId=null;
let currentVisibleMallIds=malls.map(mall=>mall.id);
const currentStatuses=Object.fromEntries(malls.map(mall=>[mall.id,{isOpen:mall.isOpen,hoursValid:mall.hoursValid,isHoliday:mall.isHoliday,localTime:mall.localTime}]));
function showFallbackMall(id){const mall=malls.find(item=>item.id===id);const popup=document.getElementById('fallback-popup');if(!mall||!popup)return;fallbackSelectedMallId=id;Object.keys(fallbackMarkerById).forEach(key=>fallbackMarkerById[key].classList.toggle('active',key===id));popup.innerHTML=fallbackPopupHtml(mall);popup.hidden=false;postMapMessage('mall:'+id);popup.querySelector('.popup-close')?.addEventListener('click',()=>{popup.hidden=true;fallbackSelectedMallId=null;Object.keys(fallbackMarkerById).forEach(key=>fallbackMarkerById[key].classList.remove('active'));postMapMessage('mall:close')});popup.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.getAttribute('data-action');if(action)postMapMessage('action:'+action+':'+id)}))}
window.selectMall=showFallbackMall;
window.clearSelection=()=>{fallbackSelectedMallId=null;Object.keys(fallbackMarkerById).forEach(id=>fallbackMarkerById[id].classList.remove('active'));const popup=document.getElementById('fallback-popup');if(popup)popup.hidden=true};
const fallbackMarkerById={};
document.getElementById('fallback-country')?.addEventListener('click',()=>postMapMessage('country:India'));
const fallbackMarkers=document.getElementById('fallback-markers');
if(fallbackMarkers){malls.forEach((mall,index)=>{const marker=document.createElement('button');marker.className='fallback-marker '+(mall.hoursValid&&mall.isOpen?'':'closed');marker.textContent=String(index+1);marker.setAttribute('aria-label','Open '+mall.name);marker.style.left=(24+index*25)+'%';marker.style.top=(54-index*15)+'%';marker.addEventListener('click',()=>showFallbackMall(mall.id));fallbackMarkers.appendChild(marker);fallbackMarkerById[mall.id]=marker})}
window.setVisibleMarkers=(ids)=>{currentVisibleMallIds=ids;const visible=new Set(ids);Object.keys(fallbackMarkerById).forEach(id=>fallbackMarkerById[id].hidden=!visible.has(id))};
window.updateStatuses=(statuses)=>{Object.assign(currentStatuses,statuses);Object.keys(fallbackMarkerById).forEach(id=>fallbackMarkerById[id].classList.toggle('closed',!currentStatuses[id]?.hoursValid||!currentStatuses[id]?.isOpen));const mall=malls.find(item=>item.id===fallbackSelectedMallId);const popup=document.getElementById('fallback-popup');if(!mall||!popup)return;const status=currentStatuses[mall.id]||{};const badge=popup.querySelector('.popup-status');if(badge){badge.textContent=status.hoursValid?(status.isHoliday?'CLOSED FOR HOLIDAY':status.isOpen?'OPEN NOW':'CLOSED'):'HOURS UNAVAILABLE';badge.classList.toggle('closed',!status.hoursValid||!status.isOpen)}const local=popup.querySelector('.popup-local');if(local)local.textContent=(status.localTime||'--:--')+' local time · '+mall.timezone};
let routedMallIds=[];
window.setRoutedMarkers=(ids)=>{routedMallIds=ids;const popup=document.getElementById('fallback-popup');if(popup){const route=popup.querySelector('.popup-route');if(route){route.textContent=routedMallIds.includes(fallbackSelectedMallId)?'✓ Added to your route':'';route.classList.toggle('visible',routedMallIds.includes(fallbackSelectedMallId))}};window.syncLeafletRoutes?.()};
postMapMessage('map:ready');
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
window.initializeMallMap=function(){
const map=L.map('map',{zoomControl:false,attributionControl:true,scrollWheelZoom:true}).setView([20,15],2);
let tileHadError=false;
const tileLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
tileLayer.on('tileerror',()=>{tileHadError=true;if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('network:degraded')});
tileLayer.on('tileload',()=>{if(tileHadError){tileHadError=false;if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('network:online')}});
window.retryTiles=()=>tileLayer.redraw();
const markers={};let activeId=null;let radiusLayer=null;
window.syncLeafletRoutes=()=>{Object.keys(markers).forEach(id=>{const popup=markers[id].getPopup().getElement();if(!popup)return;const route=popup.querySelector('.popup-route');if(route){route.textContent=routedMallIds.includes(id)?'✓ Added to your route':'';route.classList.toggle('visible',routedMallIds.includes(id))}})};
window.clearSelection=()=>{activeId=null;Object.keys(markers).forEach(key=>{const node=markers[key].getElement();const pin=node&&node.querySelector('.pin');if(pin)pin.classList.remove('active')});map.closePopup();const fallbackPopup=document.getElementById('fallback-popup');if(fallbackPopup)fallbackPopup.hidden=true};
const india=L.polygon(${indiaOutline},{className:'country-outline'}).addTo(map);
india.bindTooltip('<strong>India</strong> · Phoenix Malls<br>Tap to explore',{sticky:true});
india.on('click',()=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('country:India')});
function selectMall(id,move){const mall=malls.find(item=>item.id===id);if(!mall)return;activeId=id;
Object.keys(markers).forEach(key=>{const node=markers[key].getElement();if(node){const pin=node.querySelector('.pin');if(pin)pin.classList.toggle('active',key===id)}});
if(move)map.flyTo([mall.latitude,mall.longitude],Math.max(map.getZoom(),8),{duration:.45});
if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('mall:'+id)}
window.selectMall=(id)=>{const mall=malls.find(item=>item.id===id);if(!mall||!markers[id])return;selectMall(id,false);map.flyTo([mall.latitude,mall.longitude],Math.max(map.getZoom(),12),{duration:.45});markers[id].openPopup()};
window.setVisibleMarkers=(ids)=>{currentVisibleMallIds=ids;const visible=new Set(ids);Object.keys(markers).forEach(id=>{const marker=markers[id];if(visible.has(id)){if(!map.hasLayer(marker))marker.addTo(map)}else if(map.hasLayer(marker)){map.removeLayer(marker)}});window.updateStatuses(currentStatuses)};
window.setRoutedMarkers=(ids)=>{routedMallIds=ids;window.syncLeafletRoutes()};
function popupHtml(mall){const opened=mall.hoursValid&&mall.isOpen;const status=mall.hoursValid?(mall.isHoliday?'CLOSED FOR HOLIDAY':opened?'OPEN NOW':'CLOSED'):'HOURS UNAVAILABLE';const actions=[['edit-marker','✎','Edit marker'],['delete','×','Delete'],['edit-data','▤','Edit data'],['route','↗','Add to route'],['radius','◎','Radius'],['website','↗','Website'],['street-view','⌖','Street view'],['match','⇄','Match data']];return '<article class="mall-popup"><div class="popup-image" style="background-image:url(&quot;'+escapeHtml(mall.image)+'&quot;)"><span class="popup-status '+(opened?'':'closed')+'">'+status+'</span><button class="popup-close" aria-label="Close details">×</button></div><div class="popup-info"><div class="popup-eyebrow">'+escapeHtml(mall.city)+' · '+escapeHtml(mall.country)+'</div><div class="popup-title">'+escapeHtml(mall.name)+'</div><div class="popup-line"><b>⌖</b><span>'+escapeHtml(mall.address)+'</span></div><div class="popup-line"><b>◷</b><span>Today · '+escapeHtml(mall.openingTime)+' – '+escapeHtml(mall.closingTime)+'</span></div><span class="popup-local">'+escapeHtml(mall.localTime)+' local time · '+escapeHtml(mall.timezone)+'</span><div class="popup-line"><b>☎</b><button class="popup-phone" data-action="phone">'+escapeHtml(mall.phone)+'</button></div></div><div class="popup-toolbar">'+actions.map(([id,icon,label])=>'<button class="popup-action '+(id==='delete'?'danger':'')+'" data-action="'+id+'"><span class="action-icon">'+icon+'</span>'+label+'</button>').join('')+'</div><div class="popup-route '+(routedMallIds.includes(mall.id)?'visible':'')+'">'+(routedMallIds.includes(mall.id)?'✓ Added to your route':'')+'</div><a class="popup-directions" data-action="directions">Get directions <span>↗</span></a></article>'}
 malls.forEach((mall,index)=>{const marker=L.marker([mall.latitude,mall.longitude],{icon:L.divIcon({className:'pin-wrap',html:'<div class="pin '+(mall.hoursValid&&mall.isOpen?'open':'')+'">'+(index+1)+'</div>',iconSize:[38,38],iconAnchor:[19,19]})});
marker.bindPopup(popupHtml(mall),{autoPan:true,keepInView:true,maxWidth:300,minWidth:240,offset:[0,-6]});
marker.on('click',()=>selectMall(mall.id,false));
marker.on('popupopen',event=>{const root=event.popup.getElement();if(!root)return;const route=root.querySelector('.popup-route');if(route){route.textContent=routedMallIds.includes(mall.id)?'✓ Added to your route':'';route.classList.toggle('visible',routedMallIds.includes(mall.id))}root.querySelector('.popup-close')?.addEventListener('click',()=>{map.closePopup();if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('mall:close')});root.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const action=button.getAttribute('data-action');if(action&&window.ReactNativeWebView)window.ReactNativeWebView.postMessage('action:'+action+':'+mall.id)}))});
marker.addTo(map)});
map.on('click',()=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('mall:close')});
window.updateStatuses=(statuses)=>{Object.assign(currentStatuses,statuses);Object.keys(markers).forEach(id=>{const status=currentStatuses[id]||{};const node=markers[id].getElement();const pin=node&&node.querySelector('.pin');if(pin)pin.classList.toggle('open',!!status.hoursValid&&!!status.isOpen);const popup=markers[id].getPopup().getElement();if(!popup)return;const badge=popup.querySelector('.popup-status');if(badge){badge.textContent=status.hoursValid?(status.isHoliday?'CLOSED FOR HOLIDAY':status.isOpen?'OPEN NOW':'CLOSED'):'HOURS UNAVAILABLE';badge.classList.toggle('closed',!status.hoursValid||!status.isOpen)}const local=popup.querySelector('.popup-local');if(local)local.textContent=(status.localTime||'--:--')+' local time · '+(malls.find(item=>item.id===id)?.timezone||'')})};
window.showRadius=(id)=>{if(radiusLayer){map.removeLayer(radiusLayer);radiusLayer=null}if(id){const mall=malls.find(item=>item.id===id);if(mall)radiusLayer=L.circle([mall.latitude,mall.longitude],{radius:5000,className:'radius',weight:1.5}).addTo(map)}};
if(selectedCountry)map.flyToBounds(countryBounds,{padding:[28,28],maxZoom:12,duration:.5});
document.getElementById('map-shell')?.classList.add('has-leaflet');
window.setVisibleMarkers(currentVisibleMallIds);
window.updateStatuses(currentStatuses);
if(fallbackSelectedMallId)window.selectMall(fallbackSelectedMallId);
if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage('map:ready');
};
loadLeaflet(['https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js'],0);
</script></body></html>`;
}

function localClock(now: Date, timezone: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
    }).format(now);
  } catch (error) {
    if (error instanceof RangeError) return "--:--";
    throw error;
  }
}

export default function App() {
  const [malls, setMalls] = useState<Mall[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>("India");
  const [now, setNow] = useState(() => new Date());
  const [routedIds, setRoutedIds] = useState<Set<string>>(new Set());
  const [radiusMallId, setRadiusMallId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode | null>(null);
  const [editingMall, setEditingMall] = useState<Mall | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [addressDraft, setAddressDraft] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [mapTileError, setMapTileError] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "closed">("all");
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const mapRef = useRef<WebView>(null);
  const pageScrollRef = useRef<ScrollView>(null);
  const loadRequest = useRef(0);
  const visibleMalls = useMemo(() => {
    return filterMalls(malls, {
      country: selectedCountry,
      query: search,
      status: statusFilter,
      now,
    });
  }, [malls, now, search, selectedCountry, statusFilter]);
  const selectedMall = useMemo(
    () => visibleMalls.find((mall) => mall.id === selectedId) ?? null,
    [selectedId, visibleMalls],
  );
  const selectedMallStatus = selectedMall ? getMallStatus(selectedMall, now) : null;
  const visibleMallIdsKey = visibleMalls.map((mall) => mall.id).join("|");
  const visibleMallIds = useMemo(
    () => visibleMallIdsKey ? visibleMallIdsKey.split("|") : [],
    [visibleMallIdsKey],
  );
  const markerStatuses = Object.fromEntries(malls.map((mall) => [
    mall.id,
    getMallStatus(mall, now),
  ]));
  const markerStatusesKey = JSON.stringify(markerStatuses);
  const routedMallIdsKey = JSON.stringify([...routedIds]);
  const countryMalls = useMemo(
    () => (selectedCountry ? malls.filter((mall) => mall.country === selectedCountry) : []),
    [malls, selectedCountry],
  );
  const mapHtml = useMemo(
    () => createMapDocument(countryMalls, selectedCountry),
    [countryMalls, selectedCountry],
  );

  const loadMalls = useCallback(async () => {
    const request = ++loadRequest.current;
    setLoading(true);
    setLoadError(null);
    try {
      const items = await mockMallRepository.getMalls("India");
      if (request !== loadRequest.current) return;
      setMalls(items);
      setLoading(false);
    } catch (error) {
      if (request !== loadRequest.current) return;
      setLoadError(error instanceof Error ? error.message : "Unable to load mall data.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMalls();
    return () => {
      loadRequest.current += 1;
    };
  }, [loadMalls]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => NetInfo.addEventListener((state) => {
    const connected = state.isConnected !== false && state.isInternetReachable !== false;
    setIsOnline(connected);
    if (connected) {
      setMapTileError(false);
      mapRef.current?.injectJavaScript("window.retryTiles&&window.retryTiles(); true;");
    }
  }), []);

  useEffect(() => {
    if (!mapReady) return;
    const commands = [
      `window.setVisibleMarkers&&window.setVisibleMarkers(${JSON.stringify(visibleMallIds)})`,
      `window.updateStatuses&&window.updateStatuses(${markerStatusesKey})`,
    ];
    mapRef.current?.injectJavaScript(`${commands.join(";")}; true;`);
  }, [mapReady, markerStatusesKey, visibleMallIds]);

  useEffect(() => {
    if (!mapReady) return;
    if (selectedId && visibleMallIds.includes(selectedId)) {
      mapRef.current?.injectJavaScript(`window.selectMall&&window.selectMall(${JSON.stringify(selectedId)}); true;`);
    } else {
      mapRef.current?.injectJavaScript("window.clearSelection&&window.clearSelection(); true;");
    }
  }, [mapReady, selectedId, visibleMallIds]);

  useEffect(() => {
    if (!mapReady) return;
    mapRef.current?.injectJavaScript(`window.showRadius&&window.showRadius(${JSON.stringify(radiusMallId)}); true;`);
  }, [mapReady, radiusMallId]);

  useEffect(() => {
    if (!mapReady) return;
    mapRef.current?.injectJavaScript(`window.setRoutedMarkers&&window.setRoutedMarkers(${routedMallIdsKey}); true;`);
  }, [mapReady, routedMallIdsKey]);

  function onMapMessage(event: WebViewMessageEvent) {
    const message = event.nativeEvent.data;
    if (message === "map:ready") {
      setMapReady(true);
    } else if (message.startsWith("map:error:")) {
      setMapReady(true);
      setMapTileError(true);
    } else if (message === "network:degraded") {
      setMapTileError(true);
    } else if (message === "network:online") {
      setMapTileError(false);
    } else if (message === "mall:close") {
      setSelectedId(null);
    } else if (message.startsWith("action:")) {
      const [, action, mallId] = message.split(":");
      const mall = malls.find((item) => item.id === mallId);
      if (
        mall &&
        (action === "edit-marker" ||
          action === "delete" ||
          action === "edit-data" ||
          action === "route" ||
          action === "radius" ||
          action === "website" ||
          action === "street-view" ||
          action === "directions" ||
          action === "phone" ||
          action === "match")
      ) {
        handleAction(action, mall);
      }
    } else if (message === "country:India") {
      setSelectedCountry("India");
      setSelectedId(null);
    } else {
      const mallId = message.startsWith("mall:") ? message.slice(5) : message;
      const mall = malls.find((item) => item.id === mallId);
      if (mall) {
        setSelectedCountry(mall.country);
        setSearch("");
        setStatusFilter("all");
        setSelectedId(mall.id);
      }
    }
  }

  function selectMallFromList(mall: Mall) {
    if (selectedCountry !== mall.country) setSelectedCountry(mall.country);
    setSelectedId(mall.id);
  }

  async function findNearestMall() {
    if (visibleMalls.length === 0) {
      Alert.alert("No matching malls", "Clear the current search or status filter, then try again.");
      return;
    }
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Location permission needed", "Allow location access to find the nearest Phoenix Mall.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const radians = (degrees: number) => degrees * Math.PI / 180;
      const distance = (mall: Mall) => {
        const lat1 = radians(position.coords.latitude);
        const lat2 = radians(mall.latitude);
        const deltaLat = lat2 - lat1;
        const deltaLon = radians(mall.longitude - position.coords.longitude);
        const a = Math.sin(deltaLat / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      const nearest = [...visibleMalls].sort((a, b) => distance(a) - distance(b))[0];
      setSelectedCountry(nearest.country);
      setSelectedId(nearest.id);
      Alert.alert("Nearest Phoenix Mall", `${nearest.name} · ${Math.round(distance(nearest))} km away`);
    } catch (error) {
      Alert.alert(
        "Unable to get your location",
        error instanceof Error ? error.message : "Please try again or check location settings.",
      );
    }
  }

  function openEdit(mall: Mall, mode: EditMode) {
    setEditingMall(mall);
    setEditMode(mode);
    setNameDraft(mall.name);
    setAddressDraft(mall.address);
  }

  function saveEdit() {
    if (!editingMall) return;
    if (!nameDraft.trim() || !addressDraft.trim()) {
      Alert.alert("Missing details", "Mall name and address are required.");
      return;
    }
    setMalls((current) =>
      current.map((mall) =>
        mall.id === editingMall.id
          ? { ...mall, name: nameDraft.trim(), address: addressDraft.trim() }
          : mall,
      ),
    );
    setEditMode(null);
  }

  function removeMall(mall: Mall) {
    Alert.alert("Remove this mall?", `${mall.name} will be removed from this map view.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete marker",
        style: "destructive",
        onPress: () => {
          setMalls((current) => current.filter((item) => item.id !== mall.id));
          setRoutedIds((current) => {
            const next = new Set(current);
            next.delete(mall.id);
            return next;
          });
          setSelectedId((current) => current === mall.id ? null : current);
          setRadiusMallId((current) => current === mall.id ? null : current);
        },
      },
    ]);
  }

  async function openLink(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open link", "Please check that a compatible app is installed.");
    }
  }

  function handleAction(action: MapAction, mall: Mall) {
    if (action === "edit-marker" || action === "edit-data") {
      openEdit(mall, action === "edit-marker" ? "marker" : "data");
      return;
    }
    if (action === "delete") {
      removeMall(mall);
      return;
    }
    if (action === "route") {
      setRoutedIds((current) => {
        const next = new Set(current);
        if (next.has(mall.id)) next.delete(mall.id);
        else next.add(mall.id);
        return next;
      });
      return;
    }
    if (action === "radius") {
      setRadiusMallId((current) => current === mall.id ? null : mall.id);
      return;
    }
    if (action === "website") {
      void openLink(mall.website);
      return;
    }
    if (action === "directions") {
      void openLink(`https://www.google.com/maps/dir/?api=1&destination=${mall.latitude},${mall.longitude}`);
      return;
    }
    if (action === "phone") {
      void openLink(`tel:${mall.phone.replace(/[^\d+]/g, "")}`);
      return;
    }
    if (action === "street-view") {
      void openLink(`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${mall.latitude},${mall.longitude}`);
      return;
    }
    Alert.alert("Match up data", `${mall.name} is matched with the Phoenix directory.`);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f2] dark:bg-[#111a15]" edges={["top", "left", "right"]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View className="flex-row items-center gap-2.5">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#176b4b]">
            <Text className="font-serif text-2xl italic text-white">p</Text>
          </View>
          <Text className="text-[17px] font-bold tracking-tight text-[#1b3729] dark:text-[#e7eee8]">
            phoenix<Text className="font-normal text-[#6c8a78] dark:text-[#9bb9a5]">malls</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="flex-row items-center gap-1.5 rounded-full border border-[#e5eee8] bg-white px-3 py-2 dark:border-[#34443a] dark:bg-[#1b2820]">
            <View className="h-1.5 w-1.5 rounded-full bg-[#36a675]" />
            <Text className="text-[10px] font-semibold text-[#496955] dark:text-[#b8d5c2]">Live mall status</Text>
          </View>
          <Pressable
            onPress={() => setColorScheme(isDark ? "light" : "dark")}
            className="h-9 w-9 items-center justify-center rounded-xl border border-[#e5e9e5] bg-white dark:border-[#34443a] dark:bg-[#1b2820]"
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            {isDark ? <Sun size={16} color="#e6c56b" /> : <Moon size={16} color="#496955" />}
          </Pressable>
        </View>
      </View>

      <ScrollView ref={pageScrollRef} className="flex-1 dark:bg-[#111a15]" contentContainerClassName="pb-6" showsVerticalScrollIndicator={!!selectedMall}>
        <View className="px-5 pb-3 pt-2">
          <Text className="text-[10px] font-bold tracking-[1.5px] text-[#438364]">DISCOVER PHOENIX</Text>
          <View className="mt-1 flex-row items-end justify-between">
            <Text className="text-[27px] font-semibold leading-8 tracking-tight text-[#1b3426] dark:text-[#e7eee8]">
              Find your{"\n"}<Text className="font-serif italic text-[#3d8b67] dark:text-[#83bd98]">happy place.</Text>
            </Text>
            <View className="mb-1 flex-row items-center gap-1.5 rounded-full bg-[#e8f3eb] px-2.5 py-1.5">
              <MapPin size={13} color="#32784f" />
              <Text className="text-[10px] font-semibold text-[#32784f]">India · {visibleMalls.length} malls</Text>
            </View>
          </View>
          <Text className="mt-1.5 text-[11px] text-[#869188] dark:text-[#9ba99f]">Explore destinations, wherever you are.</Text>
        </View>

        {isOnline === false && (
          <View className="mx-4 mb-3 flex-row items-center gap-2 rounded-xl border border-[#eadfc9] bg-[#fffaf0] px-3 py-2.5 dark:border-[#5b4b2d] dark:bg-[#332b1b]">
            <Compass size={14} color="#92733d" />
            <Text className="flex-1 text-[10px] font-medium text-[#72592c] dark:text-[#e4d3a8]">Offline · mall details remain available</Text>
            <Pressable
              onPress={() => {
                mapRef.current?.injectJavaScript("window.retryTiles&&window.retryTiles(); true;");
                mapRef.current?.reload();
              }}
              accessibilityRole="button"
            >
              <Text className="text-[10px] font-bold text-[#72592c] dark:text-[#f0dbab]">Retry</Text>
            </Pressable>
          </View>
        )}

        <View className="mx-4 mb-3 flex-row rounded-xl border border-[#e5eae4] bg-white p-1 dark:border-[#34443a] dark:bg-[#1b2820]">
          <Pressable
            onPress={() => {
              setSelectedCountry(null);
              setSelectedId(null);
            }}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-[9px] py-2.5 ${selectedCountry === null ? "bg-[#176b4b]" : "bg-transparent"}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCountry === null }}
          >
            <Compass size={14} color={selectedCountry === null ? "#fff" : "#627469"} />
            <Text className={`text-[10px] font-semibold ${selectedCountry === null ? "text-white" : "text-[#627469]"}`}>World map</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setSelectedCountry("India");
              setSelectedId(null);
            }}
            className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-[9px] py-2.5 ${selectedCountry === "India" ? "bg-[#176b4b]" : "bg-transparent"}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCountry === "India" }}
          >
            <MapPin size={14} color={selectedCountry === "India" ? "#fff" : "#627469"} />
            <Text className={`text-[10px] font-semibold ${selectedCountry === "India" ? "text-white" : "text-[#627469]"}`}>India · {visibleMalls.length} malls</Text>
          </Pressable>
        </View>

        {selectedCountry && (
          <View className="mx-4 mb-3 flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-2 rounded-xl border border-[#e5eae4] bg-white px-3 dark:border-[#34443a] dark:bg-[#1b2820]">
              <Search size={14} color={isDark ? "#9aafa0" : "#829087"} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search malls or cities"
                placeholderTextColor={isDark ? "#829087" : "#a1aaa3"}
                className="h-10 flex-1 text-[11px] text-[#283a2e] dark:text-[#d9e5dc]"
                accessibilityLabel="Search malls or cities"
              />
              {!!search && <Pressable onPress={() => setSearch("")} accessibilityLabel="Clear search"><X size={14} color="#829087" /></Pressable>}
            </View>
            <Pressable
              onPress={() => setStatusFilter((value) => value === "all" ? "open" : value === "open" ? "closed" : "all")}
              className={`h-10 min-w-[68px] flex-row items-center justify-center gap-1.5 rounded-xl border px-2 ${statusFilter === "all" ? "border-[#e5eae4] bg-white dark:border-[#34443a] dark:bg-[#1b2820]" : "border-[#bcd6c1] bg-[#eaf4ec] dark:border-[#3f7050] dark:bg-[#26372c]"}`}
              accessibilityRole="button"
              accessibilityLabel={`Filter malls, currently showing ${statusFilter}`}
            >
              <SlidersHorizontal size={15} color={statusFilter === "all" ? (isDark ? "#b8d5c2" : "#627469") : "#28744f"} />
              <Text className={`text-[9px] font-semibold ${statusFilter === "all" ? "text-[#627469] dark:text-[#b8d5c2]" : "text-[#28744f] dark:text-[#a8d1b3]"}`}>
                {statusFilter === "all" ? "All" : statusFilter === "open" ? "Open" : "Closed"}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => void findNearestMall()}
              className="h-10 w-10 items-center justify-center rounded-xl bg-[#176b4b]"
              accessibilityRole="button"
              accessibilityLabel="Find nearest mall"
            >
              <Crosshair size={15} color="white" />
            </Pressable>
          </View>
        )}

        {mapTileError && isOnline !== false && (
          <View className="mx-4 mb-2 flex-row items-center justify-between rounded-lg bg-[#fff7e8] px-3 py-2 dark:bg-[#332b1b]">
            <Text className="text-[9px] text-[#72592c] dark:text-[#e4d3a8]">Some map tiles could not load</Text>
            <Pressable onPress={() => mapRef.current?.injectJavaScript("window.retryTiles&&window.retryTiles(); true;")} accessibilityRole="button">
              <Text className="text-[9px] font-bold text-[#72592c] dark:text-[#f0dbab]">Retry</Text>
            </Pressable>
          </View>
        )}

        <View
          className="mx-4 mt-1 h-[42%] min-h-[340px] max-h-[400px] overflow-hidden rounded-[20px] border border-[#e4eae4] bg-[#e9eee8] shadow-sm dark:border-[#34443a] dark:bg-[#17221b]"
        >
          <WebView
            ref={mapRef}
            source={{ html: mapHtml }}
            originWhitelist={["*"]}
            javaScriptEnabled
            domStorageEnabled
            onMessage={onMapMessage}
            onLoadStart={() => {
              setMapReady(false);
            }}
            onError={() => {
              setMapReady(true);
              setMapTileError(true);
            }}
            style={{ flex: 1, backgroundColor: isDark ? "#17221b" : "#e9eee8" }}
            accessibilityLabel="Interactive map of Phoenix Malls in India"
            androidLayerType="hardware"
          />
          <View pointerEvents="none" className="absolute left-3 top-3 rounded-lg border border-white/80 bg-white/90 px-2.5 py-2">
            <Text className="text-[8px] font-bold tracking-[1px] text-[#50675a]">{selectedCountry ? "MUMBAI · PUNE REGION" : "WORLD MAP · TAP INDIA"}</Text>
          </View>
          <View className="absolute bottom-3 left-3 flex-row items-center gap-2 rounded-lg border border-white/80 bg-white/90 px-2.5 py-2">
            <View className="h-1.5 w-1.5 rounded-full bg-[#36a675]" />
            <Text className="text-[9px] text-[#637469]">Open</Text>
            <View className="ml-1 h-1.5 w-1.5 rounded-full bg-[#d76b60]" />
            <Text className="text-[9px] text-[#637469]">Closed</Text>
          </View>
        </View>

        {selectedMall && (
          <View
            key={selectedMall.id}
            onLayout={(event) => {
              const detailsY = event.nativeEvent.layout.y;
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  pageScrollRef.current?.scrollTo({
                    y: Math.max(0, detailsY - 12),
                    animated: true,
                  });
                });
              });
            }}
            className="mx-4 mt-3 overflow-hidden rounded-[22px] border border-[#e3eae3] bg-white shadow-sm dark:border-[#34443a] dark:bg-[#1b2820]"
          >
            <View className="relative h-[148px] bg-[#dce9df] dark:bg-[#26372c]">
              <Image
                source={{ uri: selectedMall.image }}
                className="h-full w-full"
                resizeMode="cover"
                accessibilityLabel={`${selectedMall.name} exterior`}
              />
              <View className="absolute inset-0 bg-black/20" />
              <View className="absolute bottom-3 left-3 flex-row items-center gap-2">
                <View className={`rounded-full px-3 py-1.5 ${selectedMallStatus?.hoursValid && selectedMallStatus.isOpen ? "bg-[#e7f6ec]" : "bg-[#fff0ed]"}`}>
                  <Text className={`text-[10px] font-bold ${selectedMallStatus?.hoursValid && selectedMallStatus.isOpen ? "text-[#24734d]" : "text-[#ae574e]"}`}>
                    {selectedMallStatus?.hoursValid
                      ? selectedMallStatus.isHoliday
                        ? "CLOSED FOR HOLIDAY"
                        : selectedMallStatus.isOpen
                          ? "OPEN NOW"
                          : "CLOSED"
                      : "HOURS UNAVAILABLE"}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => setSelectedId(null)}
                className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-black/55"
                accessibilityRole="button"
                accessibilityLabel="Close mall details"
              >
                <X size={17} color="white" />
              </Pressable>
            </View>

            <View className="p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-[9px] font-bold tracking-[1.1px] text-[#829087] dark:text-[#9ba99f]">
                  MALL DETAILS
                </Text>
                <Text className="text-[9px] text-[#829087] dark:text-[#9ba99f]">
                  Scroll for actions
                </Text>
              </View>
              <Text className="text-[10px] font-semibold uppercase tracking-[1px] text-[#6e8a77] dark:text-[#a8c0ad]">
                {selectedMall.city} · {selectedMall.country}
              </Text>
              <Text className="mt-1 text-[19px] font-bold leading-6 text-[#20372a] dark:text-[#e7eee8]">
                {selectedMall.name}
              </Text>

              <View className="mt-3 gap-3">
                <View className="flex-row items-start gap-2.5">
                  <MapPin size={16} color={isDark ? "#9eb9a4" : "#62816b"} />
                  <Text className="flex-1 text-[12px] leading-[18px] text-[#617267] dark:text-[#b8c7bc]">
                    {selectedMall.address}
                  </Text>
                </View>
                <View className="flex-row items-start gap-2.5">
                  <Clock3 size={16} color={isDark ? "#9eb9a4" : "#62816b"} />
                  <View className="flex-1">
                    <Text className="text-[12px] font-semibold text-[#43594b] dark:text-[#d9e5dc]">
                      Today · {selectedMall.openingTime} – {selectedMall.closingTime}
                    </Text>
                    <Text className="mt-0.5 text-[10px] text-[#87948a] dark:text-[#9ba99f]">
                      {localClock(now, selectedMall.timezone)} local time · {selectedMall.timezone}
                    </Text>
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleAction("phone", selectedMall)}
                    className="flex-1 flex-row items-center gap-2 rounded-xl bg-[#f3f7f3] px-3 py-2.5 dark:bg-[#26372c]"
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${selectedMall.name}`}
                  >
                    <Phone size={15} color={isDark ? "#a8d1b3" : "#34744d"} />
                    <Text numberOfLines={1} className="flex-1 text-[11px] font-medium text-[#43624d] dark:text-[#c5dac9]">
                      {selectedMall.phone}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAction("directions", selectedMall)}
                    className="flex-row items-center justify-center gap-1.5 rounded-xl bg-[#176b4b] px-3"
                    accessibilityRole="button"
                    accessibilityLabel={`Get directions to ${selectedMall.name}`}
                  >
                    <Navigation size={14} color="white" />
                    <Text className="text-[10px] font-bold text-white">Directions</Text>
                  </Pressable>
                </View>
              </View>

              <View className="mt-4 border-t border-[#edf1ed] pt-3 dark:border-[#34443a]">
                <Text className="mb-2.5 text-[9px] font-bold tracking-[1px] text-[#829087] dark:text-[#9ba99f]">
                  QUICK ACTIONS
                </Text>
                <View className="flex-row flex-wrap">
                  {([
                    ["edit-marker", "Edit marker", Pencil],
                    ["delete", "Delete", Trash2],
                    ["edit-data", "Edit data", Building2],
                    ["route", routedIds.has(selectedMall.id) ? "Remove route" : "Add to route", Route],
                    ["radius", radiusMallId === selectedMall.id ? "Hide radius" : "Draw radius", CircleDashed],
                    ["website", "Website", Globe2],
                    ["street-view", "Street view", Eye],
                    ["match", "Match data", GitCompareArrows],
                  ] as const).map(([action, label, Icon]) => {
                    const isDestructive = action === "delete";
                    return (
                      <Pressable
                        key={action}
                        onPress={() => handleAction(action, selectedMall)}
                        className="w-1/4 items-center px-0.5 pb-2"
                        accessibilityRole="button"
                        accessibilityLabel={label}
                      >
                        <View className={`h-11 w-full items-center justify-center rounded-xl border ${isDestructive ? "border-[#f0e2df] bg-[#fff9f8] dark:border-[#59403c] dark:bg-[#30211f]" : "border-[#e8eee8] bg-[#fbfcfb] dark:border-[#34443a] dark:bg-[#202d24]"}`}>
                          <Icon size={17} color={isDestructive ? "#b65f56" : isDark ? "#a8d1b3" : "#397651"} />
                        </View>
                        <Text numberOfLines={2} className={`mt-1 text-center text-[9px] leading-3 ${isDestructive ? "text-[#a85c55]" : "text-[#65756a] dark:text-[#b8c7bc]"}`}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {routedIds.has(selectedMall.id) && (
                  <View className="mt-1 rounded-lg bg-[#edf7ef] px-3 py-2 dark:bg-[#26372c]">
                    <Text className="text-[10px] font-medium text-[#31734d] dark:text-[#a8d1b3]">
                      Added to your route
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View className="px-4 pt-4">
          <View className="mb-2.5 flex-row items-center justify-between">
            <View>
              <Text className="text-[9px] font-bold tracking-[1.2px] text-[#829087] dark:text-[#9ba99f]">DESTINATIONS</Text>
              <Text className="mt-1 text-[15px] font-bold text-[#21372a] dark:text-[#e7eee8]">{selectedCountry ?? "Choose a country"} <Text className="text-[#5b8a69] dark:text-[#83bd98]">({selectedCountry ? visibleMalls.length : 0})</Text></Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="h-1.5 w-1.5 rounded-full bg-[#36a675]" />
              <Text className="text-[10px] font-medium text-[#56826a]">{selectedCountry ? malls.filter((mall) => {
                const status = getMallStatus(mall, now);
                return status.hoursValid && status.isOpen;
              }).length : 0} open now</Text>
            </View>
          </View>
          <Text className="mb-2 text-[9px] text-[#89948b] dark:text-[#9ba99f]">
            {visibleMalls.length} places · {statusFilter === "all" ? "all statuses" : `${statusFilter} only`}
          </Text>
          {visibleMalls.length === 0 && !loading && !loadError ? (
            <View className="mb-2 items-center rounded-xl border border-[#e5eae4] bg-white px-4 py-4 dark:border-[#34443a] dark:bg-[#1b2820]">
              <Search size={17} color={isDark ? "#9aafa0" : "#829087"} />
              <Text className="mt-2 text-[11px] font-semibold text-[#405249] dark:text-[#d9e5dc]">No malls match your search</Text>
              <Text className="mt-1 text-center text-[9px] text-[#89948b] dark:text-[#9ba99f]">
                {statusFilter === "closed" && !search.trim()
                  ? "No malls are closed right now."
                  : "Try a different mall or city name."}
              </Text>
              <Pressable
                onPress={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setSelectedId(null);
                }}
                className="mt-2 rounded-lg bg-[#eaf4ec] px-3 py-2 dark:bg-[#26372c]"
                accessibilityRole="button"
                accessibilityLabel="Clear search and reset mall status filter"
              >
                <Text className="text-[10px] font-semibold text-[#28744f] dark:text-[#a8d1b3]">Clear search and filters</Text>
              </Pressable>
            </View>
          ) : null}
          {selectedCountry ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-2">
            {visibleMalls.map((mall) => {
              const active = mall.id === selectedId;
              const status = getMallStatus(mall, now);
              const mapNumber = countryMalls.findIndex((item) => item.id === mall.id) + 1;
              return (
                <Pressable
                  key={mall.id}
                  onPress={() => selectMallFromList(mall)}
                  className={`flex-row items-center gap-2 rounded-xl border px-3 py-2.5 ${active ? "border-[#bcd6c1] bg-[#f0f7f1] dark:border-[#3f7050] dark:bg-[#26372c]" : "border-[#e7ebe6] bg-white dark:border-[#34443a] dark:bg-[#1b2820]"}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Show ${mall.name} on map`}
                >
                  <View className={`h-7 w-7 items-center justify-center rounded-lg ${status.isOpen ? "bg-[#e8f3eb]" : "bg-[#f9eeeb]"}`}>
                    <Building2 size={14} color={status.isOpen ? "#3e865e" : "#b76a5e"} />
                  </View>
                  <View className="max-w-[172px]">
                    <Text numberOfLines={1} className="text-[10px] font-semibold text-[#283a2e] dark:text-[#d9e5dc]">{mall.name}</Text>
                    <Text className="mt-0.5 text-[9px] text-[#89948b] dark:text-[#9ba99f]">{String(mapNumber).padStart(2, "0")} · {mall.city}</Text>
                  </View>
                  <ChevronRight size={14} color={active ? "#538367" : "#a4ada6"} />
                </Pressable>
              );
            })}
          </ScrollView> : (
            <Pressable
              onPress={() => setSelectedCountry("India")}
              className="flex-row items-center gap-3 rounded-xl border border-[#d9e9dc] bg-white p-3 dark:border-[#34443a] dark:bg-[#1b2820]"
            >
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#e9f3eb]">
                <Text className="text-[10px] font-extrabold text-[#28744f]">IN</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold text-[#283a2e] dark:text-[#d9e5dc]">India</Text>
                <Text className="mt-1 text-[9px] text-[#89948b] dark:text-[#9ba99f]">{malls.length} Phoenix destinations</Text>
              </View>
              <ChevronRight size={15} color="#538367" />
            </Pressable>
          )}
        </View>

        {loading && (
          <View className="mx-4 mt-2 items-center rounded-2xl border border-[#e5eae4] bg-white p-5">
            <Text className="text-[11px] text-[#607166]">Finding Phoenix Malls…</Text>
          </View>
        )}
        {!loading && loadError && (
          <View className="mx-4 mt-2 items-center gap-2 rounded-2xl border border-[#f0dfdc] bg-white p-5">
            <Text className="text-[12px] font-semibold text-[#a5544d]">We couldn’t load the malls</Text>
            <Text className="text-center text-[10px] text-[#77847a]">{loadError}</Text>
            <Pressable onPress={() => void loadMalls()} className="rounded-lg bg-[#eaf4ec] px-3 py-2">
              <Text className="text-[10px] font-semibold text-[#28744f]">Try again</Text>
            </Pressable>
          </View>
        )}
        {!loading && !loadError && selectedCountry && malls.length === 0 && (
          <View className="mx-4 mt-2 items-center rounded-2xl border border-[#e5eae4] bg-white p-5">
            <Text className="text-[11px] font-semibold text-[#405249]">No malls in this country yet</Text>
            <Text className="mt-1 text-center text-[10px] text-[#89948b]">Choose another highlighted country on the map.</Text>
          </View>
        )}
        {!loading && !loadError && selectedCountry && !selectedId && visibleMalls.length > 0 && (
          <View className="mx-4 mt-2 rounded-2xl border border-[#e5eae4] bg-white p-5">
            <Text className="text-center text-[12px] text-[#607166]">Select a mall marker to explore details.</Text>
          </View>
        )}
        <View className="mt-3 flex-row items-center justify-center gap-1.5 pb-2">
          <Clock3 size={12} color="#849187" />
          <Text className="text-[9px] text-[#929b94]">Live hours · OpenStreetMap</Text>
        </View>
      </ScrollView>

      <Modal visible={editMode !== null} transparent animationType="fade" onRequestClose={() => setEditMode(null)} statusBarTranslucent>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="flex-1 bg-black/40"
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 20, paddingVertical: 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            <View className="w-full max-w-[480px] self-center rounded-[20px] bg-white p-5">
              <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[16px] font-bold text-[#23372a]">{editMode === "marker" ? "Edit map marker" : "Edit mall details"}</Text>
                  <Text className="mt-1 text-[11px] text-[#77847a]">Changes apply to this local preview.</Text>
                </View>
                <Pressable onPress={() => setEditMode(null)} className="h-8 w-8 items-center justify-center rounded-lg bg-[#f1f4f1]" accessibilityLabel="Close edit dialog">
                  <X size={16} color="#68776d" />
                </Pressable>
              </View>
              <Text className="mb-1.5 text-[10px] font-semibold text-[#5d6c61]">Mall name</Text>
              <TextInput value={nameDraft} onChangeText={setNameDraft} autoFocus className="mb-3 h-10 rounded-[9px] border border-[#dfe7df] bg-[#fbfcfb] px-3 text-[12px] text-[#263b2e]" />
              <Text className="mb-1.5 text-[10px] font-semibold text-[#5d6c61]">Address</Text>
              <TextInput value={addressDraft} onChangeText={setAddressDraft} className="h-10 rounded-[9px] border border-[#dfe7df] bg-[#fbfcfb] px-3 text-[12px] text-[#263b2e]" />
              <View className="mt-5 flex-row justify-end gap-2">
                <Pressable onPress={() => setEditMode(null)} className="h-10 items-center justify-center rounded-[10px] border border-[#e3e9e3] px-4">
                  <Text className="text-[11px] font-semibold text-[#53675a]">Cancel</Text>
                </Pressable>
                <Pressable onPress={saveEdit} className="h-10 flex-row items-center justify-center gap-1.5 rounded-[10px] bg-[#176b4b] px-4">
                  <Check size={14} color="white" />
                  <Text className="text-[11px] font-semibold text-white">Save changes</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
