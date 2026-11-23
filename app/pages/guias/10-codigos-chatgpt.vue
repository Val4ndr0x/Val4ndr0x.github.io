<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: Los 10 códigos para ChatGPT (truth, human, nofluff, devil, odds, decode,
// simulate, genius, shrink, rewire) con el prompt exacto de cada uno.
// La URL sale del nombre del archivo: /guias/10-codigos-chatgpt
// El PDF descargable está en public/guias/10-codigos-chatgpt.pdf.
const guia = guiaPorSlug("10-codigos-chatgpt");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Cómo funcionan", nota: "y cómo dejarlos fijos" },
  { titulo: "truth · human · nofluff · devil", nota: "respuestas más honestas" },
  { titulo: "odds · decode · simulate", nota: "decidir con datos" },
  { titulo: "genius · shrink · rewire", nota: "pensar, resumir, reescribir" },
  { titulo: "Chuleta y bloque maestro", nota: "los 10 de una vez" },
];

const promptTruth = `Modo truth: sé completamente sincero. No me des la razón por cortesía. Dime qué falla en esto, qué riesgos no estoy viendo y qué es lo más débil. Después, qué cambiarías.
[tu plan o idea]`;
const promptHuman = `Modo human: responde como lo diría una persona normal hablando con un amigo. Frases cortas, tono natural, nada de «cabe destacar» ni listas con viñetas innecesarias.
[tu pregunta o texto]`;
const promptNofluff = `Modo nofluff: ve directo al grano. Sin introducción, sin conclusión, sin repetir lo que he dicho. Máximo lo esencial en pocas líneas.
[tu pregunta]`;
const promptDevil = `Modo devil: hazte el abogado del diablo. Ataca mi idea con los 5 argumentos más fuertes en contra y dime en cuál tengo más probabilidad de fallar. No suavices nada.
[tu idea]`;
const promptOdds = `Modo odds: estima la probabilidad (en %) de que esto salga bien. Explica los factores que la suben, los que la bajan y qué tendría que cambiar para mejorarla. Indica cuánta confianza tienes en tu estimación.
[tu proyecto o decisión]`;
const promptDecode = `Modo decode: lee este texto y explícamelo en lenguaje llano. Marca la letra pequeña, las cláusulas que me perjudican, los plazos y penalizaciones, y lo que debería preguntar antes de firmar.
[pega aquí el contrato]`;
const promptSimulate = `Modo simulate: imagina que tomo esta decisión. Descríbeme 3 escenarios dentro de 5 años: el optimista, el realista y el pesimista. Para cada uno, qué lo provoca y cómo me afectaría. Termina con qué haría hoy para acercarme al mejor.
[tu decisión]`;
const promptGenius = `Modo genius: antes de responder, razona paso a paso. Descompón el problema, revisa tus propias conclusiones y señala dónde podrías estar equivocándote. Luego dame la respuesta final.
[tu problema]`;
const promptShrink = `Modo shrink: resume esto en tres partes: 1) qué es o qué hace, 2) cómo funciona, 3) para qué sirve o qué debo hacer yo con esto. Máximo 5 líneas en total.
[pega el texto]`;
const promptRewire = `Modo rewire: reescribe este texto para [quién lo va a leer: un cliente, tu jefe, un niño de 10 años, tu seguidor de Instagram]. Mantén el mensaje, cambia el tono, el vocabulario y la estructura.
[pega el texto]`;

const chuleta = [
  ["truth", "Sinceridad total, sin dar la razón por cortesía"],
  ["human", "Tono natural, como una persona"],
  ["nofluff", "Directo al grano, sin relleno"],
  ["devil", "Ataca tu idea con los mejores argumentos en contra"],
  ["odds", "Probabilidad en % con factores y confianza"],
  ["decode", "Traduce contratos y marca la letra pequeña"],
  ["simulate", "Tres escenarios a cinco años"],
  ["genius", "Razona paso a paso antes de responder"],
  ["shrink", "Resumen en qué es, cómo y para qué"],
  ["rewire", "Reescribe para el lector que elijas"],
];

