import { DragEvent, KeyboardEvent, useMemo, useRef, useState } from 'react'
import foodsJson from './data/foods.json'
import type { Food, MacroNutrients, PlateItem, Portion } from './types'

const foods = foodsJson as Food[]
const defaultPortion = (food: Food): Portion => food.portions?.[0] ?? { id: 'one', label: food.serving, multiplier: 1 }
const multiply = (macros: MacroNutrients, multiplier: number): MacroNutrients => ({ calories: macros.calories * multiplier, carbs: macros.carbs * multiplier, protein: macros.protein * multiplier, fat: macros.fat * multiplier })
const calculateMeal = (items: PlateItem[]): MacroNutrients => items.reduce((total, item) => { const value = multiply(item.food.macros, item.portion.multiplier); return { calories: total.calories + value.calories, carbs: total.carbs + value.carbs, protein: total.protein + value.protein, fat: total.fat + value.fat } }, { calories: 0, carbs: 0, protein: 0, fat: 0 })
const rounded = (value: number) => Math.round(value)
const calculateNutrient = (items: PlateItem[], nutrient: string): number | null => {
  let total = 0
  for (const item of items) {
    const value = item.food.micronutrients[nutrient]
    if (value === null || value === undefined) return null
    total += value * item.portion.multiplier
  }
  return total
}
const slug = (value: string) => value.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
const label = (value: string) => value.replace(/-/g, ' ').replace(/^./, (letter) => letter.toUpperCase())

type Verdict = {
  tone: 'balanced' | 'nearly' | 'adjust'
  title: string
  message: string
  findings: string[]
}

function assessMeal(total: MacroNutrients): Verdict {
  const macroEnergy = total.carbs * 4 + total.protein * 4 + total.fat * 9
  if (macroEnergy === 0) return { tone: 'adjust', title: 'Choose a few foods first', message: '', findings: [] }
  const proteinShare = (total.protein * 4 * 100) / macroEnergy
  const fatShare = (total.fat * 9 * 100) / macroEnergy
  const carbsShare = (total.carbs * 4 * 100) / macroEnergy
  const findings = [
    proteinShare < 20 ? 'Protein is below the 20–30% guide range. Consider adding a protein source.' : proteinShare > 30 ? 'Protein is above the 20–30% guide range. Try varying the mix of foods on your plate.' : null,
    fatShare < 20 ? 'Fat is below the 20–30% guide range. Try varying the mix of foods on your plate.' : fatShare > 30 ? 'Fat is above the 20–30% guide range. Consider a smaller portion of a higher-fat item.' : null,
    carbsShare < 45 ? 'Carbohydrate is below the 45–65% guide range. Try varying the mix of foods on your plate.' : carbsShare > 65 ? 'Carbohydrate is above the 45–65% guide range. Try varying the mix of foods on your plate.' : null,
  ].filter((finding): finding is string => finding !== null)
  if (findings.length === 0) {
    return { tone: 'balanced', title: 'Balanced for this activity', message: 'Your macronutrient mix sits in this activity’s guide ranges. One meal is only one part of an overall diet.', findings }
  }
  if (findings.length === 1) {
    return { tone: 'nearly', title: 'Close — try one small change', message: 'One meal is only one part of an overall diet.', findings }
  }
  return { tone: 'adjust', title: 'Try adjusting your meal', message: 'Try changing a portion or adding a different kind of food, then check again. One meal is only one part of an overall diet.', findings }
}

function MacroBar({ total }: { total: MacroNutrients }) {
  const energy = total.carbs * 4 + total.protein * 4 + total.fat * 9
  const macros = [{ key: 'carbs', label: 'Carbohydrate', grams: total.carbs, energy: total.carbs * 4 }, { key: 'protein', label: 'Protein', grams: total.protein, energy: total.protein * 4 }, { key: 'fat', label: 'Fat', grams: total.fat, energy: total.fat * 9 }]
  return <>
    <div className="macro-bar" aria-label="Macronutrient composition">{macros.map((macro) => <span className={`macro-${macro.key}`} key={macro.key} style={{ width: `${energy ? macro.energy / energy * 100 : 0}%` }} />)}</div>
    <dl className="macro-key">{macros.map((macro) => <div key={macro.key}><i className={`macro-${macro.key}`} aria-hidden="true" /><dt>{macro.label}</dt><dd>{rounded(macro.grams)} g · {rounded(macro.energy / energy * 100)}% of energy</dd></div>)}</dl>
  </>
}

