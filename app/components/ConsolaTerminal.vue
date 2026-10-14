<script setup>
import DOMPurify from "dompurify";
import {
  ayudainformation,
  directories,
  contacto,
  habil,
  experiencia,
  information,
  comandos,
  ayudaArte,
} from "~/data/consola";

// Dentro de una ventana del modo escritorio la consola va sin ids, para no
// repetir los de la consola de la página
const props = defineProps({ enVentana: { type: Boolean, default: false } });

const consola = ref(null);
const entrada = ref(null);
// Cada entrada es HTML ya sanitizado
const salida = ref([]);
const historial = [];
let historialPos = 0;

const banner = `.s5SSSs.  .s    s.  .s5SSSs.  .s5SSSs.  .s5SSSs.  .s5SSSs.                
      SS.       SS.       SS.       SS.       SS.       SS.               
sS    S%S sSs.  S%S sS    S%S sS    S%S sS    \`:; sS    \`:;               
SS    S%S SS\`S. S%S SS    S%S SS    S%S SS        SS                      
SSSs. S%S SS \`S.S%S SS    S%S SS .sS;:' SSSs.     \`:;;;;.                 
SS    S%S SS  \`sS%S SS    S%S SS    ;,  SS              ;;.               
SS    \`:; SS    \`:; SS    \`:; SS    \`:; SS              \`:;               
SS    ;,. SS    ;,. SS    ;,. SS    ;,. SS    ;,. .,;   ;,.               
:;    ;:' :;    ;:' ;;;;;;;:' \`:    ;:' \`:;;;;;:' \`:;;;;;:'               
                                                                          
.s    s.                                                                  
      SS. .s5SSSs.  .s        .s5SSSs.  .s    s.  .s5SSSs.  s.  .s5SSSs.  
sS    S%S       SS.                 SS.       SS.       SS. SS.       SS. 
SS    S%S sS    S%S sS        sS    \`:; sSs.  S%S sS    \`:; S%S sS    S%S 
SS    S%S SSSs. S%S SS        SSSs.     SS \`S.S%S SS        S%S SSSs. S%S 
 SS   S%S SS    S%S SS        SS        SS  \`sS%S SS        S%S SS    S%S 
 SS   \`:; SS    \`:; SS        SS        SS    \`:; SS        \`:; SS    \`:; 
  SS  ;,. SS    ;,. SS    ;,. SS    ;,. SS    ;,. SS    ;,. ;,. SS    ;,. 
   \`:;;:' :;    ;:' \`:;;;;;:' \`:;;;;;:' :;    ;:' \`:;;;;;:' ;:' :;    ;:'                                        
`;

// Quita tildes, mayúsculas y espacios extra para que "CD Educación" funcione igual que "cd educacion"
function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");
}

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function ejecutar(comando) {
  const [cmd, ...args] = normalizar(comando).split(" ");
  const arg = args.join(" ");

  switch (cmd) {
    case "":
      return "";
    case "ayuda":
    case "help":
      return `<pre>${ayudainformation.info}</pre>${ayudaArte}`;
    case "ls":
      return Object.keys(directories)
        .map((key) => `<div> - ${key}</div>`)
        .join("");
    case "cd":
      if (!arg) {
        return `<div>Uso: cd [directorio]. Directorios: ${Object.keys(directories).join(", ")}</div>`;
      }
      if (directories[arg]) {
        return `<div class="console-muted">cambiando a ... ${arg}</div><pre>${directories[arg]}</pre>`;
      }
      return `<div class="console-error">Directorio no encontrado: ${escapar(arg)}. Escribe <b>ls</b> para ver los disponibles.</div>`;
    case "proyectos":
      return `<pre>${directories.proyectos}</pre>`;
    case "info":
      return `<pre>${information.info}</pre>`;
    case "contacto":
      return `<pre>${contacto.info}</pre>`;
    case "habil":
      return `<pre>${habil.info}</pre>`;
    case "experiencia":
      return `<pre>${experiencia.info}</pre>`;
    default:
      return `<div class="console-error">Comando no reconocido: ${escapar(comando.trim())}. Escribe <b>ayuda</b> para ver los comandos.</div>`;
  }
}

async function agregar(html, clase = "console-entry") {
  salida.value.push({ html: DOMPurify.sanitize(html), clase });
  await nextTick();
  consola.value.scrollTop = consola.value.scrollHeight;
}

function autocompletar() {
  const input = entrada.value;
  const valor = normalizar(input.value);
  let opciones;
  let prefijo = "";
  if (valor.startsWith("cd ")) {
    prefijo = "cd ";
    opciones = Object.keys(directories).filter((d) => d.startsWith(valor.slice(3)));
  } else {
    opciones = comandos.filter((c) => c.startsWith(valor));
  }
  if (opciones.length === 1) {
    input.value = prefijo + opciones[0] + (prefijo ? "" : " ");
  } else if (opciones.length > 1) {
    agregar(opciones.join("   "), "console-entry console-muted");
  }
}

function alPresionarTecla(e) {
  const input = entrada.value;
  if (e.key === "Enter") {
    const comando = input.value;
    input.value = "";

    if (comando.trim()) {
      historial.push(comando);
    }
    historialPos = historial.length;

    if (normalizar(comando) === "clear") {
      salida.value = [];
      return;
    }

    agregar(
      `<div class="console-cmd"><span class="prompt">Andres@Valencia :~$</span> ${escapar(comando)}</div>${ejecutar(comando)}`
    );
  } else if (e.key === "ArrowUp") {
    // Historial de comandos como en una terminal real
    if (historialPos > 0) {
      historialPos--;
      input.value = historial[historialPos];
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    if (historialPos < historial.length - 1) {
      historialPos++;
      input.value = historial[historialPos];
    } else {
      historialPos = historial.length;
      input.value = "";
    }
    e.preventDefault();
  } else if (e.key === "Tab") {
    e.preventDefault();
    autocompletar();
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    salida.value = [];
  }
}

// Clic en cualquier parte de la consola enfoca el input (sin romper la selección de texto)
function enfocar() {
  if (!window.getSelection().toString()) {
    entrada.value.focus({ preventScroll: true });
  }
}
</script>

<template>
  <section>
    <div
      class="console"
      :class="{ 'console-ventana': props.enVentana }"
      :id="props.enVentana ? undefined : 'consoleId'"
      ref="consola"
      @click="enfocar"
    >
      <div class="banner-console">
        <pre class="console-banner" aria-hidden="true">{{ banner }}</pre>
        <span class="console-hint"
          >Escribe <b>ayuda</b> para ver los comandos · Tab autocompleta · ↑/↓
          historial</span
        >
      </div>

      <div class="console-output" :id="props.enVentana ? undefined : 'output'" aria-live="polite">
        <div
          v-for="(item, i) in salida"
          :key="i"
          :class="item.clase"
          v-html="item.html"
        ></div>
      </div>

      <div class="inlineblock">
        <span class="prompt">Andres@Valencia :~$</span>
        <input
          ref="entrada"
          type="text"
          class="console-input"
          :id="props.enVentana ? undefined : 'input'"
          placeholder="escribe un comando..."
          autocomplete="off"
          autocapitalize="none"
          spellcheck="false"
          aria-label="Comando de la consola"
          @keydown="alPresionarTecla"
        />
      </div>
    </div>
  </section>
</template>
