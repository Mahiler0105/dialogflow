"use strict";

const lerietboolLib = require("./lerietboolLib");

let respuesta = lerietboolLib.respuestaBasica("Bienvenido a Dialog");

let opciones = ["option1", "option2", "option3"];
lerietboolLib.addSugerencias(respuesta, opciones);
lerietboolLib.addCard(respuesta, "Antonio Banderas", "pepes", "pepes", "pepes");

let opcioness = [
  "option1",
  "option2",
  "option3",
  "option4",
  "option5",
  "option6",
  "option7",
  "option8",
  "option9",
  "option10",
  "option11",
  "option12",
];

let tipopc = "sobremesa";
let memoria;
let discoduro = "1 Tb";
let marcapc = "HP";

let t =
  (tipopc ? "/" + tipopc : "") +
  (discoduro ? "/" + discoduro : "") +
  (memoria ? "/" + memoria : "") +
  (marcapc ? "/" + tipopc : "");
let url = "https://www.pccomponentes.com" + t;

const urla =
  'http://datosabiertos.malaga.eu/api/3/action/datastore_search_sql?sql=SELECT count(*) from "3bb304f9-9de3-4bac-943e-7acce7e8e8f9"';
const http = require("http");
const reqUrl = encodeURI(urla);

function accionPromise(res) {
  let textoEnviar;
  console.log("respuesta recibida:" + JSON.stringify(res));
  if (res) {
    textoEnviar = res.result.records[0].count + " apartamentos";
    console.log("En malaga hay " + textoEnviar);
  }
}

console.log("JAJAJAJAJAJAJAJAJAJAJAJAJ");
lerietboolLib
  .leerURLpromise(reqUrl)
  .then(accionPromise)
  .catch((err) => {
    console.log("Error capturado", err);
  });
