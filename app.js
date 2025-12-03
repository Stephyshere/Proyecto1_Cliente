const tiposGato = [
    {
        name: "Gato Chino",
        id: "01",
        modifiers: {},
        images: { normal: "GatoChino.png" }
    },
    {
        name: "Gato Banana",
        id: "02",
        modifiers: {},
        images: { normal: "GatoBanana.png" }
    },
    {
        name: "Gato Negro",
        id: "03",
        modifiers: {},
        images: { normal: "GatoNegro.png" }
    },
    {
        name: "Gato Blanco",
        id: "04",
        modifiers: {},
        images: { normal: "GatoBlanco.png" }
    },
    {
        name: "Gato Naranja",
        id: "05",
        modifiers: {},
        images: { normal: "GatoNaranja.png" }
    },
    {
        name: "Gato Siames",
        id: "06",
        modifiers: {},
        images: { normal: "GatoSiames.png" }
    },
    {
        name: "Gato En Esmoking",
        id: "07",
        modifiers: {},
        images: { normal: "GatoEsmoking.png" }
    },
    {
        name: "PERLI",
        id: "08", // ID IMPORTANTE PARA LAS INTERACCIONES
        modifiers: {},
        images: {
            normal: "perli.png",
            feliz: "perliFeliz.png",
            love_max: "PerliAmorMax.png"
        }
    },
    {
        name: "BOLLITO",
        id: "09", // ID IMPORTANTE PARA LAS INTERACCIONES
        modifiers: {},
        images: {
            normal: "Bollito.png",
            feliz: "BollitoFeliz.png"
        }
    },
];

const emocionesComunes = {
    triste: "GatoTriste.gif",
    feliz: "GatoFeliz.gif",
    love_max: "AmorMax.gif",
    hate_max: "HateMax.gif",
    // Acciones
    alimentar: "Comida.gif",
    esperar: "GatoEsperando.gif",
    alimentarMalo: "GatoComidaAsco.gif",
    ignorar: "GatoIgnorado.gif",
    asustar: "GatoAsustado.gif",
    cepillar: "Peinado.gif",
    bañar: "GatoBañado.gif",
    acariciar: "GatoAcariciado.gif",
    caja: "GatoCaja.gif",
    laser: "GatoLaser.gif",
    esconder: "GatoEscondido.gif",
    risa: "GatoRisa.png",
    medicina: "GatoPastilla.gif",
    medicinaBuena: "GatoMedicina.gif"
};

