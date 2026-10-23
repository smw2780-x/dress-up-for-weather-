/**
 * WeatherWear - Main Application Script
 */

// Global App State
const state = {
  unit: "F", // "F" or "C"
  currentStep: 1,
  preferences: {
    coldThreshold: 50, // °F where user feels cold
    heatThreshold: 80, // °F where user feels hot
    preferredStyles: ["casual"], // Array supporting multiple styles: "casual", "formal", "athletic"
    hotItems: [],
    coldItems: []
  },
  weather: {
    city: "New York",
    tempF: 68,
    tempC: 20,
    condition: "Partly Cloudy",
    humidity: 55,
    wind: "10 mph"
  }
};

// Comprehensive Clothing Database categorized by Tier and Style
const clothingDatabase = {
  freezing: {
    casual: { tops: ["Thermal Shirt", "Fleece Hoodie"], bottoms: ["Thermal Jeans", "Fleece Sweatpants"], outerwear: ["Heavy Down Parka"], footwear: ["Insulated Winter Boots"], accessories: ["Beanie", "Wool Scarf", "Heavy Gloves"] },
    formal: { tops: ["Thermal Dress Shirt", "Cashmere Sweater"], bottoms: ["Heavy Wool Trousers"], outerwear: ["Wool Overcoat"], footwear: ["Lined Leather Boots"], accessories: ["Leather Gloves", "Cashmere Scarf"] },
    athletic: { tops: ["Thermal Compression Top"], bottoms: ["Thermal Running Tights"], outerwear: ["Insulated Running Jacket"], footwear: ["Trail Running Shoes"], accessories: ["Thermal Headband", "Touchscreen Gloves"] }
  },
  cold: {
    casual: { tops: ["Long Sleeve Henley", "Knit Sweater"], bottoms: ["Jeans", "Cargo Pants"], outerwear: ["Puffer Jacket", "Denim Jacket"], footwear: ["Leather Boots", "High-Top Sneakers"], accessories: ["Knit Beanie"] },
    formal: { tops: ["Dress Shirt", "Fine Sweater"], bottoms: ["Wool Trousers", "Chinos"], outerwear: ["Trench Coat"], footwear: ["Chelsea Boots", "Oxfords"], accessories: ["Silk/Wool Scarf"] },
    athletic: { tops: ["Long Sleeve Tech Shirt"], bottoms: ["Fleece Joggers"], outerwear: ["Windbreaker"], footwear: ["Running Shoes"], accessories: ["Light Gloves"] }
  },
  mild: {
    casual: { tops: ["Cotton T-Shirt", "Flannel Shirt"], bottoms: ["Jeans", "Chinos"], outerwear: ["Light Cardigan", "Bomber Jacket"], footwear: ["Sneakers", "Loafers"], accessories: ["Baseball Cap"] },
    formal: { tops: ["Button-Down Shirt", "Blazer"], bottoms: ["Tailored Trousers"], outerwear: ["Light Trench Coat"], footwear: ["Derby Shoes", "Loafers"], accessories: ["Leather Watch"] },
    athletic: { tops: ["Short Sleeve Tech Tee"], bottoms: ["Track Pants"], outerwear: ["Track Jacket"], footwear: ["Running Sneakers"], accessories: ["Sweatband"] }
  },
  warm: {
    casual: { tops: ["Graphic T-Shirt", "Polo Shirt"], bottoms: ["Chino Shorts", "Light Jeans"], outerwear: [], footwear: ["Canvas Sneakers", "Slip-Ons"], accessories: ["Sunglasses"] },
    formal: { tops: ["Linen Shirt", "Dress Shirt"], bottoms: ["Linen Trousers", "Light Chinos"], outerwear: ["Linen Blazer"], footwear: ["Suede Loafers"], accessories: ["Pocket Square"] },
    athletic: { tops: ["Breathable Tank Top"], bottoms: ["Running Shorts"], outerwear: [], footwear: ["Lightweight Trainers"], accessories: ["Visor", "Sunglasses"] }
  },
  hot: {
    casual: { tops: ["Tank Top", "Light Linen Shirt"], bottoms: ["Athletic Shorts", "Linen Shorts"], outerwear: [], footwear: ["Sandals", "Canvas Shoes"], accessories: ["Sun Hat", "Sunglasses"] },
    formal: { tops: ["Short Sleeve Linen Shirt"], bottoms: ["Tropical Wool Trousers"], outerwear: [], footwear: ["Unlined Loafers"], accessories: ["Woven Hat"] },
    athletic: { tops: ["Ultra-Light Tank Top"], bottoms: ["Mesh Running Shorts"], outerwear: [], footwear: ["Breathable Running Shoes"], accessories: ["Hydration Belt"] }
  }
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  // Step 1 -> Step 2 Navigation
  const goToStep2Btn = document.getElementById("goToStep2Btn");
  if (goToStep2Btn) {
    goToStep2Btn.addEventListener("click", () => {
      saveStep1Preferences();
      switchStep(2);
    });
  }

  // Step 2 -> Step 1 Navigation
  const backToStep1Btn = document.getElementById("backToStep1Btn");
  if (backToStep1Btn) {
    backToStep1Btn.addEventListener("click", () => {
      switchStep(1);
    });
  }

  // Step 2 -> Finish Onboarding & Load Dashboard
  const finishOnboardingBtn = document.getElementById("finishOnboardingBtn");
  if (finishOnboardingBtn) {
    finishOnboardingBtn.addEventListener("click", async () => {
      const cityInput = document.getElementById("initialCityInput").value.trim();
      if (cityInput) {
        state.weather.city = cityInput;
      }
      await fetchWeatherData(state.weather.city);
      showDashboard();
    });
  }

  // Re-configure Profile Button from Dashboard
  const reconfigureBtn = document.getElementById("reconfigureBtn");
  if (reconfigureBtn) {
    reconfigureBtn.addEventListener("click", () => {
      document.getElementById("dashboardSection").classList.add("hidden");
      document.getElementById("onboardingSection").classList.remove("hidden");
      document.getElementById("stepIndicator").classList.remove("hidden");
      switchStep(1);
    });
  }

  // Dashboard Search Button
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
      const city = document.getElementById("cityInput").value.trim();
      if (city) {
        await fetchWeatherData(city);
        renderDashboard();
      }
    });
  }

  // Unit Toggle Button (°F / °C)
  const unitToggle = document.getElementById("unitToggle");
  if (unitToggle) {
    unitToggle.addEventListener("click", () => {
      state.unit = state.unit === "F" ? "C" : "F";
      updateUnitToggleDisplay();
      renderDashboard();
    });
  }

  // Chat Form Submission
  const chatForm = document.getElementById("chatForm");
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleChatSubmit();
    });
  }
}

