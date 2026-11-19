<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: Claude aprende de YouTube con la skill Watch.
// La URL sale del nombre del archivo: /guias/claude-aprende-de-youtube
// El PDF descargable (public/guias/claude-aprende-de-youtube.pdf) es esta
// misma página impresa: las reglas @media print de guia.css la convierten en
// hojas A4.
const guia = guiaPorSlug("claude-aprende-de-youtube");

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Antes de empezar", nota: "lo que necesitas tener" },
  { titulo: "Instala Watch", nota: "en 30 segundos" },
  { titulo: "Tu primer video", nota: "para comprobar que funciona" },
  { titulo: "El prompt exacto", nota: "video → skill para siempre" },
  { titulo: "Ideas y si algo falla", nota: "ventas, edición, podcasts" },
];

const instalarHerramientas = `# Mac (con Homebrew)
$ brew install python ffmpeg yt-dlp
# Ubuntu / Debian
$ sudo apt install python3 ffmpeg pipx
$ pipx install "yt-dlp[default,curl-cffi]" && pipx ensurepath
# Windows
> winget install --id Gyan.FFmpeg --exact
> winget install --id yt-dlp.yt-dlp --exact
> winget install --id DenoLand.Deno --exact`;

const instalarEnClaude = `> /plugin marketplace add bradautomates/claude-video
> /plugin install watch@claude-video`;

const instalarEnTerminal = `$ claude plugin marketplace add bradautomates/claude-video
$ claude plugin install watch@claude-video`;

const promptPrueba = `Usa la skill watch con este video: [ENLACE DE YOUTUBE]. En la configuración, elige el detalle balanced. Resúmeme lo que se ve y lo que se dice, con marcas de tiempo.`;

const promptSkill = `Usa la skill watch con este video: [ENLACE DE YOUTUBE]
Míralo completo, con la transcripción y los fotogramas. Después conviértelo en una skill que pueda usar siempre:
1. Saca el método que enseña, paso a paso, con sus reglas, sus ejemplos y los errores que dice que hay que evitar.
2. No copies la transcripción: escríbelo para poder aplicarlo sin volver a ver el video.
3. Guárdalo en ~/.claude/skills/[nombre-corto]/SKILL.md, con una descripción clara de cuándo usarla.
4. Al terminar, dime cómo se llama y dame una frase para probarla.`;

const promptCurso = `Usa la skill watch con estos videos: [ENLACE 1] [ENLACE 2] [ENLACE 3]
Míralos todos y crea una sola skill llamada [nombre-corto] con el método que tienen en común. Si se contradicen, quédate con lo que más se repite y dime en qué no coinciden.`;

