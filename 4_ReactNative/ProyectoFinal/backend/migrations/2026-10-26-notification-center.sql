ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS rol_destino VARCHAR(30) NULL;
ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS estado_respuesta VARCHAR(20) NULL;
CREATE TABLE IF NOT EXISTS notificaciones_usuario (
  id_notificacion INT UNSIGNED NOT NULL,
  id_usuario INT UNSIGNED NOT NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  eliminada TINYINT(1) NOT NULL DEFAULT 0,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion, id_usuario),
  CONSTRAINT fk_notificacion_usuario_notificacion FOREIGN KEY (id_notificacion) REFERENCES notificaciones(id_notificacion) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_usuario_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);
