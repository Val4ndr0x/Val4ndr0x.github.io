<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: 5 skills para crear vídeos con Claude Code (HyperFrames, Remotion, onetake,
// Papercut Explainer y Embedded Captions).
// La URL sale del nombre del archivo: /guias/instala-5-skills-video
// El PDF descargable está en public/guias/instala-5-skills-video.pdf.
const guia = guiaPorSlug("instala-5-skills-video");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Antes de empezar", nota: "lo que necesitas tener" },
  { titulo: "HyperFrames y Remotion", nota: "vídeo en HTML y en React" },
  { titulo: "onetake y Papercut", nota: "un plano y papel recortado" },
  { titulo: "Embedded Captions", nota: "subtítulos detrás de ti" },
  { titulo: "¿Cuál uso?", nota: "chuleta y resumen" },
];

const requisitos = [
  { titulo: "Claude Code", etiqueta: "Obligatorio", texto: "En terminal, VS Code o la app de escritorio. Las skills viven en ~/.claude/skills." },
  { titulo: "Node.js 20 o superior", etiqueta: "Obligatorio", texto: "Para los comandos npx. Descárgalo en nodejs.org." },
  { titulo: "FFmpeg", etiqueta: "Obligatorio", texto: "Para renderizar y montar el MP4. Mac: brew install ffmpeg · Linux: sudo apt install ffmpeg." },
  { titulo: "Python 3 y Git", etiqueta: "Para onetake y Papercut", texto: "Los usan onetake y Papercut. En Windows, usa WSL para estas dos." },
];

const instHyper = `$ npx hyperframes skills
# actualizar más adelante:
$ npx hyperframes skills update`;
const pruebaHyper = `/hyperframes hazme un reel vertical de 15 segundos sobre 3 trucos para dormir mejor, con texto animado y música`;

const instRemotion = `$ npx skills add remotion-dev/skills
# si aún no tienes un proyecto de Remotion:
$ npx create-video@latest`;
const pruebaRemotion = `Con Remotion, crea un vídeo 9:16 de 10 segundos con un contador que sube de 0 a 10.000 seguidores`;

const instOnetake = `$ git clone https://github.com/feitangyuan/onetake.git ~/.claude/skills/onetake
# dependencias de Python:
$ pip install playwright numpy scipy pillow matplotlib opencv-python
$ python3 -m playwright install chromium`;
const pruebaOnetake = `/onetake un vídeo de un solo plano presentando mi app de recetas, estilo anuncio premium`;

const instPapercutRapido = `$ npx skills add 0xS4N4TG/papercut-explainer`;
const instPapercutFull = `$ git clone https://github.com/0xS4N4TG/papercut-explainer
$ cd papercut-explainer && ./install.sh`;
const pruebaPapercut = `Hazme un papercut explainer sobre este enlace: [https://…]`;

const instCaptions = `$ npx hyperframes skills update embedded-captions`;
const pruebaCaptions = `Ponle subtítulos a mi-video.mp4 con las palabras clave pasando por detrás de mí`;

const cual = [
  { titulo: "HyperFrames", texto: "Un reel o explicativo con texto, gráficos y música." },
  { titulo: "Remotion", texto: "Animaciones a medida si ya trabajas con React." },
  { titulo: "onetake", texto: "Un anuncio o lanzamiento que se vea caro, sin cortes." },
  { titulo: "Papercut Explainer", texto: "Explicar una herramienta o noticia a partir de un enlace." },
  { titulo: "Embedded Captions", texto: "Ya grabaste hablando a cámara y quieres subtítulos con efecto." },
];

