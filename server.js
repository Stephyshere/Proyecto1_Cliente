const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();

// --- CONFIGURACIÓN ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'gato_secreto_super_seguro',
    resave: false,
    saveUninitialized: false
}));

// --- CONEXIÓN BD ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // <--- TU CONTRASEÑA
    database: 'gatogotchi'
});

db.connect(err => {
    if (err) console.error("❌ Error conectando a BD:", err);
    else console.log("✅ Base de datos conectada");
});

// --- LISTA DE IMÁGENES DEL SISTEMA ---
const IMAGENES = {
    // Estados básicos
    feliz: "emociones/GatoFeliz.gif",
    triste_estado: "emociones/GatoTriste.png",
    muerto: "logros/LOGRO_GATO-RIP.png",

    // Acciones
    comida_ok: "emociones/gato-negro-comiendo.gif",
    comida_asco: "emociones/GatoComidaAsco.gif",
    mimos_ok: "emociones/GatoAcariciado.gif",
    mimos_bad: "emociones/HateMax.gif",
    laser: "emociones/GatoLaser.gif",
    caja: "emociones/GatoCaja.gif",
    bano_ok: "emociones/GatoBañado.gif",
    bano_bad: "emociones/HateMax.gif",
    curar_ok: "emociones/GatoPastilla.gif",
    curar_bad: "emociones/GatoMedicina.gif",
    ignorar: "emociones/GatoEsperando.gif",

    // --- NUEVAS IMÁGENES ---
    mudanza: "emociones/GatoMudanza.gif",
    asustar: "emociones/GatoSusto.gif",
    cepillar: "emociones/GatoAcariciado.gif"
};

// --- CONFIGURACIÓN DE GATOS DISPONIBLES (SKINS) ---
const TIPOS_GATO = [
    { img: "gatos/Bollito.png", logro: "gato_bollito" },
    { img: "gatos/perli.png", logro: "gato_perli" },
    { img: "gatos/GatoBanana.png", logro: "gato_banana" },
    { img: "gatos/GatoChino.png", logro: "gato_chino" },
    // Relleno sin logros
    { img: "gatos/GatoBlanco.png", logro: null },
    { img: "gatos/GatoEsmoking.png", logro: null },
    { img: "gatos/GatoNaranja.png", logro: null },
    { img: "gatos/GatoSiames.png", logro: null },
    { img: "gatos/GatoNegro.png", logro: null }
];

// --- FUNCION AUXILIAR: SEPARAR NOMBRE E IMAGEN ---
function procesarGato(gatoDB) {
    if (!gatoDB) return null;
    // Si el nombre tiene el separador "|||", lo partimos
    if (gatoDB.nombre && gatoDB.nombre.includes('|||')) {
        const partes = gatoDB.nombre.split('|||');
        gatoDB.nombreVis = partes[0]; // El nombre real para mostrar
        gatoDB.skin = partes[1];      // La ruta de la imagen
    } else {
        // Si es un gato viejo sin truco
        gatoDB.nombreVis = gatoDB.nombre;
        gatoDB.skin = "emociones/GatoFeliz.gif";
    }
    return gatoDB;
}

