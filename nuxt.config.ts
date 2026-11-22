// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css", "~/assets/css/guia.css"],
  // Sin <link rel="prefetch"> de los trozos que se cargan bajo demanda (el PDF
  // del CV, el modo escritorio, las guías…): competían por la red con lo que
  // sí hace falta para ver la página. Se descargan cuando se usan.
  hooks: {
    "build:manifest": (manifest) => {
      for (const clave in manifest) manifest[clave].prefetch = false;
    },
  },
  vite: {
    optimizeDeps: { include: ["dompurify"] },
  },
  app: {
    head: {
      htmlAttrs: { lang: "es" },
      title: "Portfolio de Diseñador Web",
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Jacquard+24&family=Jacquard+24+Charted&display=swap",
        },
      ],
      script: [
        {
          // La página está diseñada para verse bien a 1216px de ancho; en
          // pantallas más anchas se agranda todo en proporción (ver --escala en
          // main.css). Va en línea para que corra antes de pintar la página.
          innerHTML: `(function () {
  const ANCHO_BASE = 1216;
  function ajustarEscala() {
    const escala = Math.max(1, window.innerWidth / ANCHO_BASE);
    document.documentElement.style.setProperty("--escala", escala);
  }
  ajustarEscala();
  window.addEventListener("resize", ajustarEscala);
  // Equipo modesto (2 GB de RAM o menos, 2 núcleos, o "ahorro de datos"):
  // html.ligero apaga la decoración cara (ver utils/motion.js y main.css).
  // Va aquí para que el CSS ligero mande desde el primer cuadro.
  try {
    const n = navigator;
    if ((n.deviceMemory && n.deviceMemory <= 2) || (n.hardwareConcurrency && n.hardwareConcurrency <= 2) || (n.connection && n.connection.saveData)) {
      document.documentElement.classList.add("ligero");
    }
  } catch (e) {}
})();`,
        },
        { src: "/particles.min.js", defer: true },
      ],
    },
  },
});
