-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         13.0.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para estancia_app_rn1
CREATE DATABASE IF NOT EXISTS `estancia_app_rn1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `estancia_app_rn1`;

-- Volcando estructura para tabla estancia_app_rn1.animales
CREATE TABLE IF NOT EXISTS `animales` (
  `id_animal` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_corral` int(10) unsigned NOT NULL,
  `id_raza` int(10) unsigned NOT NULL,
  `identificador` varchar(50) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso_kg` decimal(8,2) DEFAULT NULL,
  `estado_salud` enum('sano','enfermo','herido','en_tratamiento') DEFAULT 'sano',
  `id_corral_origen` int(10) unsigned DEFAULT NULL COMMENT 'corral previo antes de enfermería',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_animal`),
  UNIQUE KEY `identificador` (`identificador`),
  KEY `fk_animal_corral` (`id_corral`),
  KEY `fk_animal_raza` (`id_raza`),
  KEY `fk_animal_corral_origen` (`id_corral_origen`),
  CONSTRAINT `fk_animal_corral` FOREIGN KEY (`id_corral`) REFERENCES `corrales` (`id_corral`),
  CONSTRAINT `fk_animal_corral_origen` FOREIGN KEY (`id_corral_origen`) REFERENCES `corrales` (`id_corral`),
  CONSTRAINT `fk_animal_raza` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id_raza`)
) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.animales: ~5 rows (aproximadamente)
INSERT INTO `animales` (`id_animal`, `id_corral`, `id_raza`, `identificador`, `nombre`, `fecha_nacimiento`, `peso_kg`, `estado_salud`, `id_corral_origen`, `activo`, `created_at`, `updated_at`) VALUES
	(128, 3, 1, 'AN-001', NULL, '2026-09-09', 100.00, 'sano', NULL, 0, '2026-09-21 01:12:53', '2026-09-21 01:27:43'),
	(130, 6, 4, 'AN-002', 'Fogata', '2026-08-20', 250.00, 'enfermo', 13, 0, '2026-09-21 12:35:09', '2026-09-21 16:42:08'),
	(131, 3, 2, 'AN-0084', 'Sara', '2026-09-21', 22.00, 'sano', NULL, 0, '2026-09-21 16:40:56', '2026-09-21 16:42:10'),
	(132, 3, 4, 'AN-0001', '...', NULL, 300.00, 'sano', NULL, 1, '2026-09-23 22:59:14', '2026-09-23 22:59:49'),
	(133, 6, 1, 'BOV-001', '...', '2026-09-23', 300.00, 'en_tratamiento', 13, 1, '2026-09-23 23:06:04', '2026-09-24 22:42:42');

-- Volcando estructura para tabla estancia_app_rn1.corrales
CREATE TABLE IF NOT EXISTS `corrales` (
  `id_corral` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `capacidad` int(10) unsigned NOT NULL DEFAULT 50,
  `es_enfermeria` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_corral`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.corrales: ~7 rows (aproximadamente)
INSERT INTO `corrales` (`id_corral`, `nombre`, `capacidad`, `es_enfermeria`, `activo`, `created_at`) VALUES
	(1, 'Corral Norte', 40, 0, 1, '2026-09-20 22:31:13'),
	(2, 'Corral Sur', 35, 0, 1, '2026-09-20 22:31:13'),
	(3, 'Corral Este', 30, 0, 1, '2026-09-20 22:31:13'),
	(4, 'Corral Oeste', 25, 0, 1, '2026-09-20 22:31:13'),
	(5, 'Potrero Central', 50, 0, 1, '2026-09-20 22:31:13'),
	(6, 'Enfermería', 15, 1, 1, '2026-09-20 22:31:13'),
	(13, 'Campo abierto', 100, 0, 1, '2026-09-21 12:34:23');

-- Volcando estructura para tabla estancia_app_rn1.especies
CREATE TABLE IF NOT EXISTS `especies` (
  `id_especie` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_especie`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.especies: ~3 rows (aproximadamente)
INSERT INTO `especies` (`id_especie`, `nombre`, `created_at`) VALUES
	(1, 'Bovino', '2026-09-20 22:31:13'),
	(2, 'Ovino', '2026-09-20 22:31:13'),
	(3, 'Equino', '2026-09-20 22:31:13');

-- Volcando estructura para tabla estancia_app_rn1.identidades_sociales
CREATE TABLE IF NOT EXISTS `identidades_sociales` (
  `id_identidad` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` int(10) unsigned NOT NULL,
  `proveedor` varchar(30) NOT NULL,
  `proveedor_usuario_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_identidad`),
  UNIQUE KEY `uk_identidad_proveedor_usuario` (`proveedor`,`proveedor_usuario_id`),
  UNIQUE KEY `uk_usuario_proveedor` (`id_usuario`,`proveedor`),
  CONSTRAINT `fk_identidad_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.identidades_sociales: ~2 rows (aproximadamente)
INSERT INTO `identidades_sociales` (`id_identidad`, `id_usuario`, `proveedor`, `proveedor_usuario_id`, `created_at`, `updated_at`) VALUES
	(7, 26, 'google', '110834360255219560973', '2026-09-24 14:21:38', '2026-09-24 14:21:38'),
	(8, 28, 'google', '114261324705831967944', '2026-09-24 14:22:55', '2026-09-24 14:22:55'),
	(9, 26, 'facebook', '122101180863486236', '2026-09-24 23:32:50', '2026-09-24 23:32:50');

-- Volcando estructura para tabla estancia_app_rn1.notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id_notificacion` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_animal` int(10) unsigned DEFAULT NULL,
  `titulo` varchar(150) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` varchar(50) DEFAULT 'alerta_sanitaria',
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_notificacion`),
  KEY `fk_notificacion_animal` (`id_animal`),
  CONSTRAINT `fk_notificacion_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.notificaciones: ~0 rows (aproximadamente)