// --- LÓGICA DE JUEGO ---
function calcularInteraccion(accion, gato) {
    let dSalud = 0, dAfecto = 0, img = IMAGENES.feliz, texto = "";
    let r = Math.random();
    let bonus = (gato.afecto > 80) ? 0.2 : 0;

    // Helper random rango
    const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    switch (accion) {
        case 'alimentar':
            if (r < (0.3 - bonus)) {
                dSalud = -rnd(2, 8); dAfecto = -rnd(2, 6); img = IMAGENES.comida_asco; texto = "¡Puaj! ¡Sabe mal! 🤢";
            } else {
                dSalud = rnd(5, 15); dAfecto = rnd(3, 10); img = IMAGENES.comida_ok; texto = "¡Qué rico! 🐟";
            } break;
        case 'acariciar':
            // Incluso si te quiere, a veces se cansa (15% chance si > 25)
            if (gato.afecto < 25 || r < 0.15) {
                dSalud = -rnd(1, 3); dAfecto = -rnd(3, 8); img = IMAGENES.mimos_bad; texto = "¡NO ME TOQUES! 🩸";
            } else {
                dAfecto = rnd(5, 15); img = IMAGENES.mimos_ok; texto = "Purrrr... mimos.";
            } break;
        case 'jugarConLaser':
            dSalud = -rnd(1, 4); dAfecto = rnd(10, 20); img = IMAGENES.laser; texto = "¡Atrápalo! 🔴";
            if (r < 0.1) { dAfecto = -5; texto = "Me aburrí..."; } // 10% aburrirse
            break;
        case 'caja':
            dAfecto = rnd(15, 25); img = IMAGENES.caja; texto = "Si encajo, me siento. 📦";
            break;
        case 'lavar':
            if (r > 0.7) { dSalud = rnd(10, 20); img = IMAGENES.bano_ok; texto = "Estoy limpio ✨"; }
            else { dAfecto = -rnd(15, 25); img = IMAGENES.bano_bad; texto = "¡ODIO EL AGUA! 💦"; } break;
        case 'medicina':
            if (gato.salud < 100) {
                if (r > 0.4) { dSalud = rnd(40, 60); dAfecto = rnd(2, 8); img = IMAGENES.curar_ok; texto = "Me siento mejor."; }
                else { dSalud = rnd(20, 40); dAfecto = -rnd(3, 8); img = IMAGENES.curar_bad; texto = "¡Sabe a rayos!"; }
            } else { dAfecto = -rnd(4, 10); img = IMAGENES.curar_bad; texto = "¡No estoy enfermo!"; } break;
        case 'ignorar':
            dAfecto = -rnd(5, 15); img = IMAGENES.ignorar; texto = "Esperando...";
            break;
        case 'asustar':
            dSalud = -rnd(3, 8); dAfecto = -rnd(10, 20); img = IMAGENES.asustar; texto = "¡AAAAH! 👻";
            break;
        case 'cepillar':
            if (r < 0.2) { dAfecto = -rnd(2, 5); texto = "¡Tirones no!"; img = IMAGENES.triste_estado; }
            else { dAfecto = rnd(5, 12); img = IMAGENES.cepillar; texto = "Qué suave..."; }
            break;
    }
    return { dSalud, dAfecto, img, texto };
}

// --- RUTAS ---
app.get('/', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    db.query('SELECT * FROM usuarios WHERE nombre = ? AND password_hash = ?', [user, pass], (err, results) => {
        if (results && results.length > 0) {
            req.session.user = results[0];
            res.redirect('/juego');
        } else { res.redirect('/'); }
    });
});

app.post('/guest', (req, res) => {
    req.session.user = null;
    const gatoRandom = TIPOS_GATO[Math.floor(Math.random() * TIPOS_GATO.length)];
    // En invitado guardamos las propiedades directas (no hay BD)
    req.session.gatoInvitado = {
        nombre: "Gato Invitado",
        nombreVis: "Gato Invitado", // Propiedad visual
        salud: 100, afecto: 50, vivo: true,
        skin: gatoRandom.img
    };
    res.redirect('/juego');
});

app.get('/registro', (req, res) => res.render('registro'));
app.post('/registro', (req, res) => {
    const { user, pass } = req.body;
    db.query('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [user, user + "@mail.com", pass], () => res.redirect('/'));
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// 4. JUEGO (LECTURA CON TRUCO)
app.get('/juego', (req, res) => {
    // MODO INVITADO
    if (!req.session.user) {
        const gatoInv = req.session.gatoInvitado;
        if (!gatoInv) return res.redirect('/');
        const fotoEstado = (gatoInv.afecto >= 50) ? gatoInv.skin : IMAGENES.triste_estado;
        return res.render('juego', {
            user: null, gato: gatoInv, historial: [], logros: [],
            imagen: gatoInv.vivo ? (req.session.ultimaFoto || fotoEstado) : IMAGENES.muerto,
            imagenEstado: fotoEstado,
            texto: req.session.ultimoTexto || "Modo Invitado"
        });
    }

    // MODO USUARIO
    const userId = req.session.user.id;
    db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 1', [userId], (err, gatos) => {
        // PROCESAMOS EL GATO (Separamos nombre de imagen)
        const gatoActual = (gatos && gatos[0]) ? procesarGato(gatos[0]) : null;

        db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 0 ORDER BY id DESC', [userId], (err2, rawHistorial) => {
            // PROCESAMOS EL HISTORIAL TAMBIÉN
            const historial = rawHistorial ? rawHistorial.map(g => procesarGato(g)) : [];

            db.query(`SELECT l.*, CASE WHEN lu.unlocked_at IS NOT NULL THEN 1 ELSE 0 END as tiene FROM logros l LEFT JOIN logros_usuario lu ON l.id = lu.logro_id AND lu.usuario_id = ?`, [userId], (err3, logros) => {

                let imagenEstado = IMAGENES.feliz;
                let imagenCentral = IMAGENES.feliz;
                let textoMostrar = "Miau...";

                if (gatoActual) {
                    // Usamos gatoActual.skin que extrajimos del nombre
                    imagenEstado = (gatoActual.afecto >= 50) ? gatoActual.skin : IMAGENES.triste_estado;
                    imagenCentral = req.session.ultimaFoto || imagenEstado;
                    textoMostrar = req.session.ultimoTexto || "Miau...";
                    req.session.ultimaFoto = null; req.session.ultimoTexto = null;
                } else {
                    imagenCentral = null; textoMostrar = "";
                }

                res.render('juego', {
                    user: req.session.user,
                    gato: gatoActual,
                    historial: historial,
                    logros: logros || [],
                    imagen: imagenCentral,
                    imagenEstado: imagenEstado,
                    texto: textoMostrar
                });
            });
        });
    });
});

