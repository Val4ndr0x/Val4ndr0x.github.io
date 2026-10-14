<script setup>
// Las burbujas se generan en el navegador (valores aleatorios distintos en cada visita)
const burbujas = ref([
  { "--size": "3.45rem", "--distance": "8.12rem", "--position": "23.4%", "--time": "3.1s", "--delay": "-3.8s" },
  { "--size": "4.78rem", "--distance": "7.33rem", "--position": "89.1%", "--time": "2.4s", "--delay": "-2.5s" },
]);

onMounted(() => {
  for (let i = 0; i < 178; i++) {
    burbujas.value.push({
      "--size": `${2 + Math.random() * 4}rem`,
      "--distance": `${6 + Math.random() * 4}rem`,
      "--position": `${Math.random() * 100}%`,
      "--time": `${2 + Math.random() * 2}s`,
      "--delay": `${-1 * (2 + Math.random() * 2)}s`,
    });
  }
});
</script>

<template>
  <footer>
    <div class="footer">
      <div class="bubbles">
        <div v-for="(burbuja, i) in burbujas" :key="i" class="bubble" :style="burbuja"></div>
      </div>
      <div class="content">
        <div>
          <p class="p-footer">© 2026 Andres Valencia | Todos los derechos reservados.</p>

          <div>
            <a href="#">Inicio</a>
            <a href="#sobre-mi">Sobre mí</a>
            <a href="#mis-proyectos">Proyectos</a>
            <a href="#trayectoria">Trayectoria</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
        <div>
          <a
            class="image"
            href="https://codepen.io/z-"
            target="_blank"
            style="background-image: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/199011/angry.svg')"
          ></a>
          <p>© { Val4nd0x }</p>
        </div>
      </div>
    </div>

    <svg style="position: fixed; top: 100vh">
      <defs>
        <filter id="blob">
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"></feGaussianBlur>
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="blob"
          ></feColorMatrix>
        </filter>
      </defs>
    </svg>
  </footer>
</template>
