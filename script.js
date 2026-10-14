/**
 * Weather-Based Clothing Recommender
 * Handles weather data processing, unit conversion, and customizable clothing logic.
 */

// 1. Default Customizable Clothing Rules (Hot to Cold in Celsius)
// Users can modify or extend this array in their local setup or via UI controls.
let clothingRules = [
  {
    minTempC: 30,
    maxTempC: Infinity,
    label: "Hot Weather",
    tops: ["Tank top", "Light linen shirt", "Short-sleeve T-shirt"],
    bottoms: ["Shorts", "Light skirt", "Linen pants"],
    footwear: ["Sandals", "Canvas sneakers"],
    accessories: ["Sunglasses", "Sun hat"]
  },
  {
    minTempC: 20,
    maxTempC: 29.9,
    label: "Warm Weather",
    tops: ["Cotton T-shirt", "Polo shirt", "Light blouse"],
    bottoms: ["Chinos", "Jeans", "Shorts"],
    footwear: ["Sneakers", "Loafers"],
    accessories: ["Sunglasses"]
  },
  {
    minTempC: 10,
    maxTempC: 19.9,
    label: "Mild / Cool Weather",
    tops: ["Long-sleeve shirt", "Light sweater", "Hoodie"],
    bottoms: ["Jeans", "Trousers", "Cargo pants"],
    footwear: ["Sneakers", "Boots"],
    accessories: ["Light scarf"]
  },
  {
    minTempC: 0,
    maxTempC: 9.9,
    label: "Cold Weather",
    tops: ["Thermal shirt", "Heavy sweater", "Fleece layer"],
    bottoms: ["Warm trousers", "Thermal-lined jeans"],
    footwear: ["Insulated boots", "Warm sneakers"],
    outerwear: ["Puffer jacket", "Wool coat"],
    accessories: ["Beanie", "Gloves", "Scarf"]
  },
  {
    minTempC: -Infinity,
    maxTempC: -0.1,
    label: "Freezing Weather",
    tops: ["Thermal base layer", "Heavy fleece", "Wool sweater"],
    bottoms: ["Thermal leggings under heavy pants", "Snow pants"],
    footwear: ["Waterproof winter boots", "Thermal socks"],
    outerwear: ["Heavy parka", "Down jacket"],
    accessories: ["Thermal beanie", "Heavy gloves/mittens", "Thick scarf", "Ear muffs"]
  }
];

// Condition-specific extra gear recommendations
const conditionModifiers = {
  rain: {
    outerwearAdditions: ["Raincoat", "Waterproof poncho"],
    accessoriesAdditions: ["Umbrella"],
    footwearOverride: "Waterproof shoes or rain boots"
  },
  thunderstorm: {
    outerwearAdditions: ["Heavy-duty raincoat"],
    accessoriesAdditions: ["Sturdy umbrella"],
    footwearOverride: "Waterproof rubber boots"
  },
  snow: {
    outerwearAdditions: ["Snow jacket"],
    accessoriesAdditions: ["Insulated gloves", "Beanie"],
    footwearOverride: "Waterproof snow boots"
  },
  windy: {
    outerwearAdditions: ["Windbreaker jacket"],
    accessoriesAdditions: ["Goggles or sunglasses (for dust)"]
  },
  sunny: {
    accessoriesAdditions: ["Sunglasses", "Sunscreen (SPF 30+)"]
  }
};

// 2. Unit Conversion Helpers
function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

// 3. Main Recommendation Generator Function
function getClothingRecommendation(params) {
  const { location, temperature, unit = "C", condition = "clear" } = params;

  // Normalize temperature to Celsius internally for lookup
  const tempInCelsius = unit.toUpperCase() === "F" ? fahrenheitToCelsius(temperature) : temperature;
  const tempInFahrenheit = unit.toUpperCase() === "C" ? celsiusToFahrenheit(temperature) : temperature;

  // Find matching temperature tier
  const matchedRule = clothingRules.find(
    (rule) => tempInCelsius >= rule.minTempC && tempInCelsius <= rule.maxTempC
  ) || clothingRules[clothingRules.length - 1];

  // Deep clone matched outfit options so we don't mutate original rules
  let outfit = {
    tops: [...(matchedRule.tops || [])],
    bottoms: [...(matchedRule.bottoms || [])],
    footwear: [...(matchedRule.footwear || [])],
    outerwear: [...(matchedRule.outerwear || [])],
    accessories: [...(matchedRule.accessories || [])]
  };

  // Apply climate/condition modifiers
  const normalizedCondition = condition.toLowerCase();
  for (const [key, modifier] of Object.entries(conditionModifiers)) {
    if (normalizedCondition.includes(key)) {
      if (modifier.outerwearAdditions) outfit.outerwear.push(...modifier.outerwearAdditions);
      if (modifier.accessoriesAdditions) outfit.accessories.push(...modifier.accessoriesAdditions);
      if (modifier.footwearOverride) outfit.footwear = [modifier.footwearOverride];
    }
  }

  return {
    location: location || "Unknown Location",
    displayTemperature: {
      celsius: `${Math.round(tempInCelsius)}°C`,
      fahrenheit: `${Math.round(tempInFahrenheit)}°F`
    },
    condition: condition,
    category: matchedRule.label,
    recommendations: {
      tops: [...new Set(outfit.tops)],
      bottoms: [...new Set(outfit.bottoms)],
      footwear: [...new Set(outfit.footwear)],
      outerwear: [...new Set(outfit.outerwear)],
      accessories: [...new Set(outfit.accessories)]
    }
  };
}

// 4. User Customization Methods
function addOrUpdateRule(newRule) {
  clothingRules.push(newRule);
  // Keep rules sorted from highest to lowest temperature min boundary
  clothingRules.sort((a, b) => b.minTempC - a.minTempC);
}

function customizeClothingForTier(tierLabel, newCategoryItems) {
  const rule = clothingRules.find((r) => r.label.toLowerCase() === tierLabel.toLowerCase());
  if (rule) {
    Object.assign(rule, newCategoryItems);
    return true;
  }
  return false;
}

// Example Usage & Output Test
const currentPreset = {
  location: "New York",
  temperature: 55, // 55°F
  unit: "F",
  condition: "rainy and windy"
};

const recommendation = getClothingRecommendation(currentPreset);
console.log("--- Recommendation Output ---");
console.log(JSON.stringify(recommendation, null, 2));
