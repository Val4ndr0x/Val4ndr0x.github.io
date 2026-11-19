<script setup>
// Bloque de código o de prompt con botón de copiar.
// - tipo "terminal": las líneas con # son comentarios; "$ " y "> " se pintan
//   como el símbolo de la terminal y no se copian.
// - tipo "prompt": lo que va entre [CORCHETES] se resalta para que se vea qué
//   hay que cambiar.
const props = defineProps({
  etiqueta: { type: String, default: "" },
  codigo: { type: String, required: true },
  tipo: { type: String, default: "terminal" }, // "terminal" | "prompt"
});

const lineas = computed(() =>
  props.codigo
    .trim()
    .split("\n")
    .map((texto) => {
      if (props.tipo === "prompt") {
        return { partes: texto.split(/(\[[^\]]+\])/).filter(Boolean) };
      }
      if (texto.startsWith("#")) return { comentario: texto };
      const m = texto.match(/^([$>]) (.*)$/);
      return m ? { simbolo: m[1], texto: m[2] } : { texto };
    })
);

const textoCopiable = computed(() =>
  props.tipo === "prompt"
    ? props.codigo.trim()
    : lineas.value
        .filter((l) => !l.comentario)
        .map((l) => l.texto)
        .join("\n")
);

const copiado = ref(false);
let temporizador = null;
async function copiar() {
  try {
    await navigator.clipboard.writeText(textoCopiable.value);
    copiado.value = true;
    clearTimeout(temporizador);
    temporizador = setTimeout(() => (copiado.value = false), 1800);
  } catch {
    /* sin permiso para el portapapeles */
  }
}
</script>

<template>
  <figure class="guia-codigo" :class="`guia-codigo--${tipo}`">
    <figcaption>
      <span>{{ etiqueta }}</span>
      <button type="button" class="guia-copiar" @click="copiar">
        {{ copiado ? "¡Copiado!" : tipo === "prompt" ? "copiar y pegar" : "copiar" }}
      </button>
    </figcaption>
    <pre><code><template v-for="(l, i) in lineas" :key="i"><span v-if="l.comentario" class="c-comentario">{{ l.comentario }}</span><template v-else-if="l.partes"><template v-for="(p, j) in l.partes" :key="j"><mark v-if="p.startsWith('[')" class="c-cambiar">{{ p }}</mark><template v-else>{{ p }}</template></template></template><template v-else><span v-if="l.simbolo" class="c-simbolo">{{ l.simbolo }} </span>{{ l.texto }}</template>
</template></code></pre>
  </figure>
</template>
