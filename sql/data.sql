-- 1. CREAR BASE DE DATOS
CREATE DATABASE IF NOT EXISTS gatogotchi;
USE gatogotchi;

-- 2. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE GATOS (VERSIÓN "TRUCO")
-- Nota: No hay columna 'imagen'. La ruta se guardará dentro de 'nombre'.
CREATE TABLE IF NOT EXISTS gatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL, -- Suficientemente largo para "Nombre|||Ruta"
    salud INT DEFAULT 100,
    afecto INT DEFAULT 50,
    vivo TINYINT(1) DEFAULT 1,
    causa_muerte VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. TABLA DE LOGROS
CREATE TABLE IF NOT EXISTS logros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    icon_url VARCHAR(100), 
    clave_interna VARCHAR(50) UNIQUE
);

-- 5. TABLA DE LOGROS_USUARIO (Relación)
CREATE TABLE IF NOT EXISTS logros_usuario (
    usuario_id INT,
    logro_id INT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, logro_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (logro_id) REFERENCES logros(id) ON DELETE CASCADE
);

-- 6. INSERTAR TODOS LOS LOGROS
INSERT IGNORE INTO logros (id, title, description, icon_url, clave_interna) VALUES 
(1, 'Amor Eterno', 'Consigue que tu gato te ame al máximo.', 'LOGRO_GATO-TEAMA.png', 'love_max'),
(2, 'Hasta la vista', 'Tu gato ha pasado a mejor vida.', 'LOGRO_GATO-RIP.png', 'rip'),
(3, 'Enemigo Público', 'Tu gato te odia con toda su alma.', 'LOGRO_GATO-ODIO.png', 'hate_max'),
(4, 'Gato Zen', 'Paz interior alcanzada.', 'LOGRO_GATOZEN.png', 'zen'),
(5, 'Bollito', 'Has adoptado un gato Bollito.', 'LOGRO_BOLLITO.jpeg', 'gato_bollito'),
(6, 'Banana Cat', 'Has conseguido un gato Banana.', 'LOGRO_GATO-BANANA.png', 'gato_banana'),
(7, 'Gato Perli', 'Has adoptado a la legendaria Perli.', 'LOGRO_PERLI.jpeg', 'gato_perli'),
(8, 'Gato Chino', 'Has adoptado un Gato Chino de la suerte.', 'logroGatoChino.jpg', 'gato_chino');