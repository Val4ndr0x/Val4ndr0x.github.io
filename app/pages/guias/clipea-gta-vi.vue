<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: clipea directos de GTA VI con OpenShorts y cobra por vistas.
// La URL sale del nombre del archivo: /guias/clipea-gta-vi
// El PDF descargable está en public/guias/clipea-gta-vi.pdf.
const guia = guiaPorSlug("clipea-gta-vi");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Cómo funciona", nota: "de un directo de 3 h a 10 clips" },
  { titulo: "Instala OpenShorts", nota: "gratis, con Docker" },
  { titulo: "Tus primeros clips", nota: "formato, gancho, publicar" },
  { titulo: "Dónde te pagan", nota: "campañas por cada 1.000 vistas" },
  { titulo: "Reglas para no perder la cuenta", nota: "YouTube y Rockstar" },
];

const flujo = [
  { titulo: "Directo largo", nota: "2–6 h de GTA VI" },
  { titulo: "Mejores momentos", nota: "de 15 a 60 s" },
  { titulo: "Vertical 9:16", nota: "+ subtítulos" },
  { titulo: "Publicar", nota: "TikTok · Reels · Shorts" },
  { titulo: "Cobrar", nota: "por cada 1.000 vistas" },
];

const cifras = [
  { valor: "≈1 $", texto: "pago mediano por cada 1.000 vistas en campañas de clipping" },
  { valor: "0,05–3 $", texto: "rango habitual por cada 1.000 vistas según la campaña" },
  { valor: "10 %", texto: "lo que se queda Whop de cada pago" },
];

const instalarOpenShorts = `$ git clone https://github.com/mutonby/openshorts.git
$ cd openshorts
$ docker compose up --build`;

const promptInstalar = `Instala OpenShorts (github.com/mutonby/openshorts) en este ordenador con Docker.
Comprueba antes que tengo Docker y git; si falta algo, ayúdame a instalarlo.
Arráncalo, dime cuando http://localhost:5175 responda y explícame dónde pegar mi clave de Gemini.`;

const promptTwitch = `Descarga con yt-dlp el VOD de este directo de Twitch: [ENLACE]. Si no tengo yt-dlp, instálalo. Guárdalo en mp4 en la carpeta ~/clips/directos y dime la ruta para subirlo a OpenShorts.`;

const rutina = [
  "Busca el directo de GTA VI con más espectadores de ayer, o el de tu campaña.",
  "Pásalo por OpenShorts y quédate con los 3–5 clips con mejor puntuación.",
  "Revisa el gancho y los subtítulos en el editor.",
  "Publica en TikTok, Reels y Shorts y apunta las vistas a las 24 h.",
  "Repite lo que funciona. Lo que no pase de 1.000 vistas, no lo repitas.",
];

const reglas = [
  {
    ok: true,
    titulo: "Añade algo tuyo.",
    texto: "YouTube no monetiza el contenido reutilizado si no se nota una diferencia clara con el original. Gancho, subtítulos, contexto o un comentario cuentan.",
  },
  {
    ok: true,
    titulo: "Nada de violencia gráfica en los primeros 7 s.",
    texto: "YouTube suavizó en septiembre de 2026 las reglas de violencia en juegos, pero eso sigue sin monetizarse.",
  },
  {
    ok: false,
    titulo: "No subas cinemáticas sueltas ni spoilers.",
    texto: "La política de Rockstar permite enseñar escenas dentro de una partida, pero retira los vídeos de solo cinemáticas.",
  },
  {
    ok: false,
    titulo: "Nada de trucos, mod menus ni herramientas de terceros",
    texto: "del modo online: Rockstar los retira.",
  },
  {
    ok: false,
    titulo: "No subas el mismo clip 50 veces.",
    texto: "YouTube puede quitar la monetización de todo el canal si ve contenido repetitivo o en masa.",
  },
];

