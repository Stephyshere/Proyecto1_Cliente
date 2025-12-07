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
-- IMPORTANTE: Se corrigió la sintaxis (el ';' después del ID 8 era el error principal)
-- Se corrigieron las rutas de imagen para Gato Chino y Corazón de Piedra.
INSERT IGNORE INTO logros (id, title, description, icon_url, clave_interna) VALUES 
(1, 'Amor Eterno', 'Consigue que tu gato te ame al máximo.', 'LOGRO_GATO-TEAMA.png', 'love_max'),
(2, 'Hasta la vista', 'Tu gato ha pasado a mejor vida.', 'LOGRO_GATO-RIP.png', 'rip'),
(3, 'Enemigo Público', 'Tu gato te odia con toda su alma.', 'LOGRO_GATO-ODIO.png', 'hate_max'),
(4, 'Gato Zen', 'Tu gato se duerme tras 5 min sin actividad.', 'LOGRO_GATOZEN.png', 'zen'),
(5,  'Bollito', 'Has adoptado un gato Bollito.','LOGRO_PERLI.jpeg', 'gato_perli'),
(6, 'Banana Cat', 'Has conseguido un gato Banana.', 'LOGRO_GATO-BANANA.png', 'gato_banana'),
(7, 'Gato Perli', 'Has adoptado a la legendaria Perli.', 'LOGRO_BOLLITO.png', 'gato_bollito'),
(8, 'Gato Chino', 'Has adoptado un Gato Chino de la suerte.', 'LOGRO_GATO-SUERTE.png', 'gato_chino'), -- CORRECCIÓN DE IMAGEN
(9, 'Abandonado', 'Tu gato ha decidido abandonarte.', 'LOGRO_GATO-ABANDONO.png', 'abandonado'),
(10, 'Solid Snake', 'Le has dado una caja a tu gato y se siente como Solid Snake.', 'LOGRO_GATO-SNAKE.png', 'solid_snake'),
(11, 'Hipocondriaco', 'Le has dado medicina a tu gato con la salud al máximo "por si acaso".', 'LOGRO_GATO-HIPO.png', 'hipocondriaco'),
(12, 'Indigestion', ' Le has dado de comer justo después de jugar o asustarlo.', 'LOGRO_GATO-INDIGESTION.png', 'indigestion'),
(13, 'Mision Suicida', '¿De verdad ibas a bañar a tu gato con lo que te odia?', 'LOGRO_GATO-MISION-SUICIDA.png', 'mision_suicida'),
(14, 'Corazon de Piedra', 'Tu gato tiene la salud muy baja y lo has ignorado.', 'LOGRO_GATO-IGNORADO.png', 'corazon_de_piedra'), -- CORRECCIÓN DE IMAGEN
(15, 'Gato Zombie', '¡Has curado a tu gato justo antes de que muriera!', 'LOGRO_GATOZOMBIE.png', 'gato_zombie'),
(16, 'Dedos Sangrantes', 'Has acariciado a tu gato cuando te odiaba mucho.', 'LOGRO_GATO-DEDOS-SANGRANTES.png', 'dedos_sangrantes'),
(17, 'Amor tragico', 'Tu gato a muerto amandote por completo', 'LOGRO_GATO-AMIGO-FIEL.png', 'amigo_fiel'),
(18, 'Rencor Eterno', 'Tu gato ha muerto odiandote con toda su alma.', 'LOGRO_GATO-RENCOROSO.png', 'rencor_eterno'),
(19, 'Gato Amoroso', 'El gato que has adoptado es extremadamente cariñoso aunque no te conozca.', 'LOGRO_GATO-AMOROSO.png', 'gato_amoroso'),
(20, 'Gato Odioso', 'El gato que has adoptado te odia desde el primer momento.', 'LOGRO_GATO-ODIOSO.png', 'gato_odioso');