// AHORA LAS INTERACCIONES ESTÁN SEPARADAS POR GENERAL Y POR ID DE GATO
const ChatInteraccion = {
    alimentar: {
        general: [
            { text: "¡Mmm, delicioso! 🐟", emotion: "feliz" },
            { text: "Gracias por la comida! 😺", emotion: "alimentar" },
            { text: "¡Estoy lleno y feliz! 🍖", emotion: "love_max" },
            { text: "Esto da asco... 🐀", emotion: "alimentarMalo" }
        ],
        "08": [ // PERLI
            { text: "¡Soy Perli y amo el atún!", emotion: "love_max" },
            { text: "Ñam ñam, gracias humano.", emotion: "feliz" }
        ],
        "09": [ // BOLLITO
            { text: "Bollito está llenito.", emotion: "feliz" },
            { text: "¿No tienes algo más dulce?", emotion: "triste" }
        ]
    },
    ignorar: {
        general: [
            { text: "¿Por qué me ignoras? 😿", emotion: "triste" },
            { text: "Me siento solo... 🥺", emotion: "triste" },
            { text: "¡Oye! ¡Presta atención! 🙀", emotion: "ignorar" },
            { text: "Bobo o qué?!😾", emotion: "hate_max" }
        ],
        "08": [ // PERLI
            { text: "Perli necesita atención AHORA.", emotion: "hate_max" }
        ]
    },
    asustar: {
        general: [
            { text: "¡QUE ES ESO!😱", emotion: "asustar" },
            { text: "¡Me asustaste! 😿", emotion: "triste" },
            { text: "¡No me hagas eso otra vez! 🤬", emotion: "hate_max" }
        ]
    },
    cepillar: {
        general: [
            { text: "¡Me encanta que me cepilles! 😻", emotion: "love_max" },
            { text: "Quita cojones, ¿que haces?", emotion: "hate_max" },
            { text: "SIIIIIIIIIIIIIIIIIIIIIIII", emotion: "cepillar" }
        ],
        "09": [ // BOLLITO
            { text: "¡Ay que suave queda mi pelo!", emotion: "feliz" }
        ]
    },
    acariciar: {
        general: [
            { text: "PURRRR PURRRRRRR PURRRRR", emotion: "acariciar" },
            { text: "NO - ME - TOQUES ", emotion: "hate_max" },
            { text: "Más a la izquierda...", emotion: "feliz" }
        ],
        "08": [ // PERLI (Perli es cariñosa)
            { text: "¡Mimos para Perli!", emotion: "love_max" }
        ]
    },
    laser: {
        general: [
            { text: "¡Lo tengo! ¡No, se fue!", emotion: "laser" },
            { text: "¡Hora de cazar!", emotion: "laser" },
            { text: "*Saltos acrobáticos*", emotion: "feliz" }
        ]
    },
    lavar: { // Nota: Corresponde a 'bañar' en emocionesComunes
        general: [
            { text: "¡Odio el agua! 😡", emotion: "hate_max" },
            { text: "*Siseo* ¡Esto no es divertido!", emotion: "bañar" },
            { text: "¡Salvadme de esta tortura!", emotion: "triste" },
            { text: "Al menos ahora estoy limpio... supongo.", emotion: "triste" }
        ]
    },
    caja: {
        general: [
            { text: "QUE ES ESO??? UNA CASA", emotion: "caja" },
            { text: "¿Que hay ahí?", emotion: "caja" },
            { text: "miau", emotion: "feliz" }
        ]
    },
    medicina: {
        general: [
            { text: "Que ascazo *escupe la pastilla*", emotion: "medicina" },
            { text: "AJKSGDAKJSKDHAS *se esconde*", emotion: "esconder" },
            { text: "ñom ñom ñom", emotion: "medicinaBuena" }
        ]
    }
};

// Variables globales
let gatoActual = {}; // Se usa en la selección
let gato = {};       // Se usa durante el juego (Objeto principal)
let achivements = {};
let gameInterval;
let finalJuego = true;

// --- NUEVA FUNCIÓN PRINCIPAL DE INTERACCIÓN ---
// Esta función reemplaza a getRandomMensaje y maneja toda la lógica visual
function interactuar(accion) {
    if (finalJuego || !gato.type) return;

    const idGato = gato.type.id;
    const datosAccion = ChatInteraccion[accion];

    if (!datosAccion) {
        console.error("Acción no encontrada:", accion);
        return;
    }

    // 1. Determinar lista de respuestas (Específica del gato o General)
    let listaRespuestas = datosAccion.general;
    if (datosAccion[idGato]) {
        // Si hay respuestas específicas para este gato (ej. Perli), las usamos.
        // Opcional: Podrías concatenar (listaRespuestas.concat(datosAccion[idGato])) si quieres mezclar.
        listaRespuestas = datosAccion[idGato]; 
    }

    // 2. Elegir respuesta aleatoria
    const respuestaObj = listaRespuestas[Math.floor(Math.random() * listaRespuestas.length)];
    const emocion = respuestaObj.emotion;

    // 3. Determinar la imagen a mostrar
    let imagenFinal;

    // A. ¿El gato tiene una imagen personalizada para esta emoción? (Ej. Perli tiene 'feliz')
    if (gato.type.images && gato.type.images[emocion]) {
        imagenFinal = gato.type.images[emocion];
    } 
    // B. Si no, ¿Existe una emoción común (GIF genérico)?
    else if (emocionesComunes[emocion]) {
        imagenFinal = emocionesComunes[emocion];
    } 
    // C. Fallback: Imagen normal del gato
    else {
        imagenFinal = gato.type.images.normal;
    }

    // 4. ACTUALIZAR ESTADO DEL GATO (Visualmente y lógica)
    gato.currentImage = imagenFinal; // Guardamos el estado actual
    
    // Aquí actualizamos el DOM (Asumiendo que tienes elementos con estos IDs)
    // Asegúrate de tener un <img id="gato-img"> y <p id="chat-texto"></p> en tu HTML
    const imgElement = document.getElementById('gato-img'); // Ajusta el ID según tu HTML
    const chatElement = document.getElementById('chat-texto'); // Ajusta el ID según tu HTML
    
    if (imgElement) imgElement.src = imagenFinal;
    if (chatElement) chatElement.textContent = respuestaObj.text;

    console.log(`Gato dice: ${respuestaObj.text} | Emoción: ${emocion} | Imagen: ${imagenFinal}`);
    
    // Retornamos el objeto por si lo necesitas fuera
    return { text: respuestaObj.text, image: imagenFinal };
}

