<script setup>
import { guiaPorSlug } from "~/data/creador";

// Guía: ¿Quién está usando tu Wi-Fi?
// La URL sale del nombre del archivo: /guias/wifi-intrusos
// El PDF descargable está en public/guias/wifi-intrusos.pdf.
const guia = guiaPorSlug("wifi-intrusos");
const mascota = (pose) => `/imagenes/automata/mascota-${pose}.webp`;

useHead({
  title: `${guia.titulo} · Guías · Val4ndr0x`,
  meta: [{ name: "description", content: guia.descripcion }],
});

const indice = [
  { titulo: "Antes de empezar", nota: "qué necesitas y qué cuidar" },
  { titulo: "Entra a tu router", nota: "la etiqueta y el navegador" },
  { titulo: "La lista de aparatos", nota: "cuéntalos y reconócelos" },
  { titulo: "Saca al intruso", nota: "clave nueva y puerta cerrada" },
];

const requisitos = [
  { titulo: "Celular en tu Wi-Fi", texto: "Tiene que estar conectado a tu Wi-Fi, no a los datos móviles. También sirve el portátil." },
  { titulo: "Etiqueta del router", texto: "Está debajo o detrás del router: trae la dirección (números como 192.168.1.1), el usuario y la contraseña de administración." },
  { titulo: "Lista de tu casa", texto: "Apunta qué aparatos usan el Wi-Fi en casa: celulares, tele, consola, impresora, altavoces, bombillas, cámaras." },
  { titulo: "Dos minutos", texto: "Mirar la lista es rápido. Cambiar la clave y volver a conectar tus aparatos lleva un poco más." },
];

const direccion = `192.168.1.1`;

const nombresMenu = `Dispositivos conectados · Clientes · Mapa de red · Equipos
Connected devices · Attached devices · Client list · DHCP clients`;

const nombresRaros = [
  { titulo: "Nombres raros pero tuyos", texto: "HP-7F3A suele ser la impresora; ESP_xxxx o tuya, bombillas y enchufes; LGwebOS, la tele." },
  { titulo: "Celulares con alias", texto: "Muchos móviles salen como Android-8c2e o con una «dirección privada». Mira el nombre de tu móvil en sus ajustes." },
  { titulo: "El truco del apagado", texto: "¿Dudas de uno? Apaga tus aparatos de uno en uno y recarga la lista: el que desaparece es tuyo." },
  { titulo: "El sospechoso", texto: "Si queda uno que nadie en tu casa reconoce, ese es el que te roba el Wi-Fi." },
];

const puertas = [
  { titulo: "Apaga el WPS", texto: "El botón de «conectar sin clave» es una puerta trasera fácil." },
  { titulo: "Clave de admin", texto: "Cambia la de la etiqueta por una propia." },
  { titulo: "Red de invitados", texto: "Para las visitas: no ven tus aparatos." },
  { titulo: "Actualiza el router", texto: "El firmware nuevo corrige fallos de seguridad." },
];

const promptIA = `Esta es la lista de aparatos conectados a mi Wi-Fi: [pega la lista o una captura]. En casa tenemos [tus aparatos]. Dime qué es cada uno y márcame los que no encajen.`;

const cierre = `1. Dale la vuelta al router: dirección, usuario y contraseña
2. Escribe la dirección en el navegador del celular
3. Busca «Dispositivos conectados» y cuéntalos
4. Reconoce cada uno (apaga y recarga si dudas)
5. Contraseña nueva (WPA2/WPA3, 12+ caracteres) y WPS apagado`;
</script>

