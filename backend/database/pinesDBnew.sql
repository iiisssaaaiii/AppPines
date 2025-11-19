-- ==============================================
--   BASE DE DATOS PINES - MODELO DEFINITIVO
-- ==============================================

DROP DATABASE IF EXISTS pinesdb;
CREATE DATABASE pinesdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pinesdb;

-- ==============================================
-- 1. TABLA USUARIOS (SE MANTIENE IGUAL Y CORRECTA)
-- ==============================================

CREATE TABLE usuarios (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin','empleado') NOT NULL DEFAULT 'empleado',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 2. TABLA IMAGENES (NUEVA)
-- ==============================================

CREATE TABLE imagenes (
  id_imagen INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(150) NOT NULL,          -- nombre que da el usuario
  archivo VARCHAR(255) NOT NULL,         -- nombre del archivo en /uploads
  ruta VARCHAR(255) NOT NULL DEFAULT '/uploads/',
  mime_type VARCHAR(100) DEFAULT NULL,
  tamano_bytes INT DEFAULT NULL,
  fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_imagen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 3. TABLA TAGS (CATEGORIAS)
-- ==============================================

CREATE TABLE tags (
  id_tag INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  PRIMARY KEY (id_tag),
  UNIQUE KEY (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 4. TABLA PIN_TAGS (TABLA PIVOTE PARA DISEÑOS)
-- ==============================================

CREATE TABLE pin_tags (
  id_imagen INT NOT NULL,   -- ahora se relaciona a IMAGENES, no a pines
  id_tag INT NOT NULL,
  PRIMARY KEY (id_imagen, id_tag),

  FOREIGN KEY (id_imagen) REFERENCES imagenes(id_imagen) ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tags(id_tag) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 5. TABLA PINES (PRODUCTOS FABRICADOS)
-- ==============================================

CREATE TABLE pines (
  id_pin INT NOT NULL AUTO_INCREMENT,
  id_imagen INT NOT NULL,                          -- diseño
  tamano ENUM('pequeno','grande') NOT NULL,        -- tamaño del pin fabricado
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,      -- precio unitario actual
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_pin),
  FOREIGN KEY (id_imagen) REFERENCES imagenes(id_imagen)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 6. TABLA INVENTARIO DE PINES
-- ==============================================

CREATE TABLE inventario_pines (
  id_inventario INT NOT NULL AUTO_INCREMENT,
  id_pin INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 0,

  PRIMARY KEY (id_inventario),
  FOREIGN KEY (id_pin) REFERENCES pines(id_pin) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 7. TABLA MATERIA PRIMA
-- ==============================================

CREATE TABLE materia_prima (
  id_material INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  cantidad DECIMAL(10,2) DEFAULT 0.00,
  unidad VARCHAR(50) DEFAULT 'pieza',
  stock_minimo DECIMAL(10,2) DEFAULT 0.00,

  PRIMARY KEY (id_material)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 8. TABLA CONSUMO DE MATERIA PRIMA POR PIN
-- ==============================================

CREATE TABLE consumo_materia (
  id_consumo INT NOT NULL AUTO_INCREMENT,
  id_material INT NOT NULL,
  tamano ENUM('pequeno','grande') NOT NULL,
  cantidad_por_pin DECIMAL(10,4) NOT NULL,

  PRIMARY KEY (id_consumo),
  FOREIGN KEY (id_material) REFERENCES materia_prima(id_material)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 9. TABLA PLANTILLA (HOJA DE PRODUCCIÓN)
-- ==============================================

CREATE TABLE plantilla (
  id INT NOT NULL AUTO_INCREMENT,
  tamano ENUM('pequeno','grande') NOT NULL,
  cantidad INT NOT NULL,
  id_usuario INT NULL,
  fecha_guardado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 10. TABLA PLANTILLA_DETALLE (IMÁGENES COLOCADAS EN LA PLANTILLA)
-- ==============================================

CREATE TABLE plantilla_detalle (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_plantilla INT NOT NULL,
  id_imagen INT NOT NULL,
  posicion INT NOT NULL,     -- posición del círculo dentro del lienzo

  PRIMARY KEY (id_detalle),
  FOREIGN KEY (id_plantilla) REFERENCES plantilla(id)
    ON DELETE CASCADE,
  FOREIGN KEY (id_imagen) REFERENCES imagenes(id_imagen)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 11. TABLA VENTAS
-- ==============================================

CREATE TABLE ventas (
  id_venta INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id_venta),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 12. TABLA DETALLE DE VENTAS
-- ==============================================

CREATE TABLE venta_detalle (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_venta INT NOT NULL,
  id_pin INT NOT NULL,
  cantidad INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,

  PRIMARY KEY (id_detalle),
  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
    ON DELETE CASCADE,
  FOREIGN KEY (id_pin) REFERENCES pines(id_pin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==============================================
-- 13. TABLA VENTA_TAGS (PARA TOP DE TAGS MÁS VENDIDAS)
-- ==============================================

CREATE TABLE venta_tags (
  id_venta INT NOT NULL,
  id_tag INT NOT NULL,

  PRIMARY KEY (id_venta, id_tag),

  FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
    ON DELETE CASCADE,
  FOREIGN KEY (id_tag) REFERENCES tags(id_tag)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
