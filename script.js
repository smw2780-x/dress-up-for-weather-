/**
 * WeatherWear - Personal Weather Dashboard & Style Advisor
 */

const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";

const state = {
  unit: "F",
  currentStep: 1,
  preferences: {
    coldThreshold: 50,
    heatThreshold: 80,
    genderExpression: 5, // 1 (Masculine) to 10 (Feminine)
    preferredStyles: ["casual"]
  },
  weather: {
    city: "New York",
    tempF: 68,
    tempC: 20,
    condition: "Partly Cloudy",
    iconCode: "02d",
    humidity: 55,
    windSpeed: "10 mph"
  }
};

// Expanded Clothing Database supporting Gender Expression & Styles
const clothingDatabase = {
  freezing: {
    masculine: { tops: ["Thermal Flannel", "Fleece Hoodie"], bottoms: ["Heavy Jeans", "Cargo Trousers"], outerwear: ["Heavy Down Parka"], footwear: ["Insulated Boots"], accessories: ["Beanie", "Gloves"] },
    neutral: { tops: ["Thermal Shirt", "Fleece Hoodie"], bottoms: ["Thermal Pants"], outerwear: ["Winter Parka"], footwear: ["Insulated Boots"], accessories: ["Warm Scarf", "Beanie"] },
    feminine: { tops: ["Knit Sweater", "Thermal Blouse"], bottoms: ["Fleece Leggings", "Warm Trousers"], outerwear: ["Wool Long Coat", "Puffer Coat"], footwear: ["Lined Ankle Boots"], accessories: ["Soft Scarf", "Earmuffs"] }
  },
  cold: {
    masculine: { tops: ["Long Sleeve Henley", "Knit Crewneck"], bottoms: ["Chinos", "Jeans"], outerwear: ["Puffer Jacket", "Denim Jacket"], footwear: ["Leather Boots"], accessories: ["Knit Beanie"] },
    neutral: { tops: ["Long Sleeve Tee", "Sweater"], bottoms: ["Jeans", "Joggers"], outerwear: ["Puffer Jacket"], footwear: ["Sneakers", "Boots"], accessories: ["Beanie"] },
    feminine: { tops: ["Cardigan", "Long Sleeve Blouse"], bottoms: ["High-Waisted Jeans", "Leggings"], outerwear: ["Tailored Trench Coat"], footwear: ["Heeled Boots", "Ankle Boots"], accessories: ["Knit Scarf"] }
  },
  mild: {
    masculine: { tops: ["Polo Shirt", "Button-Down"], bottoms: ["Chinos", "Denim"], outerwear: ["Bomber Jacket", "Blazer"], footwear: ["Loafers", "Sneakers"], accessories: ["Watch"] },
    neutral: { tops: ["Cotton T-Shirt"], bottoms: ["Jeans"], outerwear: ["Light Denim Jacket"], footwear: ["Sneakers"], accessories: ["Cap"] },
    feminine: { tops: ["Fitted Top", "Light Blouse"], bottoms: ["Midi Skirt", "Straight Jeans"], outerwear: ["Light Cardigan", "Denim Jacket"], footwear: ["Flats", "Sneakers"], accessories: ["Jewelry"] }
  },
  warm: {
    masculine: { tops: ["Short Sleeve Polo", "Graphic Tee"], bottoms: ["Chino Shorts"], outerwear: [], footwear: ["Canvas Sneakers"], accessories: ["Sunglasses"] },
    neutral: { tops: ["Short Sleeve Tee"], bottoms: ["Shorts"], outerwear: [], footwear: ["Canvas Shoes"], accessories: ["Sunglasses"] },
    feminine: { tops: ["Sleeveless Top", "Blouse"], bottoms: ["Shorts", "A-Line Skirt"], outerwear: [], footwear: ["Sandals", "Flats"], accessories: ["Sunglasses", "Sun Hat"] }
  },
  hot: {
    masculine: { tops: ["Linen Shirt", "Tank Top"], bottoms: ["Athletic Shorts"], outerwear: [], footwear: ["Sandals", "Boat Shoes"], accessories: ["Cap"] },
    neutral: { tops: ["Tank Top"], bottoms: ["Light Shorts"], outerwear: [], footwear: ["Sandals"], accessories: ["Sunglasses"] },
    feminine: { tops: ["Sundress", "Linen Crop Top"], bottoms: ["Flowy Skirt", "Linen Shorts"], outerwear: [], footwear: ["Strappy Sandals", "Espadrilles"], accessories: ["Wide-Brim Sun Hat"] }
  }
};

// SVG Vector Model Palette Mapping
const modelOutfits = {
  freezing: {
    masculine: { torso: "#1a202c", legs: "#2d3748", feet: "#4a5568", topShape: "M 24 40 L 76 40 L 70 120 L 30 120 Z" },
    neutral: { torso: "#2b6cb0", legs: "#2d3748", feet: "#1a202c", topShape: "M 26 40 L 74 40 L 68 118 L 32 118 Z" },
    feminine: { torso: "#9b2c2c", legs: "#4a5568", feet: "#1a202c", topShape: "M 28 40 L 72 40 L 78 135 L 22 135 Z" }
  },
  cold: {
    masculine: { torso: "#2c5282", legs: "#1a202c", feet: "#2d3748", topShape: "M 28 40 L 72 40 L 68 112 L 32 112 Z" },
    neutral: { torso: "#319795", legs: "#2d3748", feet: "#1a202c", topShape: "M 28 40 L 72 40 L 66 110 L 34 110 Z" },
    feminine: { torso: "#b83280", legs: "#1a202c", feet: "#4a5568", topShape: "M 30 40 L 70 40 L 74 125 L 26 125 Z" }
  },
  mild: {
    masculine: { torso: "#dd6b20", legs: "#2d3748", feet: "#a0aec0", topShape: "M 30 40 L 70 40 L 66 105 L 34 105 Z" },
    neutral: { torso: "#e0683b", legs: "#4a5568", feet: "#edf2f7", topShape: "M 30 40 L 70 40 L 66 105 L 34 105 Z" },
    feminine: { torso: "#d69e2e", legs: "#2d3748", feet: "#cbd5e0", topShape: "M 32 40 L 68 40 L 72 120 L 28 120 Z" }
  },
  warm: {
    masculine: { torso: "#3182ce", legs: "#718096", feet: "#edf2f7", topShape: "M 32 40 L 68 40 L 66 95 L 34 95 Z" },
    neutral: { torso: "#31b0d5", legs: "#a0aec0", feet: "#edf2f7", topShape: "M 32 40 L 68 40 L 66 95 L 34 95 Z" },
    feminine: { torso: "#e53e3e", legs: "#e2e8f0", feet: "#d69e2e", topShape: "M 34 40 L 66 40 L 76 115 L 24 115 Z" }
  },
  hot: {
    masculine: { torso: "#e2e8f0", legs: "#cbd5e0", feet: "#dd6b20", topShape: "M 34 40 L 66 40 L 64 90 L 36 90 Z" },
    neutral: { torso: "#edf2f7", legs: "#cbd5e0", feet: "#e0683b", topShape: "M 34 40 L 66 40 L 64 90 L 36 90 Z" },
    feminine: { torso: "#d
