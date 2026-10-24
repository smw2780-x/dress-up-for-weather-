/**
 * WeatherWear - Personal Weather Dashboard & Style Advisor
 */

const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY"; // Replace with your API key

const state = {
  unit: "F",
  currentStep: 1,
  preferences: {
    coldThreshold: 50,
    heatThreshold: 80,
    preferredStyles: ["Casual", "Formal / Business"],
    topsStyle: ["T-shirt", "Button-up / Polo"],
    bottomsStyle: ["Jeans", "Chinos / Trousers"],
    layersStyle: ["Hoodie / Sweatshirt", "Light Cardigan / Sweater"],
    shoesStyle: ["Sneakers", "Loafers / Dress Shoes"],
    accessoriesStyle: ["Sunglasses", "Cap / Beanie"]
  },
  weather: {
    city: "New York",
    tempF: 68,
    tempC: 20,
    condition: "Partly Cloudy",
    humidity: 55,
    windSpeed: "10 mph"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  document.getElementById("goToStep2Btn")?.addEventListener("click", () => {
    saveStep1Preferences();
    switchStep(2);
  });

  document.getElementById("backToStep1Btn")?.addEventListener("click", () => switchStep(1));

  document.getElementById("finishOnboardingBtn")?.addEventListener("click", async () => {
    const cityInput = document.getElementById("initialCityInput")?.value.trim();
    if (cityInput) state.weather.city = cityInput;
    await fetchWeatherData(state.weather.city);
    showDashboard();
  });

  document.getElementById("reconfigureBtn")?.addEventListener("click", () => {
    document.getElementById("dashboardSection")?.classList.add("hidden");
    document.getElementById("onboardingSection")?.classList.remove("hidden");
    document.getElementById("stepIndicator")?.classList.remove("hidden");
    switchStep(1);
  });

  document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const city = document.getElementById("cityInput")?.value.trim();
    if (city) {
      await fetchWeatherData(city);
      renderDashboard();
    }
  });

  document.getElementById("unitToggle")?.addEventListener("click", () => {
    state.unit = state.unit === "F" ? "C" : "F";
    updateUnitToggleDisplay();
    renderDashboard();
  });

  document.getElementById("chatForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleChatSubmit();
  });
}

function saveStep1Preferences() {
  const coldVal = document.getElementById("coldScale");
  const heatVal = document.getElementById("heatScale");

  if (coldVal) state.preferences.coldThreshold = parseInt(coldVal.value, 10);
  if (heatVal) state.preferences.heatThreshold = parseInt(heatVal.value, 10);

  // Save selected overall styles
  const checkedStyles = Array.from(document.querySelectorAll('input[name="preferredStyle"]:checked')).map(el => el.value);
  if (checkedStyles.length) state.preferences.preferredStyles = checkedStyles;

  // Save detailed item selections
  state.preferences.topsStyle = Array.from(document.querySelectorAll('input[name="topsStyle"]:checked')).map(el => el.value);
  state.preferences.bottomsStyle = Array.from(document.querySelectorAll('input[name="bottomsStyle"]:checked')).map(el => el.value);
  state.preferences.layersStyle = Array.from(document.querySelectorAll('input[name="layersStyle"]:checked')).map(el => el.value);
  state.preferences.shoesStyle = Array.from(document.querySelectorAll('input[name="shoesStyle"]:checked')).map(el => el.value);
  state.preferences.accessoriesStyle = Array.from(document.querySelectorAll('input[name="accessoriesStyle"]:checked')).map(el => el.value);
}

function switchStep(stepNumber) {
  state.currentStep = stepNumber;
  const step1 = document.getElementById("step1Content");
  const step2 = document.getElementById("step2Content");
  const badge1 = document.getElementById("badgeStep1");
  const badge2 = document.getElementById("badgeStep2");

  if (stepNumber === 1) {
    step1?.classList.remove("hidden");
    step2?.classList.add("hidden");
    badge1?.classList.add("active");
    badge2?.classList.remove("active");
  } else {
    step1?.classList.add("hidden");
    step2?.classList.remove("hidden");
    badge1?.classList.remove("active");
    badge2?.classList.add("active");
  }
}

function showDashboard() {
  document.getElementById("onboardingSection")?.classList.add("hidden");
  document.getElementById("stepIndicator")?.classList.add("hidden");
  document.getElementById("dashboardSection")?.classList.remove("hidden");
  renderDashboard();
}

