// Textos que muestra la consola (comandos ayuda, ls, cd, info...)

import { proyectos as listaProyectos } from "./proyectos.js";

const textoProyectos = listaProyectos
  .map((p) => `- **${p.nombre}** (${p.tipo})\n\n    ${p.descripcion}${p.enlace ? `\n\n    ${p.enlace}` : ""}`)
  .join("\n\n");

export const ayudainformation = {
  info: `
¡Bienvenido a la consola de comandos interactiva! 
Aquí tienes un resumen de los comandos disponibles
 para explorar mi CV:

    clear: Limpia la consola para una mejor visualización.

    ls: Lista los directorios disponibles en la consola.

    cd [directorio]: Cambia al directorio especificado 
    para acceder a información específica, por ejemplo, 
    cd educación.

    proyectos: Muestra los proyectos que he realizado.

    contacto: Muestra las diferentes formas de contacto.

    habil: Detalla mis habilidades de forma precisa.

    experiencia: Muestra un resumen de mi experiencia.

    info: Proporciona información detallada y completa.

Escribe un comando para comenzar a explorar. Por ejemplo, escribe ls 
para listar los directorios disponibles.

      
`,
};

export const directories = {
  educacion: ` 
  **Tecnología en Desarrollo de Software**

      Servicio Nacional de Aprendizaje (SENA), Bogotá, Colombia

      Graduación: cursando

 **Diplomado en Diseño Ux/Ui (Nivel Básico)**

      Universidad Nacional de Colombia, Bogotá, Colombia

      Graduación: 2023

  **Diplomado en Diseño Ux/Ui (Nivel Intermedio)**

      Universidad Nacional de Colombia, Bogotá, Colombia

      Graduación: 2023
`,
  certificados: `
**Certificaciones:**


- **Certificado de Inglés**

    - British Council, Bogotá, Colombia

    - Finalización: 2024

- **Certificado en Inteligencia Socioemocional**

    - Universidad Nacional de Colombia, Bogotá, Colombia

    - Finalización: 2024

`,
  proyectos: `
**Proyectos:**


${textoProyectos}
`,
};

export const contacto = {
  info: `


- **Email**: valenciagaandriux@gmail.com

- **Teléfono / WhatsApp**: +57 320 353 1129

- **LinkedIn**: https://www.linkedin.com/in/andress-val-89622a268/

- **Behance**: Andriux


---`,
};

export const habil = {
  info: `
**Habilidades:**

- Programación en JavaScript.

- Estilos con HTML, CSS y Tailwind CSS.

- Desarrollo de aplicaciones web con Vue y Nuxt.

- Diseño de experiencias UX/UI.

- Desarrollo de experiencias de realidad virtual.

- Conocimientos en bases de datos SQL.

- Familiaridad con metodologías ágiles.

`,
};

export const experiencia = {
  info: `
  
  
  Estoy en la etapa inicial de mi carrera en el desarrollo de software
  y ya he llevado ideas a proyectos reales:

  - Regalando Momentos, e-shop de detalles sorpresa.
  - Sitio web y photobooth para La Oveja Negra Creativa.
  - Tour 360° para Coopidrogas.
  - LoganIQ, aplicación de inventario.
  - Milion, simulador de inversión, y Toodo, app de tareas.
  - Página para Black House Studio, fundación de bailarines.

  Me motiva seguir aprendiendo, contribuir a proyectos innovadores
  y enfrentar desafíos que impulsen mi crecimiento.
  
  Escribe proyectos para ver el detalle de cada uno.
  `,
};

export const information = {
  info: `                                                        **Andres Valencia**

Tecnólogo en Desarrollo de Software · Diseñador UX/UI · Bogotá, Colombia


---


**Contacto:**

- **Email**: valenciagaandriux@gmail.com

- **Teléfono / WhatsApp**: +57 320 353 1129

- **LinkedIn**: https://www.linkedin.com/in/andress-val-89622a268/


---


**Perfil Profesional:**

Soy un desarrollador y diseñador UX/UI apasionado por crear
experiencias web, desde sitios para marcas hasta aplicaciones
y realidad virtual. Busco oportunidades para aplicar mis
habilidades y seguir aprendiendo en un entorno profesional.


---


**Educación:**

- **Tecnología en Desarrollo de Software**

    - Servicio Nacional de Aprendizaje (SENA), Bogotá, Colombia

    - Graduación: En curso

- **Diplomado en Diseño Ux/Ui (Nivel Básico)**

    - Universidad Nacional de Colombia, Bogotá, Colombia

    - Graduación: 2023

- **Diplomado en Diseño Ux/Ui (Nivel Intermedio)**

    - Universidad Nacional de Colombia, Bogotá, Colombia

    - Graduación: 2023

  ---


**Habilidades:**

- Programación en JavaScript.

- Estilos con HTML, CSS y Tailwind CSS.

- Desarrollo de aplicaciones web con Vue y Nuxt.

- Diseño de experiencias UX/UI.

- Desarrollo de experiencias de realidad virtual.

- Conocimientos en bases de datos SQL.

- Familiaridad con metodologías ágiles.


---


**Certificaciones:**


- **Certificado de Inglés**

    - British Council, Bogotá, Colombia

    - Finalización: 2024

- **Certificado en Inteligencia Socioemocional**

    - Universidad Nacional de Colombia, Bogotá, Colombia

    - Finalización: 2024


---


**Proyectos:**

${textoProyectos}


---


**Descripción Adicional:**

Estoy motivado para aprender y contribuir en un entorno profesional, 
listo para aplicar mis conocimientos en proyectos reales.`,
};

