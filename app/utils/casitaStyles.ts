import type { FurnitureSlot } from '~/utils/casitaData'

/** Lo que se dibuja en cada espacio: un emoji, letras japonesas o una alfombra de color. */
export type RoomPiece = { label: string; emoji?: string; text?: string; rug?: string }

export type CasitaStyle = {
  id: string
  label: string
  emoji: string
  blurb: string
  cost: number
  /** Escenario de lujo: el doble de caro y con piezas exclusivas. */
  premium?: boolean
  wall: string
  floor: string
  items: Record<FurnitureSlot, RoomPiece>
}

export const CASITA_STYLES: CasitaStyle[] = [
  {
    id: 'kawaii', label: 'Kawaii rosa', emoji: '🎀', blurb: 'Dulce y rosita', cost: 400, wall: '#fde2ea', floor: '#f0c9d6',
    items: { wall: { label: 'Corazón', emoji: '💗' }, shelf: { label: 'Osito', emoji: '🧸' }, left: { label: 'Globos', emoji: '🎈' }, right: { label: 'Sillón', emoji: '🛋️' }, floor: { label: 'Alfombra rosa', rug: '#f4b6cd' } },
  },
  {
    id: 'bosque', label: 'Bosque', emoji: '🌲', blurb: 'Verde y tranquilo', cost: 450, wall: '#dcebd3', floor: '#b6cf9f',
    items: { wall: { label: 'Mariposas', emoji: '🦋' }, shelf: { label: 'Hongo', emoji: '🍄' }, left: { label: 'Árbol', emoji: '🌳' }, right: { label: 'Librero', emoji: '📚' }, floor: { label: 'Alfombra menta', rug: '#a9dcc3' } },
  },
  {
    id: 'oriental', label: 'Oriental', emoji: '⛩️', blurb: 'Pergamino con letras japonesas, bambú y té', cost: 900, wall: '#f1e2c8', floor: '#8a5a3c',
    items: { wall: { label: 'Pergamino 和福', text: '和福' }, shelf: { label: 'Té verde', emoji: '🍵' }, left: { label: 'Bambú', emoji: '🎋' }, right: { label: 'Torii', emoji: '⛩️' }, floor: { label: 'Tatami rojo', rug: '#c0392b' } },
  },
  {
    id: 'noche', label: 'Noche estrellada', emoji: '🌌', blurb: 'Galaxia y telescopio', cost: 600, wall: '#2f3763', floor: '#1e2445',
    items: { wall: { label: 'Galaxia', emoji: '🌌' }, shelf: { label: 'Telescopio', emoji: '🔭' }, left: { label: 'Lámpara', emoji: '💡' }, right: { label: 'Camita', emoji: '🛏️' }, floor: { label: 'Alfombra lila', rug: '#cdb8ec' } },
  },
  {
    id: 'desierto', label: 'Desierto', emoji: '🌵', blurb: 'Arena y sol', cost: 500, wall: '#f4dcb6', floor: '#d3a267',
    items: { wall: { label: 'Sol', emoji: '☀️' }, shelf: { label: 'Cactus mini', emoji: '🌵' }, left: { label: 'Cactus', emoji: '🌵' }, right: { label: 'Sillón', emoji: '🛋️' }, floor: { label: 'Alfombra terracota', rug: '#f0b98d' } },
  },
  {
    id: 'marino', label: 'Marino', emoji: '🐠', blurb: 'Mar, caracolas y velero', cost: 550, wall: '#cfeaf6', floor: '#e6d4a8',
    items: { wall: { label: 'Pecera', emoji: '🐠' }, shelf: { label: 'Caracola', emoji: '🐚' }, left: { label: 'Palmerita', emoji: '🌴' }, right: { label: 'Velero', emoji: '⛵' }, floor: { label: 'Alfombra mar', rug: '#a9dcf0' } },
  },
  {
    id: 'nordico', label: 'Nórdico', emoji: '🪵', blurb: 'Claro y minimalista', cost: 500, wall: '#eef1f4', floor: '#d2c0a6',
    items: { wall: { label: 'Ventana', emoji: '🪟' }, shelf: { label: 'Velita', emoji: '🕯️' }, left: { label: 'Plantita', emoji: '🪴' }, right: { label: 'Sillón', emoji: '🛋️' }, floor: { label: 'Alfombra nube', rug: '#dfe9f7' } },
  },
  {
    id: 'otono', label: 'Otoño', emoji: '🍂', blurb: 'Hojas y café caliente', cost: 600, wall: '#f4d3b3', floor: '#a0603a',
    items: { wall: { label: 'Hojas', emoji: '🍂' }, shelf: { label: 'Cafecito', emoji: '☕' }, left: { label: 'Maple', emoji: '🍁' }, right: { label: 'Librero', emoji: '📚' }, floor: { label: 'Alfombra ámbar', rug: '#e8a56a' } },
  },
  {
    id: 'fiesta', label: 'Fiesta', emoji: '🎉', blurb: 'Bola disco y globos', cost: 650, wall: '#fff0c9', floor: '#f1c27b',
    items: { wall: { label: 'Guirnalda', emoji: '🎏' }, shelf: { label: 'Bola disco', emoji: '🪩' }, left: { label: 'Globos', emoji: '🎈' }, right: { label: 'Piano', emoji: '🎹' }, floor: { label: 'Alfombra lila', rug: '#cdb8ec' } },
  },
  {
    id: 'lavanda', label: 'Lavanda soñada', emoji: '💜', blurb: 'Morados de ensueño', cost: 700, wall: '#e8def6', floor: '#c4b1e6',
    items: { wall: { label: 'Lunita', emoji: '🌙' }, shelf: { label: 'Cristal', emoji: '🔮' }, left: { label: 'Cerezo', emoji: '🌸' }, right: { label: 'Camita', emoji: '🛏️' }, floor: { label: 'Alfombra lila', rug: '#cdb8ec' } },
  },
  {
    id: 'sakura', label: 'Sakura', emoji: '🌸', blurb: 'Cerezos en flor y té rosado', cost: 800, wall: '#fde4ec', floor: '#e8b7c3',
    items: { wall: { label: 'Cerezo', emoji: '🌸' }, shelf: { label: 'Té rosa', emoji: '🍵' }, left: { label: 'Cerezo', emoji: '🌸' }, right: { label: 'Torii', emoji: '⛩️' }, floor: { label: 'Tatami rosa', rug: '#f4b6cd' } },
  },
  {
    id: 'calles-chinas', label: 'Calles chinas', emoji: '🏮', blurb: 'Faroles rojos y callejón de noche', cost: 850, wall: '#8c2f2f', floor: '#3d2a2a',
    items: { wall: { label: 'Cartel 福', text: '福' }, shelf: { label: 'Fideos', emoji: '🍜' }, left: { label: 'Farol', emoji: '🏮' }, right: { label: 'Dragón', emoji: '🐉' }, floor: { label: 'Alfombra roja', rug: '#c0392b' } },
  },
  {
    id: 'anime-tokyo', label: 'Anime Tokyo', emoji: '🗼', blurb: 'Ciudad anime con neón suave', cost: 800, wall: '#dfe4fb', floor: '#8f9ad6',
    items: { wall: { label: 'Torre', emoji: '🗼' }, shelf: { label: 'Onigiri', emoji: '🍙' }, left: { label: 'Manga', emoji: '📚' }, right: { label: 'Consola', emoji: '🎮' }, floor: { label: 'Alfombra celeste', rug: '#b8c4f5' } },
  },
  {
    id: 'ramen', label: 'Ramen-ya', emoji: '🍜', blurb: 'Barra de ramen con cortina noren', cost: 750, wall: '#f3e3c3', floor: '#7a4b32',
    items: { wall: { label: 'Cortina 麺', text: '麺' }, shelf: { label: 'Ramen', emoji: '🍜' }, left: { label: 'Farol', emoji: '🏮' }, right: { label: 'Sake', emoji: '🍶' }, floor: { label: 'Tatami', rug: '#d9c08f' } },
  },
  {
    id: 'izakaya', label: 'Izakaya', emoji: '🍶', blurb: 'Taberna japonesa de madera', cost: 750, wall: '#d9b98d', floor: '#6b4429',
    items: { wall: { label: 'Farol', emoji: '🏮' }, shelf: { label: 'Sake', emoji: '🍶' }, left: { label: 'Barril', emoji: '🛢️' }, right: { label: 'Pescado', emoji: '🍣' }, floor: { label: 'Alfombra madera', rug: '#b98a5e' } },
  },
  {
    id: 'templo', label: 'Templo zen', emoji: '🏯', blurb: 'Piedra, bambú y calma', cost: 700, wall: '#e7e3d3', floor: '#a7a38c',
    items: { wall: { label: 'Templo', emoji: '🏯' }, shelf: { label: 'Incienso', emoji: '🕯️' }, left: { label: 'Bambú', emoji: '🎋' }, right: { label: 'Campana', emoji: '🔔' }, floor: { label: 'Alfombra musgo', rug: '#a9c79a' } },
  },
  {
    id: 'neon', label: 'Neón nocturno', emoji: '🌃', blurb: 'Ciudad cyberpunk violeta', cost: 850, wall: '#231b3f', floor: '#141024',
    items: { wall: { label: 'Ciudad', emoji: '🌃' }, shelf: { label: 'Neón', emoji: '💡' }, left: { label: 'Robot', emoji: '🤖' }, right: { label: 'Consola', emoji: '🎮' }, floor: { label: 'Alfombra neón', rug: '#7c4dff' } },
  },
  {
    id: 'tropical', label: 'Tropical', emoji: '🏝️', blurb: 'Palmeras y colores vivos', cost: 600, wall: '#d6f2e2', floor: '#e8d3a2',
    items: { wall: { label: 'Flor', emoji: '🌺' }, shelf: { label: 'Piña', emoji: '🍍' }, left: { label: 'Palmera', emoji: '🌴' }, right: { label: 'Loro', emoji: '🦜' }, floor: { label: 'Alfombra selva', rug: '#8fd1a8' } },
  },
  {
    id: 'playa', label: 'Playa', emoji: '🏖️', blurb: 'Arena, sol y brisa', cost: 550, wall: '#cdeaf7', floor: '#f0dfb4',
    items: { wall: { label: 'Sol', emoji: '☀️' }, shelf: { label: 'Concha', emoji: '🐚' }, left: { label: 'Sombrilla', emoji: '⛱️' }, right: { label: 'Tabla surf', emoji: '🏄' }, floor: { label: 'Toalla', rug: '#f7c6a0' } },
  },
  {
    id: 'espacio', label: 'Espacial', emoji: '🚀', blurb: 'Cafetería en órbita', cost: 850, wall: '#1c2350', floor: '#10143a',
    items: { wall: { label: 'Planeta', emoji: '🪐' }, shelf: { label: 'Estrella', emoji: '⭐' }, left: { label: 'Cohete', emoji: '🚀' }, right: { label: 'Alien', emoji: '👽' }, floor: { label: 'Alfombra cósmica', rug: '#5a4fcf' } },
  },
  {
    id: 'invierno', label: 'Invierno', emoji: '⛄', blurb: 'Nieve afuera, chocolate adentro', cost: 600, wall: '#e6f0fa', floor: '#b9c9d9',
    items: { wall: { label: 'Copo', emoji: '❄️' }, shelf: { label: 'Chocolate', emoji: '☕' }, left: { label: 'Muñeco nieve', emoji: '⛄' }, right: { label: 'Chimenea', emoji: '🔥' }, floor: { label: 'Alfombra nieve', rug: '#f3f7fc' } },
  },
  {
    id: 'navidad', label: 'Navidad', emoji: '🎄', blurb: 'Luces, pino y regalos', cost: 700, wall: '#f5e1dd', floor: '#8a3b3b',
    items: { wall: { label: 'Corona', emoji: '🎄' }, shelf: { label: 'Regalo', emoji: '🎁' }, left: { label: 'Pino', emoji: '🎄' }, right: { label: 'Campana', emoji: '🔔' }, floor: { label: 'Alfombra roja', rug: '#c0392b' } },
  },
  {
    id: 'halloween', label: 'Halloween', emoji: '🎃', blurb: 'Calabazas y telarañas', cost: 700, wall: '#3a2a4d', floor: '#241a33',
    items: { wall: { label: 'Luna', emoji: '🌕' }, shelf: { label: 'Calabaza', emoji: '🎃' }, left: { label: 'Fantasma', emoji: '👻' }, right: { label: 'Telaraña', emoji: '🕸️' }, floor: { label: 'Alfombra naranja', rug: '#ff8a1f' } },
  },
  {
    id: 'pirata', label: 'Pirata', emoji: '🏴‍☠️', blurb: 'Madera de barco y tesoros', cost: 650, wall: '#c9a978', floor: '#6e4a2c',
    items: { wall: { label: 'Bandera', emoji: '🏴‍☠️' }, shelf: { label: 'Tesoro', emoji: '💰' }, left: { label: 'Ancla', emoji: '⚓' }, right: { label: 'Barco', emoji: '⛵' }, floor: { label: 'Alfombra mapa', rug: '#e0c48f' } },
  },
  {
    id: 'medieval', label: 'Medieval', emoji: '🏰', blurb: 'Castillo de piedra y antorchas', cost: 700, wall: '#b9b3a8', floor: '#6f6a60',
    items: { wall: { label: 'Escudo', emoji: '🛡️' }, shelf: { label: 'Espada', emoji: '⚔️' }, left: { label: 'Castillo', emoji: '🏰' }, right: { label: 'Dragón', emoji: '🐉' }, floor: { label: 'Alfombra real', rug: '#9a3b3b' } },
  },
  {
    id: 'hadas', label: 'Hadas', emoji: '🧚', blurb: 'Bosque brillante de cuento', cost: 700, wall: '#e3f3dc', floor: '#a7cf9e',
    items: { wall: { label: 'Hada', emoji: '🧚' }, shelf: { label: 'Hongo', emoji: '🍄' }, left: { label: 'Flor', emoji: '🌷' }, right: { label: 'Unicornio', emoji: '🦄' }, floor: { label: 'Alfombra musgo', rug: '#c9e8b8' } },
  },
  {
    id: 'sirena', label: 'Sirena', emoji: '🧜‍♀️', blurb: 'Fondo del mar y perlas', cost: 700, wall: '#c9ecf0', floor: '#8ccbd6',
    items: { wall: { label: 'Sirena', emoji: '🧜‍♀️' }, shelf: { label: 'Perla', emoji: '🦪' }, left: { label: 'Coral', emoji: '🪸' }, right: { label: 'Pez', emoji: '🐠' }, floor: { label: 'Alfombra mar', rug: '#a9dcf0' } },
  },
  {
    id: 'selva', label: 'Selva', emoji: '🦜', blurb: 'Hojas enormes y loros', cost: 600, wall: '#c5e2b0', floor: '#7a9f5f',
    items: { wall: { label: 'Loro', emoji: '🦜' }, shelf: { label: 'Banana', emoji: '🍌' }, left: { label: 'Palmera', emoji: '🌴' }, right: { label: 'Mono', emoji: '🐒' }, floor: { label: 'Alfombra hoja', rug: '#8fc27a' } },
  },
  {
    id: 'granja', label: 'Granja', emoji: '🐄', blurb: 'Establo y heno', cost: 550, wall: '#f3e0c0', floor: '#b9895a',
    items: { wall: { label: 'Granero', emoji: '🏚️' }, shelf: { label: 'Huevos', emoji: '🥚' }, left: { label: 'Vaca', emoji: '🐄' }, right: { label: 'Heno', emoji: '🌾' }, floor: { label: 'Alfombra paja', rug: '#e8c97a' } },
  },
  {
    id: 'circo', label: 'Circo', emoji: '🎪', blurb: 'Rayas rojas y carpa', cost: 650, wall: '#fbe3d9', floor: '#e2a06f',
    items: { wall: { label: 'Carpa', emoji: '🎪' }, shelf: { label: 'Payaso', emoji: '🤡' }, left: { label: 'Globos', emoji: '🎈' }, right: { label: 'Elefante', emoji: '🐘' }, floor: { label: 'Alfombra rayas', rug: '#e0413b' } },
  },
  {
    id: 'biblioteca', label: 'Biblioteca', emoji: '📖', blurb: 'Libros, madera y silencio', cost: 600, wall: '#d8bf9a', floor: '#6b4a30',
    items: { wall: { label: 'Libro', emoji: '📖' }, shelf: { label: 'Pluma', emoji: '🪶' }, left: { label: 'Librero', emoji: '📚' }, right: { label: 'Globo terráqueo', emoji: '🌍' }, floor: { label: 'Alfombra vino', rug: '#8a3b4a' } },
  },
  {
    id: 'paris', label: 'París', emoji: '🥐', blurb: 'Boulangerie y croissants', cost: 650, wall: '#f3ead9', floor: '#c6b18d',
    items: { wall: { label: 'Torre Eiffel', emoji: '🗼' }, shelf: { label: 'Croissant', emoji: '🥐' }, left: { label: 'Baguette', emoji: '🥖' }, right: { label: 'Paleta', emoji: '🎨' }, floor: { label: 'Alfombra azul', rug: '#9db8e0' } },
  },
  {
    id: 'mexicano', label: 'Mexicano', emoji: '🪅', blurb: 'Papel picado y colores de fiesta', cost: 650, wall: '#fbe0a8', floor: '#c9743f',
    items: { wall: { label: 'Papel picado', emoji: '🎏' }, shelf: { label: 'Taco', emoji: '🌮' }, left: { label: 'Cactus', emoji: '🌵' }, right: { label: 'Guitarra', emoji: '🎸' }, floor: { label: 'Alfombra fiesta', rug: '#e0457b' } },
  },
  {
    id: 'arcoiris', label: 'Arcoíris', emoji: '🌈', blurb: 'Todos los colores felices', cost: 700, wall: '#fff3d6', floor: '#d9ecff',
    items: { wall: { label: 'Arcoíris', emoji: '🌈' }, shelf: { label: 'Nube', emoji: '☁️' }, left: { label: 'Estrella', emoji: '⭐' }, right: { label: 'Unicornio', emoji: '🦄' }, floor: { label: 'Alfombra pastel', rug: '#d9c6f5' } },
  },
  {
    id: 'dulces', label: 'Dulcería', emoji: '🍭', blurb: 'Caramelo y algodón de azúcar', cost: 700, wall: '#ffe0f0', floor: '#c9f0f0',
    items: { wall: { label: 'Paleta', emoji: '🍭' }, shelf: { label: 'Cupcake', emoji: '🧁' }, left: { label: 'Helado', emoji: '🍦' }, right: { label: 'Dona', emoji: '🍩' }, floor: { label: 'Alfombra rosa', rug: '#ff9ccb' } },
  },
  {
    id: 'dia-muertos', label: 'Día de Muertos', emoji: '💀', blurb: 'Cempasúchil, catrinas y ofrenda', cost: 750, wall: '#4a2a5e', floor: '#2b1638',
    items: { wall: { label: 'Catrina', emoji: '💀' }, shelf: { label: 'Vela', emoji: '🕯️' }, left: { label: 'Cempasúchil', emoji: '🌼' }, right: { label: 'Ofrenda', emoji: '🕯️' }, floor: { label: 'Alfombra naranja', rug: '#ff8a1f' } },
  },
  {
    id: 'neo-tokio', label: 'Neo Tokio 2099', emoji: '🏙️', blurb: 'Oriental futurista con hologramas y kanji de neón', cost: 1800, premium: true, wall: '#1b1440', floor: '#0e0a26',
    items: { wall: { label: 'Holograma 未', text: '未' }, shelf: { label: 'Gato robot', emoji: '🤖' }, left: { label: 'Torre neón', emoji: '🗼' }, right: { label: 'Portal', emoji: '🌀' }, floor: { label: 'Alfombra de luz', rug: '#19e6ff' } },
  },
  {
    id: 'sakura-holo', label: 'Sakura holográfica', emoji: '🪷', blurb: 'Cerezos de luz y té en gravedad cero', cost: 1900, premium: true, wall: '#3a1d4d', floor: '#22102f',
    items: { wall: { label: 'Sakura 桜', text: '桜' }, shelf: { label: 'Loto', emoji: '🪷' }, left: { label: 'Cerezo de luz', emoji: '🌸' }, right: { label: 'Nave', emoji: '🛸' }, floor: { label: 'Alfombra de pétalos', rug: '#ff9fd2' } },
  },
  {
    id: 'dragon-neon', label: 'Dragón de neón', emoji: '🐲', blurb: 'Rojo y oro eléctrico del futuro', cost: 2000, premium: true, wall: '#3d0d14', floor: '#1f070b',
    items: { wall: { label: 'Dragón 龍', text: '龍' }, shelf: { label: 'Perla', emoji: '🔮' }, left: { label: 'Farol', emoji: '🏮' }, right: { label: 'Dragón', emoji: '🐲' }, floor: { label: 'Alfombra dorada', rug: '#ffb62e' } },
  },
  {
    id: 'orbita', label: 'Estación orbital', emoji: '🛰️', blurb: 'Café con vista a la Tierra', cost: 2100, premium: true, wall: '#0d1b3d', floor: '#070f22',
    items: { wall: { label: 'Tierra', emoji: '🌍' }, shelf: { label: 'Satélite', emoji: '🛰️' }, left: { label: 'Astronauta', emoji: '👨‍🚀' }, right: { label: 'Cohete', emoji: '🚀' }, floor: { label: 'Alfombra estelar', rug: '#6ea8ff' } },
  },
  {
    id: 'aurora', label: 'Aurora cristalina', emoji: '🌠', blurb: 'Auroras sobre hielo de cristal', cost: 2200, premium: true, wall: '#0f2f3d', floor: '#081b24',
    items: { wall: { label: 'Aurora', emoji: '🌠' }, shelf: { label: 'Cristal', emoji: '🔮' }, left: { label: 'Pino de hielo', emoji: '🌲' }, right: { label: 'Zorro ártico', emoji: '🦊' }, floor: { label: 'Alfombra aurora', rug: '#5cffb5' } },
  },
  {
    id: 'cristal', label: 'Palacio de cristal', emoji: '💎', blurb: 'Diamantes y espejos de luz', cost: 2400, premium: true, wall: '#e8f6ff', floor: '#b8dbf0',
    items: { wall: { label: 'Espejo', emoji: '🪞' }, shelf: { label: 'Diamante', emoji: '💎' }, left: { label: 'Lámpara', emoji: '🪔' }, right: { label: 'Corona', emoji: '👑' }, floor: { label: 'Alfombra cristal', rug: '#7ad7ff' } },
  },
  {
    id: 'mecanico', label: 'Taller mecánico dorado', emoji: '⚙️', blurb: 'Engranes de oro y robots', cost: 2500, premium: true, wall: '#3a2a16', floor: '#221809',
    items: { wall: { label: 'Engranes', emoji: '⚙️' }, shelf: { label: 'Reloj', emoji: '🕰️' }, left: { label: 'Robot', emoji: '🤖' }, right: { label: 'Llave', emoji: '🔧' }, floor: { label: 'Alfombra bronce', rug: '#f0b429' } },
  },
  {
    id: 'galaxia', label: 'Galaxia líquida', emoji: '🪐', blurb: 'Nebulosas y anillos de planeta', cost: 2700, premium: true, wall: '#2a1252', floor: '#170a30',
    items: { wall: { label: 'Nebulosa', emoji: '🌌' }, shelf: { label: 'Planeta', emoji: '🪐' }, left: { label: 'Cometa', emoji: '☄️' }, right: { label: 'Alien', emoji: '👽' }, floor: { label: 'Alfombra nebulosa', rug: '#c56bff' } },
  },
  {
    id: 'abismo', label: 'Abismo luminoso', emoji: '🦑', blurb: 'Océano profundo bioluminiscente', cost: 3000, premium: true, wall: '#062a3a', floor: '#031521',
    items: { wall: { label: 'Medusa', emoji: '🪼' }, shelf: { label: 'Calamar', emoji: '🦑' }, left: { label: 'Coral', emoji: '🪸' }, right: { label: 'Ballena', emoji: '🐋' }, floor: { label: 'Alfombra abismo', rug: '#2effe0' } },
  },
  {
    id: 'cuantico', label: 'Reloj cuántico', emoji: '⚛️', blurb: 'El tiempo detenido en plata y oro', cost: 3500, premium: true, wall: '#20242f', floor: '#10121a',
    items: { wall: { label: 'Tiempo 時', text: '時' }, shelf: { label: 'Reloj de arena', emoji: '⏳' }, left: { label: 'Átomo', emoji: '⚛️' }, right: { label: 'Portal', emoji: '🌀' }, floor: { label: 'Alfombra dorada', rug: '#e6c15c' } },
  },
]