async function fetchWeatherData(cityName) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    state.weather.city = `${data.name}, ${data.sys.country}`;
    state.weather.tempF = Math.round(data.main.temp);
    state.weather.tempC = Math.round(((data.main.temp - 32) * 5) / 9);
    state.weather.condition = data.weather[0].description;
    state.weather.humidity = data.main.humidity;
    state.weather.windSpeed = `${Math.round(data.wind.speed)} mph`;
  } catch (error) {
    // Fallback Mock Data
    const mockTemp = Math.floor(Math.sin(cityName.length) * 25 + 65);
    state.weather.city = cityName;
    state.weather.tempF = mockTemp;
    state.weather.tempC = Math.round(((mockTemp - 32) * 5) / 9);
    state.weather.condition = mockTemp > 75 ? "clear sky" : "partly cloudy";
    state.weather.humidity = 55;
    state.weather.windSpeed = "10 mph";
  }
}

function renderDashboard() {
  const tempVal = state.unit === "F" ? `${state.weather.tempF}°F` : `${state.weather.tempC}°C`;

  if (document.getElementById("locationName")) document.getElementById("locationName").innerText = state.weather.city;
  if (document.getElementById("tempDisplay")) document.getElementById("tempDisplay").innerText = tempVal;
  if (document.getElementById("conditionText")) document.getElementById("conditionText").innerText = state.weather.condition;
  if (document.getElementById("humidityVal")) document.getElementById("humidityVal").innerText = `${state.weather.humidity}%`;
  if (document.getElementById("windVal")) document.getElementById("windVal").innerText = state.weather.windSpeed;

  renderCategoryRecommendations(state.weather.tempF);
}

function renderCategoryRecommendations(tempF) {
  // 1. Render all selected style choices as options
  renderTags("styleCategoryRecommendations", state.preferences.preferredStyles, true);

  // 2. Filter Tops based on temperature threshold
  let tops = state.preferences.topsStyle;
  if (tempF <= state.preferences.coldThreshold) {
    tops = tops.filter(item => item !== "Tank top");
  }
  renderTags("topRecommendations", tops.length ? tops : ["Long Sleeve Shirts", "Sweaters"]);

  // 3. Filter Bottoms based on temperature threshold
  let bottoms = state.preferences.bottomsStyle;
  if (tempF <= state.preferences.coldThreshold) {
    bottoms = bottoms.filter(item => item !== "Shorts");
  } else if (tempF >= state.preferences.heatThreshold) {
    bottoms = bottoms.length ? bottoms : ["Shorts", "Light Linen Pants"];
  }
  renderTags("bottomRecommendations", bottoms.length ? bottoms : ["Jeans", "Chinos / Trousers"]);

  // 4. Render Outerwear/Layers options based on weather
  let layers = [];
  if (tempF <= state.preferences.coldThreshold) {
    layers = state.preferences.layersStyle.length ? state.preferences.layersStyle : ["Puffer Jacket / Heavy Coat", "Hoodie"];
  } else if (tempF < state.preferences.heatThreshold) {
    layers = state.preferences.layersStyle.filter(item => !item.includes("Heavy Coat"));
    if (!layers.length) layers = ["Light Sweater", "Cardigan"];
  } else {
    layers = ["No heavy layers needed"];
  }
  renderTags("layerRecommendations", layers);

  // 5. Render Shoes options
  let shoes = state.preferences.shoesStyle;
  if (tempF <= state.preferences.coldThreshold) {
    shoes = shoes.filter(item => item !== "Sandals / Slides");
  }
  renderTags("shoesRecommendations", shoes.length ? shoes : ["Sneakers", "Boots"]);

  // 6. Render Accessories options
  let accessories = state.preferences.accessoriesStyle;
  renderTags("gearRecommendations", accessories.length ? accessories : ["Sunglasses"]);
}

function renderTags(elementId, itemsArray, isStyleTag = false) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";

  itemsArray.forEach((item) => {
    const span = document.createElement("span");
    span.className = "tag";
    if (isStyleTag) {
      span.style.background = "var(--primary-color, #3b82f6)";
      span.style.color = "#ffffff";
    }
    span.innerText = item;
    container.appendChild(span);
  });
}

function updateUnitToggleDisplay() {
  const btn = document.getElementById("unitToggle");
  if (btn) btn.innerText = `Unit: °${state.unit}`;
}

function handleChatSubmit() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  appendChat(text, "user");
  input.value = "";

  setTimeout(() => {
    appendChat(
      `For ${state.weather.tempF}°F weather in ${state.weather.city}, "${text}" works great with your selected options!`,
      "bot"
    );
  }, 400);
}

function appendChat(text, sender) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerText = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