function NutrientTracker({ items, totalFat }: { items: PlateItem[]; totalFat: number }) {
  const saturatedFat = calculateNutrient(items, 'saturatedFat')
  const sodium = calculateNutrient(items, 'sodium')
  const saturatedFatShare = saturatedFat === null ? null : totalFat > 0 ? (saturatedFat * 100) / totalFat : 0
  const sodiumDailyShare = sodium === null ? null : (sodium * 100) / 2000

  return <section className="nutrient-tracker" aria-labelledby="nutrient-tracker-title">
    <div className="tracker-heading"><h3 id="nutrient-tracker-title">Nutrition guide tracker</h3><span>For this meal</span></div>
    <dl>
      <div className={saturatedFatShare !== null && saturatedFatShare > (100 / 3) ? 'is-over' : ''}>
        <dt>Saturated fat</dt>
        <dd>{saturatedFat === null || saturatedFatShare === null ? <><strong>Unavailable</strong><span>Data is missing for a selected food</span></> : <><strong>{saturatedFat.toFixed(1)} g</strong><span>{rounded(saturatedFatShare)}% of total fat</span><em>{saturatedFatShare > (100 / 3) ? 'Above ⅓ of total fat' : 'Within ⅓ of total fat'}</em></>}</dd>
      </div>
      <div className={sodiumDailyShare !== null && sodiumDailyShare > 100 ? 'is-over' : ''}>
        <dt>Sodium</dt>
        <dd>{sodium === null || sodiumDailyShare === null ? <><strong>Unavailable</strong><span>Data is missing for a selected food</span></> : <><strong>{rounded(sodium)} mg</strong><span>{rounded(sodiumDailyShare)}% of 2,000 mg daily reference</span><em>{sodiumDailyShare > 100 ? 'Above daily reference' : 'Within daily reference'}</em></>}</dd>
      </div>
    </dl>
  </section>
}

