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
    secret: 'secreto_super_seguro',
    resave: false,
    saveUninitialized: false
}));

// --- CONEXIÓN BD ---
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // CAMBIA ESTO SI TIENES CONTRASEÑA
    password: 'root',      
    database: 'gatogotchi'
});

db.connect(err => {
    if (err) console.error("❌ Error BD:", err);
    else console.log("✅ Base de datos conectada");
});

// --- DATOS GLOBALES (MIGRADOS DE TU JS) ---
// Define qué imágenes corresponden a cada ID
const TIPOS_GATO = {
    "01": { name: "Gato Chino", img: "gatos/GatoChino.png" },
    "02": { name: "Gato Banana", img: "gatos/GatoBanana.png" },
    "03": { name: "Gato Negro", img: "gatos/GatoNegro.png" },
    "04": { name: "Gato Blanco", img: "gatos/GatoBlanco.png" },
    "05": { name: "Gato Naranja", img: "gatos/GatoNaranja.png" },
    "06": { name: "Gato Siames", img: "gatos/GatoSiames.png" },
    "07": { name: "Gato Esmoking", img: "gatos/GatoEsmoking.png" },
    "08": { 
        name: "PERLI", 
        img: "gatos/perli.png", 
        // Perli tiene imágenes especiales
        especial: { feliz: "gatos/perliFeliz.png", love_max: "gatos/PerliAmorMax.png" } 
    },
    "09": { 
        name: "BOLLITO", 
        img: "gatos/Bollito.png",
        especial: { feliz: "gatos/BollitoFeliz.png" }
    }
};

// Rutas a las emociones genéricas
const EMOCIONES = {
    triste: "emociones/GatoTriste.png",
    feliz: "emociones/GatoFeliz.gif",
    love_max: "emociones/AmorMax.gif",
    hate_max: "emociones/HateMax.gif",
    alimentar: "emociones/Comida.gif",
    alimentarMalo: "emociones/GatoComidaAsco.gif",
    ignorar: "emociones/GatoIgnorado.gif",
    asustar: "emociones/GatoAsustado.gif",
    cepillar: "emociones/Peinado.gif", // Asegúrate de tener esta imagen o cambia el nombre
    bañar: "emociones/GatoBañado.gif",
    acariciar: "emociones/GatoAcariciado.gif",
    caja: "emociones/GatoCaja.gif",
    laser: "emociones/GatoLaser.gif",
    esconder: "emociones/GatoEscondido.gif",
    medicina: "emociones/GatoPastilla.gif",
    medicinaBuena: "emociones/GatoMedicina.gif",
    tumba: "emociones/tumba.png" // Asegurate de tener una imagen tumba
};

// --- LÓGICA DE PROBABILIDADES ---
function calcularInteraccion(accion, salud, afecto) {
    let dSalud = 0;
    let dAfecto = 0;
    let emocion = 'feliz';
    let texto = "";
    const r = Math.random(); // 0.0 a 1.0

    switch(accion) {
        case 'alimentar':
            if (r > 0.3) { // 70% Bueno
                dSalud = 5; dAfecto = 5; emocion = 'feliz'; texto = "¡Qué rico! 🐟";
            } else { 
                dSalud = -5; dAfecto = -5; emocion = 'alimentarMalo'; texto = "¡Puaj! Esto sabe mal 🤢";
            }
            break;
        case 'acariciar':
            if (afecto > 80) {
                dAfecto = 5; emocion = 'love_max'; texto = "¡Te quiero mucho humano! ❤️";
            } else if (r > 0.4) {
                dAfecto = 10; emocion = 'acariciar'; texto = "Purrr purrr...";
            } else {
                dAfecto = -5; emocion = 'hate_max'; texto = "¡NO ME TOQUES! 😾";
            }
            break;
        case 'jugarConLaser':
            dAfecto = 15; dSalud = -2; emocion = 'laser'; texto = "¡Ven aquí puntito rojo!";
            break;
        case 'lavar':
            if (r > 0.8) { // Raro que le guste
                dSalud = 10; emocion = 'bañar'; texto = "Bueno... estoy limpio ✨";
            } else {
                dSalud = 5; dAfecto = -20; emocion = 'hate_max'; texto = "¡ODIO EL AGUA! 💦😡";
            }
            break;
        case 'cepillar':
            if (r > 0.5) {
                dAfecto = 10; emocion = 'cepillar'; texto = "Qué suave...";
            } else {
                dAfecto = -5; emocion = 'hate_max'; texto = "¡Ay! ¡Cuidado con los tirones!";
            }
            break;
        case 'ignorar':
            dAfecto = -15; emocion = (r > 0.5) ? 'triste' : 'ignorar'; texto = "¿Hola? ¿Hay alguien ahí? 🥺";
            break;
        case 'darMedicamento':
            if (salud < 100) {
                if (r > 0.4) {
                    dSalud = 20; emocion = 'medicinaBuena'; texto = "Me siento mejor 💪";
                } else {
                    dSalud = 0; dAfecto = -5; emocion = 'medicina'; texto = "¡Sabe horrible! *Escupe*";
                }
            } else {
                dAfecto = -10; emocion = 'esconder'; texto = "¡No estoy enfermo, déjame!";
            }
            break;
        case 'asustar':
            dSalud = -5; dAfecto = -20; emocion = 'asustar'; texto = "¡AAAAHH! ¡Qué susto! 👻";
            break;
        case 'darCaja': // Extra
            dAfecto = 10; emocion = 'caja'; texto = "Si encajo, me siento 📦";
            break;
        default:
            texto = "...";
    }
    return { dSalud, dAfecto, emocion, texto };
}

