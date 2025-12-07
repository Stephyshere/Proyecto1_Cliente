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
    password: '', // <--- TU CONTRASEÑA
    database: 'gatogotchi'
});

db.connect(err => {
    if (err) console.error("❌ Error conectando a BD:", err);
    else console.log("✅ Base de datos conectada");
});

// --- IMÁGENES EXACTAS (Según tu lista) ---
const IMAGENES = {
    // Estados básicos
    feliz: "emociones/GatoFeliz.gif",     // >= 50% afecto
    triste_estado: "emociones/GatoTriste.png", // < 50% afecto (User pidió .gif, pero en lista archivos es .png, ajusta si es necesario)
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

    // Nuevos
    asustar: "emociones/GatoEscondido.gif", // Asumo esta imagen o usa HateMax
    cepillar: "emociones/GatoAcariciado.gif" // Reutilizamos acariciado o añade una específica
};

// --- LÓGICA DE JUEGO ---
function calcularInteraccion(accion, gato) {
    let dSalud = 0, dAfecto = 0, img = IMAGENES.feliz, texto = "";
    let r = Math.random(); 
    let bonus = (gato.afecto > 80) ? 0.2 : 0; 

    switch(accion) {
        case 'alimentar':
            if (r < (0.3 - bonus)) {
                dSalud = -5; dAfecto = -2; img = IMAGENES.comida_asco; texto = "¡Puaj! ¡Sabe mal! 🤢";
            } else {
                dSalud = 10; dAfecto = 5; img = IMAGENES.comida_ok; texto = "¡Qué rico! 🐟";
            }
            break;

        case 'acariciar':
            if (gato.afecto < 25) { // Si te odia
                dSalud = -2; dAfecto = -5; img = IMAGENES.mimos_bad; texto = "¡NO ME TOQUES! 🩸";
            } else {
                dAfecto = 10; img = IMAGENES.mimos_ok; texto = "Purrrr... mimos.";
            }
            break;

        case 'jugarConLaser':
            dSalud = -2; dAfecto = 15; img = IMAGENES.laser; texto = "¡Atrápalo! 🔴";
            break;

        case 'caja':
            dAfecto = 20; img = IMAGENES.caja; texto = "Si encajo, me siento. 📦";
            break;

        case 'lavar':
            if (r > 0.7) { 
                dSalud = 15; img = IMAGENES.bano_ok; texto = "Estoy limpio ✨";
            } else {
                dAfecto = -20; img = IMAGENES.bano_bad; texto = "¡ODIO EL AGUA! 💦";
            }
            break;

        case 'medicina': // Curar
            if (gato.salud < 100) {
                if (r > 0.4) {
                     dSalud = 50; dAfecto = 5; img = IMAGENES.curar_ok; texto = "Me siento mejor (Pastilla).";
                } else {
                     dSalud = 30; dAfecto = -5; img = IMAGENES.curar_bad; texto = "¡Sabe a rayos! (Jarabe).";
                }
            } else {
                dAfecto = -5; img = IMAGENES.curar_bad; texto = "¡No estoy enfermo!";
            }
            break;

        case 'ignorar':
            dAfecto = -10; img = IMAGENES.ignorar; texto = "Esperando...";
            break;

        case 'asustar':
            dSalud = -5; dAfecto = -15; img = IMAGENES.mimos_bad; texto = "¡AAAAH! 👻";
            break;

        case 'cepillar':
            dAfecto = 8; img = IMAGENES.mimos_ok; texto = "Qué suave...";
            break;
    }
    return { dSalud, dAfecto, img, texto };
}

// --- RUTAS ---

// 1. LOGIN
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

// 2. INVITADO (NUEVA RUTA)
app.post('/guest', (req, res) => {
    req.session.user = null; // Asegurar que no hay usuario
    // Crear gato default
    req.session.gatoInvitado = { nombre: "Gato Invitado", salud: 100, afecto: 50, vivo: true };
    res.redirect('/juego');
});

