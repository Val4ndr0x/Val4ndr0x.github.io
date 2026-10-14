# Portafolio en Nuxt

Versión en Nuxt 4 + Vue del portafolio (Fase 1: mismo diseño, organizado en componentes).

## Comandos

```bash
npm install        # instalar dependencias (solo la primera vez)
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run generate   # web estática lista para publicar en .output/public
```

## Estructura

- `app/app.vue`: arma la página, pantalla de carga, partículas y scroll suave.
- `app/components/`: una sección por archivo (header, hero, medallas, certificados, contacto, escritorio, consola, footer).
- `app/utils/motion.js`: animaciones con resortes (aparición al hacer scroll, visor de imágenes, ventanas, parallax, barra de navegación).
- `app/data/consola.js`: textos de los comandos de la consola.
- `app/assets/css/main.css`: estilos globales (copia de `styles.css`).
- `public/`: imágenes, iconos y cursores. Los certificados están en `public/imagenes/certificados/`.

## Publicar en GitHub Pages

Si la web va en una subcarpeta (por ejemplo `usuario.github.io/portafolio/`), genera con:

```bash
NUXT_APP_BASE_URL=/portafolio/ npm run generate
```
