# Nutrition Game — Gameplay Specification

## 1. Purpose

The game asks students to build a balanced meal using intuition alone, then compare their choices with the meal's actual energy and macronutrient composition.

The experience must be publicly playable from GitHub Pages without an account, sign-in, or saved personal data.

## 2. Learning objective

Students should be able to:

- estimate which combinations and portions of familiar foods form a balanced meal;
- observe how each food changes a meal's total calories, carbohydrate, protein, and fat;
- revise a meal after receiving evidence-based feedback; and
- learn that serving size, cooking method, sauces, and drinks can materially affect a meal's nutrition.

The game is educational, not medical advice. It must not label individual foods as inherently “good,” “bad,” or forbidden.

## 3. Core gameplay loop

1. The student sees an empty plate and a food browser on the left.
2. The student explores the browser through category tabs.
3. The student drags foods from a tab and drops them onto the plate.
4. The student may add multiple foods, change portions, reposition foods, or remove them.
5. While the meal is being assembled, calories, macronutrient values, balance scores, and corrective hints remain hidden.
6. The student selects **Check my meal**.
7. The game reveals the meal's total calories and macronutrient composition, followed by simple balance feedback.
8. The student may select **Try again** to edit the same meal and resubmit, or **Start over** to clear the plate.

There is no time limit and no penalty for experimentation.

## 4. Play area

### Food browser

The left side contains one tab per food category. Each tab displays food tiles with:

- a recognizable image or illustration;
- the food's common name;
- a standard serving description, such as “1 egg,” “1 bowl,” or “1 slice”; and
- a visible portion selector when more than one supported serving size exists.

Calories and macronutrients must not appear on food tiles before submission.

The initial category set should cover a complete meal and may include:

- **Breakfast:** eggs, kaya toast, thosai, cereal, yoghurt;
- **Rice and noodles:** chicken rice, nasi lemak, char kway teow, brown rice, bee hoon;
- **Proteins and mains:** chicken, fish, tofu, tempeh, dhal;
- **Vegetables and sides:** leafy vegetables, cucumber, achar, mixed vegetables;
- **Fruit and snacks:** durian, papaya, banana, orange, curry puff;
- **Drinks:** water, kopi, teh, soy milk, soft drink.

These are browsing categories, not nutrition classifications. A food should appear in the single tab where students are most likely to look for it. The final library should favour recognisable Singaporean foods while retaining enough simple foods to let students adjust a meal deliberately.

### Plate

The centre or right side contains a large plate-shaped drop area. Dropping a food creates one serving of that food on the plate.

The plate must:

- accept food by drag-and-drop and by an equivalent click/tap interaction;
- show every selected food and its current portion;
- allow more than one serving of a food;
- allow portion changes after placement;
- allow foods to be removed; and
- clearly reject drops outside the valid plate area without changing the meal.

Repositioning food on the plate is visual only and does not alter its nutrition.

### Meal summary before submission

Before submission, the interface may show the number and names of foods selected, but no calorie total, macronutrient total, balance meter, or hint that reveals the nutritional answer.

**Check my meal** is enabled once at least one food is on the plate.

## 5. Portion rules

Every selectable portion must correspond to a defined edible serving with its own nutrient calculation. Portions should use student-friendly units rather than grams alone; grams or millilitres may be shown secondarily.

Examples include:

- egg: 1 egg or 2 eggs;
- chicken rice: half plate or 1 plate;
- durian: 1 seed or 3 seeds;
- drink: small cup or regular cup.

Changing a portion updates the eventual totals but must not reveal those totals before submission. If a dish varies substantially by recipe, the displayed serving description must identify the assumed version, such as “chicken rice, roasted, with chilli sauce.”

## 6. Submission and reveal

Selecting **Check my meal** freezes the current result long enough to present:

- total energy in kilocalories (kcal);
- carbohydrate, protein, and fat in grams;
- each macronutrient's percentage contribution to total energy;
- a visual macronutrient composition, such as a stacked bar or chart; and
- a contribution breakdown showing how much each selected food adds to the totals.

Percentages should be calculated using 4 kcal per gram of carbohydrate, 4 kcal per gram of protein, and 9 kcal per gram of fat. Any difference between calculated macronutrient energy and the researched calorie total should be handled consistently and explained in an information note; fibre, rounding, and source methodology may cause small differences.

The reveal should be animated briefly enough to create a moment of discovery, but the values must also appear as text.