const cierreComandos = `> /plugin marketplace add bradautomates/claude-video
> /plugin install watch@claude-video
# repo: github.com/bradautomates/claude-video`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Claude Code"
        titulo="Claude ahora aprende"
        destacado="viendo YouTube"
        resumen="La skill <strong>Watch</strong> y el prompt exacto para que Claude vea cualquier video, aprenda lo que enseña y lo guarde como una skill para siempre."
        :chips="['5 pasos', 'Gratis', 'Nivel básico']"
        :indice="indice"
      >
        <template #ilustracion><GuiaIlustracionVideo /></template>
      </GuiaPortada>

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Antes de empezar"
        titulo="Qué hace"
        destacado="Watch"
        intro="Claude no puede «ver» un video por sí solo. Watch lo convierte en algo que sí entiende: <strong>fotogramas con la marca de tiempo de cada segundo y la transcripción completa</strong>. Con eso lo ve como lo vería una persona: lo que se dice y lo que se muestra en pantalla. Es gratis y de código abierto (licencia MIT)."
      >
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Claude Code" etiqueta="Obligatorio" color="var(--g-c1)">
            En la terminal, en VS Code o en una sesión Code de la app de escritorio.
            <strong>No funciona</strong> en el chat normal de Claude ni en Cowork.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Python 3.10 o superior" etiqueta="Obligatorio" color="var(--g-c2)">
            Lo usan los scripts de la skill. Descárgalo en python.org si no lo tienes.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="FFmpeg y yt-dlp" etiqueta="Obligatorio" color="var(--g-c3)">
            FFmpeg saca los fotogramas; yt-dlp descarga el video. Usa siempre la
            <strong>última versión</strong> de yt-dlp. Para YouTube en Linux o Windows, instala también Deno.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Clave de Gemini" etiqueta="Opcional" suave color="var(--g-c4)">
            El camino más rápido: con una clave gratis de <code>aistudio.google.com/apikey</code>, los enlaces
            de YouTube no necesitan nada más. Sin clave, todo se procesa en tu computadora.
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">Instalar las herramientas (si te faltan)</h3>
        <GuiaCodigo etiqueta="Terminal" :codigo="instalarHerramientas" />

        <GuiaNota>
          no te pelees con la terminal. Instala primero la skill (paso 02) y luego pídele a Claude Code:
          <em>«Usa el setup.py de la skill watch para comprobar las dependencias. Dime qué me falta y ayúdame a
          instalarlo»</em>. Él revisa lo que tienes y lo arregla.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso
        :numero="2"
        etiqueta="Instalación"
        titulo="Instala"
        destacado="Watch"
        intro="Elige solo una forma, según dónde uses Claude Code."
      >
        <h3 class="guia-subtitulo">Dentro de Claude Code (escribe <code>claude</code> para abrirlo)</h3>
        <GuiaCodigo etiqueta="Claude Code" :codigo="instalarEnClaude" />

        <h3 class="guia-subtitulo">Desde la terminal, sin abrir Claude Code</h3>
        <GuiaCodigo etiqueta="Terminal" :codigo="instalarEnTerminal" />

        <div class="guia-rejilla">
          <GuiaTarjeta titulo="En VS Code" color="var(--g-c1)">
            <ol>
              <li>Abre el panel de Claude Code y escribe <code>/plugins</code>.</li>
              <li>En Marketplaces, añade <code>bradautomates/claude-video</code>.</li>
              <li>Vuelve a Plugins, busca <strong>watch</strong> y pulsa <em>Install for you</em>.</li>
            </ol>
          </GuiaTarjeta>
          <GuiaTarjeta titulo="En la app de escritorio" color="var(--g-c5)">
            <ol>
              <li><em>Customize → Plugins → Add → Add marketplace</em>.</li>
              <li><em>Add from a repository</em>, pega <code>github.com/bradautomates/claude-video</code> y pulsa <em>Sync</em>.</li>
              <li>Instala Watch y abre una sesión Code.</li>
            </ol>
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Comprueba que está:">
          abre una sesión nueva de Claude Code, escribe <code>/watch</code> y elige <code>/watch:watch</code>.
          Si aparece, ya está instalada.
        </GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso
        :numero="3"
        etiqueta="Primera prueba"
        titulo="Tu primer"
        destacado="video"
        intro="Una prueba corta para ver que todo funciona. La primera vez, Watch te hará unas preguntas de configuración: elige el detalle <strong>balanced</strong> (hasta 100 fotogramas, buen equilibrio entre precisión y rapidez)."
      >
        <GuiaCodigo etiqueta="Prompt · Pruébala con un video corto" tipo="prompt" :codigo="promptPrueba" />
        <GuiaNota titulo="¿Funciona?">
          Si te devuelve un resumen con los minutos marcados, sí. Ya puedes pasar al prompt importante, el del
          paso siguiente.
        </GuiaNota>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso
        :numero="4"
        etiqueta="El prompt exacto"
        titulo="Convierte cualquier video en una"
        destacado="skill para siempre"
        intro="Este es el que hace la magia. Copia el bloque completo, cambia lo que está <mark class='c-cambiar'>[ENTRE CORCHETES]</mark> y pégalo en Claude Code. Claude ve el video, saca el método y lo guarda en tu carpeta de skills, así que podrá usarlo en todos tus proyectos."
      >
        <GuiaCodigo etiqueta="Prompt · Video → Skill" tipo="prompt" :codigo="promptSkill" />

        <h3 class="guia-subtitulo">Versión pro · varios videos en una sola skill</h3>
        <GuiaCodigo etiqueta="Prompt · Curso completo → Skill" tipo="prompt" :codigo="promptCurso" />

        <GuiaNota titulo="Para usarla después:">
          no hace falta que la nombres. Claude carga la skill sola cuando le pides algo que encaja con su
          descripción. Si quieres forzarla, escribe <code>/</code> y su nombre. Abre una sesión nueva si no aparece.
        </GuiaNota>
      </GuiaPaso>

      <!-- 05 -->
      <GuiaPaso :numero="5" etiqueta="Ideas para empezar hoy" titulo="Qué le puedes" destacado="enseñar">
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Ventas" color="var(--g-c1)">
            Pásale los mejores cursos de ventas y escribirá tus guiones con ese método.
            <em class="guia-ejemplo">«Con la skill de ventas, escríbeme un guion para vender [tu producto]»</em>
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Edición de video" color="var(--g-c2)">
            Pásale tutoriales de edición y editará tus reels con ese estilo.
            <em class="guia-ejemplo">«Edita este reel aplicando la skill de edición que creaste»</em>
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Podcasts" color="var(--g-c3)">
            No solo YouTube: también aprende de podcasts y entrevistas largas que nunca tienes tiempo de escuchar.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Tu sector" color="var(--g-c4)">
            Diseño, programación, copywriting, finanzas, cocina… Si hay un video que lo enseña, Claude lo puede
            aprender.
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">Si algo falla</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="«Falta una herramienta»" color="var(--g-c2)">
            Pídele a Claude que use el setup.py de la skill para revisar las dependencias. Casi siempre es FFmpeg o
            un yt-dlp desactualizado.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="No aparece /watch" color="var(--g-c2)">
            Cierra y abre una sesión nueva de Claude Code. Y recuerda: en el chat normal y en Cowork no funciona.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="El video no tiene subtítulos" color="var(--g-c2)">
            Añade la clave gratuita de Gemini, o pídele que active la transcripción con Whisper.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Cualquier otro error" color="var(--g-c2)">
            Pégale el error a Claude Code y dile «arréglalo». Él mismo lo diagnostica.
          </GuiaTarjeta>
        </div>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Ya lo tienes."
        destacado="Ahora, a enseñarle."
        texto="Tú verías un video y mañana lo habrías olvidado. Claude puede ver decenas y guardarlo todo."
        :archivo="guia.archivo"
      >
        <GuiaCodigo etiqueta="Resumen" :codigo="cierreComandos" />
        <p class="guia-firma">Más guías en <strong>val4ndr0x.github.io/guias</strong> · @val4ndr0x</p>
      </GuiaDescarga>
    </article>
  </MarcoGuias>
</template>
