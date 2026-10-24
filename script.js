/**
 * WeatherWear - Personal Weather Dashboard & Style Advisor
 */

// Replace with your valid OpenWeatherMap API key (e.g. "a1b2c3d4e5...")
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";

const state = {
  unit: "F",
  currentStep: 1,
  preferences: {
    coldThreshold: 50,
    heatThreshold: 80,
    preferredStyles: ["casual"],
    genderExpression: 5,
    hotStyle: ["T-shirt", "Shorts"],
    coldStyle: ["Hoodie", "Wool Coat"],
  },
  weather: {
    city: "New York",
    tempF: 68,
    tempC: 20,
    condition: "Partly Cloudy",
    iconCode: "02d",
    humidity: 55,
    windSpeed: "10 mph",
  },
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
  const genderVal = document.getElementById("genderStyleScale");

  if (coldVal) state.preferences.coldThreshold = parseInt(coldVal.value, 10);
  if (heatVal) state.preferences.heatThreshold = parseInt(heatVal.value, 10);
  if (genderVal) state.preferences.genderExpression = parseInt(genderVal.value, 10);

  const selectedStyles = Array.from(
    document.querySelectorAll('input[name="preferredStyle"]:checked')
  ).map((el) => el.value);
  if (selectedStyles.length) state.preferences.preferredStyles = selectedStyles;

  const hotChecked = Array.from(
    document.querySelectorAll('input[name="hotStyle"]:checked')
  ).map((el) => el.value);
  if (hotChecked.length) state.preferences.hotStyle = hotChecked;

  const coldChecked = Array.from(
    document.querySelectorAll('input[name="coldStyle"]:checked')
  ).map((el) => el.value);
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
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      cityName
    )}&units=imperial&appid=${OPENWEATHER_API_KEY}`;
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
  const tempVal =
    state.unit === "F" ? `${state.weather.tempF}°F` : `${state.weather.tempC}°C`;

  if (document.getElementById("locationName"))
    document.getElementById("locationName").innerText = state.weather.city;
  if (document.getElementById("tempDisplay"))
    document.getElementById("tempDisplay").innerText = tempVal;
  if (document.getElementById("conditionText"))
    document.getElementById("conditionText").innerText = state.weather.condition;
  if (document.getElementById("humidityVal"))
    document.getElementById("humidityVal").innerText = `${state.weather.humidity}%`;
  if (document.getElementById("windVal"))
    document.getElementById("windVal").innerText = state.weather.windSpeed;

  updateAvatarColors(state.weather.tempF);
  updateOutfitTags(state.weather.tempF);
}

function updateAvatarColors(tempF) {
  const torso = document.getElementById("avatarTorso");
  const jacket = document.getElementById("avatarJacket");
  const sleeveL = document.getElementById("sleeveLeft");
  const sleeveR = document.getElementById("sleeveRight");
  const pantsFull = document.getElementById("pantsFull");
  const pantsShorts = document.getElementById("pantsShorts");
  const legsBareL = document.getElementById("legsBare");
  const legsBareR = document.getElementById("legsBareRight");
  const shoeL = document.getElementById("shoeLeft");
  const shoeR = document.getElementById("shoeRight");
  const hat = document.getElementById("avatarHat");

  const styles = state.preferences.preferredStyles;
  const isAthletic = styles.includes("athletic");
  const isFormal = styles.includes("formal");
  const expression = state.preferences.genderExpression;

  // Cold Weather
  if (tempF <= state.preferences.coldThreshold) {
    if (jacket) jacket.classList.remove("hidden");
    if (hat) hat.classList.remove("hidden");
    if (pantsShorts) pantsShorts.classList.add("hidden");
    if (legsBareL) legsBareL.classList.add("hidden");
    if (legsBareR) legsBareR.classList.add("hidden");
    if (pantsFull) pantsFull.classList.remove("hidden");

    if (isFormal) {
      if (torso) torso.setAttribute("fill", "#1a202c");
      if (pantsFull) pantsFull.setAttribute("fill", "#2d3748");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#000000");
        shoeR.setAttribute("fill", "#000000");
      }
    } else if (isAthletic) {
      if (torso) torso.setAttribute("fill", "#3182ce");
      if (pantsFull) pantsFull.setAttribute("fill", "#1a202c");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#e53e3e");
        shoeR.setAttribute("fill", "#e53e3e");
      }
    } else {
      if (torso) torso.setAttribute("fill", "#dd6b20");
      if (pantsFull) pantsFull.setAttribute("fill", "#2b6cb0");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#744210");
        shoeR.setAttribute("fill", "#744210");
      }
    }
  }
  // Hot Weather
  else if (tempF >= state.preferences.heatThreshold) {
    if (jacket) jacket.classList.add("hidden");
    if (hat) hat.classList.add("hidden");
    if (pantsFull) pantsFull.classList.add("hidden");
    if (pantsShorts) pantsShorts.classList.remove("hidden");
    if (legsBareL) legsBareL.classList.remove("hidden");
    if (legsBareR) legsBareR.classList.remove("hidden");

    if (sleeveL && sleeveR) {
      sleeveL.setAttribute("height", "14");
      sleeveR.setAttribute("height", "14");
    }

    if (isAthletic) {
      if (torso) torso.setAttribute("fill", "#e53e3e");
      if (pantsShorts) pantsShorts.setAttribute("fill", "#2d3748");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#319795");
        shoeR.setAttribute("fill", "#319795");
      }
    } else if (isFormal) {
      if (torso) torso.setAttribute("fill", "#edf2f7");
      if (pantsShorts) pantsShorts.setAttribute("fill", "#718096");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#4a5568");
        shoeR.setAttribute("fill", "#4a5568");
      }
    } else {
      if (torso) torso.setAttribute("fill", expression < 5 ? "#ed64a6" : "#4299e1");
      if (pantsShorts) pantsShorts.setAttribute("fill", "#cbd5e0");
      if (shoeL && shoeR) {
        shoeL.setAttribute("fill", "#a0aec0");
        shoeR.setAttribute("fill", "#a0aec0");
      }
    }
  }
  // Mild Weather
  else {
    if (jacket) jacket.classList.add("hidden");
    if (hat) hat.classList.add("hidden");
    if (pantsShorts) pantsShorts.classList.add("hidden");
    if (legsBareL) legsBareL.classList.add("hidden");
    if (legsBareR) legsBareR.classList.add("hidden");
    if (pantsFull) pantsFull.classList.remove("hidden");

    if (sleeveL && sleeveR) {
      sleeveL.setAttribute("height", "25");
      sleeveR.setAttribute("height", "25");
    }

    if (torso) torso.setAttribute("fill", expression < 5 ? "#9f7aea" : "#3182ce");
    if (pantsFull) pantsFull.setAttribute("fill", "#2d3748");
    if (shoeL && shoeR) {
      shoeL.setAttribute("fill", "#1a202c");
      shoeR.setAttribute("fill", "#1a202c");
    }
  }
}

function updateOutfitTags(tempF) {
  const styles = state.preferences.preferredStyles;
  let tops = [];
  let bottoms = [];
  let gear = [];

  if (tempF <= state.preferences.coldThreshold) {
    if (styles.includes("formal")) {
      tops.push("Overcoat", "Wool Blazer");
      bottoms.push("Dress Trousers");
      gear.push("Leather Boots", "Scarf");
    }
    if (styles.includes("athletic")) {
      tops.push("Thermal Fleece", "Windbreaker");
      bottoms.push("Insulated Joggers");
      gear.push("Running Sneakers", "Sport Beanie");
    }
    if (styles.includes("casual") || (!styles.includes("formal") && !styles.includes("athletic"))) {
      tops.push(...state.preferences.coldStyle);
      bottoms.push("Heavy Denim", "Chinos");
      gear.push("Knit Beanie", "Winter Boots");
    }
  } else if (tempF >= state.preferences.heatThreshold) {
    if (styles.includes("formal")) {
      tops.push("Linen Button-Down", "Short-Sleeve Polo");
      bottoms.push("Tailored Chino Shorts", "Light Slacks");
      gear.push("Loafers", "Sunglasses");
    }
    if (styles.includes("athletic")) {
      tops.push("Dri-FIT Tank", "Moisture-Wicking Tee");
      bottoms.push("Running Shorts", "Breathable Leggings");
      gear.push("Light Trainer Shoes", "Visor");
    }
    if (styles.includes("casual") || (!styles.includes("formal") && !styles.includes("athletic"))) {
      tops.push(...state.preferences.hotStyle);
      bottoms.push("Denim Shorts", "Cotton Shorts");
      gear.push("Canvas Sneakers", "Sunglasses");
    }
  } else {
    if (styles.includes("formal")) {
      tops.push("Dress Shirt", "Light Blazer");
      bottoms.push("Tailored Trousers");
      gear.push("Oxford Shoes");
    }
    if (styles.includes("athletic")) {
      tops.push("Track Jacket", "Long-Sleeve Performance Tee");
      bottoms.push("Athletic Joggers");
      gear.push("Running Shoes");
    }
    if (styles.includes("casual") || (!styles.includes("formal") && !styles.includes("athletic"))) {
      tops.push("Denim Jacket", "Cardigan", "Light Sweatshirt");
      bottoms.push("Jeans", "Casual Chinos");
      gear.push("Everyday Sneakers");
    }
  }

  renderTags("topRecommendations", [...new Set(tops)]);
  renderTags("bottomRecommendations", [...new Set(bottoms)]);
  renderTags("gearRecommendations", [...new Set(gear)]);
}

function renderTags(elementId, itemsArray) {
  const container = document.getElementById(elementId);
  if (!container) return;
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
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;
  const text = input.value.trim();
  appendChat(text, "user");
  input.value = "";
  setTimeout(() => {
    appendChat(
      `For ${state.weather.tempF}°F weather in ${state.weather.city}, "${text}" is a solid match for your selected preferences!`,
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
