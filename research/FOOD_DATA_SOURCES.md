# Food data sources and research notes

This first-draft dataset lives in [`src/data/foods.json`](../src/data/foods.json). Values are attached to the serving shown in each record; they are not intended to be clinical advice or a universal description of every stall or brand.

## Source hierarchy

1. Singapore Health Promotion Board (HPB), HealthHub recipe cards and the Singapore Food Insights Database (SG FoodID) are preferred for Singapore dishes. The SG FoodID landing page is <https://www.hpb.gov.sg/healthy-living/food-and-beverage/sgfoodid/> and links to the searchable database at <https://pphtpc.hpb.gov.sg/web/sgfoodid/>.
2. Singapore hospitals and public-health institutions are acceptable for local-food tables when HPB does not expose a stable item page. This draft uses Tan Tock Seng Hospital's dietary guide for nasi lemak.
3. USDA FoodData Central is used for generic ingredients where a Singapore-specific record is not available. USDA food links are either stable FDC item pages or an official FDC search query where the exact record/portion still needs to be pinned.
4. Brand nutrition panels are preferred for branded local products. Items without a serving-specific authoritative record are excluded from the playable first draft rather than paired with an unsupported value.

HPB explains that meal-log values for local dishes are averages because recipes, ingredients, and serving sizes vary: <https://help.hpb.gov.sg/ssp/en/how-is-the-nutritional-information-in-meal-log-determined?id=kb_article_view_ssp&sysparm_article=KB0014570>.

## Local dish citations

- Chicken rice: HPB/HealthHub recipe card, <https://ch-api.healthhub.sg/api/public/content/04c471018966457aae9cda32b0f4b6fd?v=2a80ae0e>. It reports 510 kcal, 45.7 g protein, 16.5 g fat, 45.6 g carbohydrate and 3 g fibre per serving. It does not report the requested micronutrients.
- Char kway teow: HPB/HealthHub recipe card, <https://ch-api.healthhub.sg/api/public/content/89090d5f74bd4f068c2dde25a42112e6?v=e4fa0afa>. It reports 277.9 kcal, 11.3 g protein, 11.4 g fat, 32.3 g carbohydrate, 2.2 g fibre, 2.5 g saturated fat and 390 mg sodium per 220 g serving. It is a wholemeal recipe variant, not an average hawker serving.
- Nasi lemak: SingHealth HealthXchange in collaboration with KKH Nutrition and Dietetics, <https://www.healthxchange.sg/health-articles/food-nutrition/food-tips/best-worst-singapore-hawker-malay-breakfast-foods-nasi-lemak-mee-siam-soto>. It reports 494 kcal, 13 g protein, 14 g fat, 7.6 g saturated fat, 6.5 g fibre, 80 g carbohydrate, 76 mg cholesterol, and 838 mg sodium for a 210 g serving.
- Kaya toast was researched but excluded from the playable first draft because the located official Ya Kun nutrition PDF covers drinks rather than a serving-specific toast panel. It should be added only when an authoritative source can be tied directly to the values shown.

## Units and fields

Calories are kcal per listed serving. Carbohydrate, protein, fat, fibre, sugars and saturated fat are grams. Iron, calcium, sodium, potassium, magnesium, phosphorus and zinc are milligrams. Vitamin A and folate are micrograms (vitamin A as µg RAE where USDA supplies RAE); vitamins C and B12 are milligrams and micrograms respectively; vitamin D is micrograms. `cholesterol` is milligrams.

The game currently uses only `macros` in its reveal screen. The complete `micronutrients` object is retained for the later micronutrient view. A `null` means that the cited source did not report that nutrient for the exact serving; it must not be treated as zero.

## Conversions and uncertainty

USDA records are often per 100 g or a US household measure. Where a standard USDA portion is used, the dataset records the resulting serving and notes the scaling. Before production, pin every search-query URL to a specific FDC item ID and verify serving-weight conversions against the downloaded USDA record. Do not derive a missing nutrient from calories or from another food.

For packaged products, replace generic USDA records with the Singapore product's current Nutrition Information Panel and record serving size, pack size, label date, and URL. For hawker foods, use SG FoodID's named item and default serving where available, preserve its average/uncertainty note, and retain a source URL per item.

Access dates in this first draft are 2026-09-10 (Asia/Singapore).
