/**
 * WeatherWear - Option A: Personal Weather Dashboard
 * Integrated with OpenWeather API
 */

// Replace with your actual OpenWeather API key
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";

// Global Application State
const state = {
  unit: "F", // "F" or "C"
  currentStep: 1,
  preferences: {
    coldThreshold: 50,
    heatThreshold: 80,
    preferredStyles: ["casual"],
    hotItems: [],
    coldItems: []
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

// Clothing Database for Recommendation Engine
const clothingDatabase = {
  freezing: {
    casual: { tops: ["Thermal Shirt", "Fleece Hoodie"], bottoms: ["Thermal Jeans"], outerwear: ["Heavy Down Parka"], footwear: ["Insulated Boots"], accessories: ["Beanie", "Scarf", "Gloves"] },
    formal: { tops: ["Thermal Dress Shirt", "Cashmere Sweater"], bottoms: ["Heavy Wool Trousers"], outerwear: ["Wool Overcoat"], footwear: ["Lined Leather Boots"], accessories: ["Leather Gloves"] },
    athletic: { tops: ["Thermal Compression Top"], bottoms: ["Thermal Running Tights"], outerwear: ["Insulated Running Jacket"], footwear: ["Trail Running Shoes"], accessories: ["Thermal Headband"] }
  },
  cold: {
    casual: { tops: ["Long Sleeve Henley", "Knit Sweater"], bottoms: ["Jeans", "Cargo Pants"], outerwear: ["Puffer Jacket"], footwear: ["Leather Boots"], accessories: ["Knit Beanie"] },
    formal: { tops: ["Dress Shirt", "Fine Sweater"], bottoms: ["Wool Trousers"], outerwear: ["Trench Coat"], footwear: ["Chelsea Boots"], accessories: ["Silk/Wool Scarf"] },
    athletic: { tops: ["Long Sleeve Tech Shirt"], bottoms: ["Fleece Joggers"], outerwear: ["Windbreaker"], footwear: ["Running Shoes"], accessories: ["Light Gloves"] }
  },
  mild: {
    casual: { tops: ["Cotton T-Shirt", "Flannel Shirt"], bottoms: ["Jeans", "Chinos"], outerwear: ["Light Cardigan", "Bomber Jacket"], footwear: ["Sneakers"], accessories: ["Baseball Cap"] },
    formal: { tops: ["Button-Down Shirt", "Blazer"], bottoms: ["Tailored Trousers"], outerwear: ["Unstructured Blazer"], footwear: ["Loafers"], accessories: ["Leather Watch"] },
    athletic: { tops: ["Short Sleeve Tech Tee"], bottoms: ["Track Pants"], outerwear: ["Track Jacket"], footwear: ["Running Sneakers"], accessories: ["Sweatband"] }
  },
  warm: {
    casual: { tops: ["Graphic T-Shirt", "Polo Shirt"], bottoms: ["Chino Shorts", "Light Jeans"], outerwear: [], footwear: ["Canvas Sneakers"], accessories: ["Sunglasses"] },
    formal: { tops: ["Linen Shirt", "Dress Shirt"], bottoms: ["Linen Trousers"], outerwear: ["Linen Blazer"], footwear: ["Suede Loafers"], accessories: ["Pocket Square"] },
    athletic: { tops: ["Breathable Tank Top"], bottoms: ["Running Shorts"], outerwear: [], footwear: ["Lightweight Trainers"], accessories: ["Visor"] }
  },
  hot: {
    casual: { tops: ["Tank Top", "Light Linen Shirt"], bottoms: ["Athletic Shorts"], outerwear: [], footwear: ["Sandals"], accessories: ["Sun Hat", "Sunglasses"] },
    formal: { tops: ["Short Sleeve Linen Shirt"], bottoms: ["Tropical Wool Trousers"], outerwear: [], footwear: ["Unlined Loafers"], accessories: ["Woven Hat"] },
    athletic: { tops: ["Ultra-Light Tank Top"], bottoms: ["Mesh Running Shorts"], outerwear: [], footwear: ["Breathable Runners"], accessories: ["Hydration Belt"] }
  }
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  // Navigation: Step 1 -> Step 2
  const goToStep2Btn = document.getElementById("goToStep2Btn");
  if (goToStep2Btn) {
    goToStep2Btn.addEventListener("click", () => {
      saveStep1Preferences();
      switchStep(2);
    });
  }

  // Navigation: Step 2 -> Step 1
  const backToStep1Btn = document.getElementById("backToStep1Btn");
  if (backToStep1Btn) {
    backToStep1Btn.addEventListener("click", () => switchStep(1));
  }

  // Finish Onboarding & Load Live Weather
  const finishOnboardingBtn = document.getElementById("finishOnboardingBtn");
  if (finishOnboardingBtn) {
    finishOnboardingBtn.addEventListener("click", async () => {
      const cityInput = document.getElementById("initialCityInput").value.trim();
      if (cityInput) state.weather.city = cityInput;
      await fetchOpenWeatherData(state.weather.city);
      showDashboard();
    });
  }

  // Re-configure Profile
  const reconfigureBtn = document.getElementById("reconfigureBtn");
  if (reconfigureBtn) {
    reconfigureBtn.addEventListener("click", () => {
      document.getElementById("dashboardSection").classList.add("hidden");
      document.getElementById("onboardingSection").classList.remove("hidden");
      document.getElementById("stepIndicator").classList.remove("hidden");
      switchStep(1);
    });
  }

  // Dashboard Location Search Update
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const city = document.getElementById("cityInput").value.trim();
      if (city) {
        await fetchOpenWeatherData(city);
        renderDashboard();
      }
    });
  }

  // Unit Toggle (°F / °C)
  const unitToggle = document.getElementById("unitToggle");
  if (unitToggle) {
    unitToggle.addEventListener("click", () => {
      state.unit = state.unit === "F" ? "C" : "F";
      updateUnitToggleDisplay();
      renderDashboard();
    });
  }

  // Outfit Assistant Chat Form
  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleChatSubmit();
    });
  }
}

