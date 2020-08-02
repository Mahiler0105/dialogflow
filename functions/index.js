"use strict";
// Importacion de librerias
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const lerietboolLib = require("./lerietboolLib");
// Variables Globales
global.listaPersonajes = require("./personajes.json");
global.images =
  "https://us-central1-siama-a5712.cloudfunctions.net/curso/image/";

const server = express();
server.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
server.use(bodyParser.json());
server.use("/image", express.static(path.join(__dirname, "/image")));

server.get("/", (req, res) => {
  return res.json(
    "Hola, soy un bot, pero esta no es la forma correcta de interactura conmigo"
  );
});

server.post("/curso", (req, res) => {
  let context = "nada";
  let resultado;
  let respuestaEnviada = false;
  let textoEnviare = "recibida la preticion post incorrecta";
  let opciones = lerietboolLib.reducirAOcho([
    "Chiste",
    "Consejo",
    "Noticias",
    "Mi equipo",
  ]);

  try {
    context = req.body.queryResult.action;
    textoEnviare = `recibida peticion de accion: ${context}`;
  } catch (error) {
    console.log("Error contexto vacio:" + error);
  }
  // if (req.body.queryResult.parameters) {
  //   console.log("parametros:" + req.body.queryResult.parameters);
  // } else {
  //   console.log("Sin parametros");
  // }
  if (context === "input.welcome") {
    textoEnviare = "Hola, soy tu primer webHook";
    resultado = lerietboolLib.respuestaBasica(textoEnviare);
  } else if (context === "personaje") {
    let personaje;
    let person;
    try {
      personaje = req.body.queryResult.parameters.personaje;
      person = req.body.queryResult.parameters.person;
    } catch (err) {
      console.log("error personaje  no leido");
    }
    if (typeof personaje !== "undefined") {
      let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
      opciones = arListaPersonajes.slice();
      opciones.unshift("Menú");
      if (global.listaPersonajes[personaje]) {
        textoEnviare = global.listaPersonajes[personaje];
        let imagen = encodeURI(global.images + personaje + ".jpg");
        let url = "http://www.google.com/search?q=" + personaje;
        resultado = lerietboolLib.respuestaBasica(`Me encanta ${personaje}`);
        lerietboolLib.addCard(resultado, personaje, textoEnviare, imagen, url);
      } else {
        resultado = lerietboolLib.respuestaBasica(
          `Lo siento, todabia no he aprendido nada de ${person.name}`
        );
      }
    } else {
      resultado = lerietboolLib.respuestaBasica("No se ha recibido personaje");
    }
  } else if (context === "lista_personajes") {
    let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
    opciones = arListaPersonajes.slice();
    opciones.unshift("Menú");
    resultado = lerietboolLib.respuestaBasica(
      "Te muestro algunos personajes que conozco..."
    );
  } else if (context === "menu") {
    resultado = lerietboolLib.respuestaBasica(
      "Puedo hacer muchas cosas, te muestro algunas sugerencias"
    );
  } else if (context === "recomendar_ordenador") {
    let tipopc;
    let memoria;
    let discoduro;
    let marcapc;
    try {
      tipopc = req.body.queryResult.parameters.tipoPC;
      memoria = req.body.queryResult.parameters.memoria;
      marcapc = req.body.queryResult.parameters.marcapc;
      discoduro = req.body.queryResult.parameters.discoduro;
    } catch (err) {
      console.log("Cargando variables:", err);
    }
    if (!tipopc) {
      textoEnviare = "Que tipo de dispositivo te gustaria elegir:";
      opciones = ["sobremesa", "portatiles"];
      resultado = lerietboolLib.respuestaBasica(textoEnviare);
    } else if (!memoria) {
      textoEnviare = "Es necesario elegir el tamaño de la memoria:";
      opciones = ["4 Gb", "8 Gb", "16 Gb", "32 Gb"];
      resultado = lerietboolLib.respuestaBasica(textoEnviare);
    } else if (!discoduro) {
      textoEnviare = "Ahora veremos el almacenamiento en disco:";
      opciones = ["1 Tb", "2 Tb", "4 Tb"];
      resultado = lerietboolLib.respuestaBasica(textoEnviare);
    } else if (!marcapc) {
      textoEnviare = "Vamos a ver que marca te gustaria consultar:";
      opciones = ["Hp", "Lenovo", "Msi", "Dell", "Acer"];
      resultado = lerietboolLib.respuestaBasica(textoEnviare);
    } else {
      //se tienen los 4 aparametros y se puede realizar la busqueda del pc
      resultado = lerietboolLib.respuestaBasica(
        "Te ayudara a encontrar un ordenador con esas caracteristicas"
      );
      let para =
        (tipopc ? "/" + tipopc : "") +
        (discoduro ? "/" + discoduro : "") +
        (memoria ? "/" + memoria : "") +
        (marcapc ? "/" + marcapc : "");
      let url = "https://www.pccomponentes.com" + para;
      lerietboolLib.addEnlace(
        resultado,
        `Ver ordenador ${tipopc} con disco de ${discoduro} , memoria de ${memoria} y de la marca ${marcapc}`,
        url
      );
      opciones = ["Menú"];
    }
  } else if (context === "aparcamientos_contar") {
    respuestaEnviada = true;
    const reqUrl =
      'http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT count(*) from "3bb304f9-9de3-4bac-943e-7acce7e8e8f9"';

    lerietboolLib
      .leerURLpromise(reqUrl)
      .then((respuesta) => {
        let resultado;
        textoEnviare = respuesta.result.records[0].count + " aparcamientos";
        console.log("En Malaga hay" + textoEnviare);
        resultado = lerietboolLib.respuestaBasica(textoEnviare);
        lerietboolLib.addSugerencias(resultado, opciones);
        res.json(resultado);
        return true;
      })
      .catch((err) => {
        console.log("Error capturado" + err);
        res.json(
          lerietboolLib.respuestaBasica(
            "Lo siento. No puedo contactar con servidor externo"
          )
        );
      });
  } else if (context === "aparcamientos_ocupacion") {
    respuestaEnviada = true;
    const aparcBuscado = req.body.queryResult.parameters.nombre;
    console.log("AEA MONGOL" + aparcBuscado);
    const Url = `http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT * from "3bb304f9-9de3-4bac-943e-7acce7e8e8f9" where "NOMBRE" like '%${aparcBuscado}%'`;
    const reqUrl = encodeURI(Url);
    lerietboolLib
      .leerURLpromise(reqUrl)
      .then((respuesta) => {
        let resultado;
        console.log("leerURLprimise" + JSON.stringify(respuesta));
        const aparcamiento = respuesta.result.records[0];
        console.log("leerURLpromise-aparcamiento:" + aparcamiento);
        console.log(aparcamiento);
        if (aparcamiento.NUM_LIBRES > 0) {
          textoEnviare += `${aparcamiento.NOMBRE} situado en ${aparcamiento.DIRECCION} dispone de ${aparcamiento.NUM_DERBIS} plazas y ahora tiene ${aparcamiento.NUM_LIBRES} libres. Corre y no pierdas tu sitio`;
        } else {
          textoEnviare += `${aparcamiento.NOMBRE} situado en ${aparcamiento.DIRECCION} dispone de ${aparcamiento.NUM_DERBIS} plazas y ahora esta lleno. Espera un poquito o prueba con otro`;
        }
        console.log("Resultado aparcamientos" + textoEnviare);
        resultado = lerietboolLib.respuestaBasica(textoEnviare);
        lerietboolLib.addSugerencias(resultado, opciones);
        res.json(resultado);
        return true;
      })
      .catch((err) => {
        console.log("Error capturado de promise" + err);
        res.json(
          lerietboolLib.respuestaBasica(
            "Lo siento. No encuentro ese aparcamiento"
          )
        );
      });
  } else {
    resultado = lerietboolLib.respuestaBasica(
      `Todabia no he aprendio a gestionar: ${context}`
    );
  }

  if (!respuestaEnviada) {
    lerietboolLib.addSugerencias(resultado, opciones);
    res.json(resultado);
  }
});

const local = true;
if (local) {
  server.listen(process.env.PORT || 8000, () => {
    console.log("Servidor funcionando");
  });
} else {
  exports.curso = functions.https.onRequest(server);
}
