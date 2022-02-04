import L from "leaflet";

// Docker url
 const url = `http://10.10.17.194/api/`
// Local url
//const url = `http://localhost:5000/api/`;

// Variable para el token
var sToken = "";
// Variable del mapa
var map; 

function Login() {
  // Guardo el usuario y contraseña
  var usuario = `${document.getElementById('iUsuario').value}`; 
  var contrasena = `${document.getElementById('iContrasena').value}`;

  $.ajax({
      type: "POST",
      dataType: "json",
      contentType:'application/json',
      url: url+`Users/authenticate/`,     // Usuario y contraseña
      data:JSON.stringify({
        username: `${usuario}`,
        password: `${contrasena}`,
      }),
      headers: {
        accept: "application/json",
        dataType: "json",
        contentType:'application/json',
      },
    }).then(function(data) {
      sToken = data.token;
      // Guardo el token el local
      localStorage.setItem("sToken", sToken);
      // 
      window.location="pagina.html";
    }).fail(function(err) {
      console.log(err)
        alert("Usuario o contraseña incorrecta.");
    })
  }
  $("document").ready(function () {

    // Variable boton
    var boton = $("#boton");

    boton.on("click", Login);

    if (window.location.href.indexOf("pagina") > -1) {
      // Inserción del mapa
      sToken = localStorage.getItem("sToken")
      // Introduzco el mapa
      map = L.map("map").setView([43.3125271, -1.8986133], zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      // Llamo para ubicar las balizas
      DevolverBalizas();
      // Se inicia el cargado de los datos cada minuto
      setInterval(function() {
      ActualizarDatos()
      }, 60000);  
    }
    // Convierto en draggable todos los paneles de las opciones de los datos a mostrar
    $("#panelTemperatura").draggable({
      revert: "invalid",
      helper: "clone",
    });
    $("#panelHumedad").draggable({
      revert: "invalid",
      helper: "clone",
    });
    $("#panelPresion").draggable({
      revert: "invalid",
      helper: "clone",
    });
    $("#panelViento").draggable({
      revert: "invalid",
      helper: "clone",
    });
  });

// Zoom del mapa
var zoom = 8;

// Icono para cuando este sin seleccionar
var iconoSinSeleccionar = L.icon({
  customId: "",
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// Icono para cuando este seleccionado
var iconoSeleccionado = L.icon({
  customId: "",
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
// Variables para controlar los datos y los marcadores
var oDato;
var aMunicipios;
var aPaneles;
var arrayDatos = [];
var aMarcadores = [];

// Para guardar el id del dragabble p
var idP = "";

// Funcion para obtener los datos respecto a las balizas de la bbdd
function DevolverBalizas() {
  $.ajax({
    type: "GET",
    dataType: "html",
    url: url + "Meteorologia",
    headers: {
      accept: "application/json",
      authorization: "Bearer " + sToken,      // Se introduce el token para poder acceder a los datos que la api lee
    },
  })
  .fail(function (err) {
    console.log("ERROR: " + err);
  })
  .then(function (data) {
    aMunicipios = JSON.parse(data);
    // Se crean los marcadores
    MostrarMarcadores();

    // Creamos el localStorage
    if (localStorage.Paneles == undefined) {
      aPaneles = {};
      for (var i = 0; i < aMunicipios.length; i++) {
        aPaneles[aMunicipios[i].codigo] = { 'visible': false, 'temperatura': false, 'humedad': false, 'viento': false, 'presion': false };
      }
      localStorage.Paneles = JSON.stringify(aPaneles);
    } // se obtienen los datos del localStorage
    else {
      aPaneles = JSON.parse(localStorage.Paneles);
      ObtenerLocalStorage(aPaneles);
    }
  });
}

// Funcion para obtener los datos de una baliza en cuestion
function DevolverDato(codigo) {
  return $.ajax({
    type: "GET",
    dataType: "html",
    url: url + "Meteorologia/" + codigo,
    headers: {
      accept: "application/json",
      authorization: "Bearer " + sToken,       // Se introduce el token para poder acceder a los datos que la api lee
    },
  }).fail(function (err) {
    console.log("ERROR: " + err);
  });
}

// Funcion para crear los marcadores
function MostrarMarcadores() {
  aMunicipios.forEach((element) => {
    const marker = new L.marker([element.latitud, element.longitud], { customId:`m${element.codigo}`, icon: iconoSinSeleccionar })
      .bindPopup(element.nombre)
      .addTo(map)
      // Cuando se hace click en un marcador
      .on("click", function () {
        // Se obtienen los datos
        var promise = DevolverDato(element.codigo);
        promise.then(function (response) {
          oDato = JSON.parse(response);
          arrayDatos.push(oDato);
          // Funcion para crear los paneles de las balizas
          CrearPanel(element, marker);
          // Funcion para el boton de eliminar los paneles
          CrearBotonEliminar(element.codigo, marker);
          // Se crean los elemento droppable
          CrearDroppable(element.codigo);
        });
      });
     
    aMarcadores.push(marker);
  });
}

// Eliminar las opciones de los paneles (las P)
$("#iBasura").droppable({
  drop:function(ui, event){
    var draggableId = idP;
    // Guardo la p (quitando el codigo que son los ultimos 9 caracteres)
    var sOpcion = draggableId.substr(0, [draggableId.length-9]);
    // Guardo el codigo de la baliza (los ultimos nueve caracteres del id)
    var sCodigo = draggableId.substr ([draggableId.length-9],draggableId.length);    
    // Elimino la p
    $(`#${draggableId}`).remove();

    // Actualizo el localStorage
    if (sOpcion == "pTemperatura") {
      aPaneles[sCodigo].temperatura = false; // En el localstorage "temperatura" se volvera false
    }
    else if (sOpcion  == "pHumedad") {
      aPaneles[sCodigo].humedad = false; // En el localstorage el "humedad" se volvera false
    }
    else if (sOpcion  == "pPresion") {
      aPaneles[sCodigo].presion = false; // En el localstorage el "precipitacion" se volvera false
    }
    else {
      aPaneles[sCodigo].viento = false; // En el localstorage el "viento" se volvera false
    }
    localStorage.Paneles = JSON.stringify(aPaneles); // Se guarda el cambio en el localStorage
  }
})

function ObtenerLocalStorage(aPaneles) {  
  for (const codigo in aPaneles) {
    const objeto = aPaneles[codigo];
    // Si alguna baliza esta como visible
    if (objeto["visible"]) {
      // Se obtiene el dato
      var promise = DevolverDato(codigo);
      promise.then(function (response) {
        oDato = JSON.parse(response);
        arrayDatos.push(oDato);
        let marker;
        // Buscamos el marcador por su customId
        aMarcadores.forEach(element => {
          // Recorremos los Id y se guarda el correspondiente
          if(element.options.customId==`m${codigo}`){
          marker = element;
        }
        });

        marker.setIcon(iconoSeleccionado);

        // Se añade el div
        $("#panelesPueblos").append(
          `<div class='card' id='${codigo}'><i class="bi bi-x-square" id="b${codigo}"></i><h7 class="card-title">${oDato.nombre.toUpperCase()}</h7></div>`
        );
        // Si los objetos objetos estaban guardados como true (es decir que estaban visibles)
        if (objeto["temperatura"]){
          $(`#${codigo}`).append(`<p id="pTemperatura${codigo}" class="card-text">Temperatura: ${oDato.temperatura}</p>`);
        }
        if (objeto["humedad"]){
          $(`#${codigo}`).append(`<p id="pHumedad${codigo}" class="card-text">Humedad: ${oDato.humedad}</p>`);
        } 
        if (objeto["viento"]){
          $(`#${codigo}`).append(`<p id="pViento${codigo}" class="card-text">Viento: ${oDato.velocidadViento}</p>`);
        }
        if (objeto["presion"]){
          $(`#${codigo}`).append(`<p id="pPresion${codigo}" class="card-text">Presión Atmosferica: ${oDato.presionAtmosferica}</p>`);
        } 
        
        // Convierto en draggable p
        $(`.card-text`).draggable({
          revert: "invalid",
          helper: "clone",
          start:function(ui){
            // Guardo el id del dragabble p
            idP = ui.target.id;
          }
        });

        CrearBotonEliminar(codigo, marker);
        CrearDroppable(codigo);
      });
    }      
  }
}
// Funcion para crear los div de las balizas
function CrearPanel(element, marker){
  // Si no hay 4 municipios y el municipio ese aun no existe
  if (document.getElementsByClassName("bi bi-x-square").length < 4 && !document.getElementById(`${element.codigo}`)) {
    marker.setIcon(iconoSeleccionado);
    // Se añade el div
    $("#panelesPueblos").append(
      `<div class='card' id='${element.codigo}'><i class="bi bi-x-square" id="b${element.codigo}"></i><h7 class="card-title">${element.nombre.toUpperCase()}</h7><p class="card-text" id="pTemperatura${
        element.codigo
      }">Temperatura: ${oDato.temperatura}</p><p class="card-text" id="pHumedad${element.codigo}">Humedad: ${oDato.humedad}</div>`
    );
    // Convierto en draggable
    $(`.card-text`).draggable({
      revert: "invalid",
      helper: "clone",
      start:function(ui){
        // Guardo el id del dragabble p
        idP = ui.target.id;
      }
    });
    // Añadimos al local los visibles
    aPaneles[element.codigo].visible = true; // en el localstorage el "visible" se volvera true
    aPaneles[element.codigo].temperatura = true; //en el localstorage el "temperatura" se volvera true
    aPaneles[element.codigo].humedad = true; //en el localstorage el "humedad" se volvera true
    localStorage.Paneles = JSON.stringify(aPaneles); // Se guarda    
  }
}

// Se crea la opcion de eliminar la carta (div de la baliza)
function CrearBotonEliminar(codigo, marker){
// Se crea la funcion al hacer click en el button de eliminar el div del municipio
  $(`#b${codigo}`).on("click", function () {
    // Elimina el div por el id del div
    $(`#${codigo}`).remove();

    // Eliminamos al local los visibles
    aPaneles[codigo].visible = false; // En el localStorage el "visible" se volvera false
    aPaneles[codigo].temperatura = false; // En el localstorage "temperatura" se volvera false
    aPaneles[codigo].humedad = false; // En el localstorage el "humedad" se volvera false
    localStorage.Paneles = JSON.stringify(aPaneles); // Se guarda

    // Cambiamos el icono a no seleccionado
    marker.setIcon(iconoSinSeleccionar);
  });
}

function CrearDroppable(codigo) {
  // Vuelvo a la funcion para obtener los datos de ese municipio

  $("#" + codigo).droppable({
    drop: function (event, ui) {
      // Busco en el array los datos de ese municipio
      oDato = arrayDatos.find((item) => item.codigo == codigo);

      // Obtengo el id del elemento draggable
      var draggableId = ui.draggable[0].id;

      if (draggableId == "panelTemperatura" && !document.getElementById(`pTemperatura${codigo}`)) {
        $(this).append(`<p id="pTemperatura${codigo}" class="card-text">Temperatura: ${oDato.temperatura}</p>`);
        aPaneles[codigo].temperatura = true; //en el localstorage el "temperatura" se volvera true
      }
      if (draggableId == "panelHumedad" && !document.getElementById(`pHumedad${codigo}`)) {
        $(this).append(`<p id="pHumedad${codigo}" class="card-text">Humedad: ${oDato.humedad}</p>`);
        aPaneles[codigo].humedad = true; //en el localstorage el "humedad" se volvera true
      }
      if (draggableId == "panelPresion" && !document.getElementById(`pPresion${codigo}`)) {
        $(this).append(`<p id="pPresion${codigo}" class="card-text">Presión Atmosferica: ${oDato.presionAtmosferica}</p>`);
        aPaneles[codigo].presion = true; //en el localstorage el "presion" se volvera true
      }
      if (draggableId == "panelViento" && !document.getElementById(`pViento${codigo}`)) {
        $(this).append(`<p id="pViento${codigo}" class="card-text">Viento: ${oDato.velocidadViento}</p>`);
        aPaneles[codigo].viento = true; //en el localstorage el "viento" se volvera true
      }
      // Convierto en draggable los p del cuadrado
      $(`.card-text`).draggable({
        revert: "invalid",
        helper: "clone",
        start:function(ui){
          // Guardo el id del dragabble p
          idP = ui.target.id;
        }
      });

      localStorage.Paneles = JSON.stringify(aPaneles); // Se guarda el cambio en el localStorage
    },
  });
}
// FUncion para actualizar los datos visibles en el momento
function ActualizarDatos() {
  // Hago un for in para obtener del localStorage los codigo del objeto
  for (const codigo in aPaneles) {
    // Cuando el municipio esta visible
    if (aPaneles[codigo].visible) {
      // Llamo por los datos
      var promise = DevolverDato(codigo);
      promise.then(function (response) {
        // Buscar en el array de datos indice del codigo
        var indice = arrayDatos.map(function(e) { return e.codigo; }).indexOf(codigo);
        // Obtengo el dato
        oDato = JSON.parse(response);
        // Actualizo los datos del array
        arrayDatos[indice]= oDato;
        // Introduzco el dato
        arrayDatos.push(oDato);
        // En caso de que existan, se actualiza
        if (document.getElementById(`pTemperatura${codigo}`)) {
          document.getElementById(`pTemperatura${codigo}`).innerHTML=`Temperatura: ${oDato.temperatura}`;
          // console.log("Temperatura" + oDato.temperatura);
        }
        if (document.getElementById(`pHumedad${codigo}`)) {
          document.getElementById(`pHumedad${codigo}`).innerHTML=`Temperatura: ${oDato.humedad}`;
          // console.log("Humedad" + oDato.humedad);
        }
        if (document.getElementById(`pPresion${codigo}`)) {
          document.getElementById(`pPresion${codigo}`).innerHTML=`Humedad: ${oDato.presionAtmosferica}`;
          // console.log("Presion" + oDato.presionAtmosferica);
        }
        if (document.getElementById(`pViento${codigo}`)) {
          document.getElementById(`pViento${codigo}`).innerHTML=`Viento: ${oDato.velocidadViento}`;
          // console.log("Viento" + oDato.velocidadViento);
        }
      });
    }
  }
}

// Si se hace click en la barra boton del mapa para mostrar y minimizar
$("#bMapa").click(() => {
  // Si el mapa esta minimizado
  if ( $("#map").css('display') == 'none') {
    $("#map").css('display', "block")
    $("#bMapa").removeClass("border10px")    
  }
  else{
  // Si no esta minimizado
    $("#map").css('display', "none")
    $("#bMapa").addClass("border10px");    
  }
});

