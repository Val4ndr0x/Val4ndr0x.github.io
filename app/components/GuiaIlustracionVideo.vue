<!-- Ilustración original de la guía "Claude aprende de YouTube": un orbe
     neón con el botón de play y fotogramas que giran a su alrededor (lo que
     Watch le pasa a Claude). Va en el hueco "ilustracion" de GuiaPortada. -->
<template>
  <svg class="ilus-video" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ilus-orbe" cx="50%" cy="38%" r="65%">
        <stop offset="0" stop-color="#7dd3fc" stop-opacity="0.9" />
        <stop offset="0.45" stop-color="#0284c7" stop-opacity="0.55" />
        <stop offset="1" stop-color="#0b1118" stop-opacity="0.95" />
      </radialGradient>
      <filter id="ilus-brillo" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>

    <!-- Órbitas -->
    <g class="ilus-orbita" stroke="#38bdf8" stroke-opacity="0.35">
      <ellipse cx="120" cy="120" rx="108" ry="42" transform="rotate(-18 120 120)" stroke-dasharray="3 7" />
      <ellipse cx="120" cy="120" rx="104" ry="38" transform="rotate(24 120 120)" />
    </g>

    <!-- Orbe -->
    <circle cx="120" cy="120" r="66" fill="url(#ilus-orbe)" stroke="#38bdf8" stroke-width="2" filter="url(#ilus-brillo)" />
    <circle cx="120" cy="120" r="54" stroke="#bae6fd" stroke-opacity="0.25" />

    <!-- Botón de play -->
    <rect x="86" y="97" width="68" height="46" rx="14" fill="#0b1118" fill-opacity="0.55" stroke="#e0f2fe" stroke-width="2.5" filter="url(#ilus-brillo)" />
    <path d="M113 109v22l19-11z" fill="#ffffff" filter="url(#ilus-brillo)" />

    <!-- Fotogramas que entran al orbe -->
    <g class="ilus-fotogramas" filter="url(#ilus-brillo)">
      <rect x="18" y="98" width="30" height="21" rx="5" fill="#ff4060" fill-opacity="0.25" stroke="#ff4060" stroke-width="2" />
      <rect x="190" y="70" width="30" height="21" rx="5" fill="#fbbf24" fill-opacity="0.2" stroke="#fbbf24" stroke-width="2" />
      <rect x="176" y="160" width="30" height="21" rx="5" fill="#34d399" fill-opacity="0.2" stroke="#34d399" stroke-width="2" />
    </g>

    <!-- Destello -->
    <path class="ilus-destello" d="M184 30l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" fill="#a78bfa" filter="url(#ilus-brillo)" />
    <circle cx="52" cy="54" r="3" fill="#38bdf8" />
    <circle cx="200" cy="208" r="2.5" fill="#38bdf8" fill-opacity="0.7" />
  </svg>
</template>