const cierre = `npx hyperframes skills                         → HyperFrames
npx skills add remotion-dev/skills             → Remotion
git clone …/feitangyuan/onetake                → onetake
npx skills add 0xS4N4TG/papercut-explainer     → Papercut Explainer
npx hyperframes skills update embedded-captions → Embedded Captions`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Claude Code"
        titulo="Instala estas 5 skills"
        destacado="antes de tu próximo vídeo"
        resumen="Copia, pega y listo. Cada skill con su <strong>comando de instalación</strong>, lo que necesitas antes y la <strong>frase exacta</strong> para probarla en Claude."
        :chips="['5 skills', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('teclea')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Antes de empezar"
        titulo="Qué necesitas"
        destacado="en tu ordenador"
        intro="Las skills son instrucciones que Claude Code carga cuando las necesita. Se instalan una vez y funcionan en todos tus proyectos."
      >
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(r, n) in requisitos"
            :key="r.titulo"
            :titulo="r.titulo"
            :etiqueta="r.etiqueta"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ r.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Truco:" :mascota="mascota('idea')">
          no hace falta que te pelees con la terminal. Pégale a Claude Code el comando de cada skill y dile «instala esto y avísame si falta algo». Él revisa lo que tienes y lo arregla.
        </GuiaNota>

        <h3 class="guia-subtitulo">Cómo usar esta guía</h3>
        <ol>
          <li>Abre una terminal (o pídele a Claude Code que ejecute el comando).</li>
          <li>Copia el bloque negro de cada skill y ejecútalo.</li>
          <li>Reinicia Claude Code para que cargue las skills nuevas.</li>
          <li>Pega la frase de prueba que viene debajo y mira cómo trabaja.</li>
        </ol>

        <GuiaNota titulo="¿Por dónde empiezo?">
          si solo vas a instalar una, que sea HyperFrames: es la base. Embedded Captions se apoya en ella y es la que más llama la atención en un reel.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso :numero="2" etiqueta="Skills 1 y 2" titulo="HyperFrames" destacado="y Remotion">
        <h3 class="guia-subtitulo">1 · HyperFrames · vídeo en HTML → MP4</h3>
        <p>Escribe el vídeo en HTML y lo renderiza a MP4. Claude diseña cada escena como una página web animada y la convierte en vídeo fotograma a fotograma, siempre igual. Sirve para reels, explicativos, gráficos, títulos y subtítulos, y trae una vista previa en el navegador para revisar antes de exportar.</p>
        <GuiaCodigo etiqueta="Instalar" :codigo="instHyper" />
        <GuiaCodigo etiqueta="Pruébala con" tipo="prompt" :codigo="pruebaHyper" />

        <h3 class="guia-subtitulo">2 · Remotion · animación en React</h3>
        <p>Las skills oficiales para animar vídeo en React. Remotion es la librería de vídeo con código más usada: le enseñan a Claude a crear composiciones, animar, añadir subtítulos, mapas y renderizar sin errores típicos.</p>
        <GuiaCodigo etiqueta="Instalar" :codigo="instRemotion" />
        <GuiaCodigo etiqueta="Pruébala con" tipo="prompt" :codigo="pruebaRemotion" />
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso :numero="3" etiqueta="Skills 3 y 4" titulo="onetake" destacado="y Papercut Explainer">
        <h3 class="guia-subtitulo">3 · onetake · un solo plano, sin cortes</h3>
        <p>Como un anuncio caro: toda la pieza es un único movimiento de cámara continuo, donde los elementos entran, se transforman y pasan al siguiente sin un solo corte. Ideal para lanzamientos de producto y portadas que enganchan.</p>
        <GuiaCodigo etiqueta="Instalar" :codigo="instOnetake" />
        <GuiaNota titulo="Ojo con la licencia:">
          es PolyForm Noncommercial, gratis solo para uso personal o no comercial. Para clientes o negocio necesitas la versión Pro.
        </GuiaNota>
        <GuiaCodigo etiqueta="Pruébala con" tipo="prompt" :codigo="pruebaOnetake" />

        <h3 class="guia-subtitulo">4 · Papercut Explainer · de un enlace a un reel</h3>
        <p>Le pasas un enlace (un repositorio, la web de un producto, una noticia) y hace todo el camino: gancho, guion, storyboard, voz y vídeo final con estética de papel recortado.</p>
        <GuiaCodigo etiqueta="Instalar (rápido: solo las skills)" :codigo="instPapercutRapido" />
        <GuiaCodigo etiqueta="Instalar (completo: librería, render y voz)" :codigo="instPapercutFull" />
        <GuiaCodigo etiqueta="Pruébala con" tipo="prompt" :codigo="pruebaPapercut" />
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso :numero="4" etiqueta="Skill 5" titulo="Embedded Captions:" destacado="subtítulos detrás de ti">
        <p>Recorta tu silueta del vídeo y coloca el texto entre tú y el fondo, como en los reels de los grandes creadores. Transcribe tu voz sola, todo en local, y tiene 35 estilos para elegir. Es parte del ecosistema HyperFrames.</p>
        <GuiaCodigo etiqueta="Instalar" :codigo="instCaptions" />
        <GuiaCodigo etiqueta="Pruébala con" tipo="prompt" :codigo="pruebaCaptions" />
      </GuiaPaso>

      <!-- 05 -->
      <GuiaPaso :numero="5" etiqueta="¿Cuál uso?" titulo="Una skill" destacado="para cada vídeo">
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(c, n) in cual"
            :key="c.titulo"
            :titulo="c.titulo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ c.texto }}
          </GuiaTarjeta>
        </div>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Ya lo tienes."
        destacado="Ahora a grabar."
        texto="Reinicia Claude Code después de instalar y pídele el vídeo como se lo pedirías a un editor. Si algo falla, pégale el error: casi siempre es una dependencia que falta y te la instala él."
        :archivo="guia.archivo"
        :mascota="mascota('pulgar')"
      >
        <GuiaCodigo etiqueta="Resumen" :codigo="cierre" />
        <p class="guia-firma">Más trucos de IA en → <strong>@automata.ofi</strong></p>
      </GuiaDescarga>

      <GuiaAutor />
    </article>
  </MarcoGuias>
</template>
