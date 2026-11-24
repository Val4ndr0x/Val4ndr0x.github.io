<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: Tu Wi-Fi más rápido con Claude Code.
// La URL sale del nombre del archivo: /guias/wifi-claude
// El PDF descargable está en public/guias/wifi-claude.pdf.
const guia = guiaPorSlug("wifi-claude");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Antes de empezar", nota: "qué necesitas y qué cuidar" },
  { titulo: "Conecta Claude a tu router", nota: "el prompt del reel" },
  { titulo: "Diagnóstico y arreglos", nota: "mide, aprueba, repite" },
  { titulo: "Privacidad", nota: "quién está en tu Wi-Fi" },
];

const promptRouter = `Conéctate a mi router y encuentra todo lo que está haciendo lento a mi Wi-Fi.`;

const promptContexto = `Quiero mejorar mi Wi-Fi. Estoy en este portátil conectado por Wi-Fi. Antes de ejecutar nada, dime qué vas a hacer. Empieza midiendo la velocidad y localizando la dirección del router. No cambies ningún ajuste sin preguntarme.`;

const promptDiagnostico = `Mide mi velocidad ahora y guárdala. Luego dime qué apps están usando más red en segundo plano y qué redes cercanas usan el mismo canal que la mía.`;

const promptComparar = `Vuelve a correr la prueba de velocidad y compárala con la primera. Muéstrame los dos resultados en una tabla y dime qué cambio ayudó más.`;

const promptIntrusos = `Muéstrame todos los aparatos conectados a mi Wi-Fi y márcame los que no reconozca.`;

const requisitos = [
  { titulo: "Claude Code", texto: "En la app de Claude entra en la pestaña Code, o abre una terminal y escribe claude." },
  { titulo: "Ordenador en tu Wi-Fi", texto: "Mejor el portátil conectado por Wi-Fi: así mide lo mismo que sufres en el móvil." },
  { titulo: "Sticker del router", texto: "Trae la dirección de acceso (suele ser 192.168.0.1 o 192.168.1.1), el usuario y la clave de administración." },
  { titulo: "Cinco minutos", texto: "El diagnóstico tarda poco. Lo que más lleva es leer y aprobar los cambios con calma." },
];

const arreglos = [
  { titulo: "Cambiar de canal", texto: "A uno menos usado por tus vecinos." },
  { titulo: "Usar 5 GHz", texto: "Para móvil y portátil, si estás cerca del router." },
  { titulo: "Actualizar firmware", texto: "Corrige fallos y mejora el rendimiento." },
  { titulo: "Parar apps pesadas", texto: "Copias en la nube y descargas en segundo plano." },
];