// 3. REGISTRO
app.get('/registro', (req, res) => res.render('registro'));
app.post('/registro', (req, res) => {
    const { user, pass } = req.body;
    db.query('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [user, user+"@mail.com", pass], () => {
        res.redirect('/');
    });
});
app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// 4. JUEGO
app.get('/juego', (req, res) => {
    
    // --> MODO INVITADO
    if (!req.session.user) {
        const gatoInv = req.session.gatoInvitado;
        if (!gatoInv) return res.redirect('/'); // Si entra directo sin botón, al login

        // Determinar FOTO DE ESTADO (Top Left)
        const fotoEstado = (gatoInv.afecto >= 50) ? IMAGENES.feliz : IMAGENES.triste_estado;
        // La foto central por defecto
        const fotoCentral = req.session.ultimaFoto || fotoEstado; 
        
        return res.render('juego', {
            user: null,
            gato: gatoInv,
            historial: [],
            logros: [],
            imagen: gatoInv.vivo ? fotoCentral : IMAGENES.muerto,
            imagenEstado: fotoEstado, // Variable nueva para el cuadro arriba izq
            texto: req.session.ultimoTexto || "Modo Invitado"
        });
    }

    // --> MODO USUARIO
    const userId = req.session.user.id;
    db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 1', [userId], (err, gatos) => {
        const gatoActual = gatos ? gatos[0] : null;

        db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 0 ORDER BY id DESC', [userId], (err2, historial) => {
            const sqlLogros = `SELECT l.*, CASE WHEN lu.unlocked_at IS NOT NULL THEN 1 ELSE 0 END as tiene FROM logros l LEFT JOIN logros_usuario lu ON l.id = lu.logro_id AND lu.usuario_id = ?`;
            
            db.query(sqlLogros, [userId], (err3, logros) => {
                if (err3) logros = [];

                let imagenEstado = IMAGENES.feliz;
                let imagenCentral = IMAGENES.feliz;
                let textoMostrar = "Miau...";

                if (gatoActual) {
                    // Lógica del cuadro de estado
                    imagenEstado = (gatoActual.afecto >= 50) ? IMAGENES.feliz : IMAGENES.triste_estado;
                    // Si venimos de una interacción, usamos la foto de la interacción, si no, la del estado
                    imagenCentral = req.session.ultimaFoto || imagenEstado;
                    textoMostrar = req.session.ultimoTexto || "Miau...";
                    
                    // Limpiar sesión flash manual
                    req.session.ultimaFoto = null;
                    req.session.ultimoTexto = null;
                } else {
                    imagenCentral = null;
                    textoMostrar = "";
                }

                res.render('juego', {
                    user: req.session.user,
                    gato: gatoActual,
                    historial: historial || [],
                    logros: logros || [],
                    imagen: imagenCentral,
                    imagenEstado: imagenEstado, // Nueva variable
                    texto: textoMostrar
                });
            });
        });
    });
});

// 5. INTERACTUAR
app.post('/interactuar', (req, res) => {
    const { accion } = req.body;

    // Helper para guardar resultado y redirigir
    const finalizarInteraccion = (gato, resultado, vivo) => {
        req.session.ultimaFoto = vivo ? resultado.img : IMAGENES.muerto;
        req.session.ultimoTexto = vivo ? resultado.texto : "Ha muerto...";
        res.redirect('/juego');
    };

    // Invitado
    if (!req.session.user) {
        let g = req.session.gatoInvitado;
        if (!g || !g.vivo) return res.redirect('/juego');

        const resInv = calcularInteraccion(accion, g);
        g.salud = Math.min(100, Math.max(0, g.salud + resInv.dSalud));
        g.afecto = Math.min(100, Math.max(0, g.afecto + resInv.dAfecto));
        if (g.salud <= 0) { g.vivo = false; }
        req.session.gatoInvitado = g;
        finalizarInteraccion(g, resInv, g.vivo);
        return;
    }

    // Usuario
    db.query('SELECT * FROM gatos WHERE user_id = ? AND vivo = 1', [req.session.user.id], (err, rows) => {
        if (!rows || !rows[0]) return res.redirect('/juego');
        let gato = rows[0];

        // Cheats Admin
        if (req.session.user.rol === 'admin') {
            if (accion === 'kill') gato.salud = 0;
            if (accion === 'heal') { gato.salud = 100; gato.afecto = 100; }
        }

        const resultado = calcularInteraccion(accion, gato);
        let nuevaSalud = Math.min(100, Math.max(0, gato.salud + resultado.dSalud));
        let nuevoAfecto = Math.min(100, Math.max(0, gato.afecto + resultado.dAfecto));
        let vivo = nuevaSalud > 0 ? 1 : 0;
        let causa = vivo ? null : "Descuido";

        // Desbloquear Logros
        if (nuevoAfecto >= 100) db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave_interna='love_max'", [req.session.user.id]);
        if (vivo === 0) db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave_interna='rip'", [req.session.user.id]);

        db.query('UPDATE gatos SET salud=?, afecto=?, vivo=?, causa_muerte=? WHERE id=?', 
            [nuevaSalud, nuevoAfecto, vivo, causa, gato.id], () => {
                finalizarInteraccion(gato, resultado, vivo);
        });
    });
});

// 6. ADOPTAR (CORREGIDO: Permite nombre siempre)
app.post('/adoptar', (req, res) => {
    const nombre = req.body.nombre || "Michi Nuevo";

    if (!req.session.user) {
        req.session.gatoInvitado = { nombre: nombre, salud: 100, afecto: 50, vivo: true };
        return res.redirect('/juego');
    }

    // Archivar gato anterior (vivo o muerto, lo marcamos como abandonado/muerto)
    // Primero archivamos el que esté vivo
    db.query('UPDATE gatos SET vivo = 0, causa_muerte = "Reemplazado" WHERE user_id = ? AND vivo = 1', [req.session.user.id], () => {
        // Creamos el nuevo
        db.query('INSERT INTO gatos (user_id, nombre) VALUES (?, ?)', [req.session.user.id, nombre], () => {
            req.session.ultimaFoto = null; // Reset foto
            res.redirect('/juego');
        });
    });
});

app.listen(3001, () => console.log("😺 Server corriendo en http://localhost:3001"));