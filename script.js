/**
 * WeatherWear - Option A: Personal Weather Dashboard
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

// Expanded Clothing Database supporting Gender Expression filtering
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

// SVG Model Color & Silhouette Coordinates
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
    feminine: { torso: "#d69e2e", legs: "#feb2b2", feet: "#dd6b20", topShape: "M 36 40 L 64 40 L 80 120 L 20 120 Z" }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateSliderReadouts();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  const coldScale = document.getElementById("coldScale");
  const heatScale = document.getElementById("heatScale");
  const genderScale = document.getElementById("genderScale");

  if (coldScale) coldScale.addEventListener("input", updateSliderReadouts);
  if (heatScale) heatScale.addEventListener("input", updateSliderReadouts);
  if (genderScale) genderScale.addEventListener("input", updateSliderReadouts);

  document.getElementById("goToStep2Btn")?.addEventListener("click", () => {
    saveStep1Preferences();
    switchStep(2);
  });

  document.getElementById("backToStep1Btn")?.addEventListener("click", () => switchStep(1));

  document.getElementById("finishOnboardingBtn")?.addEventListener("click", async () => {
    const cityInput = document.getElementById("initialCityInput").value.trim();
    if (cityInput) state.weather.city = cityInput;
    await fetchOpenWeatherData(state.weather.city);
    showDashboard();
  });

  document.getElementById("reconfigureBtn")?.addEventListener("click", () => {
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("onboardingSection").classList.remove("hidden");
    document.getElementById("stepIndicator").classList.remove("hidden");
    switchStep(1);
  });

  document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) {
      await fetchOpenWeatherData(city);
      renderDashboard();
    }
  });

  document.getElementById("unitToggle")?.addEventListener("click", () => {
    state.unit = state.unit === "F" ? "C" : "F";
    updateSliderReadouts();
    updateUnitToggleDisplay();
    renderDashboard();
  });

  document.getElementById("chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleChatSubmit();
  });
}

function updateSliderReadouts() {
  const coldValF = parseInt(document.getElementById("coldScale").value, 10);
  const heatValF = parseInt(document.getElementById("heatScale").value, 10);
  const genderVal = parseInt(document.getElementById("genderScale").value, 10);

  if (state.unit === "F") {
    document.getElementById("coldReadout").innerText = `${coldValF}°F`;
    document.getElementById("heatReadout").innerText = `${heatValF}°F`;
  } else {
    const coldValC = Math.round(((coldValF - 32) * 5) / 9);
    const heatValC = Math.round(((heatValF - 32) * 5) / 9);
    document.getElementById("coldReadout").innerText = `${coldValC}°C`;
    document.getElementById("heatReadout").innerText = `${heatValC}°C`;
  }

  // Expression Readout Formatting (1 to 10 scale)
  let label = "Neutral";
  if (genderVal <= 3) label = `${genderVal} (Masculine)`;
  else if (genderVal <= 4) label = `${genderVal} (Slightly Masculine)`;
  else if (genderVal <= 6) label = `${genderVal} (Neutral)`;
  else if (genderVal <= 8) label = `${genderVal} (Slightly Feminine)`;
  else label = `${genderVal} (Feminine)`;

  document.getElementById("genderReadout").innerText = label;
}

function saveStep1Preferences() {
  state.preferences.coldThreshold = parseInt(document.getElementById("coldScale").value, 10);
  state.preferences.heatThreshold = parseInt(document.getElementById("heatScale").value, 10);
  state.preferences.genderExpression = parseInt(document.getElementById("genderScale").value, 10);

  const selectedStyles = Array.from(
    document.querySelectorAll('input[name="preferredStyle"]:checked')
  ).map((el) => el.value);

  state.preferences.preferredStyles = selectedStyles.length > 0 ? selectedStyles : ["casual"];
}

function switchStep(stepNumber) {
  state.currentStep = stepNumber;
  const step1Content = document.getElementById("step1Content");
  const step2Content = document.getElementById("step2Content");
  const badgeStep1 = document.getElementById("badgeStep1");
  const badgeStep2 = document.getElementById("badgeStep2");

  if (stepNumber === 1) {
    step1Content.classList.remove("hidden");
    step2Content.classList.add("hidden");
    badgeStep1.classList.add("active");
    badgeStep2.classList.remove("active");
  } else {
    step1Content.classList.add("hidden");
    step2Content.classList.remove("hidden");
    badgeStep1.classList.remove("active");
    badgeStep2.classList.add("active");
  }
}

function showDashboard() {
  document.getElementById("onboardingSection").classList.add("hidden");
  document.getElementById("stepIndicator").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");
  renderDashboard();
}

async function fetchOpenWeatherData(cityName) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    
    const data = await response.json();
    state.weather.city = `${data.name}, ${data.sys.country}`;
    state.weather.tempF = Math.round(data.main.temp);
    state.weather.tempC = Math.round(((data.main.temp - 32) * 5) / 9);
    state.weather.condition = data.weather[0].description;
    state.weather.iconCode = data.weather[0].icon;
    state.weather.humidity = data.main.humidity;
    state.weather.windSpeed = `${Math.round(data.wind.speed)} mph`;
  } catch (error) {
    const mockTempF = Math.floor(Math.sin(cityName.length) * 25 + 65);
    state.weather.city = cityName;
    state.weather.tempF = mockTempF;
    state.weather.tempC = Math.round(((mockTempF - 32) * 5) / 9);
    state.weather.condition = mockTempF > 75 ? "clear sky" : "scattered clouds";
    state.weather.iconCode = mockTempF > 75 ? "01d" : "03d";
    state.weather.humidity = 50;
    state.weather.windSpeed = "8 mph";
  }
}

function getTemperatureTier(tempF) {
  const coldCutoff = state.preferences.coldThreshold;
  const heatCutoff = state.preferences.heatThreshold;

  if (tempF <= coldCutoff - 15) return "freezing";
  if (tempF <= coldCutoff) return "cold";
  if (tempF < heatCutoff - 10) return "mild";
  if (tempF < heatCutoff) return "warm";
  return "hot";
}

function renderDashboard() {
  const tempVal = state.unit === "F" ? `${state.weather.tempF}°F` : `${state.weather.tempC}°C`;
  
  document.getElementById("locationName").innerText = state.weather.city;
  document.getElementById("tempDisplay").innerText = tempVal;
  document.getElementById("conditionText").innerText = state.weather.condition;
  
  const badge = document.getElementById("weatherConditionBadge");
  const iconUrl = `https://openweathermap.org/img/wn/${state.weather.iconCode}.png`;
  badge.innerHTML = `<img src="${iconUrl}" alt="icon" style="vertical-align: middle; width: 22px;"> ${state.weather.condition}`;

  document.getElementById("humidityVal").innerText = `${state.weather.humidity}%`;
  document.getElementById("windVal").innerText = state.weather.windSpeed;

  const currentTier = getTemperatureTier(state.weather.tempF);
  const expressionVal = state.preferences.genderExpression;

  let expressionKey = "neutral";
  if (expressionVal <= 4) expressionKey = "masculine";
  else if (expressionVal >= 7) expressionKey = "feminine";

  renderAvatar(currentTier, expressionKey);

  const outfit = clothingDatabase[currentTier][expressionKey] || clothingDatabase[currentTier].neutral;

  renderTags("topRecommendations", outfit.tops || []);
  renderTags("bottomRecommendations", outfit.bottoms || []);
  renderTags("gearRecommendations", [...(outfit.footwear || []), ...(outfit.accessories || []), ...(outfit.outerwear || [])]);
}

function renderAvatar(tier, expressionKey) {
  const outfit = (modelOutfits[tier] && modelOutfits[tier][expressionKey]) || modelOutfits.mild.neutral;

  const torsoEl = document.getElementById("modelTorso");
  const legsEl = document.getElementById("modelLegs");
  const footLeft = document.getElementById("modelFootLeft");
  const footRight = document.getElementById("modelFootRight");

  if (torsoEl) {
    torsoEl.setAttribute("fill", outfit.torso);
    torsoEl.setAttribute("d", outfit.topShape);
  }
  if (legsEl) legsEl.setAttribute("fill", outfit.legs);
  if (footLeft) footLeft.setAttribute("fill", outfit.feet);
  if (footRight) footRight.setAttribute("fill", outfit.feet);
}

function renderTags(elementId, itemsArray) {
  const container = document.getElementById(elementId);
  container.innerHTML = "";
  itemsArray.forEach((item) => {
    const span = document.createElement("span");
    span.className = "tag";
    span.innerText = item;
    container.appendChild(span);
  });
}

function updateUnitToggleDisplay() {
  const btn = document.getElementById("unitToggle");
  if (btn) btn.innerText = `Unit: °${state.unit}`;
}

function handleChatSubmit() {
  const chatInput = document.getElementById("chatInput");
  const query = chatInput.value.trim();
  if (!query) return;

  appendChatMessage(query, "user");
  chatInput.value = "";

  setTimeout(() => {
    const reply = generateBotReply(query);
    appendChatMessage(reply, "bot");
  }, 400);
}

function appendChatMessage(text, sender) {
  const chatMessages = document.getElementById("chatMessages");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateBotReply(query) {
  const q = query.toLowerCase();
  const tempF = state.weather.tempF;

  if (q.includes("dress") || q.includes("skirt")) {
    return tempF >= state.preferences.heatThreshold - 10
      ? `A dress or skirt is a great option for today's ${tempF}°F weather!`
      : `It might feel chilly in a light dress today at ${tempF}°F. Consider tights or a long coat.`;
  }

  if (q.includes("short") || q.includes("shorts")) {
    return tempF >= state.preferences.heatThreshold - 5
      ? `Shorts are ideal for today's ${tempF}°F weather!`
      : `It's slightly chilly for shorts today at ${tempF}°F. Consider pants instead.`;
  }

  if (q.includes("jacket") || q.includes("coat")) {
    return tempF <= state.preferences.coldThreshold
      ? `Yes, an outerwear layer is recommended for ${tempF}°F weather.`
      : `A heavy jacket may be too warm for today's temperature (${tempF}°F).`;
  }

  return `For today's weather in ${state.weather.city} (${tempF}°F, ${state.weather.condition}), stick with your tailored style profile.`;
}
