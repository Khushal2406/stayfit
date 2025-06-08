const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

export async function searchFood(query) {
  // First search for ingredients
  const searchResponse = await fetch(
    `${BASE_URL}/food/ingredients/search?apiKey=${API_KEY}&query=${encodeURIComponent(query)}&number=10&sort=calories&sortDirection=desc`,
    { next: { revalidate: 3600 } }
  );
  const searchData = await searchResponse.json();

  // Then get nutrition info for each result
  const foodsWithNutrition = await Promise.all(
    searchData.results.map(async (item) => {
      // Get detailed nutrition info for 100g amount
      const nutritionResponse = await fetch(
        `${BASE_URL}/food/ingredients/${item.id}/information?apiKey=${API_KEY}&amount=100&unit=grams`,
        { next: { revalidate: 3600 } }
      );
      const nutritionData = await nutritionResponse.json();
      
      return {
        id: item.id,
        name: item.name,
        image: item.image,
        nutrition: {
          calories: Math.round(nutritionData.nutrition?.nutrients?.find(n => n.name === "Calories")?.amount || 0),
          protein: Math.round(nutritionData.nutrition?.nutrients?.find(n => n.name === "Protein")?.amount || 0),
          carbs: Math.round(nutritionData.nutrition?.nutrients?.find(n => n.name === "Carbohydrates")?.amount || 0),
          fat: Math.round(nutritionData.nutrition?.nutrients?.find(n => n.name === "Fat")?.amount || 0)
        },
        servingSize: 100,
        servingUnit: 'g'
      };
    })
  );

  return {
    results: foodsWithNutrition
  };
}

export async function getFoodInfo(id) {
  const response = await fetch(
    `${BASE_URL}/${id}/information?apiKey=${API_KEY}&amount=1`,
    { next: { revalidate: 3600 } }
  );
  return response.json();
}

export async function getNutritionInfo(id) {
  const response = await fetch(
    `${BASE_URL}/${id}/nutritionWidget.json?apiKey=${API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  return response.json();
}