const cierreComandos = `$ git clone https://github.com/mutonby/openshorts.git
$ cd openshorts && docker compose up --build
# abre http://localhost:5175 y pega tu clave de Gemini`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Comentaste CLIP"
        titulo="Clipea GTA VI"
        destacado="y cobra por vistas"
        resumen="Cómo funciona el clipping, cómo montar <strong>OpenShorts</strong> gratis en tu ordenador, dónde te pagan de verdad y las reglas para no perder la cuenta."
        :chips="['5 pasos', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('teclea')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Cómo funciona"
        titulo="Qué es el"
        destacado="clipping"
        intro="Coges directos largos (de GTA VI ahora mismo hay cientos de horas cada día), cortas los mejores momentos en vídeos verticales y los subes a TikTok, Reels y Shorts. Te pagan por las visualizaciones: el streamer o la marca que lanza la campaña, o la propia plataforma si tu cuenta está monetizada."
      >
        <ol class="guia-flujo" aria-label="Del directo al pago">
          <li v-for="(p, i) in flujo" :key="p.titulo" :style="{ '--color': `var(--g-c${i + 1})` }">
            <span class="guia-flujo-num">{{ i + 1 }}</span>
            <strong>{{ p.titulo }}</strong>
            <span>{{ p.nota }}</span>
          </li>
        </ol>

        <div class="guia-cifras">
          <div v-for="c in cifras" :key="c.valor" class="guia-cifra">
            <strong>{{ c.valor }}</strong>
            <span>{{ c.texto }}</span>
          </div>
        </div>
        <p class="guia-fuente">
          Fuentes: análisis de 707 campañas de Content Rewards (10/11/2026) y de 50 campañas en directo (28/09/2026).
          Las tarifas cambian cada semana: mira siempre la campaña antes de empezar.
        </p>

        <h3 class="guia-subtitulo">Lo que necesitas</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Un ordenador" etiqueta="8 GB RAM+" color="var(--g-c1)">
            OpenShorts corre en tu máquina con Docker. Con CPU tarda unos 5–8 min por cada 8 min de vídeo. Con una
            gráfica NVIDIA, alrededor de 1 min.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Docker" etiqueta="Gratis" suave color="var(--g-c2)">
            Docker Desktop en Mac/Windows o Docker Engine en Linux. Es lo que arranca OpenShorts con un solo comando.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Clave de Gemini" etiqueta="Gratis" suave color="var(--g-c3)">
            Es la IA que elige los momentos. Sácala en <code>aistudio.google.com/app/apikey</code>. Cuesta menos de
            0,01 $ por cada vídeo de 10 min si pasas del uso gratis.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Cuentas nuevas" etiqueta="Recomendado" color="var(--g-c4)">
            Una cuenta de clips de GTA VI en cada red, separada de tu cuenta personal. Así el algoritmo entiende de
            qué va.
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Antes de seguir:" :mascota="mascota('pensando')">
          las tarifas y las condiciones las pone cada campaña. Léelas antes de clipear, no después.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso
        :numero="2"
        etiqueta="Instala OpenShorts"
        titulo="Tu fábrica de clips,"
        destacado="gratis"
        intro="<strong>OpenShorts</strong> (<code>github.com/mutonby/openshorts</code>) es la alternativa de código abierto a OpusClip. Licencia MIT: en tu ordenador es gratis para siempre, sin marca de agua y sin límite de minutos."
      >
        <h3 class="guia-subtitulo">1 · Descárgalo y arráncalo (en una terminal, con Docker abierto)</h3>
        <GuiaCodigo etiqueta="Terminal" :codigo="instalarOpenShorts" />
        <p class="guia-texto">
          La primera vez tarda un rato porque descarga los modelos. Cuando termine, abre
          <code>http://localhost:5175</code> en el navegador.
        </p>

        <h3 class="guia-subtitulo">2 · Pega tu clave de Gemini</h3>
        <p class="guia-texto">
          <em>Settings → Gemini API key → guardar.</em> Es lo único obligatorio para clipear. Las claves de fal.ai y
          ElevenLabs solo hacen falta para los vídeos con actores de IA y el doblaje, y aquí no las necesitas.
        </p>

        <GuiaNota titulo="¿Sin clave de Google?">
          OpenShorts también funciona con un modelo local (Ollama, LM Studio…): pon su dirección en la variable
          <code>LLM_BASE_URL</code> del archivo <code>.env</code>.
        </GuiaNota>

        <h3 class="guia-subtitulo">¿No quieres tocar la terminal? Pídeselo a Claude Code</h3>
        <GuiaCodigo etiqueta="Prompt · Copia y pega" tipo="prompt" :codigo="promptInstalar" />

        <GuiaNota titulo="¿Tu ordenador no puede?" :mascota="mascota('explica')">
          Tienes la versión en la nube, <code>openshorts.app</code>. Es el mismo programa en una gráfica, pero el
          plan gratis tiene marca de agua: tu primer vídeo hasta 60 min y luego 20 min al mes. Los planes sin marca
          empiezan en 12 $/mes. Para empezar a cobrar, la versión local te sale gratis.
        </GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso :numero="3" etiqueta="Tus primeros clips" titulo="Pega el enlace." destacado="Publica.">
        <h3 class="guia-subtitulo">1 · Clip Generator</h3>
        <p class="guia-texto">
          Pega un enlace de YouTube o sube el archivo del directo. OpenShorts lee la transcripción y los cambios de
          escena y saca de <strong>3 a 15 momentos de 15 a 60 s</strong>. Cada uno sale en 9:16, con subtítulos, una
          frase de gancho, una puntuación de viralidad y títulos para cada red. Si el directo es de Twitch, descarga
          el VOD (por ejemplo, con <code>yt-dlp</code>) y súbelo como archivo.
        </p>

        <h3 class="guia-subtitulo">2 · Retócalo en el editor</h3>
        <p class="guia-texto">Corta por palabras, cambia el encuadre, vuelve a renderizar.</p>
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Facecam arriba, juego abajo" color="var(--g-c1)">
            El formato que más retiene en clips de streamers. Usa el diseño <strong>SPLIT</strong> o fuerza el
            encuadre desde el panel.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="El gancho en 1 segundo" color="var(--g-c2)">
            Empieza en la reacción, no antes. Si el clip arranca con 3 s de nada, córtalos en el editor.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Subtítulos siempre" color="var(--g-c3)">
            La mayoría ve los vídeos sin sonido. Déjalos grandes y en el centro, lejos de los botones de la app.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Volumen diario" color="var(--g-c4)">
            Empieza con 3–5 clips al día por red. Mira cuáles funcionan y repite ese tipo de momento.
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">3 · Publica</h3>
        <p class="guia-texto">
          A mano, o en todas las redes a la vez. Desde OpenShorts puedes publicar o programar en TikTok, Instagram,
          YouTube y más con una clave de <strong>Upload-Post</strong>. Su plan gratis incluye 10 subidas al mes a todas
          las redes, sin tarjeta.
        </p>

        <h3 class="guia-subtitulo">Descargar un directo de Twitch · pídeselo a Claude Code</h3>
        <GuiaCodigo etiqueta="Prompt · Copia y pega" tipo="prompt" :codigo="promptTwitch" />

        <div class="guia-rutina">
          <img :src="mascota('senala')" alt="" class="guia-mascota" loading="lazy" decoding="async" />
          <div>
            <h3 class="guia-subtitulo">Tu rutina de <span class="guia-resalte">30 minutos</span></h3>
            <ol>
              <li v-for="r in rutina" :key="r">{{ r }}</li>
            </ol>
          </div>
        </div>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso :numero="4" etiqueta="Dónde te pagan" titulo="Cobra por cada" destacado="1.000 vistas">
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Whop · Content Rewards" color="var(--g-c1)">
            El mayor mercado de clipping. Streamers y marcas publican campañas y te pagan por cada 1.000 vistas
            <strong>verificadas</strong> de los clips que te aprueban. Muchas no piden seguidores mínimos.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Otras plataformas" color="var(--g-c2)">
            Vyro, Ssemble y similares funcionan igual: eliges una campaña, subes el clip y mandas el enlace. Compara la
            tarifa y las condiciones de aprobación antes de elegir.
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="El camino más seguro:">
          clipea para <strong>campañas de streamers que te pagan por hacerlo</strong>. Así el creador te da permiso
          para usar su directo, y no subes contenido ajeno sin más.
        </GuiaNota>
      </GuiaPaso>

      <!-- 05 -->
      <GuiaPaso :numero="5" etiqueta="Reglas" titulo="Cobra" destacado="sin perder la cuenta">
        <ul class="guia-reglas">
          <li v-for="r in reglas" :key="r.titulo" :class="r.ok ? 'es-si' : 'es-no'">
            <span class="guia-reglas-marca" aria-hidden="true">{{ r.ok ? "✓" : "✕" }}</span>
            <p><strong>{{ r.titulo }}</strong> {{ r.texto }}</p>
          </li>
        </ul>
        <p class="guia-fuente">
          La política de Rockstar está pensada para el uso no comercial de los fans y no autoriza de forma expresa
          monetizar. Las campañas pagadas son el camino con menos riesgo. Esta guía no es asesoramiento legal.
        </p>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Llegas pronto."
        destacado="No rico."
        texto="Miles de personas empiezan el primer día y la mayoría lo deja a la semana. Si publicas cada día y repites lo que funciona, vas a estar por delante."
        :archivo="guia.archivo"
        :mascota="mascota('pulgar')"
      >
        <GuiaCodigo etiqueta="Resumen" :codigo="cierreComandos" />
        <p class="guia-firma">Sígueme para el siguiente → <strong>@automata.ofi</strong></p>
      </GuiaDescarga>

      <GuiaAutor />
    </article>
  </MarcoGuias>
</template>
