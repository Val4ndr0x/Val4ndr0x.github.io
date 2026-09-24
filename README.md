# Mis Tareas

Aplicación personal de organización hecha con [Nuxt 4](https://nuxt.com) + Vue 3 + Tailwind CSS. Corre 100% en el cliente (sin SSR) y guarda todos los datos en `localStorage` del navegador, sin backend ni cuentas de usuario.

## Funcionalidades

- **Listas de tareas** — crea listas con categoría, color y sticker; agrega, marca y elimina tareas; filtra por pendientes/completadas.
- **Tablero** (`/tablero`) — lienzo libre con stickers, imágenes y widgets (notas, checklist, título, fecha, ánimo, sueño, etc.) que se pueden mover y redimensionar.
- **Calendario** (`/calendario`) — vista mensual con alarmas/recordatorios.
- **Libros** (`/books`) — seguimiento de lecturas con portada y progreso.
- **Clientes** (`/clientes`) — pedidos, fecha de entrega, abono y estado de entrega.
- **Companion** — mascota animada personalizable que acompaña la interfaz.

## Requisitos

- Node.js 18+
- npm (o pnpm/yarn/bun)

## Desarrollo

Instalar dependencias:

```bash
npm install
```

Levantar el servidor de desarrollo en `http://localhost:3000`:

```bash
npm run dev
```

## Producción

```bash
npm run build
npm run preview
```

## Almacenamiento de datos

Todo el estado (listas, tareas, tablero, calendario, libros, clientes, companion) se guarda en `localStorage` bajo claves con prefijo `todo-*`. Esto significa que:

- Los datos son locales a cada navegador/dispositivo — no hay sincronización entre ellos.
- Borrar el caché o los datos del sitio elimina la información de forma permanente.
- No existe (todavía) exportación/importación ni respaldo automático.

## Stack

- [Nuxt 4](https://nuxt.com/docs/getting-started/introduction) (modo SPA, `ssr: false`)
- Vue 3 + composables para estado (`app/composables/`)
- Tailwind CSS (`@nuxtjs/tailwindcss`)
