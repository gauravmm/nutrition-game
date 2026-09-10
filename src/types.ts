export type MacroNutrients = {
  calories: number
  carbs: number
  protein: number
  fat: number
}

export type Portion = {
  id: string
  label: string
  multiplier: number
}

export type Food = {
  id: string
  name: string
  category: string
  serving: string
  preparation?: string
  placeholder?: string
  macros: MacroNutrients
  micronutrients: Record<string, number | null>
  source: { name: string; url: string; accessed?: string }
  researchNote?: string
  portions?: Portion[]
}

export type PlateItem = {
  instanceId: string
  food: Food
  portion: Portion
}