<template>
  <MarcoGuias>
    <article class="guia-doc" :style="{ '--g-tono': guia.tono }">
      <a href="/guias" class="guia-volver solo-pantalla"><IconoLinea nombre="flecha" />Todas las guías</a>

      <GuiaPortada
        etiqueta="Guía gratuita · Wi-Fi"
        titulo="¿Quién está"
        destacado="usando tu Wi-Fi?"
        resumen="El paso a paso del reel: entra a tu router, mira la <strong>lista de aparatos conectados</strong>, encuentra al que no es de tu casa y <strong>sácalo para siempre</strong>. Sin instalar nada."
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
        intro="Tu router es como el portero de un edificio: apunta cada aparato que entra. Solo tienes que pedirle la lista. Se hace desde el navegador del celular en un par de minutos."
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
          hazlo únicamente en el router que es tuyo (o con permiso de quien lo paga). Entrar en redes ajenas no es buena idea y puede ser ilegal.
        </GuiaNota>
        <GuiaNota titulo="Dos claves distintas:" :mascota="mascota('explica')">
          la de la etiqueta sirve para entrar al router (<strong>administración</strong>). La del Wi-Fi es la que usas para conectar el celular. Esta guía te hace cambiar las dos.
        </GuiaNota>
        <GuiaNota titulo="¿Wi-Fi lento?" :mascota="mascota('idea')">
          no siempre es culpa de tu compañía de internet. Un aparato de más descargando o viendo vídeos en tu red se nota. Antes de llamar al operador, revisa la lista.
        </GuiaNota>
      </GuiaPaso>

      <!-- 02 -->
      <GuiaPaso
        :numero="2"
        etiqueta="Entra a tu router"
        titulo="Dale la vuelta"
        destacado="al router"
        intro="En la etiqueta hay una <strong>dirección con números</strong>, un <strong>usuario</strong> y una <strong>contraseña</strong>. Hazle una foto para tenerla a mano."
      >
        <p>
          La dirección suele ser <strong>192.168.1.1</strong>, <strong>192.168.0.1</strong> o <strong>10.0.0.1</strong> (a veces es una web, como tplinkwifi.net). El usuario muchas veces es <strong>admin</strong>.
        </p>

        <h3 class="guia-subtitulo">Escríbela en el navegador</h3>
        <p>
          Abre Chrome o Safari en el celular conectado a tu Wi-Fi, escribe la dirección en la barra de arriba <strong>sin «www»</strong> y entra con los datos de la etiqueta. Si sale un aviso de «conexión no segura», es normal en la página del router: pulsa <strong>Avanzado → Continuar</strong>.
        </p>
        <GuiaCodigo etiqueta="Barra del navegador" :codigo="direccion" />

        <GuiaNota titulo="¿No te sale la página?" :mascota="mascota('teclea')">
          muchos operadores tienen su propia <strong>app del router</strong> (busca el nombre de tu compañía en la tienda de apps) y ahí también está la lista. Para ver la dirección exacta, en el celular ve a <strong>Ajustes → Wi-Fi → tu red → Router</strong> (o «Puerta de enlace»).
        </GuiaNota>
      </GuiaPaso>

      <!-- 03 -->
      <GuiaPaso
        :numero="3"
        etiqueta="La lista de aparatos"
        titulo="Busca «dispositivos"
        destacado="conectados»"
        intro="Ahí está la lista: tu celular, la tele, la consola… <strong>Cuéntalos</strong> y compáralos con los aparatos de tu casa. Cada router llama a esa sección de una forma; suele estar en la portada o dentro de «Red», «LAN», «Wi-Fi» o «Estado»."
      >
        <GuiaCodigo etiqueta="Cómo puede llamarse" :codigo="nombresMenu" />

        <h3 class="guia-subtitulo">Reconoce cada aparato</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(a, n) in nombresRaros"
            :key="a.titulo"
            :titulo="a.titulo"
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ a.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Pista extra:" :mascota="mascota('pensando')">
          muchas listas muestran el <strong>fabricante</strong> o la <strong>dirección MAC</strong>. Si pegas la MAC en un buscador de fabricantes, sabrás si es un Samsung, un Xiaomi o una cámara.
        </GuiaNota>

        <h3 class="guia-subtitulo">Bonus: que la IA te traduzca la lista</h3>
        <GuiaCodigo etiqueta="Prompt · Para Claude o tu IA favorita" tipo="prompt" :codigo="promptIA" />
        <p>Pégalo con una captura de la lista. Antes de compartir la captura, tapa las contraseñas si salen.</p>
      </GuiaPaso>

      <!-- 04 -->
      <GuiaPaso
        :numero="4"
        etiqueta="Saca al intruso"
        titulo="Clave nueva ="
        destacado="todos fuera"
        intro="Cambia la contraseña del Wi-Fi y el que no la sepa se queda fuera."
      >
        <div class="guia-rutina">
          <img :src="mascota('senala')" alt="" class="guia-mascota" loading="lazy" decoding="async" />
          <div>
            <h3 class="guia-subtitulo">Paso a paso</h3>
            <ol>
              <li>En el router entra en <strong>Wi-Fi → Seguridad</strong> (o «Inalámbrico»).</li>
              <li>Elige <strong>WPA2</strong> o <strong>WPA3</strong> (nunca «WEP» ni «abierta»).</li>
              <li>Pon una <strong>contraseña nueva y larga</strong>: 12 caracteres o más. Una frase sirve, como MiPerroComeMango_27.</li>
              <li><strong>Guarda</strong>. Todos los aparatos se desconectan: vuelve a conectar los tuyos con la clave nueva.</li>
            </ol>
          </div>
        </div>

        <h3 class="guia-subtitulo">Cierra también estas puertas</h3>
        <div class="guia-rejilla">
          <GuiaTarjeta
            v-for="(p, n) in puertas"
            :key="p.titulo"
            :titulo="p.titulo"
            suave
            :color="`var(--g-c${(n % 4) + 1})`"
          >
            {{ p.texto }}
          </GuiaTarjeta>
        </div>

        <GuiaNota titulo="Bloquear no basta:" :mascota="mascota('pulgar')">
          si solo bloqueas el aparato, el intruso puede volver con otro distinto. Lo que de verdad lo saca es cambiar la contraseña del Wi-Fi.
        </GuiaNota>
      </GuiaPaso>

      <GuiaDescarga
        titulo="Revísalo"
        destacado="cada mes."
        texto="Y si algún día vuelve a ir lento, pregúntate: ¿quién más está en mi Wi-Fi? Si encuentras un intruso, cuéntamelo en comentarios."
        :archivo="guia.archivo"
        :mascota="mascota('celebra')"
      >
        <GuiaCodigo etiqueta="Resumen" :codigo="cierre" />
        <p class="guia-firma">Más trucos de tecnología en → <strong>@automata.ofi</strong></p>
      </GuiaDescarga>

      <GuiaAutor />
    </article>
  </MarcoGuias>
</template>
