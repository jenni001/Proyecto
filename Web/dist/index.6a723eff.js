function e(e){return e&&e.__esModule?e.default:e}var a;a=L;var t,n="";function o(){var e=`${document.getElementById("iUsuario").value}`,a=`${document.getElementById("iContrasena").value}`;$.ajax({type:"POST",dataType:"json",contentType:"application/json",url:"http://10.10.17.194/api/Users/authenticate/",data:JSON.stringify({username:`${e}`,password:`${a}`}),headers:{accept:"application/json",dataType:"json",contentType:"application/json"}}).then((function(e){n=e.token,localStorage.setItem("sToken",n),window.location="pagina.html"})).fail((function(e){console.log(e),alert("Usuario o contraseña incorrecta.")}))}$("document").ready((function(){$("#boton").on("click",o),window.location.href.indexOf("pagina")>-1&&(n=localStorage.getItem("sToken"),t=e(a).map("map").setView([43.3125271,-1.8986133],p),e(a).tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(t),$.ajax({type:"GET",dataType:"html",url:"http://10.10.17.194/api/Meteorologia",headers:{accept:"application/json",authorization:"Bearer "+n}}).fail((function(e){console.log("ERROR: "+e)})).then((function(n){if((i=JSON.parse(n)).forEach((n=>{const o=new(e(a).marker)([n.latitud,n.longitud],{customId:`m${n.codigo}`,icon:c}).bindPopup(n.nombre).addTo(t).on("click",(function(){g(n.codigo).then((function(e){r=JSON.parse(e),l.push(r),function(e,a){document.getElementsByClassName("bi bi-x-square").length<4&&!document.getElementById(`${e.codigo}`)&&(a.setIcon(s),$("#panelesPueblos").append(`<div class='card' id='${e.codigo}'><i class="bi bi-x-square" id="b${e.codigo}"></i><h7 class="card-title">${e.nombre.toUpperCase()}</h7><p class="card-text" id="pTemperatura${e.codigo}">Temperatura: ${r.temperatura}</p><p class="card-text" id="pHumedad${e.codigo}">Humedad: ${r.humedad}</div>`),$(".card-text").draggable({revert:"invalid",helper:"clone",start:function(e){m=e.target.id}}),d[e.codigo].visible=!0,d[e.codigo].temperatura=!0,d[e.codigo].humedad=!0,localStorage.Paneles=JSON.stringify(d))}(n,o),h(n.codigo,o),f(n.codigo)}))}));u.push(o)})),null==localStorage.Paneles){d={};for(var o=0;o<i.length;o++)d[i[o].codigo]={visible:!1,temperatura:!1,humedad:!1,viento:!1,presion:!1};localStorage.Paneles=JSON.stringify(d)}else!function(e){for(const a in e){const t=e[a];t.visible&&g(a).then((function(e){let n;r=JSON.parse(e),l.push(r),u.forEach((e=>{e.options.customId==`m${a}`&&(n=e)})),n.setIcon(s),$("#panelesPueblos").append(`<div class='card' id='${a}'><i class="bi bi-x-square" id="b${a}"></i><h7 class="card-title">${r.nombre.toUpperCase()}</h7></div>`),t.temperatura&&$(`#${a}`).append(`<p id="pTemperatura${a}" class="card-text">Temperatura: ${r.temperatura}</p>`),t.humedad&&$(`#${a}`).append(`<p id="pHumedad${a}" class="card-text">Humedad: ${r.humedad}</p>`),t.viento&&$(`#${a}`).append(`<p id="pViento${a}" class="card-text">Viento: ${r.velocidadViento}</p>`),t.presion&&$(`#${a}`).append(`<p id="pPresion${a}" class="card-text">Presión Atmosferica: ${r.presionAtmosferica}</p>`),$(".card-text").draggable({revert:"invalid",helper:"clone",start:function(e){m=e.target.id}}),h(a,n),f(a)}))}}(d=JSON.parse(localStorage.Paneles))})),setInterval((function(){!function(){for(const e in d)if(d[e].visible){g(e).then((function(a){var t=l.map((function(e){return e.codigo})).indexOf(e);r=JSON.parse(a),l[t]=r,l.push(r),document.getElementById(`pTemperatura${e}`)&&(document.getElementById(`pTemperatura${e}`).innerHTML=`Temperatura: ${r.temperatura}`),document.getElementById(`pHumedad${e}`)&&(document.getElementById(`pHumedad${e}`).innerHTML=`Temperatura: ${r.humedad}`),document.getElementById(`pPresion${e}`)&&(document.getElementById(`pPresion${e}`).innerHTML=`Humedad: ${r.presionAtmosferica}`),document.getElementById(`pViento${e}`)&&(document.getElementById(`pViento${e}`).innerHTML=`Viento: ${r.velocidadViento}`)}))}}()}),6e4)),$("#panelTemperatura").draggable({revert:"invalid",helper:"clone"}),$("#panelHumedad").draggable({revert:"invalid",helper:"clone"}),$("#panelPresion").draggable({revert:"invalid",helper:"clone"}),$("#panelViento").draggable({revert:"invalid",helper:"clone"})}));var r,i,d,p=8,c=e(a).icon({customId:"",iconUrl:"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]}),s=e(a).icon({customId:"",iconUrl:"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]}),l=[],u=[],m="";function g(e){return $.ajax({type:"GET",dataType:"html",url:"http://10.10.17.194/api/Meteorologia/"+e,headers:{accept:"application/json",authorization:"Bearer "+n}}).fail((function(e){console.log("ERROR: "+e)}))}function h(e,a){$(`#b${e}`).on("click",(function(){$(`#${e}`).remove(),d[e].visible=!1,d[e].temperatura=!1,d[e].humedad=!1,localStorage.Paneles=JSON.stringify(d),a.setIcon(c)}))}function f(e){$("#"+e).droppable({drop:function(a,t){r=l.find((a=>a.codigo==e));var n=t.draggable[0].id;"panelTemperatura"!=n||document.getElementById(`pTemperatura${e}`)||($(this).append(`<p id="pTemperatura${e}" class="card-text">Temperatura: ${r.temperatura}</p>`),d[e].temperatura=!0),"panelHumedad"!=n||document.getElementById(`pHumedad${e}`)||($(this).append(`<p id="pHumedad${e}" class="card-text">Humedad: ${r.humedad}</p>`),d[e].humedad=!0),"panelPresion"!=n||document.getElementById(`pPresion${e}`)||($(this).append(`<p id="pPresion${e}" class="card-text">Presión Atmosferica: ${r.presionAtmosferica}</p>`),d[e].presion=!0),"panelViento"!=n||document.getElementById(`pViento${e}`)||($(this).append(`<p id="pViento${e}" class="card-text">Viento: ${r.velocidadViento}</p>`),d[e].viento=!0),$(".card-text").draggable({revert:"invalid",helper:"clone",start:function(e){m=e.target.id}}),localStorage.Paneles=JSON.stringify(d)}})}$("#iBasura").droppable({drop:function(e,a){var t=m,n=t.substr(0,[t.length-9]),o=t.substr([t.length-9],t.length);$(`#${t}`).remove(),"pTemperatura"==n?d[o].temperatura=!1:"pHumedad"==n?d[o].humedad=!1:"pPresion"==n?d[o].presion=!1:d[o].viento=!1,localStorage.Paneles=JSON.stringify(d)}}),$("#bMapa").click((()=>{"none"==$("#map").css("display")?($("#map").css("display","block"),$("#bMapa").removeClass("border10px")):($("#map").css("display","none"),$("#bMapa").addClass("border10px"))}));
//# sourceMappingURL=index.6a723eff.js.map
