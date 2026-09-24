export type RecipeReq = { type: 'tasks' | 'streak' | 'level'; value: number }

export type Recipe = {
  id: string
  label: string
  emoji: string
  description: string
  req: RecipeReq
  /** Ingredientes, para la vista de detalle. */
  ingredients: string[]
}

export type CafeStats = { tasks: number; streak: number; level: number }

export const REQ_LABELS: Record<RecipeReq['type'], string> = {
  tasks: 'pedidos servidos',
  streak: 'días de racha',
  level: 'nivel del compañero',
}

export const RECIPES: Recipe[] = [
  { id: 'cafe', label: 'Café de la casa', emoji: '☕', description: 'El clásico de siempre, recién hecho.', req: { type: 'tasks', value: 0 }, ingredients: ['Café molido', 'Agua caliente', 'Un toque de azúcar'] },
  { id: 'te-verde', label: 'Té verde', emoji: '🍵', description: 'Suave y tranquilo para las mañanas.', req: { type: 'tasks', value: 3 }, ingredients: ['Hojas de té verde', 'Agua a 80 °C', 'Miel'] },
  { id: 'croissant', label: 'Croissant', emoji: '🥐', description: 'Hojaldrado y con mantequilla.', req: { type: 'tasks', value: 6 }, ingredients: ['Masa de hojaldre', 'Mantequilla', 'Huevo para dorar'] },
  { id: 'galletas', label: 'Galletas de avena', emoji: '🍪', description: 'Crujientes por fuera, tiernas por dentro.', req: { type: 'tasks', value: 10 }, ingredients: ['Avena', 'Mantequilla', 'Azúcar morena', 'Canela'] },
  { id: 'cupcake', label: 'Cupcake de vainilla', emoji: '🧁', description: 'Con crema rosa y chispitas.', req: { type: 'tasks', value: 15 }, ingredients: ['Harina', 'Vainilla', 'Crema rosa', 'Chispitas'] },
  { id: 'chocolate', label: 'Chocolate caliente', emoji: '🍫', description: 'Para quien mantiene 3 días de racha.', req: { type: 'streak', value: 3 }, ingredients: ['Leche', 'Chocolate oscuro', 'Canela'] },
  { id: 'panqueques', label: 'Panqueques', emoji: '🥞', description: 'Una torre con miel encima.', req: { type: 'tasks', value: 25 }, ingredients: ['Harina', 'Leche', 'Huevos', 'Miel'] },
  { id: 'tarta-fresa', label: 'Tarta de fresa', emoji: '🍰', description: 'La favorita de la casa.', req: { type: 'tasks', value: 35 }, ingredients: ['Fresas frescas', 'Base de galleta', 'Crema pastelera'] },
  { id: 'bubble-tea', label: 'Bubble tea', emoji: '🧋', description: 'Se desbloquea al llegar al nivel 3.', req: { type: 'level', value: 3 }, ingredients: ['Té negro', 'Leche', 'Perlas de tapioca'] },
  { id: 'donas', label: 'Donas glaseadas', emoji: '🍩', description: 'Con glaseado rosa, claro.', req: { type: 'tasks', value: 50 }, ingredients: ['Masa esponjosa', 'Glaseado rosa', 'Chispitas'] },
  { id: 'pay-manzana', label: 'Pay de manzana', emoji: '🥧', description: 'Tibio y con canela.', req: { type: 'tasks', value: 75 }, ingredients: ['Manzanas', 'Canela', 'Masa quebrada'] },
  { id: 'flan', label: 'Flan de vainilla', emoji: '🍮', description: 'Premio a una semana seguida de racha.', req: { type: 'streak', value: 7 }, ingredients: ['Leche', 'Huevos', 'Vainilla', 'Caramelo'] },
  { id: 'mochis', label: 'Mochis', emoji: '🍡', description: 'Suaves y de colores.', req: { type: 'tasks', value: 100 }, ingredients: ['Harina de arroz glutinoso', 'Azúcar', 'Relleno dulce'] },
  { id: 'pastel', label: 'Pastel de celebración', emoji: '🎂', description: 'Para celebrar el nivel 6.', req: { type: 'level', value: 6 }, ingredients: ['Bizcocho', 'Crema', 'Frutillas', 'Velitas'] },
  { id: 'helado', label: 'Helado artesanal', emoji: '🍨', description: 'Tres bolas y galleta.', req: { type: 'tasks', value: 150 }, ingredients: ['Leche', 'Crema', 'Frutas', 'Galleta'] },
  { id: 'especial', label: 'Especial del chef', emoji: '🍓', description: 'Solo para cafeteros veteranos.', req: { type: 'tasks', value: 250 }, ingredients: ['Fresas', 'Chocolate', 'Crema batida', 'Un secreto del chef'] },
]

export function recipeProgress(recipe: Recipe, stats: CafeStats) {
  const current = stats[recipe.req.type === 'tasks' ? 'tasks' : recipe.req.type]
  return {
    current: Math.min(current, recipe.req.value),
    target: recipe.req.value,
    unlocked: current >= recipe.req.value,
  }
}

const DRINK_IDS = ['cafe', 'te-verde', 'chocolate', 'bubble-tea']

export type RecipeEffect = { kind: 'food' | 'drink'; cost: number; restore: number; xp: number }

/** Efecto al dársela al compañero: las recetas más difíciles de conseguir rinden más. */
export function recipeEffect(recipe: Recipe): RecipeEffect {
  const tier = RECIPES.findIndex((r) => r.id === recipe.id)
  return {
    kind: DRINK_IDS.includes(recipe.id) ? 'drink' : 'food',
    cost: 2 + Math.floor(tier / 2),
    restore: Math.min(90, 25 + tier * 4),
    xp: 6 + tier * 3,
  }
}