app.post('/interactuar', (req, res) => {
    const { accion } = req.body;
    if (!req.session.user) {
        // Invitado... (Igual que antes)
        let g = req.session.gatoInvitado;
        if (!g || !g.vivo) return res.redirect('/juego');
        const resInv = calcularInteraccion(accion, g);
        g.salud = Math.min(100, Math.max(0, g.salud + resInv.dSalud));
        g.afecto = Math.min(100, Math.max(0, g.afecto + resInv.dAfecto));
        if (g.salud <= 0) g.vivo = false;
        req.session.gatoInvitado = g;
        req.session.ultimaFoto = g.vivo ? resInv.img : IMAGENES.muerto;
        req.session.ultimoTexto = g.vivo ? resInv.texto : "Ha muerto...";
        return res.redirect('/juego');
    }

    db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 1', [req.session.user.id], (err, rows) => {
        if (!rows || !rows[0]) return res.redirect('/juego');
        let gato = rows[0];

        if (req.session.user.rol === 'admin') {
            if (accion === 'kill') gato.salud = 0;
            if (accion === 'heal') { gato.salud = 100; gato.afecto = 100; }
        }

        const resultado = calcularInteraccion(accion, gato);

        // Debug
        console.log(`Accion: ${accion}, dSalud: ${resultado.dSalud}, dAfecto: ${resultado.dAfecto}`);

        let currentSalud = parseInt(gato.salud);
        let currentAfecto = parseInt(gato.afecto);

        let nuevaSalud = Math.min(100, Math.max(0, currentSalud + resultado.dSalud));
        let nuevoAfecto = Math.min(100, Math.max(0, currentAfecto + resultado.dAfecto));
        let vivo = nuevaSalud > 0 ? 1 : 0;
        let causa = vivo ? null : "Descuido";

        if (nuevoAfecto >= 100) db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave_interna='love_max'", [req.session.user.id]);
        if (vivo === 0) db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave_interna='rip'", [req.session.user.id]);

        db.query('UPDATE gatos SET salud=?, afecto=?, vivo=?, causa_muerte=? WHERE id=?',
            [nuevaSalud, nuevoAfecto, vivo, causa, gato.id], (err2) => {
                if (err2) console.error("Error updating cat:", err2);
                req.session.ultimaFoto = vivo ? resultado.img : IMAGENES.muerto;
                req.session.ultimoTexto = vivo ? resultado.texto : "Ha muerto...";
                res.redirect('/juego');
            });
    });
});

// 6. ADOPTAR (CON TRUCO NOMBRE+IMAGEN)
app.post('/adoptar', (req, res) => {
    const nombreUsuario = req.body.nombre || "Michi Nuevo";
    const gatoRandom = TIPOS_GATO[Math.floor(Math.random() * TIPOS_GATO.length)];

    // EL TRUCO: Guardamos "Nombre|||Imagen" en la columna nombre
    // Ejemplo: "Pelusa|||gatos/GatoBanana.png"
    const nombreCombinado = nombreUsuario + "|||" + gatoRandom.img;

    if (!req.session.user) {
        req.session.gatoInvitado = {
            nombre: "Gato Invitado", nombreVis: nombreUsuario,
            salud: 100, afecto: 50, vivo: true, skin: gatoRandom.img
        };
        return res.redirect('/juego');
    }

    const userId = req.session.user.id;
    db.query('UPDATE gatos SET vivo = 0, causa_muerte = "Reemplazado" WHERE user_id = ? AND vivo = 1', [userId], () => {
        // Usamos nombreCombinado y forzamos salud/vivo a 100/1 para evitar bugs
        db.query('INSERT INTO gatos (user_id, nombre, salud, afecto, vivo) VALUES (?, ?, 100, 50, 1)',
            [userId, nombreCombinado], () => {

                if (gatoRandom.logro) {
                    db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave_interna = ?",
                        [userId, gatoRandom.logro], () => {
                            req.session.ultimaFoto = null; res.redirect('/juego');
                        });
                } else {
                    req.session.ultimaFoto = null; res.redirect('/juego');
                }
            });
    });
});

app.listen(3001, () => console.log("😺 Server corriendo en http://localhost:3001"));