// Save preferences collected in Step 1
function saveStep1Preferences() {
  state.preferences.coldThreshold = parseInt(document.getElementById("coldScale").value, 10);
  state.preferences.heatThreshold = parseInt(document.getElementById("heatScale").value, 10);

  // Collect all checked styles
  const selectedStyles = Array.from(
    document.querySelectorAll('input[name="preferredStyle"]:checked')
  ).map((el) => el.value);

  // Fallback to "casual" if user leaves all checkboxes empty
  state.preferences.preferredStyles = selectedStyles.length > 0 ? selectedStyles : ["casual"];

  state.preferences.hotItems = Array.from(
    document.querySelectorAll('input[name="hotStyle"]:checked')
  ).map((el) => el.value);

  state.preferences.coldItems = Array.from(
    document.querySelectorAll('input[name="coldStyle"]:checked')
  ).map((el) => el.value);
}

// Switch Wizard Steps
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

// Show Dashboard & Hide Onboarding
function showDashboard() {
  document.getElementById("onboardingSection").classList.add("hidden");
  document.getElementById("stepIndicator").classList.add("hidden");
  document.getElementById("dashboardSection").classList.remove("hidden");
  renderDashboard();
}

// Fetch Weather Data (Simulated for testing without an API key)
async function fetchWeatherData(cityName) {
  const mockTempF = Math.floor(Math.sin(cityName.length) * 25 + 65);
  state.weather.city = cityName;
  state.weather.tempF = mockTempF;
  state.weather.tempC = Math.round(((mockTempF - 32) * 5) / 9);

  if (mockTempF < 40) {
    state.weather.condition = "Chilly & Clear";
  } else if (mockTempF > 75) {
    state.weather.condition = "Warm & Sunny";
  } else {
    state.weather.condition = "Partly Cloudy";
  }
}

// Determine Temperature Tier Based on User Sensitivity Settings
function getTemperatureTier(tempF) {
  const coldCutoff = state.preferences.coldThreshold;
  const heatCutoff = state.preferences.heatThreshold;

  if (tempF <= coldCutoff - 15) return "freezing";
  if (tempF <= coldCutoff) return "cold";
  if (tempF < heatCutoff - 10) return "mild";
  if (tempF < heatCutoff) return "warm";
  return "hot";
}

// Render Dashboard UI
function renderDashboard() {
  const tempVal = state.unit === "F" ? `${state.weather.tempF}°F` : `${state.weather.tempC}°C`;
  
  document.getElementById("locationName").innerText = state.weather.city;
  document.getElementById("tempDisplay").innerText = tempVal;
  document.getElementById("conditionText").innerText = state.weather.condition;
  document.getElementById("weatherConditionBadge").innerText = state.weather.condition.split(" ")[0];

  const currentTier = getTemperatureTier(state.weather.tempF);
  const activeStyles = state.preferences.preferredStyles;

  // Aggregate recommendations across all selected styles
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

  // Render deduplicated tags
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

// Chat Assistant Logic
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
      ? `Shorts are a great choice for today's ${tempF}°F weather!`
      : `It might be a bit cool for shorts today at ${tempF}°F. Consider trousers or chinos.`;
  }

  if (q.includes("jacket") || q.includes("coat")) {
    return tempF <= state.preferences.coldThreshold
      ? `Yes! A jacket or coat is strongly recommended for ${tempF}°F weather.`
      : `A jacket might be too warm for today's weather (${tempF}°F). A light layer should be enough.`;
  }

  const stylesText = state.preferences.preferredStyles.join(", ");
  return `Based on today's weather (${tempF}°F, ${state.weather.condition}) and your chosen styles (${stylesText}), comfortable layering is recommended!`;
}