// Save Preferences from Wizard
function saveStep1Preferences() {
  state.preferences.coldThreshold = parseInt(document.getElementById("coldScale").value, 10);
  state.preferences.heatThreshold = parseInt(document.getElementById("heatScale").value, 10);

  const selectedStyles = Array.from(
    document.querySelectorAll('input[name="preferredStyle"]:checked')
  ).map((el) => el.value);

  state.preferences.preferredStyles = selectedStyles.length > 0 ? selectedStyles : ["casual"];
}

// Wizard Step Switcher
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

/**
 * Data Layer: OpenWeather API Single Call
 */
async function fetchOpenWeatherData(cityName) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error("City not found or API error");
    
    const data = await response.json();

    // Processing Layer: Extract & Format Data
    state.weather.city = `${data.name}, ${data.sys.country}`;
    state.weather.tempF = Math.round(data.main.temp);
    state.weather.tempC = Math.round(((data.main.temp - 32) * 5) / 9);
    state.weather.condition = data.weather[0].description;
    state.weather.iconCode = data.weather[0].icon;
    state.weather.humidity = data.main.humidity;
    state.weather.windSpeed = `${Math.round(data.wind.speed)} mph`;
  } catch (error) {
    console.warn("Using fallback weather data due to API key error or network failure:", error.message);
    // Fallback simulation for offline/preview testing
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

/**
 * UI Layer: Display Weather Conditions and Suggestions
 */
function renderDashboard() {
  const tempVal = state.unit === "F" ? `${state.weather.tempF}°F` : `${state.weather.tempC}°C`;
  
  document.getElementById("locationName").innerText = state.weather.city;
  document.getElementById("tempDisplay").innerText = tempVal;
  document.getElementById("conditionText").innerText = state.weather.condition;
  
  // Weather condition badge with icon mapping
  const badge = document.getElementById("weatherConditionBadge");
  const iconUrl = `https://openweathermap.org/img/wn/${state.weather.iconCode}.png`;
  badge.innerHTML = `<img src="${iconUrl}" alt="weather icon" style="vertical-align: middle; width: 24px;"> ${state.weather.condition}`;

  document.getElementById("humidityVal").innerText = `${state.weather.humidity}%`;
  document.getElementById("windVal").innerText = state.weather.windSpeed;

  const currentTier = getTemperatureTier(state.weather.tempF);
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

// Outfit Advisor Chat
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
      : `It's slightly chilly for shorts today at ${tempF}°F. Consider pants or trousers instead.`;
  }

  if (q.includes("jacket") || q.includes("coat")) {
    return tempF <= state.preferences.coldThreshold
      ? `Yes, an outerwear layer is recommended for ${tempF}°F weather.`
      : `A thick jacket may be too warm for today's temperature (${tempF}°F).`;
  }

  return `For today's weather in ${state.weather.city} (${tempF}°F, ${state.weather.condition}), stick with your selected style layerings.`;
}
