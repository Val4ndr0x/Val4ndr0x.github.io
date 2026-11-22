<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: Claude maneja tu Excel (limpiar datos, fórmulas, gráficos y dashboard).
// La URL sale del nombre del archivo: /guias/claude-excel
// El PDF descargable está en public/guias/claude-excel.pdf.
const guia = guiaPorSlug("claude-excel");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Antes de empezar", nota: "lo que necesitas tener" },
  { titulo: "Sube tu Excel", nota: "en 30 segundos" },
  { titulo: "Tu primera prueba", nota: "para comprobar que funciona" },
  { titulo: "El prompt exacto", nota: "limpiar, fórmulas y gráfico" },
  { titulo: "Ideas y si algo falla", nota: "cruces, dashboard, CSV" },
];

const pasosSubir = [
  "Abre una conversación nueva en Claude.",
  "Comprueba que la creación de archivos está activada (Ajustes → Capacidades).",
  "Arrastra tu .xlsx al chat o pulsa el clip / el + para adjuntarlo.",
  "Espera a que aparezca como adjunto y escribe tu petición.",
];

const promptPrueba = `Echa un vistazo a este Excel. Dime qué hojas tiene, qué significa cada columna, cuántas filas hay y qué errores o datos raros ves (duplicados, celdas vacías, fechas o números mal escritos). No cambies nada todavía.`;

const promptExcel = `Revisa este Excel y déjalo listo para usar:
1. Borra las filas duplicadas y dime cuántas había.
2. Corrige los datos mal escritos: espacios de más, mayúsculas y fechas en formatos distintos.
3. Añade las fórmulas que falten: [ej.: totales por columna y margen = ventas − gastos].
4. Haz un gráfico de [lo que quieras ver, ej.: ventas por producto].
5. Devuélveme un archivo .xlsx nuevo, sin tocar el original, para descargar. Al final resume qué cambiaste.`;

const promptPro = `Cruza la hoja [Ventas] con la hoja [Gastos] por [producto]. Dime en cuáles estoy perdiendo dinero y por qué.
Después crea una hoja nueva llamada «Dashboard» con los totales de ventas, gastos y margen, y un gráfico de la evolución mensual. Devuélveme el .xlsx para descargar.`;

const ideas = [
  { titulo: "Fórmulas en lenguaje normal", texto: "Descríbele lo que quieres y que te escriba la fórmula. «Suma las ventas de cada mes y dime la fórmula que usaste»" },
  { titulo: "Limpiar exportaciones", texto: "Listados de tu tienda, CRM o banco con columnas desordenadas. «Separa nombre y apellido y unifica los formatos de fecha»" },
  { titulo: "Dashboard mensual", texto: "Una hoja de resumen con totales, márgenes y gráficos al día. «Crea un dashboard del mes con lo más importante»" },
  { titulo: "Y no solo Excel: CSV", texto: "También trabaja con archivos .csv, el formato que exportan casi todas las herramientas." },
];

const fallos = [
  { titulo: "No me devuelve el archivo", texto: "Comprueba que la creación de archivos está activada y pídelo expresamente: «devuélveme el .xlsx para descargar»." },
  { titulo: "Salen #REF! o #N/A", texto: "Pégale el error y dile «revisa estas fórmulas y arréglalas». Casi siempre es un rango o un nombre de hoja mal puesto." },
  { titulo: "El archivo es enorme", texto: "Pídele que trabaje solo con una hoja o un rango, o usa Claude Code, que lee archivos grandes directamente de tu carpeta." },
  { titulo: "Los números no cuadran", texto: "Pídele que explique cada paso y la fórmula usada, y comprueba dos o tres filas a mano." },
];

