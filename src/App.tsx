import { DragEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import foodsJson from './data/foods.json'
import type { Food, MacroNutrients, PlateItem, Portion } from './types'

const foods = foodsJson as Food[]

const defaultPortion = (food: Food): Portion =>
  food.portions?.[0] ?? { id: 'one', label: food.serving, multiplier: 1 }

const multiply = (macros: MacroNutrients, multiplier: number): MacroNutrients => ({
  calories: macros.calories * multiplier,
  carbs: macros.carbs * multiplier,
  protein: macros.protein * multiplier,
  fat: macros.fat * multiplier,
})

const calculateMeal = (items: PlateItem[]): MacroNutrients =>
  items.reduce(
    (total, item) => {
      const itemMacros = multiply(item.food.macros, item.portion.multiplier)
      return {
        calories: total.calories + itemMacros.calories,
        carbs: total.carbs + itemMacros.carbs,
        protein: total.protein + itemMacros.protein,
        fat: total.fat + itemMacros.fat,
      }
    },
    { calories: 0, carbs: 0, protein: 0, fat: 0 },
  )

const calculateNutrient = (items: PlateItem[], nutrient: string): number | null => {
  let total = 0
  for (const item of items) {
    const value = item.food.micronutrients[nutrient]
    if (value === null || value === undefined) return null
    total += value * item.portion.multiplier
  }
  return total
}

const rounded = (value: number) => Math.round(value)
const categorySlug = (category: string) => category.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
const categoryLabel = (category: string) => category.replace(/-/g, ' ').replace(/^./, (letter) => letter.toUpperCase())

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
  const macroEnergy = total.carbs * 4 + total.protein * 4 + total.fat * 9
  const macros = [
    { key: 'carbs', label: 'Carbohydrate', grams: total.carbs, energy: total.carbs * 4 },
    { key: 'protein', label: 'Protein', grams: total.protein, energy: total.protein * 4 },
    { key: 'fat', label: 'Fat', grams: total.fat, energy: total.fat * 9 },
  ]
  return <>
    <div className="macro-bar" aria-label="Macronutrient composition">
      {macros.map((macro) => <span className={`macro-${macro.key}`} key={macro.key} style={{ width: `${macroEnergy ? (macro.energy / macroEnergy) * 100 : 0}%` }} />)}
    </div>
    <dl className="macro-key">
      {macros.map((macro) => <div key={macro.key}><i className={`macro-${macro.key}`} aria-hidden="true" /><dt>{macro.label}</dt><dd>{rounded(macro.grams)} g · {rounded((macro.energy / macroEnergy) * 100)}% of energy</dd></div>)}
    </dl>
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
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? '')
  const [portions, setPortions] = useState<Record<string, string>>({})
  const [plate, setPlate] = useState<PlateItem[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [lastChecked, setLastChecked] = useState<MacroNutrients | null>(null)
  const [previous, setPrevious] = useState<MacroNutrients | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const foodMenuRef = useRef<HTMLDivElement>(null)
  const foodTabsRef = useRef<HTMLElement>(null)

  const total = useMemo(() => calculateMeal(plate), [plate])
  const chosenPortion = (food: Food) => food.portions?.find((portion) => portion.id === portions[food.id]) ?? defaultPortion(food)

  useEffect(() => {
    const anchor = document.getElementById(`category-jump-${categorySlug(activeCategory)}`)
    const tabs = foodTabsRef.current
    if (!anchor || !tabs) return

    const leftEdge = anchor.offsetLeft
    const rightEdge = leftEdge + anchor.offsetWidth
    const visibleLeft = tabs.scrollLeft
    const visibleRight = visibleLeft + tabs.clientWidth
    if (leftEdge < visibleLeft || rightEdge > visibleRight) {
      tabs.scrollTo({
        left: leftEdge < visibleLeft ? leftEdge : rightEdge - tabs.clientWidth,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }
  }, [activeCategory])

  const addFood = (food: Food, portion = chosenPortion(food)) => {
    setPlate((current) => [...current, { instanceId: `${food.id}-${crypto.randomUUID()}`, food, portion }])
    setSubmitted(false)
    setLiveMessage(`${food.name} added to your plate.`)
  }

  const removeItem = (instanceId: string) => {
    const item = plate.find((entry) => entry.instanceId === instanceId)
    setPlate((current) => current.filter((entry) => entry.instanceId !== instanceId))
    setSubmitted(false)
    setLiveMessage(`${item?.food.name ?? 'Food'} removed from your plate.`)
  }

  const updateItemPortion = (instanceId: string, portionId: string) => {
    setPlate((current) => current.map((item) => {
      if (item.instanceId !== instanceId) return item
      return { ...item, portion: item.food.portions?.find((portion) => portion.id === portionId) ?? item.portion }
    }))
    setSubmitted(false)
    setLiveMessage('Portion changed. Check your meal again when you are ready.')
  }

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const food = foods.find((item) => item.id === event.dataTransfer.getData('text/food-id'))
    if (food) addFood(food)
  }

  const checkMeal = () => {
    if (!plate.length) return
    if (lastChecked) setPrevious(lastChecked)
    setLastChecked(total)
    setSubmitted(true)
    setLiveMessage('Your meal nutrition has been revealed.')
  }

  const startOver = () => {
    if (plate.length > 0 && !window.confirm('Clear everything from your plate?')) return
    setPlate([])
    setSubmitted(false)
    setLastChecked(null)
    setPrevious(null)
    setLiveMessage('Your plate is clear. Build a new meal.')
  }

  const verdict = assessMeal(total)

  const jumpToCategory = (category: string) => {
    const menu = foodMenuRef.current
    const section = document.getElementById(`food-section-${categorySlug(category)}`)
    if (!menu || !section) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    menu.scrollTo({
      top: section.offsetTop - 8,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
    setActiveCategory(category)
  }

  const syncCategoryToScroll = () => {
    const menu = foodMenuRef.current
    if (!menu) return

    const marker = menu.scrollTop + 28
    let visibleCategory = categories[0] ?? ''
    for (const category of categories) {
      const section = document.getElementById(`food-section-${categorySlug(category)}`)
      if (section && section.offsetTop <= marker) visibleCategory = category
    }
    if (menu.scrollTop + menu.clientHeight >= menu.scrollHeight - 2) {
      visibleCategory = categories[categories.length - 1] ?? visibleCategory
    }
    setActiveCategory(visibleCategory)
  }

  const moveTab = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? categories.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + categories.length) % categories.length
    const next = categories[nextIndex]
    jumpToCategory(next)
    document.getElementById(`category-jump-${categorySlug(next)}`)?.focus()
  }

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="./" aria-label="Meal Mixer home"><span className="brand-mark">M</span>Meal Mixer</a>
      <p>What will you put together?</p>
      <button className="quiet-button" onClick={startOver} type="button">Start over</button>
    </header>

    <main>
      <div className="game-layout">
        <aside className="food-browser" aria-label="Food browser">
          <div className="section-heading"><p className="eyebrow">01 · Choose</p><h2>Food shelf</h2></div>
          <nav className="tabs" ref={foodTabsRef} aria-label="Jump to a food category">
            {categories.map((category, index) => <a key={category} id={`category-jump-${categorySlug(category)}`} href={`#food-section-${categorySlug(category)}`} aria-current={category === activeCategory ? 'location' : undefined} className={category === activeCategory ? 'active' : ''} onKeyDown={(event) => moveTab(event, index)} onClick={(event) => { event.preventDefault(); jumpToCategory(category) }}>{categoryLabel(category)}</a>)}
          </nav>
          <div className="food-menu" ref={foodMenuRef} onScroll={syncCategoryToScroll}>
            <div className="food-list" aria-label="All food categories">
              {categories.map((category) => <section className="category-section" id={`food-section-${categorySlug(category)}`} aria-labelledby={`food-heading-${categorySlug(category)}`} key={category}>
                <h3 className="category-heading" id={`food-heading-${categorySlug(category)}`}>{categoryLabel(category)}</h3>
                <div className="category-foods">
                  {foods.filter((food) => food.category === category).map((food) => <article className="food-tile" key={food.id} draggable onDragStart={(event) => { event.dataTransfer.setData('text/food-id', food.id); setIsDragging(true) }} onDragEnd={() => setIsDragging(false)}>
                    <div className="food-placeholder" aria-hidden="true">{food.placeholder ?? 'Food image'}</div>
                    <div className="food-copy"><h4>{food.name}</h4><p>{food.preparation ?? food.serving}</p>
                      {food.portions && food.portions.length > 1 && <label className="select-label">Portion<select value={chosenPortion(food).id} onChange={(event) => setPortions((current) => ({ ...current, [food.id]: event.target.value }))}>{food.portions.map((portion) => <option key={portion.id} value={portion.id}>{portion.label}</option>)}</select></label>}
                    </div>
                    <button className="add-button" onClick={() => addFood(food)} type="button" aria-label={`Add ${food.name} to plate`}>Add<span aria-hidden="true"> +</span></button>
                  </article>)}
                </div>
              </section>)}
            </div>
          </div>
        </aside>

        <section className="plate-workspace" aria-labelledby="plate-title">
          <div className="section-heading"><p className="eyebrow">02 · Build</p><h2 id="plate-title">Your plate</h2></div>
          <div className={`plate-zone ${isDragging ? 'is-dragging' : ''}`} onDrop={handleDrop} onDragOver={(event) => event.preventDefault()} aria-label={`Your meal plate. ${plate.length} foods selected. Drop food here, or use Add buttons.`}>
            <div className="plate-rim"><div className="plate">
              {plate.length === 0 ? <div className="empty-plate"><span>↓</span><p>Drag foods here<br />or use the Add buttons</p></div> : <ul className="plate-items" aria-label="Foods on your plate">
                {plate.map((item) => <li key={item.instanceId} className="plate-item"><div className="plate-token" aria-hidden="true">{item.food.placeholder ?? 'Food'}</div><div><strong>{item.food.name}</strong><label><span className="sr-only">Portion for {item.food.name}</span><select value={item.portion.id} onChange={(event) => updateItemPortion(item.instanceId, event.target.value)}>{(item.food.portions ?? [defaultPortion(item.food)]).map((portion) => <option key={portion.id} value={portion.id}>{portion.label}</option>)}</select></label></div><button className="remove-button" type="button" onClick={() => removeItem(item.instanceId)} aria-label={`Remove ${item.food.name}`}>×</button></li>)}
              </ul>}
            </div></div>
          </div>
          <div className="plate-footer"><span>{plate.length === 0 ? 'Your plate is empty' : `${plate.length} ${plate.length === 1 ? 'item' : 'items'} selected`}</span><button className="check-button" onClick={checkMeal} disabled={!plate.length} type="button">Check my meal <span aria-hidden="true">→</span></button></div>
        </section>

        <aside className={`result-panel ${submitted ? 'is-revealed' : ''}`} aria-labelledby="results-title">
          <div className="section-heading"><p className="eyebrow">03 · Discover</p><h2 id="results-title">Your meal</h2></div>
          {!submitted ? <div className="hidden-results"><span className="secret-mark" aria-hidden="true">?</span><h3>{lastChecked ? 'Your meal changed' : 'Keep building'}</h3><p>{lastChecked ? 'Check again to reveal the updated nutrition for your meal.' : 'When you’re ready, check your meal to reveal its energy and macronutrients.'}</p></div> : <div className="results-content">
            <div className="calorie-total"><span>Total energy</span><strong>{rounded(total.calories)}</strong><em>kcal</em></div>
            <MacroBar total={total} />
            <NutrientTracker items={plate} totalFat={total.fat} />
            <div className={`verdict ${verdict.tone}`}><span>{verdict.tone === 'balanced' ? '✦' : verdict.tone === 'nearly' ? '↗' : '↺'}</span><div><h3>{verdict.title}</h3>{verdict.findings.length > 0 && <ul className="verdict-findings">{verdict.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul>}<p>{verdict.message}</p></div></div>
            <details className="contributions"><summary>Food contributions and sources</summary><ul>{plate.map((item) => { const itemTotal = multiply(item.food.macros, item.portion.multiplier); return <li key={item.instanceId}><span>{item.food.name} · {item.portion.label}</span><strong>{rounded(itemTotal.calories)} kcal</strong><small>{rounded(itemTotal.carbs)} g carbs · {rounded(itemTotal.protein)} g protein · {rounded(itemTotal.fat)} g fat</small><a href={item.food.source.url} target="_blank" rel="noreferrer">{item.food.source.name} <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></li> })}</ul><p>Sources describe the specific serving used. Values can vary by recipe and preparation.</p></details>
            {previous && <p className="previous-check">Previous check: {rounded(previous.calories)} kcal</p>}
            <button className="retry-button" onClick={() => setSubmitted(false)} type="button">Try adjusting it</button>
          </div>}
        </aside>
      </div>
    </main>
    <p className="sr-only" aria-live="polite">{liveMessage}</p>
  </div>
}
