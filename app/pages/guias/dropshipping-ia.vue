<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: Monta tu tienda de dropshipping con IA (página de venta + vídeo de anuncio).
// La URL sale del nombre del archivo: /guias/dropshipping-ia
// El PDF descargable está en public/guias/dropshipping-ia.pdf.
const guia = guiaPorSlug("dropshipping-ia");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Elige el producto", nota: "y copia la ficha del proveedor" },
  { titulo: "La página de venta", nota: "el prompt exacto" },
  { titulo: "El vídeo de anuncio", nota: "guion y textos en pantalla" },
  { titulo: "Revisa antes de publicar", nota: "lo que la IA no hace por ti" },
];

const promptPagina = `Crea una página de venta en HTML para mi tienda de dropshipping con este producto, pensada para convertir: titular con beneficio, el problema que resuelve, 3 beneficios, FAQ y garantía.
Descripción del proveedor: [PEGA AQUÍ LA FICHA DE ALIEXPRESS]`;

const promptMejora = `El archivo tiene que ser autocontenido (CSS y JS dentro), pensado para móvil y con el botón de pedir siempre visible. No inventes reseñas, cifras, premios ni certificados: usa solo datos de la ficha y márcame con [COMPLETAR] lo que debo poner yo (precio, plazos de envío, garantía real).`;

const promptVideo = `Con estas fotos y esta ficha del proveedor, escribe el guion de un vídeo de anuncio vertical 9:16 de 15 a 20 segundos:
1. 5 escenas, cada una con una foto y un texto corto en pantalla (máximo 6 palabras, con una palabra clave resaltada).
2. Cada texto parte de un dato real de la ficha (peso, tamaño, función). Nada que la ficha no confirme.
3. Primera escena: el beneficio más fuerte. Última: oferta y botón «Pedir ahora».
Ficha: [PEGA LA FICHA]`;

const revisar = [
  { titulo: "Datos", texto: "Compara cada dato de tu página con la ficha. Si algo no está en la ficha, bórralo o confírmalo con el proveedor." },
  { titulo: "Promesas", texto: "Nada de «cura», «garantizado» ni resultados que no puedas probar. Pon plazos de envío y devolución reales." },
  { titulo: "Reseñas", texto: "No inventes testimonios. Cuando tengas clientes reales, añade un bloque de prueba social con sus opiniones." },
  { titulo: "Normas", texto: "Revisa la normativa de tu país sobre venta online, devoluciones, aduanas y publicidad antes de lanzar anuncios." },
];

const productoBueno = [
  { titulo: "¿Se entiende en 3 segundos?", texto: "Si no puedes enseñar qué hace en un vídeo corto, será difícil de anunciar." },
  { titulo: "¿Hay margen?", texto: "Resta al precio de venta el coste del producto, el envío, las comisiones y lo que gastarás en anuncios." },
  { titulo: "¿El proveedor es de fiar?", texto: "Mira valoraciones, número de ventas y tiempos de envío. Pide una muestra y pruébala tú." },
  { titulo: "¿Resuelve algo concreto?", texto: "Un problema claro («tengo calor») se vende mejor que una lista de características." },
];