export const comandos = ["ayuda", "ls", "cd", "proyectos", "info", "contacto", "habil", "experiencia", "clear"];

export const ayudaArte = `<pre class="console-art" aria-hidden="true">
            
            
            
                █▀▀ㅤ █ ㅤ █ㅤ █ㅤ █ㅤ▀▀█▀▀ㅤㅤ█ㅤ █ㅤ █▀▀▄ 　
                ▀▀█ㅤ█▀▀█ㅤ █ㅤ █ㅤ ㅤ █ㅤㅤㅤ █ ㅤ █ㅤ █ ㅤ █ 　
                ▀▀▀ㅤ▀ ㅤ▀ㅤ ▀▀▀▀ㅤㅤ ▀ㅤㅤ ㅤ ▀▀▀▀ㅤ █▀▀ 　
                ㅤㅤㅤㅤㅤㅤ▄▀▀▄ㅤ█▀▀▄ㅤ █▀▀▄
                ㅤㅤㅤㅤㅤㅤ█▄▄█ㅤ█ ㅤ █ㅤ█ ㅤ █
                ㅤㅤㅤㅤㅤㅤ█ㅤ █ㅤ█ ㅤ █ㅤ█▄▄▀
                
                ─────███────██
                ──────████───███
                ────────████──███
                ─────────████─█████
                ████████──█████████
                ████████████████████
                ████████████████████
                █████████████████████
                █████████████████████
                █████████████████████
                ██─────██████████████
                ███────────█████████
                █──█───────────████
                █──────────────██
                ██──────────────█────────▄███████▄
                ██───███▄▄──▄▄███──────▄██$█████$██▄
                ██──█▀───▀███────█───▄██$█████████$██▄
                ██──█───█──██───█─█──█$█████████████$█
                ██──█──────██─────█──█████████████████
                ██──██────██▀█───█─────██████████████
                ─█───██████──▀████───────███████████
                ──────────────────█───────█████████
                ─────────────▀▀████──────███████████
                ────────────────█▀──────██───████▀─▀█
                ────────────────▀█──────█─────▀█▀───█
                ──▄▄▄▄▄▄▄────────██────█───████▀───██
                ─█████████████────▀█──█───███▀──▄▄██
                ─█▀██▀██▀████▀█████▀──█───██████▀─▀█
                ─█────────█▄─────────██───████▀───██
                ─██▄████▄──██────────██───██──▄▄▄██
                ──██▄▄▄▄▄██▀─────────██──█████▀───█
                ─────────███────────███████▄────███
                ────────███████─────█████████████
                ───────▄██████████████████████
                ████████─██████████████████
                ─────────██████████████
                ────────███████████
                ───────█████
                ──────████
                ─────████
                
                ㅤ ㅤ ㅤ ㅤ ㅤ ▀▀█▀▀ㅤ█▀▀█ㅤ█ㅤ▄█ㅤ█▀▀
                ㅤㅤ ㅤㅤ ㅤ ㅤㅤ█ ㅤㅤ█▄▄█ㅤ█▀▀▄ ㅤ█▀▀
                ㅤ ㅤ ㅤ ㅤ ㅤ ㅤ ▀ㅤ ㅤ▀ㅤ ▀ㅤ▀ㅤㅤ▀ㅤ▀▀▀
                
                █▀▄▀█ㅤ█ ㅤ █ㅤ ㅤ█▀▄▀█ ▄▀▀▄ █▀▀▄ █▀▀ █ ㅤ █ㅤ█
                █─▀─█ㅤ█▄▄█ㅤㅤ █─▀─█ █ ㅤ █ █ ㅤ █ █▀▀ █▄▄█ㅤ█
                █ㅤㅤ █ㅤ▄▄▄█ㅤ ㅤ█ㅤㅤ█ ─▀▀ ─ ▀ ㅤ ▀ ▀▀▀ ▄▄▄█ㅤ▄
                </pre>`;
