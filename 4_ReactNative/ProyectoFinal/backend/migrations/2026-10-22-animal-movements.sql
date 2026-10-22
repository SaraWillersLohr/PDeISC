-- registro el historial de traslados sin borrar el corral de origen.
CREATE TABLE IF NOT EXISTS `movimientos_animales` (
  `id_movimiento` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `id_animal` int(10) unsigned NOT NULL,
  `id_corral_origen` int(10) unsigned NOT NULL,
  `id_corral_destino` int(10) unsigned NOT NULL,
  `id_usuario` int(10) unsigned NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  `observaciones` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_movimiento_animal_fecha` (`id_animal`, `fecha_hora`),
  KEY `idx_movimiento_origen` (`id_corral_origen`),
  KEY `idx_movimiento_destino` (`id_corral_destino`),
  KEY `idx_movimiento_usuario` (`id_usuario`),
  CONSTRAINT `fk_movimiento_animal` FOREIGN KEY (`id_animal`) REFERENCES `animales` (`id_animal`),
  CONSTRAINT `fk_movimiento_corral_origen` FOREIGN KEY (`id_corral_origen`) REFERENCES `corrales` (`id_corral`),
  CONSTRAINT `fk_movimiento_corral_destino` FOREIGN KEY (`id_corral_destino`) REFERENCES `corrales` (`id_corral`),
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
