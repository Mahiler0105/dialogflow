const http = require("http");

/**
 * Crea una respuesta basica a partir de un texto
 * @param {*} textoEnviar
 * @returns la cadena Json de respuesta
 */
function respuestaBasica(textoEnviar) {
  let respuesta = {
    fulfillmentText: textoEnviar,
    fulfillmentMessages: [
      {
        platform: "ACTIONS_ON_GOOGLE",
        simpleResponses: {
          simpleResponses: [
            {
              textToSpeech: textoEnviar,
            },
          ],
        },
      },
      {
        text: {
          text: [textoEnviar],
        },
      },
    ],
  };
  return respuesta;
}

/**
 *
 * @param {*} res Añade a una respuesta basica la lista de sugerencias
 * @param {*} option En la lista de sugetencias a añadir a res con el formato
 *                   ["option1",option2""]
 */
function addSugerencias(res, option) {
  res.fulfillmentMessages.push({
    platform: "ACTIONS_ON_GOOGLE",
    suggestions: {
      suggestions: listaOptionesGoogle(option),
    },
  });
}

/**
 *
 * @param {*} res Añade a una respuesta basica un card
 * @param {*} titulo Titulo del card
 * @param {*} texto  Texto principal
 * @param {*} imagen Imagen asociada
 * @param {*} url  Url de la card
 */
function addCard(res, titulo, texto, imagen, url) {
  res.fulfillmentMessages.push({
    platform: "ACTIONS_ON_GOOGLE",
    basicCard: {
      title: titulo,
      subtitle: titulo,
      formattedText: texto,
      image: {
        imageUri: imagen,
        accessibilityText: titulo,
      },
      buttons: [
        {
          title: `Mas info de ${titulo}`,
          openUriAction: {
            uri: url,
          },
        },
      ],
    },
  });
}

/**
 * Esta funcion recibe una direccion y crea una promesa que so es correcta
 * devuelve la respuesta como paramtreo y si no lo es devuelve error
 * @param {*} reqUrl
 */
function leerURLpromise(reqUrl) {
  return new Promise((resolve, reject) => {
    let textoEnviar = "";
    http
      .get(reqUrl, (respuestaDeApi) => {
        let respuestaCompleta = "";
        let respuestaJSON = "";
        respuestaDeApi.on("data", (chunk) => {
          respuestaCompleta += chunk;
        });
        respuestaDeApi.on("end", () => {
          try {
            respuestaJSON = JSON.parse(respuestaCompleta);
            resolve(respuestaJSON);
          } catch (err) {
            //   en caso se devolvera la cadena vacia
            console.log("Error al cargar los datos del servidor externo" + err);
            reject(new Error("Error al cargar datos externos"));
          }
        });
      })
      .on("error", (err) => {
        //se ejecutara cuando la peticion no es valida
        console.log("Error al cargar los datos del servidor", err);
        reject(new Error("Error al cargar los datos externos"));
      });
    console.log(JSON.stringify(textoEnviar));
  });
}

/**
 *
 * @param {*} opciones Recibe la lista de opciones
 * @returns Devuelve la lista en formato suggestion de google
 *  [{"title": "valor"}]
 */
function listaOptionesGoogle(opciones) {
  let res = [];
  for (let i = 0; i < opciones.length; i++) {
    res.push({ title: opciones[i] });
  }
  return res;
}

/**
 *  Recibe una lista de opciones y devuelve una lista de sugerencias de 8 elementos de maximo
 * @param {*} opciones lista de opciones
 *  ["opcion1", "opcion2", "opcion3"]
 */
function reducirAOcho(opciones) {
  let res = [];
  let i = 0;
  let pos;
  while (i < 8 && opciones.length > 0) {
    pos = Math.floor(Math.random() * opciones.length);
    res.push(opciones[pos]);
    opciones.splice(pos, 1);
    i++;
  }
  return res;
}

/**
 *  Esta funcion añade un enlace en la conversacion
 * @param {*} res  respuesta a la que se añade al enlace
 * @param {*} texto  texto a añadir en el enlace
 * @param {*} url direccion a la que apuntara el enlace
 */
function addEnlace(res, texto, url) {
  res.fulfillmentMessages.push({
    platform: "ACTIONS_ON_GOOGLE",
    linkOutSuggestion: {
      destinationName: texto,
      uri: url,
    },
  });
}

module.exports = {
  respuestaBasica: respuestaBasica,
  addSugerencias: addSugerencias,
  addCard: addCard,
  reducirAOcho: reducirAOcho,
  addEnlace: addEnlace,
  leerURLpromise: leerURLpromise,
};