## 7. Balance feedback

After revealing the values, the game compares the meal with configurable targets chosen for the intended student group and lesson. Targets must be approved by the project's nutrition or teaching lead before release.

Feedback has three possible outcomes:

- **Balanced:** the meal falls within all configured target ranges.
- **Nearly balanced:** the meal misses one target by a configured small margin.
- **Try adjusting it:** the meal misses multiple targets or one target by a substantial margin.

Feedback should:

- name the measured reason, such as “high in fat for this activity” or “low in protein”;
- suggest a direction rather than prescribe a specific answer, such as “try adding a protein source” or “try a smaller portion of one item”;
- recognise successful aspects of the meal;
- avoid weight-loss language, body judgement, shame, or moral labels; and
- clarify that one meal is only one part of an overall diet.

The game may also compare the plate with an age-appropriate plate-model guideline if the lesson uses one, but this visual comparison must not replace the calorie and macronutrient reveal requested by the activity.

## 8. Retry and completion

After feedback, the student can:

- return to the plate with all current foods retained;
- change foods or portions and check again;
- compare the new result with the immediately previous attempt; or
- clear the meal and restart.

A round is complete when the student reaches the configured **Balanced** range or chooses to start over. Reaching balance should produce a modest positive acknowledgement, not a competitive ranking.

No leaderboard, score based on eating less, streak penalty, or public comparison between students is part of the gameplay.

## 9. Food and nutrition data research

Before a food is added to the playable library, its nutrition values must be researched online and recorded for the exact serving represented in the game. Research should prioritise Singapore-specific, authoritative sources such as the Singapore Health Promotion Board and HealthHub. Suitable food-composition databases, peer-reviewed publications, official restaurant nutrition information, and manufacturer labels may be used when an authoritative Singapore source does not cover the food.

Each food record must include:

- common food name and category;
- exact serving description and edible serving mass or volume;
- preparation assumptions, including relevant oil, skin, gravy, sauce, and sugar;
- calories, carbohydrate, protein, and fat per displayed serving;
- source name, source URL, and date accessed;
- whether the value is directly sourced or calculated from ingredients; and
- a short note explaining any conversion, scaling, averaging, or uncertainty.

For composite and highly variable dishes—including chicken rice, nasi lemak, char kway teow, and durian portions—the researcher should use a representative local serving, check more than one credible source where possible, and document why the chosen value is suitable. Values must not be silently combined from incompatible serving sizes or recipes.

Nutrition records should be reviewed before first publication and on a regular schedule thereafter. A food whose serving or nutrient values cannot be supported by a credible source must not be presented as an exact value; it should be excluded or clearly identified as an estimate.

## 10. Gameplay states and edge cases

- **Empty plate:** prompt the student to choose a food; submission is unavailable.
- **Food selected:** show the item and portion controls while keeping nutrition hidden.
- **Submitted:** show totals, composition, contribution breakdown, and balance feedback.
- **Editing after submission:** hide the obsolete result as soon as a food or portion changes and require another submission.
- **Duplicate food:** combine servings or list them separately, but calculate every serving exactly once.
- **Large meal:** allow all selected items to remain inspectable; the interface must not conceal foods or totals.
- **Missing data:** do not allow submission with an item whose nutrition record is incomplete.
- **Calculation failure:** preserve the meal and offer a retry without inventing or displaying partial totals.

## 11. Gameplay accessibility

All gameplay must be possible with a keyboard and on a touch screen; drag-and-drop cannot be the only way to add food. Category tabs, food choices, portion controls, removal controls, the plate, and result values require clear text labels and visible focus states. Food information must not rely on colour, imagery, motion, or chart shape alone.

Motion should be brief and respect reduced-motion preferences. Instructions and feedback should use concise language suitable for the target student age.

## 12. Acceptance criteria

The gameplay is ready when:

1. A student can open the public GitHub Pages experience without signing in.
2. The student can browse food categories, including Singaporean examples, without seeing nutrition answers.
3. The student can add, remove, and resize portions using pointer, touch, or keyboard controls.
4. Submission reveals correct total calories, macronutrient grams, and macronutrient energy percentages for the selected portions.
5. The result explains which foods contributed to the totals and gives neutral, actionable balance feedback.
6. Editing a submitted meal invalidates and hides the old result until the student checks again.
7. Every playable food has a traceable serving-specific nutrition source and research notes.
8. The student can iterate toward the configured balance target or start over at any time.
