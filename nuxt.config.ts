// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-10-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
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
})();`,
        },
        { src: "/particles.min.js", defer: true },
      ],
    },
  },
});
