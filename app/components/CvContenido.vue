<script setup>
import { perfil, sobreMi, stack, niveles, trayectoria, idiomas, servicios, contacto } from "~/data/perfil";
import { proyectos } from "~/data/proyectos";
import { medallas, imagenMedalla, verificarMedalla, certificados, formatoFecha } from "~/data/insignias";
import { abrirVisor } from "~/utils/motion";

// Contenido del CV para las ventanas del modo escritorio.
// `parte` = "cv" muestra todo junto, como un documento.
const props = defineProps({ parte: { type: String, required: true } });
const ver = (clave) => props.parte === "cv" || props.parte === clave;

const nombreTipo = { experiencia: "Experiencia", educacion: "Educación", certificado: "Certificado" };

function ampliar(evento) {
  abrirVisor(evento.currentTarget);
}
</script>

<template>
  <div class="cv-doc" :class="{ 'cv-doc--completo': parte === 'cv' }">
    <!-- Encabezado y resumen -->
    <header v-if="ver('sobre')" class="cv-encabezado">
      <img src="/imagenes/Dibujo.png" alt="" class="cv-foto" />
      <div>
        <h1>{{ perfil.nombre }}</h1>
        <p class="cv-cargo">{{ perfil.cargo }}</p>
        <p class="cv-meta">
          <span>{{ perfil.ciudad }}</span>
          <span v-if="perfil.disponible" class="cv-disponible"><span class="punto-vivo"></span>{{ perfil.disponibilidad }}</span>
        </p>
      </div>
    </header>

    <section v-if="ver('sobre')" class="cv-bloque">
      <h2>Perfil</h2>
      <p>{{ sobreMi.resumen }}</p>
      <ul class="cv-cifras">
        <li v-for="c in sobreMi.cifras" :key="c.texto">
          <strong>{{ c.valor === "proyectos" ? proyectos.length : c.valor }}{{ c.sufijo }}</strong>
          <span>{{ c.texto }}</span>
        </li>
      </ul>
      <h3>Ahora mismo</h3>
      <dl class="cv-lista-def">
        <div v-for="item in sobreMi.ahoraMismo" :key="item.etiqueta">
          <dt>{{ item.etiqueta }}</dt>
          <dd>{{ item.texto }}</dd>
        </div>
      </dl>
      <h3>Idiomas</h3>
      <ul class="cv-chips">
        <li v-for="i in idiomas" :key="i.idioma" class="chip">{{ i.idioma }} · {{ i.nivel }}</li>
      </ul>
    </section>

    <!-- Stack -->
    <section v-if="ver('stack')" class="cv-bloque">
      <h2>Habilidades</h2>
      <div class="cv-stack">
        <div v-for="grupo in stack" :key="grupo.categoria">
          <h3>{{ grupo.categoria }}</h3>
          <ul class="cv-chips">
            <li
              v-for="item in grupo.items"
              :key="item.nombre"
              class="chip"
              :style="{ '--tono': niveles[item.nivel].color }"
              :title="`${niveles[item.nivel].texto} · ${item.detalle}`"
            >
              <span class="chip-punto"></span>{{ item.nombre }}
            </li>
          </ul>
        </div>
      </div>
      <h3>Servicios</h3>
      <ul class="cv-servicios">
        <li v-for="s in servicios" :key="s.titulo" :style="{ '--tono': s.tono }">
          <strong>{{ s.titulo }}</strong> — {{ s.descripcion }}
        </li>
      </ul>
    </section>

    <!-- Proyectos -->
    <section v-if="ver('proyectos')" class="cv-bloque">
      <h2>Proyectos</h2>
      <div class="cv-proyectos">
        <article v-for="p in proyectos" :key="p.nombre" class="cv-proyecto" :style="{ '--tono': p.tono }">
          <IconoLinea :nombre="p.icono" class="cv-proyecto-icono" />
          <div>
            <p class="cv-proyecto-tipo">{{ p.tipo }}</p>
            <h3>{{ p.nombre }}</h3>
            <p>{{ p.descripcion }}</p>
            <a v-if="p.enlace" :href="p.enlace" target="_blank" rel="noopener" class="enlace-acento">Ver proyecto ›</a>
          </div>
        </article>
      </div>
    </section>

    <!-- Trayectoria -->
    <section v-if="ver('trayectoria')" class="cv-bloque">
      <h2>Trayectoria</h2>
      <ol class="cv-trayectoria">
        <li v-for="h in trayectoria" :key="h.titulo" :class="`hito--${h.tipo}`">
          <p class="cv-trayectoria-meta">
            {{ nombreTipo[h.tipo] }} · {{ h.periodo }}
            <span v-if="h.actual" class="insignia-actual"><span class="punto-vivo"></span>Actual</span>
          </p>
          <h3>{{ h.titulo }}</h3>
          <p class="cv-gris">{{ h.lugar }}</p>
          <ul v-if="h.puntos" class="cv-puntos">
            <li v-for="punto in h.puntos" :key="punto">{{ punto }}</li>
          </ul>
        </li>
      </ol>
    </section>

    <!-- Certificados e insignias -->
    <section v-if="ver('certificados')" class="cv-bloque">
      <h2>Certificados</h2>
      <div class="cv-certificados">
        <figure v-for="cert in certificados" :key="cert.src">
          <img :src="cert.src" :alt="cert.titulo" loading="lazy" @click="ampliar" />
          <figcaption>
            <strong>{{ cert.titulo }}</strong>
            <span>{{ cert.emisor }} · {{ cert.anio }}</span>
          </figcaption>
        </figure>
      </div>
      <h3>Insignias digitales</h3>
      <div class="cv-insignias">
        <figure v-for="m in medallas" :key="m.id">
          <img :src="imagenMedalla(m.id)" :alt="m.nombre" loading="lazy" @click="ampliar" />
          <figcaption>
            <a :href="verificarMedalla(m.id)" target="_blank" rel="noopener">{{ m.nombre }}</a>
            <span>{{ formatoFecha(m.fecha) }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- Contacto -->
    <section v-if="ver('contacto')" class="cv-bloque">
      <h2>Contacto</h2>
      <ul class="cv-contacto">
        <li>
          <IconoLinea nombre="correo" />
          <a :href="`mailto:${contacto.correo}`">{{ contacto.correo }}</a>
        </li>
        <li>
          <IconoLinea nombre="chat" />
          <a :href="contacto.whatsapp" target="_blank" rel="noopener">{{ contacto.telefono }} (WhatsApp)</a>
        </li>
        <li>
          <IconoLinea nombre="enlace" />
          <a :href="contacto.linkedin" target="_blank" rel="noopener">LinkedIn</a>
        </li>
      </ul>
      <p class="cv-gris">{{ contacto.respuesta }}.</p>
    </section>
  </div>
</template>
