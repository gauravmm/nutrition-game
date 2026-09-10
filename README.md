# Meal Mixer

Meal Mixer is a classroom nutrition game built around familiar Singaporean foods. Students assemble a meal using intuition, then reveal its calories and macronutrient composition. Nutrition values remain hidden until the meal is checked.

The first draft intentionally uses text placeholders instead of food artwork. Micronutrient data is retained in the dataset for later lessons but is not shown in the game yet.

## Run locally

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

## Nutrition data

Every playable food has a serving-specific source link. The dataset also records iron, calcium, sodium, potassium, vitamins A, C, and D, along with other commonly reported nutrients when an authoritative source provides them.

See [research/FOOD_DATA_SOURCES.md](research/FOOD_DATA_SOURCES.md) for the source hierarchy, assumptions, and known gaps. Values for prepared dishes are representative estimates and can vary by recipe, vendor, and serving size. This project is a learning activity, not medical advice.

## Gameplay and design

- [Gameplay specification](spec/GAMEPLAY.md)
- [Visual system](docs/VISUAL_SYSTEM.md)

## Deployment

Pushes to `main` are built and deployed through the GitHub Pages workflow in `.github/workflows/deploy-pages.yml`.
