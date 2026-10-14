<script setup>
// Iconos de línea (viewBox 48x48, trazo con currentColor)
const iconos = {
  web: '<rect x="6" y="10" width="36" height="28" rx="5"/><path d="M6 18h36"/><circle cx="12" cy="14" r="0.8"/><circle cx="16" cy="14" r="0.8"/>',
  grafica: '<path d="M8 40h32"/><path d="M10 32l9-9 7 6 13-14"/><path d="M31 15h8v8"/>',
  tienda: '<rect x="9" y="16" width="30" height="24" rx="5"/><path d="M18 16v-2a6 6 0 0 1 12 0v2"/><path d="M18 24a6 6 0 0 0 12 0"/>',
  vr: '<path d="M10 15h28a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-7l-4-5h-6l-4 5h-7a6 6 0 0 1-6-6v-8a6 6 0 0 1 6-6z"/><path d="M14 15l2-4h16l2 4"/>',
  tareas: '<rect x="10" y="7" width="28" height="34" rx="6"/><path d="M16 19l3 3 5-6"/><path d="M28 19h4"/><path d="M16 31l3 3 5-6"/><path d="M28 31h4"/>',
  destello: '<path d="M24 7l3.6 10.4L38 21l-10.4 3.6L24 35l-3.6-10.4L10 21l10.4-3.6z"/><path d="M37 33l1.2 3.3 3.3 1.2-3.3 1.2L37 42l-1.2-3.3-3.3-1.2 3.3-1.2z"/>',
  pincel: '<path d="M30 8l10 10-16 16-10-10z"/><path d="M14 24c-5 0-7 4-7 8 0 3-1 5-3 6 8 2 15-1 15-8"/>',
  app: '<rect x="8" y="8" width="13" height="13" rx="3.5"/><rect x="27" y="8" width="13" height="13" rx="3.5"/><rect x="8" y="27" width="13" height="13" rx="3.5"/><path d="M33.5 27v13M27 33.5h13"/>',
  detalle: '<circle cx="21" cy="21" r="12"/><path d="M30 30l10 10"/><path d="M21 15v12M15 21h12"/>',
  rayo: '<path d="M27 6L11 27h12l-3 15 17-22H25z"/>',
  persona: '<circle cx="24" cy="11" r="4"/><path d="M10 18l14 3 14-3"/><path d="M24 21v8l-6 13M24 29l6 13"/>',
  correo: '<rect x="6" y="11" width="36" height="26" rx="5"/><path d="M8 14l16 12 16-12"/>',
  chat: '<path d="M8 12a5 5 0 0 1 5-5h22a5 5 0 0 1 5 5v15a5 5 0 0 1-5 5H20l-9 8v-8H13a5 5 0 0 1-5-5z"/>',
  enlace: '<path d="M20 28l8-8"/><path d="M22 14l3-3a8 8 0 0 1 12 12l-3 3"/><path d="M26 34l-3 3a8 8 0 0 1-12-12l3-3"/>',
  reloj: '<circle cx="24" cy="24" r="17"/><path d="M24 14v10l7 5"/>',
  mapa: '<path d="M24 42s-13-12-13-22a13 13 0 0 1 26 0c0 10-13 22-13 22z"/><circle cx="24" cy="20" r="4.5"/>',
  comillas: '<path d="M10 34c0-10 3-16 10-20M28 34c0-10 3-16 10-20"/><path d="M10 34h8v-8h-8zM28 34h8v-8h-8z"/>',
  flecha: '<path d="M10 24h28M28 14l10 10-10 10"/>',
  descargar: '<path d="M24 8v22M15 21l9 9 9-9"/><path d="M9 34v3a4 4 0 0 0 4 4h22a4 4 0 0 0 4-4v-3"/>',
  documento: '<path d="M12 6h16l10 10v24a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z"/><path d="M28 6v10h10"/><path d="M16 25h16M16 32h16M16 18h6"/>',
  carpeta: '<path d="M6 14a4 4 0 0 1 4-4h9l4 5h15a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z"/><path d="M6 21h36"/>',
  medalla: '<circle cx="24" cy="29" r="11"/><path d="M17 20L12 6h8l4 9 4-9h8l-5 14"/><path d="M24 24l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"/>',
  terminal: '<rect x="6" y="9" width="36" height="30" rx="5"/><path d="M13 19l6 5-6 5M23 30h11"/>',
  salir: '<path d="M20 8H12a4 4 0 0 0-4 4v24a4 4 0 0 0 4 4h8"/><path d="M30 15l9 9-9 9M39 24H19"/>',
  escritorio: '<rect x="5" y="8" width="38" height="26" rx="4"/><path d="M18 40h12M24 34v6"/><path d="M11 15h6M11 21h6"/>',
};

defineProps({
  nombre: { type: String, required: true },
  grosor: { type: [Number, String], default: 2.2 },
});
</script>

<template>
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke="currentColor"
    :stroke-width="grosor"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="iconos[nombre]"
  ></svg>
</template>
