-- =====================================
-- Base de datos PinesDB
-- =====================================

-- 1. Crear base de datos
DROP DATABASE IF EXISTS PinesDB;
CREATE DATABASE PinesDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE PinesDB;

-- =====================================
-- 2. Tabla de usuarios (admins y empleados)
-- =====================================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- se almacenará con hash
    rol ENUM('admin','empleado') NOT NULL DEFAULT 'empleado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 3. Tabla de pines (diseños)
-- =====================================
CREATE TABLE pines (
    id_pin INT AUTO_INCREMENT PRIMARY KEY,
    url_imagen VARCHAR(255) NOT NULL,
    etiquetas VARCHAR(255),
    tamano ENUM('pequeno','grande') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 4. Inventario de pines
-- =====================================
CREATE TABLE inventario_pines (
    id_inventario INT AUTO_INCREMENT PRIMARY KEY,
    id_pin INT NOT NULL,
    cantidad INT DEFAULT 0,
    FOREIGN KEY (id_pin) REFERENCES pines(id_pin) ON DELETE CASCADE
);

-- =====================================
-- 5. Materia prima (insumos)
-- =====================================
CREATE TABLE materia_prima (
    id_material INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cantidad DECIMAL(10,2) DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    unidad VARCHAR(50) DEFAULT 'pieza'
);

-- =====================================
-- 6. Consumo de materia prima por pin
-- =====================================
CREATE TABLE consumo_materia (
    id_consumo INT AUTO_INCREMENT PRIMARY KEY,
    tamano ENUM('pequeno','grande') NOT NULL,
    id_material INT NOT NULL,
    cantidad_por_pin DECIMAL(10,4) NOT NULL,
    FOREIGN KEY (id_material) REFERENCES materia_prima(id_material)
);

-- =====================================
-- 7. Ventas (registro de ventas directas)
-- =====================================
CREATE TABLE ventas (
    id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- =====================================
-- 8. Detalle de ventas
-- =====================================
CREATE TABLE venta_detalle (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_pin INT NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE CASCADE,
    FOREIGN KEY (id_pin) REFERENCES pines(id_pin)
);

-- =====================================
-- 9. Datos iniciales
-- =====================================

-- Usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Admin General', 'admin@pines.com', '123456', 'admin');

-- Materia prima inicial
INSERT INTO materia_prima (nombre, cantidad, stock_minimo, unidad) VALUES
('Botones pequenos', 500, 100, 'pieza'),
('Botones grandes', 300, 50, 'pieza'),
('Hojas A4', 200, 50, 'pieza');

-- Consumo de materia prima por pin
-- Pines pequeños: 1 botón pequeño + 1/12 de hoja
INSERT INTO consumo_materia (tamano, id_material, cantidad_por_pin) VALUES
('pequeno', 1, 1),        -- 1 botón pequeño por pin
('pequeno', 3, 0.0833);   -- 1/12 hoja A4 por pin

-- Pines grandes: 1 botón grande + 1/12 de hoja
INSERT INTO consumo_materia (tamano, id_material, cantidad_por_pin) VALUES
('grande', 2, 1),         -- 1 botón grande por pin
('grande', 3, 0.0833);    -- 1/12 hoja A4 por pin