const cierre = `1. Conéctate a mi router y encuentra qué lo hace lento
2. Mide mi velocidad y guárdala (el «antes»)
3. Aprueba los arreglos uno a uno
4. Repite la prueba y compara
5. Muéstrame los aparatos conectados`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Claude Code"
        titulo="Tu Wi-Fi"
        destacado="más rápido con Claude"
        resumen="Que Claude <strong>mida tu red</strong>, encuentre qué te frena, aplique los arreglos contigo y te enseñe <strong>quién más está conectado</strong>, con los prompts exactos del reel."
        :chips="['5 pasos', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('laptop')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Antes de empezar"
        titulo="Qué necesitas y"
        destacado="qué cuidar"
        intro="Claude Code corre en tu ordenador, así que puede ejecutar pruebas de red de verdad: medir la velocidad, escanear canales y listar dispositivos. Lo que hace depende de tu sistema y de tu router."
      >
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(r, n) in requisitos"
            :key="r.titulo"
            :titulo="r.titulo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ r.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Solo en tu red:" :mascota="mascota('senala')">
          haz esto únicamente en el Wi-Fi que es tuyo. Escanear redes ajenas no es buena idea y puede ser ilegal.
        </GuiaNota>
        <GuiaNota titulo="Aprueba cada cambio tú:" :mascota="mascota('pensando')">
          Claude te pide permiso antes de ejecutar comandos o tocar ajustes. Léelos y aprueba uno a uno; no actives la aprobación automática en una tarea que modifica tu router.
        </GuiaNota>
        <GuiaNota titulo="Sobre la clave:" :mascota="mascota('explica')">
          la del sticker es la de <strong>administración del router</strong>, no la del Wi-Fi. Si prefieres no escribirla en el chat, entra tú mismo a la página del router y dile a Claude qué ves y qué pulsar. Al terminar, cámbiala por una propia.
        </GuiaNota>
        <GuiaNota titulo="Sin garantías de «10×»:" :mascota="mascota('idea')">
          en el reel salió el doble de rápido. Tu resultado depende de qué te frene: canal saturado, apps en segundo plano, router viejo o tu contrato. La prueba antes/después te dice la verdad.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso
        :numero="2"
        etiqueta="Conecta Claude a tu router"
        titulo="Pídele que"
        destacado="encuentre tu router"
        intro="Abre Claude, pulsa <strong>Code</strong> y elige una carpeta cualquiera (por ejemplo «wifi»). Después pega el prompt del reel."
      >
        <GuiaCodigo etiqueta="Prompt · El del reel" tipo="prompt" :codigo="promptRouter" />
        <p>
          Claude buscará la dirección de tu router por su cuenta. Cuando llegue al inicio de sesión te pedirá el usuario y la clave de administración del sticker.
        </p>

        <h3 class="guia-subtitulo">Versión con más contexto</h3>
        <GuiaCodigo etiqueta="Prompt · Con control" tipo="prompt" :codigo="promptContexto" />

        <GuiaNota titulo="Si no encuentra el router:" :mascota="mascota('teclea')">
          escribe tú la dirección del sticker («mi router es 192.168.1.1»). Si el router es del operador y solo se gestiona desde su app, dile que haga el diagnóstico sin entrar al router y que te indique qué cambiar a mano.
        </GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso
        :numero="3"
        etiqueta="Diagnóstico y arreglos"
        titulo="Mide, aprueba y"
        destacado="vuelve a medir"
        intro="Claude hace tres comprobaciones: corre una <strong>prueba de velocidad</strong> (tu «antes»), busca <strong>apps que consumen red</strong> en segundo plano y revisa si tus vecinos usan <strong>el mismo canal</strong> que tú."
      >
        <GuiaCodigo etiqueta="Prompt · Diagnóstico" tipo="prompt" :codigo="promptDiagnostico" />

        <h3 class="guia-subtitulo">El canal, explicado fácil</h3>
        <p>
          El canal es como el <strong>carril de una autopista</strong>: si cinco vecinos van por el mismo, todos van más lentos. En 2,4 GHz, los canales 1, 6 y 11 no se pisan entre sí. En 5 GHz hay más canales y más velocidad, pero menos alcance.
        </p>

        <h3 class="guia-subtitulo">Aplica y compara</h3>
        <p>
          Claude te propondrá una lista de arreglos (en el reel salieron nueve). Lee cada uno, pregunta «¿qué pasa si lo desactivo?» en los que no entiendas y apruébalos de uno en uno. Reinicia el router si lo pide y repite la prueba.
        </p>
        <GuiaCodigo etiqueta="Prompt · Antes y después" tipo="prompt" :codigo="promptComparar" />

        <h3 class="guia-subtitulo">Arreglos típicos</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(a, n) in arreglos"
            :key="a.titulo"
            :titulo="a.titulo"
            suave
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ a.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Si algo empeora:" :mascota="mascota('pulgar')">
          pídele a Claude que deshaga el último cambio. Por eso conviene aprobarlos de uno en uno y guardar el «antes».
        </GuiaNota>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso
        :numero="4"
        etiqueta="Privacidad"
        titulo="¿Quién está"
        destacado="en tu Wi-Fi?"
        intro="Claude te enseña la lista de aparatos (nombre, fabricante y dirección) y marca los sospechosos. Compárala con lo que tienes en casa: móviles, tele, consola, altavoces, bombillas, impresora."
      >
        <GuiaCodigo etiqueta="Prompt · Detector de intrusos" tipo="prompt" :codigo="promptIntrusos" />

        <div class="guia-rejilla">
          <GuiaTarjeta titulo="Si lo reconoces" color="var(--g-c1)">
            Ponle nombre al aparato en el router para identificarlo la próxima vez.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Si no lo reconoces" color="var(--g-c2)">
            Bloquéalo desde la app del router (en el reel, en dos toques) y mira si algo deja de funcionar en casa.
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Ojo con los falsos positivos:" :mascota="mascota('pensando')">
          muchos aparatos salen con un nombre raro o sin nombre (bombillas, enchufes, tele). Antes de bloquear, apaga el aparato que sospechas y comprueba si desaparece de la lista.
        </GuiaNota>
        <GuiaNota titulo="Cierra la puerta de verdad:" :mascota="mascota('senala')">
          cambia la clave del Wi-Fi por una larga y nueva, y la de administración del router. Bloquear un aparato sin cambiar la clave no impide que vuelva a entrar con otro.
        </GuiaNota>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Mide, aplica,"
        destacado="vuelve a medir."
        texto="Con la prueba antes/después ves qué te frenaba y si ya está resuelto. Si te funcionó, cuéntame cuánto subió."
        :archivo="guia.archivo"
        :mascota="mascota('celebra')"
      >
        <GuiaCodigo etiqueta="Resumen" :codigo="cierre" />
        <p class="guia-firma">Más trucos de IA en → <strong>@automata.ofi</strong></p>
      </GuiaDescarga>

      <GuiaAutor />
    </article>
  </MarcoGuias>
</template>
