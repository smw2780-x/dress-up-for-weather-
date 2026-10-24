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
    preferredStyle: "casual",
    hotStyle: ["T-shirt", "Shorts"],
    coldStyle: ["Hoodie", "Wool Coat"]
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

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUnitToggleDisplay();
});

function setupEventListeners() {
  // Step Navigation Buttons
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

  const styleRadio = document.querySelector('input[name="preferredStyle"]:checked');
  if (styleRadio) state.preferences.preferredStyle = styleRadio.value;

  const hotChecked = Array.from(document.querySelectorAll('input[name="hotStyle"]:checked')).map(el => el.value);
  if (hotChecked.length) state.preferences.hotStyle = hotChecked;

  const coldChecked = Array.from(document.querySelectorAll('input[name="coldStyle"]:checked')).map(el => el.value);
  if (coldChecked.length) state.preferences.coldStyle = coldChecked;
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
    state.weather.iconCode = data.weather[0].icon;
    state.weather.humidity = data.main.humidity;
    state.weather.windSpeed = `${Math.round(data.wind.speed)} mph`;
  } catch (error) {
    // Fallback Mock Data
    const mockTemp = Math.floor(Math.sin(cityName.length) * 25 + 65);
    state.weather.city = cityName;
    state.weather.tempF = mockTemp;
    state.weather.tempC = Math.round(((mockTemp - 32) * 5) / 9);
    state.weather.condition = mockTemp > 75 ? "clear sky" : "partly cloudy";
    state.weather.iconCode = mockTemp > 75 ? "01d" : "02d";
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

  updateAvatarColors(state.weather.tempF);
  updateOutfitTags(state.weather.tempF);
}

function updateAvatarColors(tempF) {
  const torso = document.getElementById("avatarTorso");
  const legs = document.getElementById("avatarLegs");

  if (!torso || !legs) return;

  if (tempF <= state.preferences.coldThreshold) {
    torso.setAttribute("fill", "#2b6cb0"); // Deep blue winter jacket
    legs.setAttribute("fill", "#1a202c");  // Dark heavy trousers
  } else if (tempF >= state.preferences.heatThreshold) {
    torso.setAttribute("fill", "#e53e3e"); // Light red t-shirt
    legs.setAttribute("fill", "#a0aec0");  // Short beige cut
  } else {
    torso.setAttribute("fill", "#dd6b20"); // Orange sweater
    legs.setAttribute("fill", "#2d3748");  // Standard jeans
  }
}

function updateOutfitTags(tempF) {
  const topContainer = document.getElementById("topRecommendations");
  const bottomContainer = document.getElementById("bottomRecommendations");
  const gearContainer = document.getElementById("gearRecommendations");

  if (tempF <= state.preferences.coldThreshold) {
    renderTags("topRecommendations", state.preferences.coldStyle);
    renderTags("bottomRecommendations", ["Warm Trousers", "Heavy Jeans"]);
    renderTags("gearRecommendations", ["Boots", "Beanie"]);
  } else if (tempF >= state.preferences.heatThreshold) {
    renderTags("topRecommendations", state.preferences.hotStyle);
    renderTags("bottomRecommendations", ["Light Shorts", "Linen Pants"]);
    renderTags("gearRecommendations", ["Sandals", "Sunglasses"]);
  } else {
    renderTags("topRecommendations", ["Light Sweater", "Denim Jacket"]);
    renderTags("bottomRecommendations", ["Jeans", "Chinos"]);
    renderTags("gearRecommendations", ["Sneakers", "Cap"]);
  }
}

function renderTags(elementId, itemsArray) {
  const container = document.getElementById(elementId);
  if (!container) return;
  container.innerHTML = "";
  itemsArray.forEach(item => {
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
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  appendChat(text, "user");
  input.value = "";

  setTimeout(() => {
    appendChat(`For ${state.weather.tempF}°F weather in ${state.weather.city}, "${text}" is a solid match for your selected preferences!`, "bot");
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
