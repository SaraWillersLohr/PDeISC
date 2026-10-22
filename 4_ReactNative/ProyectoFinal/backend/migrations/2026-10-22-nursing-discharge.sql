-- registro altas veterinarias y destinatario de notificaciones por rol.
ALTER TABLE `notificaciones`
  ADD COLUMN `rol_destino` varchar(30) DEFAULT NULL AFTER `tipo`;

CREATE TABLE IF NOT EXISTS `altas_enfermeria` (
  `id_alta` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_animal` int(10) unsigned NOT NULL,
  `id_veterinario` int(10) unsigned NOT NULL,
  `id_movimiento` int(10) unsigned DEFAULT NULL,
  `fecha_alta` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_traslado` datetime DEFAULT NULL,
  `observaciones` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_alta`),
  KEY `idx_alta_animal_fecha` (`id_animal`, `fecha_alta`),
  KEY `idx_alta_veterinario` (`id_veterinario`),
  CONSTRAINT `fk_alta_enfermeria_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`),
  CONSTRAINT `fk_alta_enfermeria_veterinario` FOREIGN KEY (`id_veterinario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_alta_enfermeria_movimiento` FOREIGN KEY (`id_movimiento`) REFERENCES `movimientos_animales` (`id_movimiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
