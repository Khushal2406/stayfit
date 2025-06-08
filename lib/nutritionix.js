const APP_ID = process.env.NUTRITIONIX_APP_ID;
const API_KEY = process.env.NUTRITIONIX_API_KEY;
const BASE_URL = 'https://trackapi.nutritionix.com/v2';

const headers = {
  'x-app-id': APP_ID,
  'x-app-key': API_KEY,
  'Content-Type': 'application/json'
};

export async function searchFood(query) {
  const response = await fetch(
    `${BASE_URL}/search/instant?query=${encodeURIComponent(query)}&detailed=true`,
    {
      headers,
      next: { revalidate: 3600 }
    }
  );
  const data = await response.json();
  
  // Map the response to our app's format
  return {
    results: data.branded.concat(data.common).slice(0, 10).map(item => ({
      id: item.nix_item_id || item.food_name,
      name: item.food_name,
      brand: item.brand_name,
      image: item.photo?.thumb,
      nutrition: {
        calories: Math.round(item.full_nutrients?.find(n => n.attr_id === 208)?.value || 0),
        protein: Math.round(item.full_nutrients?.find(n => n.attr_id === 203)?.value || 0),
        carbs: Math.round(item.full_nutrients?.find(n => n.attr_id === 205)?.value || 0),
        fat: Math.round(item.full_nutrients?.find(n => n.attr_id === 204)?.value || 0)
      },
      servingSize: item.serving_qty || 1,
      servingUnit: item.serving_unit || 'serving'
    }))
  };
}

export async function getNutritionInfo(id) {
  if (!id.startsWith('nix')) {
    // For common foods, we need to use natural language API
    const response = await fetch(`${BASE_URL}/natural/nutrients`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: id,
        timezone: "US/Eastern"
      })
    });
    const data = await response.json();
    const food = data.foods[0];
    
    return {
      calories: Math.round(food.nf_calories),
      protein: Math.round(food.nf_protein),
      carbs: Math.round(food.nf_total_carbohydrate),
      fat: Math.round(food.nf_total_fat)
    };
  }
  
  // For branded foods, use the item API
  const response = await fetch(
    `${BASE_URL}/search/item?nix_item_id=${id}`,
    { headers }
  );
  const data = await response.json();
  const food = data.foods[0];
  
  return {
    calories: Math.round(food.nf_calories),
    protein: Math.round(food.nf_protein),
    carbs: Math.round(food.nf_total_carbohydrate),
    fat: Math.round(food.nf_total_fat)
  };
}