-- Volcando estructura para tabla estancia_app_rn1.razas
CREATE TABLE IF NOT EXISTS `razas` (
  `id_raza` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_especie` int(10) unsigned NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_raza`),
  UNIQUE KEY `uk_raza_especie` (`id_especie`,`nombre`),
  CONSTRAINT `fk_raza_especie` FOREIGN KEY (`id_especie`) REFERENCES `especies` (`id_especie`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.razas: ~4 rows (aproximadamente)
INSERT INTO `razas` (`id_raza`, `id_especie`, `nombre`, `created_at`) VALUES
	(1, 1, 'Angus', '2026-09-20 22:31:13'),
	(2, 1, 'Hereford', '2026-09-20 22:31:13'),
	(3, 2, 'Merino', '2026-09-20 22:31:13'),
	(4, 3, 'Criollo', '2026-09-20 22:31:13');

-- Volcando estructura para tabla estancia_app_rn1.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id_rol` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.roles: ~4 rows (aproximadamente)
INSERT INTO `roles` (`id_rol`, `nombre`, `descripcion`, `created_at`) VALUES
	(1, 'dueno', 'Dueño original de la estancia — acceso total', '2026-09-20 22:31:13'),
	(2, 'copropietario', 'Copropietario con permisos administrativos', '2026-09-20 22:31:13'),
	(3, 'peon', 'Operativo de campo — traslados y alertas', '2026-09-20 22:31:13'),
	(4, 'veterinario', 'Sanidad — corral enfermería y tratamientos', '2026-09-20 22:31:13');

-- Volcando estructura para tabla estancia_app_rn1.tratamientos
CREATE TABLE IF NOT EXISTS `tratamientos` (
  `id_tratamiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_animal` int(10) unsigned NOT NULL,
  `id_veterinario` int(10) unsigned NOT NULL,
  `descripcion` text NOT NULL,
  `medicamento` varchar(150) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_tratamiento`),
  KEY `fk_tratamiento_animal` (`id_animal`),
  KEY `fk_tratamiento_vet` (`id_veterinario`),
  CONSTRAINT `fk_tratamiento_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`),
  CONSTRAINT `fk_tratamiento_vet` FOREIGN KEY (`id_veterinario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.tratamientos: ~3 rows (aproximadamente)
INSERT INTO `tratamientos` (`id_tratamiento`, `id_animal`, `id_veterinario`, `descripcion`, `medicamento`, `fecha_inicio`, `fecha_fin`, `observaciones`, `created_at`) VALUES
	(3, 130, 3, 'reporte de ingreso a enfermería: decaimineto', NULL, '2026-09-21', NULL, NULL, '2026-09-21 12:36:44'),
	(4, 133, 3, 'reporte de ingreso a enfermería por síntomas observados en campo', NULL, '2026-09-23', NULL, NULL, '2026-09-23 23:11:38'),
	(5, 133, 4, 'vdssdvdvd', 'gggg', '2026-09-23', NULL, '.....', '2026-09-23 23:12:43');

-- Volcando estructura para tabla estancia_app_rn1.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_rol` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `debe_cambiar_password` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuario_rol` (`id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla estancia_app_rn1.usuarios: ~6 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `id_rol`, `nombre`, `apellido`, `email`, `password_hash`, `activo`, `created_at`, `updated_at`, `debe_cambiar_password`) VALUES
	(1, 1, 'Sara', 'Willers', 'dueno@estancia.app', '$2b$10$edn7NvaKw3A6rYzyM5b.F.kSDxlJWjN4fo4.dnIr/v3UDP9LUTA1C', 1, '2026-09-20 22:31:13', '2026-09-24 14:19:10', 0),
	(2, 2, 'Martín', 'López', 'coprop@estancia.app', '$2a$10$VFt8EMqmR136yHf4SaALmuO.Hp2KrDSXOgkbEiRINm29zhh/unsUW', 0, '2026-09-20 22:31:13', '2026-09-24 14:19:32', 1),
	(3, 3, 'Juan', 'García', 'peon@estancia.app', '$2a$10$gGNUld0NyO7KGK1CvHANOuPvjUccWB4CYxPKqRxRcG6e81ufgGN2a', 1, '2026-09-20 22:31:13', '2026-09-21 01:10:37', 0),
	(4, 4, 'Laura', 'Fernández', 'vet@estancia.app', '$2a$10$tuQal7bxhQNO7uCDILEONe8pM3cctzjbUyqdcjW7B4tORxIDrEuyK', 1, '2026-09-20 22:31:13', '2026-09-21 01:09:31', 0),
	(26, 2, 'Sara', 'Willers Löhr', 'sarawillerslohr08@gmail.com', '$2a$10$EJync7tb7YLUBm91GJUo4ezpDPas1YFnIJKiQclwENC.ExLteDLyW', 1, '2026-09-24 14:21:29', '2026-09-24 14:21:48', 0),
	(28, 4, 'Sara', 'Vet', 'sara.willers23@gmail.com', '$2a$10$G4bXRNUUv9kWjOIahRHXUuN3OPp7THHSfDfEuw7lk1aSipGedTica', 1, '2026-09-24 14:22:40', '2026-09-24 14:23:04', 0);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
