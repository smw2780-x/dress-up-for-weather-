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

const clothingDatabase = {
  freezing: {
    casual: { tops: ["Thermal Shirt", "Fleece Hoodie"], bottoms: ["Thermal Jeans"], outerwear: ["Heavy Down Parka"], footwear: ["Insulated Boots"], accessories: ["Beanie", "Gloves"] },
    formal: { tops: ["Thermal Dress Shirt"], bottoms: ["Heavy Wool Trousers"], outerwear: ["Wool Overcoat"], footwear: ["Lined Leather Boots"], accessories: ["Gloves"] },
    athletic: { tops: ["Thermal Compression Top"], bottoms: ["Thermal Running Tights"], outerwear: ["Insulated Jacket"], footwear: ["Trail Running Shoes"], accessories: ["Headband"] }
  },
  cold: {
    casual: { tops: ["Long Sleeve Henley"], bottoms: ["Jeans"], outerwear: ["Puffer Jacket"], footwear: ["Boots"], accessories: ["Knit Beanie"] },
    formal: { tops: ["Dress Shirt"], bottoms: ["Wool Trousers"], outerwear: ["Trench Coat"], footwear: ["Chelsea Boots"], accessories: ["Scarf"] },
    athletic: { tops: ["Long Sleeve Tech Shirt"], bottoms: ["Fleece Joggers"], outerwear: ["Windbreaker"], footwear: ["Running Shoes"], accessories: ["Light Gloves"] }
  },
  mild: {
    casual: { tops: ["Cotton T-Shirt"], bottoms: ["Jeans"], outerwear: ["Light Cardigan"], footwear: ["Sneakers"], accessories: ["Baseball Cap"] },
    formal: { tops: ["Button-Down Shirt"], bottoms: ["Tailored Trousers"], outerwear: ["Blazer"], footwear: ["Loafers"], accessories: ["Watch"] },
    athletic: { tops: ["Short Sleeve Tee"], bottoms: ["Track Pants"], outerwear: ["Track Jacket"], footwear: ["Running Sneakers"], accessories: ["Sweatband"] }
  },
  warm: {
    casual: { tops: ["Graphic T-Shirt"], bottoms: ["Chino Shorts"], outerwear: [], footwear: ["Canvas Sneakers"], accessories: ["Sunglasses"] },
    formal: { tops: ["Linen Shirt"], bottoms: ["Linen Trousers"], outerwear: [], footwear: ["Suede Loafers"], accessories: ["Pocket Square"] },
    athletic: { tops: ["Breathable Tank Top"], bottoms: ["Running Shorts"], outerwear: [], footwear: ["Lightweight Trainers"], accessories: ["Visor"] }
  },
  hot: {
    casual: { tops: ["Tank Top"], bottoms: ["Athletic Shorts"], outerwear: [], footwear: ["Sandals"], accessories: ["Sun Hat", "Sunglasses"] },
    formal: { tops: ["Short Sleeve Linen Shirt"], bottoms: ["Tropical Trousers"], outerwear: [], footwear: ["Unlined Loafers"], accessories: ["Hat"] },
    athletic: { tops: ["Ultra-Light Tank"], bottoms: ["Mesh Shorts"], outerwear: [], footwear: ["Breathable Runners"], accessories: ["Hydration Belt"] }
  }
};

// Avatar Emoji Layers for "Bitmoji" visual representation
const avatarLayers = {
  freezing: { hat: "⛷️", torso: "🧥", legs: "👖", feet: "🥾" },
  cold: { hat: "🧶", torso: "🧥", legs: "👖", feet: "🥾" },
  mild: { hat: "🧢", torso: "👔", legs: "👖", feet: "👟" },
  warm: { hat: "🕶️", torso: "👕", legs: "🩳", feet: "👟" },
  hot: { hat: "👒", torso: "🎽", legs: "🩳", feet: "🩴" }
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateSliderReadouts();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  // Slider Real-time Number Updates
  const coldScale = document.getElementById("coldScale");
  const heatScale = document.getElementById("heatScale");

  if (coldScale) {
    coldScale.addEventListener("input", updateSliderReadouts);
  }
  if (heatScale) {
    heatScale.addEventListener("input", updateSliderReadouts);
  }

  // Navigation
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

  if (state.unit === "F") {
    document.getElementById("coldReadout").innerText = `${coldValF}°F`;
    document.getElementById("heatReadout").innerText = `${heatValF}°F`;
  } else {
    const coldValC = Math.round(((coldValF - 32) * 5) / 9);
    const heatValC = Math.round(((heatValF - 32) * 5) / 9);
    document.getElementById("coldReadout").innerText = `${coldValC}°C`;
    document.getElementById("heatReadout").innerText = `${heatValC}°C`;
  }
}

function saveStep1Preferences() {
  state.preferences.coldThreshold = parseInt(document.getElementById("coldScale").value, 10);
  state.preferences.heatThreshold = parseInt(document.getElementById("heatScale").value, 10);

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
  
  // Render Avatar preview matching current temperature tier
  renderAvatar(currentTier);

  const activeStyles = state.preferences.preferredStyles;
  let combinedTops = [];
  let combinedBottoms = [];
  let combinedFootwear = [];
  let combinedAccessories = [];

  activeStyles.forEach((styleKey) => {
    const outfit = clothingDatabase[currentTier][styleKey];
    if (outfit) {
      if (outfit.tops) combinedTops.push(...outfit.tops);
      if (outfit.outerwear) combinedTops.push(...outfit.outerwear);
      if (outfit.bottoms) combinedBottoms.push(...outfit.bottoms);
      if (outfit.footwear) combinedFootwear.push(...outfit.footwear);
      if (outfit.accessories) combinedAccessories.push(...outfit.accessories);
    }
  });

  renderTags("topRecommendations", [...new Set(combinedTops)]);
  renderTags("bottomRecommendations", [...new Set(combinedBottoms)]);
  renderTags("gearRecommendations", [...new Set([...combinedFootwear, ...combinedAccessories])]);
}

function renderAvatar(tier) {
  const layer = avatarLayers[tier] || avatarLayers.mild;
  document.getElementById("avatarHat").innerText = layer.hat;
  document.getElementById("avatarTorso").innerText = layer.torso;
  document.getElementById("avatarLegs").innerText = layer.legs;
  document.getElementById("avatarFeet").innerText = layer.feet;
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

  if (q.includes("short") || q.includes("shorts")) {
    return tempF >= state.preferences.heatThreshold - 5
      ? `Shorts are ideal for today's ${tempF}°F weather!`
      : `It's slightly chilly for shorts today at ${tempF}°F. Consider pants instead.`;
  }

  if (q.includes("jacket") || q.includes("coat")) {
    return tempF <= state.preferences.coldThreshold
      ? `Yes, an outerwear layer is recommended for ${tempF}°F weather.`
      : `A jacket may be too warm for today's temperature (${tempF}°F).`;
  }

  return `For today's weather in ${state.weather.city} (${tempF}°F, ${state.weather.condition}), stick with your selected style layerings.`;
}