const cierre = `1. Copia la ficha del proveedor (AliExpress)
2. Pega el prompt de la página (Claude)
3. Guion del anuncio + montaje (9:16)
4. Revisa datos y promesas antes de publicar`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Claude"
        titulo="Monta tu tienda de"
        destacado="dropshipping con IA"
        resumen="De la descripción del proveedor a una <strong>página de venta</strong> y un <strong>vídeo de anuncio</strong> en minutos, con los prompts exactos del reel."
        :chips="['4 pasos', 'Gratis', 'Nivel básico']"
        :indice="indice"
        :mascota="mascota('laptop')"
      />

      <!-- 01 -->
      <GuiaPaso
        :numero="1"
        etiqueta="Elige el producto"
        titulo="Copia la ficha"
        destacado="del proveedor"
        intro="Todo parte de lo que dice tu proveedor. Entra en AliExpress, abre el producto y baja hasta <strong>Descripción</strong>. Copia el texto entero: modelo, medidas, peso, materiales, características y lista del paquete. Esa ficha es la <strong>única fuente de datos</strong> de tu página: lo que no esté ahí, no debe aparecer en tu tienda."
      >
        <GuiaNota titulo="Truco:" :mascota="mascota('senala')">
          copia también el nombre del producto y los colores o variantes. Si tienes las fotos del producto en buena calidad, guárdalas: las usarás en el paso 3.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso
        :numero="2"
        etiqueta="La página de venta"
        titulo="Una página en"
        destacado="un minuto"
        intro="En Claude (el chat normal vale). Copia, pega la ficha y envía."
      >
        <GuiaCodigo etiqueta="Prompt · Página de venta" tipo="prompt" :codigo="promptPagina" />

        <h3 class="guia-subtitulo">Versión mejorada · añade esto al final</h3>
        <GuiaCodigo etiqueta="Prompt · Sin inventar datos" tipo="prompt" :codigo="promptMejora" />

        <h3 class="guia-subtitulo">Publicarla</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta titulo="En Shopify" color="var(--g-c1)">
            Crea una página nueva, cambia el editor a «Mostrar HTML» y pega todo desde &lt;style&gt; hasta &lt;/script&gt;.
          </GuiaTarjeta>
          <GuiaTarjeta titulo="Página independiente" color="var(--g-c2)">
            Descarga el archivo .html que te da Claude y súbelo tal cual a Netlify, Hostinger u otro hosting.
          </GuiaTarjeta>
        </div>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso
        :numero="3"
        etiqueta="El vídeo de anuncio"
        titulo="Vertical, 15–20 s,"
        destacado="listo para anuncios"
        intro="Formato 9:16. Sube a Claude las fotos del producto y pídele primero el <strong>guion con los textos en pantalla</strong>. Es lo que más cuesta y lo que decide si el anuncio retiene."
      >
        <GuiaCodigo etiqueta="Prompt · Guion del anuncio" tipo="prompt" :codigo="promptVideo" />

        <p>
          Con el guion, móntalo en el editor que uses (CapCut, o con Claude Code y HyperFrames si ya trabajas con él).
          Mantén los textos en la zona central del vídeo para que la interfaz de Instagram o TikTok no los tape.
        </p>

        <GuiaNota titulo="Ejemplo del reel:" :mascota="mascota('explica')">
          «Aire HELADO en segundos» → «Cabe en tu MANO» → «Pídelo HOY». Una idea por escena, una palabra resaltada.
        </GuiaNota>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso
        :numero="4"
        etiqueta="Revisa antes de publicar"
        titulo="La IA monta la tienda;"
        destacado="la responsabilidad es tuya"
      >
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(r, n) in revisar"
            :key="r.titulo"
            :titulo="r.titulo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ r.texto }}
          </GuiaTarjeta>
        </div>

        <h3 class="guia-subtitulo">Lo que la IA no hace por ti: elegir un producto que se venda</h3>
        <p>Una página perfecta no vende un producto que nadie quiere. Antes de montar nada, pasa tu producto por esta lista:</p>
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(p, n) in productoBueno"
            :key="p.titulo"
            :titulo="p.titulo"
            suave
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ p.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Cómo usar Claude aquí:" :mascota="mascota('pensando')">
          pégale la ficha y pregúntale «¿qué problema resuelve, a quién se lo venderías y qué objeciones pondría un cliente?». Te ayuda a pensar, pero la decisión y la prueba con dinero real son tuyas.
        </GuiaNota>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Tienda lista."
        destacado="Ahora, a probar."
        texto="Antes necesitabas un diseñador y un programador. Ahora necesitas una buena ficha, un buen prompt y buen criterio."
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
