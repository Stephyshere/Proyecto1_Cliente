CREATE DATABASE IF NOT EXISTS gatogotchi;
USE gatogotchi;
CREATE TABLE `usuarios` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `nombre` varchar(255) UNIQUE NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'Contraseña encriptada',
  `created_at` timestamp DEFAULT (now())
);

CREATE TABLE `gatos` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `user_id` integer NOT NULL,
  `nombre` varchar(255) DEFAULT 'Michi',
  `salud` integer DEFAULT 100 COMMENT 'Salud: 0-100. Sube con medicinas, baja con errores',
  `afecto` integer DEFAULT 50 COMMENT 'Afecto: 0-100. Sube con mimos',
  `vivo` boolean DEFAULT true
);

CREATE TABLE `recursos` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `condicion` varchar(255) NOT NULL COMMENT 'Clave para el JS: sick, loving, normal, dead',
  `url_archivo` varchar(255) NOT NULL COMMENT '/img/gato_triste.gif',
  `tipo` varchar(255) COMMENT 'image o gif'
);

CREATE TABLE `logros` (
  `id` integer PRIMARY KEY AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text COMMENT 'Ej: Consigue 100 de afecto',
  `icon_url` varchar(255) COMMENT 'Icono de la medalla'
);

CREATE TABLE `logros_usuario` (
  `usuario_id` integer,
  `logros_id` integer,
  `unlocked_at` timestamp DEFAULT (now()),
  PRIMARY KEY (`usuario_id`, `logros_id`)
);

ALTER TABLE `gatos` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `logros_usuario` ADD FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

ALTER TABLE `logros_usuario` ADD FOREIGN KEY (`logros_id`) REFERENCES `logros` (`id`);