// --- RUTAS ---

// Login
app.get('/', (req, res) => res.render('login'));
app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    db.query('SELECT * FROM usuarios WHERE nombre = ? AND password_hash = ?', [user, pass], (err, results) => {
        if (results.length > 0) {
            req.session.userId = results[0].id;
            req.session.userName = results[0].nombre;
            res.redirect('/juego');
        } else {
            res.redirect('/'); // Falló login
        }
    });
});

// Registro
app.get('/registro', (req, res) => res.render('registro'));
app.post('/registro', (req, res) => {
    const { user, pass } = req.body;
    db.query('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', 
        [user, user+"@mail.com", pass], (err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

// Pantalla de Juego
app.get('/juego', (req, res) => {
    if (!req.session.userId) return res.redirect('/');

    // 1. Obtener gato
    db.query('SELECT * FROM gatos WHERE user_id = ?', [req.session.userId], (err, rows) => {
        const gato = rows[0];

        // Si no tiene gato, renderizar vista de adopción (que está dentro de juego.ejs controlada por if)
        if (!gato) return res.render('juego', { gato: null, user: req.session.userName });

        // 2. Obtener logros desbloqueados
        const sqlLogros = `
            SELECT l.*, 
            CASE WHEN lu.unlocked_at IS NOT NULL THEN 1 ELSE 0 END as tiene 
            FROM logros l 
            LEFT JOIN logros_usuario lu ON l.id = lu.logro_id AND lu.usuario_id = ?`;
        
        db.query(sqlLogros, [req.session.userId], (err2, logros) => {
            
            // Lógica de imagen inicial
            const datosTipo = TIPOS_GATO[gato.tipo_id] || TIPOS_GATO["01"];
            let imagenUrl = datosTipo.img;
            if (!gato.vivo) imagenUrl = EMOCIONES.tumba;

            res.render('juego', {
                gato: gato,
                user: req.session.userName,
                imagen: imagenUrl,
                texto: "¡Hola " + req.session.userName + "!",
                logros: logros
            });
        });
    });
});

// Acción de Botones
app.post('/interactuar', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const { accion } = req.body;

    db.query('SELECT * FROM gatos WHERE user_id = ?', [req.session.userId], (err, rows) => {
        if (!rows[0]) return res.redirect('/juego');
        let gato = rows[0];

        if (!gato.vivo) return res.redirect('/juego'); // Si está muerto no hace nada

        // Calcular
        const resultado = calcularInteraccion(accion, gato.salud, gato.afecto);
        
        // Limites
        let nuevaSalud = Math.min(100, Math.max(0, gato.salud + resultado.dSalud));
        let nuevoAfecto = Math.min(100, Math.max(0, gato.afecto + resultado.dAfecto));
        let vivo = nuevaSalud > 0;

        // Determinar Imagen
        let imgFinal = EMOCIONES[resultado.emocion] || TIPOS_GATO["01"].img;
        const tipoGato = TIPOS_GATO[gato.tipo_id];

        // ¿Es Perli/Bollito y tiene imagen especial?
        if (tipoGato.especial && tipoGato.especial[resultado.emocion]) {
            imgFinal = tipoGato.especial[resultado.emocion];
        }
        if (!vivo) imgFinal = EMOCIONES.tumba;

        // Actualizar BD
        db.query('UPDATE gatos SET salud=?, afecto=?, vivo=? WHERE id=?', 
            [nuevaSalud, nuevoAfecto, vivo, gato.id], () => {
                
                // Recargar página con datos nuevos (Simulado pasando variables al render)
                // Para simplificar, redirigimos a /juego pero guardamos el estado en sesión o 
                // hacemos render directo. Haremos render directo para ver el resultado de la acción.
                
                const sqlLogros = `SELECT l.*, CASE WHEN lu.unlocked_at IS NOT NULL THEN 1 ELSE 0 END as tiene FROM logros l LEFT JOIN logros_usuario lu ON l.id = lu.logro_id AND lu.usuario_id = ?`;
                db.query(sqlLogros, [req.session.userId], (err3, logros) => {
                    res.render('juego', {
                        gato: { ...gato, salud: nuevaSalud, afecto: nuevoAfecto, vivo },
                        user: req.session.userName,
                        imagen: imgFinal,
                        texto: resultado.texto,
                        logros: logros
                    });
                });
        });
    });
});

// Adoptar
app.post('/adoptar', (req, res) => {
    if (!req.session.userId) return res.redirect('/');
    const { nombre } = req.body;
    
    // Elegir tipo aleatorio
    const keys = Object.keys(TIPOS_GATO);
    const tipoId = keys[Math.floor(Math.random() * keys.length)];

    // Borrar anterior y crear nuevo
    db.query('DELETE FROM gatos WHERE user_id = ?', [req.session.userId], () => {
        db.query('INSERT INTO gatos (user_id, nombre, tipo_id) VALUES (?, ?, ?)', 
            [req.session.userId, nombre, tipoId], () => {
            
            // Check Logros de adopción
            if (tipoId === '08') db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave='gatoPerli'", [req.session.userId]);
            if (tipoId === '09') db.query("INSERT IGNORE INTO logros_usuario (usuario_id, logro_id) SELECT ?, id FROM logros WHERE clave='gatoBollito'", [req.session.userId]);

            res.redirect('/juego');
        });
    });
});

app.listen(3001, () => console.log("😺 Servidor listo en http://localhost:3001"));