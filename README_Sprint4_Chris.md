# Sprint 4 – Actualización PinesApp (Chris)

Este documento explica los pasos para que el equipo pueda levantar **la versión del proyecto con los cambios del Sprint 4** (manejo de inventario de pines, ventas, movimientos, etc.).

> ⚠️ **IMPORTANTE:** En estos pasos se **borra y vuelve a crear** la base de datos `pinesdb`.  
> Si tienen datos locales que quieran conservar, hagan respaldo antes.

---

## 1. Requisitos

- Node.js y npm instalados
- MySQL 8 instalado
- Git instalado
- Haber clonado este repositorio y cambiarse a la rama del sprint:

```bash
git clone <URL_DEL_REPO>
cd AppPines
git checkout Sprint4-Chris
```

---

## 2. Backend (`/backend`)

### 2.1 Instalar dependencias

Desde la carpeta `backend`:

```bash
cd backend
npm install
npm install multer
```

> `multer` se usa para la gestión de subida de imágenes.

---

## 3. Base de datos `pinesdb`

El archivo actualizado del esquema está en:

```text
backend/database/pinesDBnew.sql
```

Hay dos formas de aplicar los cambios. Lo recomendado es la **Opción A**.

---

### ✅ Opción A (RECOMENDADA): Borrar y recrear la BD con el script nuevo

1. Abrir una terminal y ejecutar MySQL.

   En Windows (ejemplo, ajusten la ruta si es necesario):

   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

2. Dentro de la consola de MySQL, ejecutar:

   ```sql
   DROP DATABASE pinesdb;
   CREATE DATABASE pinesdb;
   EXIT;
   ```

3. Importar el script `pinesDBnew.sql` en la nueva base:

   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p pinesdb < "C:\Users\TU_USUARIO\AppPines\backend\database\pinesDBnew.sql"
   ```

   > Cambien `TU_USUARIO` por su usuario real de Windows y ajusten la ruta si el proyecto está en otra carpeta.

4. Verificar que la base quedó bien:

   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

   Y dentro de MySQL:

   ```sql
   USE pinesdb;
   SHOW TABLES;
   ```

   Deberían ver tablas como:

   - `pines`
   - `imagenes`
   - `materia_prima`
   - `movimientos_inventario`
   - `ventas`
   - `venta_detalle`
   - `venta_tags`
   - `usuarios`
   - y demás tablas del proyecto.

5. Crear el usuario admin inicial:

   Dentro de MySQL (con `USE pinesdb;` activo):

   ```sql
   INSERT INTO usuarios (id_usuario, nombre, email, password, rol)
   VALUES (1, 'Admin General', 'admin@pines.com', '123456', 'admin');
   ```

   > 👤 Este usuario se usa para entrar al sistema:  
   > **Correo:** `admin@pines.com`  
   > **Contraseña:** `123456`

Con esto ya tienen:

- Columna `color` en `tags`
- Columna `cantidad` en `venta_tags`
- Tabla `movimientos_inventario` con `tipo` = `entrada | salida | ajuste`
- Todas las tablas del proyecto actualizadas al Sprint 4 usando `pinesDBnew.sql`.

---

### (Opcional) Opción B: Actualizar una BD vieja sin borrarla

> Usar solo si **no quieren borrar** su base actual y vienen de un Sprint anterior.

1. Abrir MySQL:

   ```bash
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
   ```

2. Seleccionar la base:

   ```sql
   USE pinesdb;
   ```

3. Ejecutar los cambios de estructura:

   ```sql
   ALTER TABLE tags
   ADD COLUMN color VARCHAR(7) NOT NULL DEFAULT '#243b53';

   ALTER TABLE venta_tags
   ADD cantidad INT NOT NULL DEFAULT 1;

   CREATE TABLE movimientos_inventario (
     id_movimiento INT NOT NULL AUTO_INCREMENT,
     id_pin INT NOT NULL,
     tipo ENUM('entrada','salida') NOT NULL,
     cantidad INT NOT NULL,
     motivo VARCHAR(255) NULL,
     id_usuario INT NULL,
     fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (id_movimiento),
     FOREIGN KEY (id_pin) REFERENCES pines(id_pin)
       ON DELETE CASCADE,
     FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
       ON DELETE SET NULL
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

   ALTER TABLE movimientos_inventario
   MODIFY COLUMN tipo ENUM('entrada','salida','ajuste') NOT NULL;
   ```

4. Crear el usuario admin (si no existe):

   ```sql
   INSERT INTO usuarios (id_usuario, nombre, email, password, rol)
   VALUES (1, 'Admin General', 'admin@pines.com', '123456', 'admin');
   ```

---

## 4. Frontend (`/frontend`)

1. Instalar dependencias:

   ```bash
   cd ../frontend
   npm install
   ```

2. Ejecutar el frontend:

   ```bash
   npm start
   ```

---

## 5. Levantar toda la app

1. En una terminal: backend

   ```bash
   cd backend
   npm start
   ```

   El servidor debería levantar en:

   ```text
   http://localhost:4000
   ```

2. En otra terminal: frontend

   ```bash
   cd frontend
   npm start
   ```

3. Iniciar sesión con:

   - **Correo:** `admin@pines.com`
   - **Contraseña:** `123456`

---

## 6. Resumen rápido de lo que cambió en BD

- **`tags`**
  - Se agregó la columna `color` (`VARCHAR(7)`, default `#243b53`) para guardar el color de cada tag.
- **`venta_tags`**
  - Se agregó la columna `cantidad` (`INT`, default `1`) para almacenar cuántos pines de cada tag se vendieron en una venta.
- **`movimientos_inventario`**
  - Nueva tabla para llevar el historial de movimientos de inventario de pines.
  - Campos:
    - `id_movimiento` (PK, AUTO_INCREMENT)
    - `id_pin` (FK hacia `pines.id_pin`)
    - `tipo` (`ENUM('entrada','salida','ajuste')`)
    - `cantidad` (INT)
    - `motivo` (VARCHAR(255), opcional)
    - `id_usuario` (FK hacia `usuarios.id_usuario`, puede ser NULL)
    - `fecha_movimiento` (TIMESTAMP, default `CURRENT_TIMESTAMP`)
- **`usuarios`**
  - Usuario administrador inicial:
    - `email`: `admin@pines.com`
    - `password`: `123456`
    - `rol`: `admin`

---

## 7. Si algo falla

Si aparece algún error del tipo:

- *“Unknown column …”*  
- *“Table … doesn’t exist”*

Revisen:

1. Que estén usando la base `pinesdb` correcta:

   ```sql
   SELECT DATABASE();
   ```

2. Que hayan corrido **completamente** el script `pinesDBnew.sql` (Opción A)  
   o **todos** los `ALTER` / `CREATE TABLE` de la Opción B.

3. Que MySQL sea la misma versión (recomendado MySQL 8).

Si después de eso sigue fallando, pueden volver a usar la **Opción A** (borrar y recrear `pinesdb`) y arrancar desde cero con datos limpios.
