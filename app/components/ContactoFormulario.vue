<script setup>
import { perfil, contacto } from "~/data/perfil";

defineProps({ numero: Number });

// El sitio es estático: el formulario arma el mensaje y lo abre en el
// correo o en WhatsApp de quien escribe.
const nombre = ref("");
const correo = ref("");
const tipo = ref(contacto.tiposProyecto[0]);
const presupuesto = ref(contacto.presupuestos[0]);
const mensaje = ref("");

const texto = computed(
  () =>
    `Hola Andrés, soy ${nombre.value || "—"}${correo.value ? ` (${correo.value})` : ""}.\n\n` +
    `Tipo de proyecto: ${tipo.value}\nPresupuesto: ${presupuesto.value}\n\n${mensaje.value}`
);

function enviarCorreo() {
  const asunto = `Proyecto: ${tipo.value} — ${nombre.value || "Nuevo contacto"}`;
  window.location.href = `mailto:${contacto.correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto.value)}`;
}

function enviarWhatsapp() {
  window.open(`${contacto.whatsapp}?text=${encodeURIComponent(texto.value)}`, "_blank", "noopener");
}

// Copiar con confirmación inmediata
const copiado = ref("");
async function copiar(valor) {
  try {
    await navigator.clipboard.writeText(valor);
    copiado.value = valor;
    setTimeout(() => copiado.value === valor && (copiado.value = ""), 1600);
  } catch {
    /* sin permiso de portapapeles: no pasa nada */
  }
}

// Hora local en vivo
const hora = ref("");
let reloj;
function actualizarHora() {
  hora.value = new Date().toLocaleTimeString("es-CO", {
    timeZone: perfil.zonaHoraria,
    hour: "2-digit",
    minute: "2-digit",
  });
}
onMounted(() => {
  actualizarHora();
  reloj = setInterval(actualizarHora, 15000);
});
onBeforeUnmount(() => clearInterval(reloj));

const canales = [
  { icono: "correo", titulo: "Correo", valor: contacto.correo, copiar: true },
  { icono: "chat", titulo: "WhatsApp", valor: contacto.telefono, href: contacto.whatsapp },
  { icono: "enlace", titulo: "LinkedIn", valor: "andress-val", href: contacto.linkedin },
];
</script>

<template>
  <section id="contacto" class="seccion contacto-form">
    <SeccionCabecera
      :numero="numero"
      etiqueta="Contacto"
      titulo="¿Tienes una idea?"
      destacado="Hablemos."
    />

    <div class="contacto-grid">
      <form class="tarjeta-vidrio formulario" @submit.prevent="enviarCorreo">
        <div class="campo-doble">
          <label class="campo">
            <span>Nombre</span>
            <input v-model="nombre" type="text" autocomplete="name" required placeholder="Tu nombre" />
          </label>
          <label class="campo">
            <span>Correo</span>
            <input v-model="correo" type="email" autocomplete="email" placeholder="tu@correo.com" />
          </label>
        </div>

        <fieldset class="campo">
          <legend>Tipo de proyecto</legend>
          <div class="chips-opciones">
            <label v-for="op in contacto.tiposProyecto" :key="op" class="chip chip-boton" :class="{ activo: tipo === op }">
              <input v-model="tipo" type="radio" name="tipo" :value="op" />{{ op }}
            </label>
          </div>
        </fieldset>

        <fieldset class="campo">
          <legend>Presupuesto</legend>
          <div class="chips-opciones">
            <label v-for="op in contacto.presupuestos" :key="op" class="chip chip-boton" :class="{ activo: presupuesto === op }">
              <input v-model="presupuesto" type="radio" name="presupuesto" :value="op" />{{ op }}
            </label>
          </div>
        </fieldset>

        <label class="campo">
          <span>Mensaje</span>
          <textarea v-model="mensaje" rows="4" required placeholder="Cuéntame sobre tu proyecto"></textarea>
        </label>

        <div class="formulario-acciones">
          <button type="submit" class="boton-principal">Enviar por correo</button>
          <button type="button" class="boton-secundario" @click="enviarWhatsapp">Enviar por WhatsApp</button>
        </div>
      </form>

      <aside class="contacto-lateral">
        <div class="tarjeta-vidrio contacto-estado">
          <p><span class="punto-vivo"></span>{{ contacto.respuesta }}</p>
          <p class="contacto-hora">
            <IconoLinea nombre="reloj" class="icono-pequeno" />
            {{ hora }} en {{ perfil.ciudad }}
          </p>
        </div>

        <component
          :is="canal.href ? 'a' : 'button'"
          v-for="canal in canales"
          :key="canal.titulo"
          class="tarjeta-vidrio canal"
          :href="canal.href"
          :target="canal.href ? '_blank' : undefined"
          :rel="canal.href ? 'noopener' : undefined"
          :type="canal.href ? undefined : 'button'"
          @click="canal.copiar && copiar(canal.valor)"
        >
          <IconoLinea :nombre="canal.icono" class="canal-icono" />
          <span class="canal-texto">
            <strong>{{ canal.titulo }}</strong>
            <span>{{ canal.valor }}</span>
          </span>
          <span class="canal-accion">{{ canal.copiar ? (copiado === canal.valor ? "¡Copiado!" : "Copiar") : "↗" }}</span>
        </component>
      </aside>
    </div>
  </section>
</template>