const bloqueMaestro = `Cuando mi mensaje empiece con una de estas palabras, aplica ese modo:
truth: sé totalmente sincero, no me des la razón por cortesía; di qué falla y qué riesgos no veo.
human: responde con tono natural y frases cortas, como una persona.
nofluff: directo al grano, sin introducción ni relleno.
devil: abogado del diablo: 5 argumentos fuertes en contra de mi idea.
odds: estima la probabilidad en %, con factores a favor, en contra y tu nivel de confianza.
decode: explica el texto en lenguaje llano y marca la letra pequeña y lo que me perjudica.
simulate: 3 escenarios a 5 años (optimista, realista, pesimista) y qué hacer hoy.
genius: razona paso a paso y revisa tus conclusiones antes de responder.
shrink: resume en qué es, cómo funciona y para qué sirve, en 5 líneas máximo.
rewire: reescribe el texto para el lector que te indique, cambiando tono y vocabulario.`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · ChatGPT"
        titulo="Los 10 códigos"
        destacado="para ChatGPT"
        resumen="Diez órdenes cortas que cambian cómo te responde: más honesto, más directo, más útil. Con el <strong>prompt exacto de cada una</strong> para copiar y pegar."
        :chips="['10 códigos', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('idea')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Cómo funcionan"
        titulo="No son comandos secretos."
        destacado="Son órdenes con nombre"
        intro="ChatGPT no tiene un menú oculto de códigos. Lo que hace funcionar a <strong>truth</strong>, <strong>devil</strong> o <strong>odds</strong> es que la palabra va acompañada de una instrucción clara: <strong>cómo quieres que responda</strong>. Si solo escribes la palabra suelta, puede que no haga nada."
      >
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Uso puntual" etiqueta="Rápido" color="var(--g-c1)">
            Escribe tu pregunta y, justo debajo, pega el prompt del código. Vale solo para ese mensaje.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Dejarlos fijos" etiqueta="Recomendado" suave color="var(--g-c2)">
            Pega el bloque maestro (último paso) una vez en Ajustes → Personalización → Instrucciones personalizadas. Desde ahí basta escribir la palabra.
          </GuiaTarjeta>
        </div>

        <GuiaCodigo
          etiqueta="Ejemplo de uso"
          tipo="prompt"
          codigo="truth: quiero dejar mi trabajo y vender cursos online. Mi plan es grabar tres módulos este mes y lanzarlos en diciembre."
        />

        <GuiaNota titulo="Truco:" :mascota="mascota('explica')">
          pon el código al principio del mensaje y tu pregunta después. Si la respuesta no te convence, escribe otro código encima («ahora devil») y compara.
        </GuiaNota>

        <GuiaNota titulo="Ojo:">
          ChatGPT puede equivocarse y sonar muy seguro. En odds, decode y simulate los resultados son orientativos, no un consejo legal, médico ni financiero. Para contratos o dinero de verdad, valídalo con un profesional.
        </GuiaNota>

        <GuiaNota titulo="Combínalos:">
          «truth + nofluff» te da la crítica más directa y sin relleno. Pruébalo con tu último plan o tu último texto.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso :numero="2" etiqueta="Respuestas más honestas" titulo="Códigos" destacado="1 al 4">
        <h3 class="guia-subtitulo">1 · truth · para planes, ideas y negocios</h3>
        <p>Apaga la cortesía excesiva. Te dice qué falla, no solo lo que quieres oír.</p>
        <GuiaCodigo etiqueta="Prompt · truth" tipo="prompt" :codigo="promptTruth" />

        <h3 class="guia-subtitulo">2 · human · para mensajes, posts y emails</h3>
        <p>Te contesta como una persona, no como un folleto corporativo.</p>
        <GuiaCodigo etiqueta="Prompt · human" tipo="prompt" :codigo="promptHuman" />

        <h3 class="guia-subtitulo">3 · nofluff · para cuando tienes prisa</h3>
        <p>Solo lo importante. Sin introducciones, sin repetir tu pregunta, sin relleno.</p>
        <GuiaCodigo etiqueta="Prompt · nofluff" tipo="prompt" :codigo="promptNofluff" />

        <h3 class="guia-subtitulo">4 · devil · para decisiones antes de ejecutar</h3>
        <p>Deja de aplaudirte y ataca tu idea desde todos los ángulos.</p>
        <GuiaCodigo etiqueta="Prompt · devil" tipo="prompt" :codigo="promptDevil" />

        <GuiaNota titulo="Después:">pídele «ahora dime cómo defenderme de cada uno».</GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso :numero="3" etiqueta="Decidir con datos" titulo="Códigos" destacado="5 al 7">
        <h3 class="guia-subtitulo">5 · odds · para «¿esto va a funcionar?»</h3>
        <p>En vez de un «depende», te da un porcentaje estimado con sus razones.</p>
        <GuiaCodigo etiqueta="Prompt · odds" tipo="prompt" :codigo="promptOdds" />
        <GuiaNota titulo="Recuerda:">es una estimación razonada, no un cálculo exacto.</GuiaNota>

        <h3 class="guia-subtitulo">6 · decode · para contratos, condiciones y términos</h3>
        <p>Pegas un texto legal o técnico y te marca lo que de verdad importa.</p>
        <GuiaCodigo etiqueta="Prompt · decode" tipo="prompt" :codigo="promptDecode" />
        <GuiaNota titulo="Ojo:">no sustituye a un abogado. Úsalo para entender y llegar preparado, no para firmar sin revisar.</GuiaNota>

        <h3 class="guia-subtitulo">7 · simulate · para decisiones grandes</h3>
        <p>Lleva tu decisión a cinco años y te enseña varios futuros posibles, no uno solo.</p>
        <GuiaCodigo etiqueta="Prompt · simulate" tipo="prompt" :codigo="promptSimulate" />
        <GuiaNota titulo="Combo útil:">usa simulate para ver los escenarios y odds para ponerle número al que más te preocupe.</GuiaNota>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso :numero="4" etiqueta="Pensar, resumir, reescribir" titulo="Códigos" destacado="8 al 10">
        <h3 class="guia-subtitulo">8 · genius · para problemas complejos</h3>
        <p>Le pides que piense paso a paso antes de contestar. La respuesta sale más sólida.</p>
        <GuiaCodigo etiqueta="Prompt · genius" tipo="prompt" :codigo="promptGenius" />
        <GuiaNota titulo="Nota:">los modelos con razonamiento ya lo hacen solos; en los demás, esta orden marca la diferencia.</GuiaNota>

        <h3 class="guia-subtitulo">9 · shrink · para artículos, PDFs y reuniones</h3>
        <p>Resume lo que sea a su esencia: qué hace, cómo lo hace y para qué sirve.</p>
        <GuiaCodigo etiqueta="Prompt · shrink" tipo="prompt" :codigo="promptShrink" />

        <h3 class="guia-subtitulo">10 · rewire · para adaptar cualquier texto</h3>
        <p>Le pasas un texto y lo reescribe pensando en quien lo va a leer.</p>
        <GuiaCodigo etiqueta="Prompt · rewire" tipo="prompt" :codigo="promptRewire" />
        <GuiaNota titulo="Práctica rápida:" :mascota="mascota('teclea')">
          coge un texto tuyo y pásalo por rewire tres veces con tres públicos distintos. En cinco minutos ves por qué funciona.
        </GuiaNota>
      </GuiaPaso>

      <!-- 05 -->
      <GuiaPaso :numero="5" etiqueta="Chuleta y bloque maestro" titulo="Los 10" destacado="de una vez">
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="([codigo, texto], n) in chuleta"
            :key="codigo"
            :titulo="codigo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ texto }}
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">Bloque maestro · pégalo una vez en Instrucciones personalizadas</h3>
        <GuiaCodigo etiqueta="Bloque maestro · copiar y pegar" tipo="prompt" :codigo="bloqueMaestro" />
      </GuiaPaso>

      <GuiaDescarga
        titulo="Pruébalos hoy."
        destacado="Empieza con truth y devil."
        texto="Elige un plan o un texto que tengas a medias y pásalo por truth y devil. Verás en dos minutos lo que tu asistente se callaba."
        :archivo="guia.archivo"
        :mascota="mascota('pulgar')"
      >
        <p class="guia-firma">Más trucos de IA en → <strong>@automata.ofi</strong></p>
      </GuiaDescarga>

      <GuiaAutor />
    </article>
  </MarcoGuias>
</template>