function ponerNombreGato() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    finalJuego = true;
    
    // Asegúrate de que estas funciones existan en tu código UI
    if(typeof hideEndGamePrompt === 'function') hideEndGamePrompt();
    if(typeof updateUI === 'function') updateUI();

    // Selección del gato aleatorio
    const newTipoGato = tiposGato[Math.floor(Math.random() * tiposGato.length)];
    
    // Guardamos temporalmente la selección
    gatoActual = {
        tiposGato: newTipoGato,
        currentImage: newTipoGato.images.normal
    };
    
    // Actualizar UI de selección
    const msgElement = document.getElementById('name-prompt-message');
    if(msgElement) msgElement.textContent = `¡Felicidades! Vas a adoptar un ${newTipoGato.name}. ¿Qué nombre le pondrás?`;
    
    document.getElementById('new-cat-name').value = '';
    document.getElementById('name-input-prompt').style.display = 'block';
    
    // Mostrar visualmente al gato seleccionado antes de empezar
    const imgElement = document.getElementById('gato-img'); // O el ID que uses en la pantalla de nombre
    if(imgElement) imgElement.src = newTipoGato.images.normal;

    const adoptBtn = document.getElementById('adopt-button');
    if(adoptBtn) adoptBtn.disabled = true; // Se habilita cuando escriban nombre supongo
}

function empiezaJuegoconNombre() {
    const nombreInput = document.getElementById('new-cat-name');
    const nombreGato = nombreInput.value.trim();
    const catname = nombreGato.length > 0 ? nombreGato : "GATO SIN NOMBRE :(";

    document.getElementById('name-input-prompt').style.display = 'none'; // Ocultar prompt
    
    // GATO CON NOMBRE - Objeto definitivo del juego
    finalJuego = false;

    gato = {
        type: gatoActual.tiposGato, // Aquí guardamos toda la data del tipo (ids, images, etc)
        name: catname,
        stats: {
            estado: Math.floor(Math.random() * 51) + 50, // entre 50 y 100
            amorOdio: Math.floor(Math.random() * 201) - 100 // entre -100 y 100
        },
        currentImage: gatoActual.tiposGato.images.normal
    };

    // Actualizar imagen inicial del juego
    const imgElement = document.getElementById('gato-img');
    if(imgElement) imgElement.src = gato.currentImage;
    
    console.log("Juego iniciado con:", gato);
}

// EJEMPLO DE USO:
// Llama a esta función desde tus botones HTML
// <button onclick="interactuar('alimentar')">Alimentar</button>
// <button onclick="interactuar('acariciar')">Acariciar</button>