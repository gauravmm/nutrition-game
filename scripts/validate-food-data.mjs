import { readFile } from 'node:fs/promises'

const foods = JSON.parse(
  await readFile(new URL('../src/data/foods.json', import.meta.url), 'utf8'),
)

const macroFields = ['calories', 'carbs', 'protein', 'fat']
const requiredNutrients = [
  'iron',
  'calcium',
  'sodium',
  'potassium',
  'vitaminA',
  'vitaminC',
  'vitaminD',
  'fiber',
  'sugars',
  'saturatedFat',
  'cholesterol',
]

const errors = []
const ids = new Set()

for (const food of foods) {
  const label = food.id ?? '(missing id)'

  if (!food.id || ids.has(food.id)) errors.push(`${label}: id is missing or duplicated`)
  ids.add(food.id)

  for (const field of ['name', 'category', 'serving', 'preparation', 'researchNote']) {
    if (!food[field]) errors.push(`${label}: ${field} is required`)
  }

  for (const field of macroFields) {
    const value = food.macros?.[field]
    if (!Number.isFinite(value) || value < 0) errors.push(`${label}: macros.${field} must be a non-negative number`)
  }

  for (const field of requiredNutrients) {
    const value = food.micronutrients?.[field]
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      errors.push(`${label}: micronutrients.${field} must be a non-negative number or null`)
    }
  }

  if (!food.source?.name) errors.push(`${label}: source name is required`)
  if (!food.source?.accessed) errors.push(`${label}: source access date is required`)
  if (!food.source?.url?.startsWith('https://')) errors.push(`${label}: source must be an HTTPS URL`)
  if (food.placeholder !== 'FOOD IMAGE') errors.push(`${label}: draft visual must use the uniform FOOD IMAGE placeholder`)
  if (!Array.isArray(food.portions) || food.portions.length === 0) errors.push(`${label}: at least one portion is required`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${foods.length} foods, their nutrient fields, portions, placeholders, and source links.`)