export default function App() {
  const categories = useMemo(() => [...new Set(foods.map((food) => food.category))], [])
  const featured = useMemo(() => ['chicken-breast', 'brown-rice', 'broccoli', 'sweet-potato', 'banana', 'egg-hard-boiled'].map((id) => foods.find((food) => food.id === id)).filter((food): food is Food => Boolean(food)), [])
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '')
  const [portions, setPortions] = useState<Record<string, string>>({})
  const [plate, setPlate] = useState<PlateItem[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [lastChecked, setLastChecked] = useState<MacroNutrients | null>(null)
  const [previous, setPrevious] = useState<MacroNutrients | null>(null)
  const [liveMessage, setLiveMessage] = useState('Your plate is empty. Add a food to begin.')
  const [isDragging, setIsDragging] = useState(false)
  const [allFoodsOpen, setAllFoodsOpen] = useState(false)
  const allFoodsRef = useRef<HTMLDetailsElement>(null)
  const total = useMemo(() => calculateMeal(plate), [plate])
  const ribbonCategories = categories.slice(0, 5)
  const verdict = assessMeal(total)
  const chosenPortion = (food: Food) => food.portions?.find((portion) => portion.id === portions[food.id]) ?? defaultPortion(food)

  const addFood = (food: Food, portion = chosenPortion(food)) => { setPlate((current) => [...current, { instanceId: `${food.id}-${crypto.randomUUID()}`, food, portion }]); setSubmitted(false); setLiveMessage(`${food.name} added to your plate.`) }
  const removeItem = (instanceId: string) => { const item = plate.find((entry) => entry.instanceId === instanceId); setPlate((current) => current.filter((entry) => entry.instanceId !== instanceId)); setSubmitted(false); setLiveMessage(`${item?.food.name ?? 'Food'} removed from your plate.`) }
  const updatePortion = (instanceId: string, portionId: string) => { setPlate((current) => current.map((item) => item.instanceId === instanceId ? { ...item, portion: item.food.portions?.find((portion) => portion.id === portionId) ?? item.portion } : item)); setSubmitted(false); setLiveMessage('Portion changed. Check your updated meal.') }
  const handleDrop = (event: DragEvent<HTMLElement>) => { event.preventDefault(); setIsDragging(false); const food = foods.find((item) => item.id === event.dataTransfer.getData('text/food-id')); if (food) addFood(food); else setLiveMessage('That food could not be added here.') }
  const checkMeal = () => { if (!plate.length) return; if (lastChecked) setPrevious(lastChecked); setLastChecked(total); setSubmitted(true); setLiveMessage(`Meal checked. Your total is ${rounded(total.calories)} calories.`) }
  const startOver = () => { if (plate.length && !window.confirm('Clear everything from your plate?')) return; setPlate([]); setSubmitted(false); setLastChecked(null); setPrevious(null); setLiveMessage('Your plate is clear. Build a new meal.') }
  const jumpToCategory = (category: string) => { setActiveCategory(category); setAllFoodsOpen(true); window.setTimeout(() => document.getElementById(`food-section-${slug(category)}`)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }), 0) }
  const moveTab = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return; event.preventDefault(); const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? ribbonCategories.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + ribbonCategories.length) % ribbonCategories.length; const next = ribbonCategories[nextIndex]; jumpToCategory(next); document.getElementById(`category-jump-${slug(next)}`)?.focus() }
  const dragProps = (food: Food) => ({ draggable: true, onDragStart: (event: DragEvent<HTMLElement>) => { event.dataTransfer.setData('text/food-id', food.id); setIsDragging(true); setLiveMessage(`Moving ${food.name}. Drop on the plate, or use Add.`) }, onDragEnd: () => setIsDragging(false) })

  return <div className="app-shell">
    <div className="step-ribbon"><span>07</span><strong>Top ingredient ribbon</strong></div>
    <header className="topbar"><a className="brand" href="./" aria-label="Meal Mixer home"><span className="brand-mark">M</span><strong>Meal Mixer</strong></a><p>What will you put together?</p><button className="quiet-button" onClick={startOver} type="button">Start over</button></header>
    <main>
      <section className="food-browser" aria-label="Choose an ingredient">
        <nav className="tabs" role="tablist" aria-label="Food categories">{ribbonCategories.map((category, index) => <a key={category} id={`category-jump-${slug(category)}`} role="tab" aria-selected={category === activeCategory} aria-controls={`food-section-${slug(category)}`} href={`#food-section-${slug(category)}`} className={category === activeCategory ? 'active' : ''} onKeyDown={(event) => moveTab(event, index)} onClick={(event) => { event.preventDefault(); jumpToCategory(category) }}>{label(category)}</a>)}</nav>
        <div className="food-ribbon" aria-label="Top ingredients">{featured.map((food) => <article className="ribbon-food" key={food.id} {...dragProps(food)}><button type="button" onClick={() => addFood(food)} aria-label={`Add ${food.name} to plate`}><span className="food-placeholder" aria-hidden="true">FOOD IMAGE</span><strong>{food.name}</strong></button></article>)}</div>
      </section>

      <div className="workspace">
        <section className="plate-workspace" aria-labelledby="plate-title"><h2 id="plate-title" className="sr-only">Your plate</h2>
          <div className={`plate-zone ${isDragging ? 'is-dragging' : ''}`} onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} aria-label={`Your meal plate. ${plate.length} foods selected. Drop food here, or use Add buttons.`}><span className="botanical botanical-left" aria-hidden="true" /><span className="botanical botanical-right" aria-hidden="true" /><span className="botanical botanical-bottom" aria-hidden="true" /><div className="plate-rim"><div className="plate">{plate.length === 0 ? <div className="empty-plate"><span>↓</span><p>Drag foods here<br />or click ingredients above</p></div> : <ul className="plate-items" aria-label="Foods on your plate">{plate.map((item) => <li className="plate-item" key={item.instanceId}><span className="plate-token" aria-hidden="true">FOOD</span><div><strong>{item.food.name}</strong><label><span className="sr-only">Portion for {item.food.name}</span><select value={item.portion.id} onChange={(event) => updatePortion(item.instanceId, event.target.value)}>{(item.food.portions ?? [defaultPortion(item.food)]).map((portion) => <option value={portion.id} key={portion.id}>{portion.label}</option>)}</select></label></div><button className="remove-button" type="button" onClick={() => removeItem(item.instanceId)} aria-label={`Remove ${item.food.name}`}>×</button></li>)}</ul>}</div></div></div>
          <div className="plate-footer"><span>{plate.length ? `${plate.length} ${plate.length === 1 ? 'food' : 'foods'} selected` : 'Your plate is ready'}</span><span className="plate-hint">Nutrition stays hidden until you check your meal.</span></div>
        </section>

        <aside className={`result-panel ${submitted ? 'is-revealed' : ''}`} aria-labelledby="results-title"><h2 id="results-title">Your meal</h2>{!submitted ? <div className="hidden-results"><span className="secret-mark" aria-hidden="true">?</span><h3>{lastChecked ? 'Your meal changed' : 'Keep building'}</h3><p>{lastChecked ? 'Check again to reveal updated nutrition.' : 'When you’re ready, check your meal to reveal its energy and macronutrients.'}</p></div> : <div className="results-content"><div className="calorie-total"><span>Total energy</span><strong>{rounded(total.calories)}</strong><em>kcal</em></div><MacroBar total={total} /><NutrientTracker items={plate} totalFat={total.fat} /><div className={`verdict ${verdict.tone}`}><span aria-hidden="true">{verdict.tone === 'balanced' ? '✦' : verdict.tone === 'nearly' ? '↗' : '↺'}</span><div><h3>{verdict.title}</h3>{verdict.findings.length > 0 && <ul className="verdict-findings">{verdict.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>}<p>{verdict.message}</p></div></div><details className="contributions"><summary>Food contributions and sources</summary><ul>{plate.map((item) => { const itemTotal = multiply(item.food.macros, item.portion.multiplier); return <li key={item.instanceId}><span>{item.food.name} · {item.portion.label}</span><strong>{rounded(itemTotal.calories)} kcal</strong><small>{rounded(itemTotal.carbs)} g carbs · {rounded(itemTotal.protein)} g protein · {rounded(itemTotal.fat)} g fat</small><a href={item.food.source.url} target="_blank" rel="noreferrer">{item.food.source.name} ↗<span className="sr-only"> (opens in a new tab)</span></a></li> })}</ul><p>Sources describe the specific serving used. Values can vary by recipe and preparation.</p></details>{previous && <p className="previous-check">Previous check: {rounded(previous.calories)} kcal</p>}<button className="retry-button" onClick={() => setSubmitted(false)} type="button">Adjust and check again</button></div>}<button className="check-button" onClick={checkMeal} disabled={!plate.length} type="button">Check my meal <span aria-hidden="true">→</span></button></aside>
      </div>

      <details className="all-foods" ref={allFoodsRef} open={allFoodsOpen} onToggle={(event) => setAllFoodsOpen(event.currentTarget.open)}><summary>Browse all foods</summary><div className="food-list" aria-label="All food categories">{categories.map((category) => <section className="category-section" id={`food-section-${slug(category)}`} aria-labelledby={`food-heading-${slug(category)}`} key={category}><h3 className="category-heading" id={`food-heading-${slug(category)}`}>{label(category)}</h3><div className="category-foods">{foods.filter((food) => food.category === category).map((food) => <article className="food-tile" key={food.id} {...dragProps(food)}><span className="food-placeholder" aria-hidden="true">FOOD IMAGE</span><div className="food-copy"><h4>{food.name}</h4><p>{food.preparation ?? food.serving}</p>{food.portions && food.portions.length > 1 && <label className="select-label">Portion<select value={chosenPortion(food).id} onChange={(event) => setPortions((current) => ({ ...current, [food.id]: event.target.value }))}>{food.portions.map((portion) => <option key={portion.id} value={portion.id}>{portion.label}</option>)}</select></label>}</div><button className="add-button" onClick={() => addFood(food)} type="button" aria-label={`Add ${food.name} to plate`}>Add <span aria-hidden="true">+</span></button></article>)}</div></section>)}</div></details>
    </main>
    <p className="sr-only" aria-live="polite">{liveMessage}</p><footer>This is a learning activity, not medical advice. Nutrition values vary by recipe and serving.</footer>
  </div>
}