const cierre = `1. Ajustes → Capacidades → creación de archivos
2. Sube tu .xlsx y pega el prompt
3. Descarga el archivo listo`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Claude"
        titulo="Claude ahora maneja"
        destacado="tu Excel"
        resumen="Cómo subir tu hoja de cálculo a Claude y pedirle que <strong>limpie datos, ponga fórmulas y cree gráficos</strong>. Con los prompts exactos para copiar y pegar."
        :chips="['5 pasos', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('laptop')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Antes de empezar"
        titulo="Qué puede hacer Claude"
        destacado="con tu Excel"
        intro="Claude lee tus hojas, entiende qué hay en cada columna y, con la creación de archivos activada, te devuelve un .xlsx nuevo listo para descargar: datos limpios, fórmulas puestas, gráficos y hojas de resumen. Tú se lo pides con palabras normales; no hace falta saber de fórmulas."
      >
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Cuenta de Claude" etiqueta="Obligatorio" color="var(--g-c1)">
            En claude.ai o en la app de escritorio o móvil. Para archivos grandes o muchas tareas, el plan de pago te da más margen de uso.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Creación de archivos activada" etiqueta="Obligatorio" color="var(--g-c2)">
            En Ajustes → Capacidades, activa la opción «Ejecución de código y creación de archivos». El nombre puede variar un poco según la versión.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Tu archivo .xlsx o .csv" etiqueta="Obligatorio" color="var(--g-c3)">
            Con tus hojas tal cual. Haz una copia antes: Claude te entrega un archivo nuevo, pero nunca está de más.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Datos sin información sensible" etiqueta="Recomendado" suave color="var(--g-c4)">
            Evita subir datos personales de clientes, contraseñas o cifras confidenciales. Si los necesitas, anonimiza antes (cambia nombres por códigos).
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Ojo:" :mascota="mascota('pensando')">
          Claude puede equivocarse, sobre todo con tablas muy grandes o muy desordenadas. Revisa siempre el resultado:
          pídele que te enseñe las fórmulas que usó y comprueba dos o tres resultados a mano antes de fiarte.
        </GuiaNota>

        <GuiaNota titulo="Alternativa para archivos grandes:">
          en Claude Code (terminal, VS Code o la app en modo Code) puedes decirle «abre este Excel con Python y haz lo
          siguiente…». Trabaja directamente sobre los archivos de tu carpeta y sirve para automatizarlo después.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso :numero="2" etiqueta="Sube tu Excel" titulo="Treinta segundos," destacado="de verdad">
        <div class="guia-rutina">
          <img :src="mascota('senala')" alt="" class="guia-mascota" loading="lazy" decoding="async" />
          <div>
            <h3 class="guia-subtitulo">Paso a paso</h3>
            <ol>
              <li v-for="r in pasosSubir" :key="r">{{ r }}</li>
            </ol>
          </div>
        </div>

        <GuiaNota titulo="Un archivo, una conversación:">
          si cambias de tema o de archivo, abre otra conversación. Así Claude no mezcla datos y los resultados salen más limpios.
        </GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso
        :numero="3"
        etiqueta="Tu primera prueba"
        titulo="Antes de cambiar nada,"
        destacado="que te cuente qué ve"
        intro="Esta prueba no modifica el archivo. Sirve para comprobar que Claude lee bien tus hojas y para que descubras qué errores tienen tus datos."
      >
        <GuiaCodigo etiqueta="Prompt · Copia y pega" tipo="prompt" :codigo="promptPrueba" />

        <GuiaNota titulo="¿Funciona?" :mascota="mascota('explica')">
          Si te devuelve un resumen con las hojas, las columnas y una lista de problemas, sí. Pasa al prompt importante, el del paso siguiente.
        </GuiaNota>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso
        :numero="4"
        etiqueta="El prompt exacto"
        titulo="Limpia, calcula y grafica"
        destacado="en un solo mensaje"
        intro="Copia el bloque entero, cambia lo que está entre corchetes por lo tuyo y pégalo en la misma conversación donde subiste el archivo. Claude hace los cinco pasos y te devuelve el Excel nuevo."
      >
        <GuiaCodigo etiqueta="Prompt · Excel listo" tipo="prompt" :codigo="promptExcel" />

        <h3 class="guia-subtitulo">Versión pro · cruza datos y monta un dashboard</h3>
        <GuiaCodigo etiqueta="Prompt · Dónde pierdo dinero" tipo="prompt" :codigo="promptPro" />

        <GuiaNota titulo="Para afinarlo:">
          pídele cambios en la misma conversación («pon el gráfico de barras», «añade una columna con el porcentaje»).
          Cada vez te devolverá la versión actualizada del archivo.
        </GuiaNota>
      </GuiaPaso>

      <!-- 05 -->
      <GuiaPaso :numero="5" etiqueta="Ideas y si algo falla" titulo="Qué más le puedes pedir" destacado="hoy mismo">
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(i, n) in ideas"
            :key="i.titulo"
            :titulo="i.titulo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ i.texto }}
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">Si algo falla</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(f, n) in fallos"
            :key="f.titulo"
            :titulo="f.titulo"
            suave
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ f.texto }}
          </GuiaTarjeta>
        </div>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Ya lo tienes."
        destacado="Ahora, a trabajar."
        texto="Tú tardarías una tarde buscando la fórmula correcta. Claude lo resuelve en segundos."
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
