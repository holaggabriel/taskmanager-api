# Task Manager API

Task Manager API es una **API RESTful desarrollada en Node.js** para la gestión de tareas.
Permite crear, listar, actualizar, eliminar (soft delete y hard delete) y restaurar tareas.

El proyecto incluye una colección lista para usar con **Bruno**, facilitando la prueba de todos los endpoints.

### Tecnologías utilizadas

* Node.js
* Express.js
* PostgreSQL
* Sequelize ORM

### Requisitos previos

* Node.js v24 o superior
* PostgreSQL
* npm
* Bruno (opcional)
  [https://www.usebruno.com/](https://www.usebruno.com/)

## Instalación

```
git clone <url-del-repo>
cd <carpeta-del-proyecto>
npm install
```

### Configuración de variables de entorno

Crear un archivo `.env` a partir del ejemplo:
```
PORT=3000

DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

NODE_ENV=development
```

## Base de datos

El proyecto utiliza **Sequelize CLI** para la gestión de la base de datos.

Antes de ejecutar el siguiente comando asegurate de tener PostgreSQL ya instalado y configurado.

**Crear la base de datos**

```
npx sequelize-cli db:create
```

## Ejecutar el proyecto

```
npm start
```
## Rutas de la API
> Todas las rutas están protegidas por autenticación, excepto las rutas de autenticación.

### URL Base
En entorno de desarrollo, la API está disponible en:
```
http://localhost:3000
```
Todos los endpoints documentados a continuación son relativos a esta URL base. Ejemplo:
```
GET http://localhost:3000/tasks
```

### Rutas de autenticación

Prefijo: `/auth`

| Método | Endpoint        | Descripción          |
| ------ | --------------- | -------------------- |
| POST   | `/auth/signup`  | Registrar un usuario |
| POST   | `/auth/signin`  | Iniciar sesión       |
| POST   | `/auth/signout` | Cerrar sesión        |

### Rutas de usuarios
Prefijo: `/users`
| Método | Endpoint | Descripción             |
| ------ | -------- | ----------------------- |
| GET    | `/me`    | Obtener datos del usuario autenticado |

### Rutas de tareas

Prefijo: `/tasks`

| Método | Endpoint                    | Descripción                                 |
|--------|----------------------------|---------------------------------------------|
| POST   | `/tasks`                   | Crear una nueva tarea                       |
| GET    | `/tasks`                   | Listar todas las tareas del usuario         |
| GET    | `/tasks/deleted`           | Listar tareas eliminadas (soft delete)      |
| GET    | `/tasks/:id`               | Obtener una tarea específica por ID         |
| PUT    | `/tasks/:id`               | Actualizar una tarea existente              |
| DELETE | `/tasks/:id/soft`          | Eliminar una tarea (soft delete)            |
| DELETE | `/tasks/:id/hard`          | Eliminar una tarea permanentemente          |
| PATCH  | `/tasks/:id/restore`       | Restaurar una tarea eliminada               |
| DELETE | `/tasks/soft`              | Eliminar **todas** las tareas (soft delete)     |
| DELETE | `/tasks/hard`              | Eliminar **todas** las tareas permanentemente   |
| PATCH  | `/tasks/restore`           | Restaurar **todas** las tareas eliminadas       |

### Ruta de prueba

| Método | Endpoint | Descripción             |
| ------ | -------- | ----------------------- |
| GET    | `/`      | Verificar autenticación |

## Probar la API con Bruno

El repositorio incluye una carpeta **`bruno/`** con una colección de requests compatible con **Bruno**.

**Pasos:**

1. Instalar Bruno
   [https://www.usebruno.com/](https://www.usebruno.com/)

2. Abrir Bruno y seleccionar **Open Collection**

3. Seleccionar la carpeta:

```
<carpeta-del-proyecto>/bruno
```

4. Ejecutar los endpoints desde la colección incluida

Esto permite probar toda la API sin configurar requests manualmente.
