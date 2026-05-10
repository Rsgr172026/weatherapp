const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const citySuggestions = document.getElementById("citySuggestions");
const currentLocationBtn = document.getElementById("currentLocationBtn");
const recentWrapper = document.getElementById("recentWrapper");
const recentCitiesSelect = document.getElementById("recentCities");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");
const appBody = document.getElementById("appBody");

const locationName = document.getElementById("locationName");
const currentDate = document.getElementById("currentDate");
const weatherIcon = document.getElementById("weatherIcon");
const temperatureValue = document.getElementById("temperatureValue");
const humidityValue = document.getElementById("humidityValue");
const windValue = document.getElementById("windValue");
const forecastGrid = document.getElementById("forecastGrid");
const customAlert = document.getElementById("customAlert");
const statusMessage = document.getElementById("statusMessage");

const RECENT_STORAGE_KEY = "skycast_recent_cities";
const MAX_RECENT_CITIES = 6;
let selectedUnit = "C";
let currentTemperatureC = null;
let suggestionDebounceId = null;
let suggestionAbortController = null;
let activeSuggestionIndex = -1;
let latestSuggestionQuery = "";

const weatherCodeMap = {
    0: { label: "Clear sky", icon: "☀️", rainy: false },
    1: { label: "Mainly clear", icon: "🌤️", rainy: false },
    2: { label: "Partly cloudy", icon: "⛅", rainy: false },
    3: { label: "Overcast", icon: "☁️", rainy: false },
    45: { label: "Fog", icon: "🌫️", rainy: false },
    48: { label: "Depositing rime fog", icon: "🌫️", rainy: false },
    51: { label: "Drizzle", icon: "🌦️", rainy: true },
    53: { label: "Moderate drizzle", icon: "🌦️", rainy: true },
    55: { label: "Dense drizzle", icon: "🌧️", rainy: true },
    61: { label: "Slight rain", icon: "🌧️", rainy: true },
    63: { label: "Rain", icon: "🌧️", rainy: true },
    65: { label: "Heavy rain", icon: "⛈️", rainy: true },
    71: { label: "Slight snow", icon: "🌨️", rainy: false },
    73: { label: "Snow", icon: "🌨️", rainy: false },
    75: { label: "Heavy snow", icon: "❄️", rainy: false },
    80: { label: "Rain showers", icon: "🌧️", rainy: true },
    81: { label: "Rain showers", icon: "🌧️", rainy: true },
    82: { label: "Violent rain showers", icon: "⛈️", rainy: true },
    95: { label: "Thunderstorm", icon: "⛈️", rainy: true }
};


function showMessage(target, message) {
    target.textContent = message;
    target.classList.remove("hidden");
}

function hideMessage(target) {
    target.textContent = "";
    target.classList.add("hidden");
}

function sanitizeCityName(city) {
    return city.trim().replace(/\s+/g, " ");
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9) / 5 + 32;
}

function formatTemp(celsiusValue) {
    if (celsiusValue === null) return "--";
    if (selectedUnit === "F") return `${celsiusToFahrenheit(celsiusValue).toFixed(1)} °F`;
    return `${celsiusValue.toFixed(1)} °C`;
}

function parseSafeJSON(rawValue) {
    try {
        const data = JSON.parse(rawValue);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}


function getRecentCities() {
    return parseSafeJSON(localStorage.getItem(RECENT_STORAGE_KEY));
}

function saveRecentCities(cities) {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(cities));
}

function updateRecentCitiesDropdown() {
    const recentCities = getRecentCities();
    recentCitiesSelect.innerHTML = '<option value="">Select a recent city</option>';

    if (recentCities.length === 0) {
        recentWrapper.classList.add("hidden");
        return;
    }

    recentCities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentCitiesSelect.appendChild(option);
    });

    recentWrapper.classList.remove("hidden");
}

function addRecentCity(city) {
    const cleanedCity = sanitizeCityName(city);
    const recentCities = getRecentCities();
    const updated = [cleanedCity, ...recentCities.filter((item) => item.toLowerCase() !== cleanedCity.toLowerCase())]
        .slice(0, MAX_RECENT_CITIES);

    saveRecentCities(updated);
    updateRecentCitiesDropdown();
}

function getWeatherMeta(weatherCode) {
    return weatherCodeMap[weatherCode] || { label: "Unknown", icon: "🌍", rainy: false };
}

function createRain() {
    const oldRain = document.getElementById('rain-container');
    if (oldRain) oldRain.remove();
    const rainContainer = document.createElement('div');
    rainContainer.id = 'rain-container';
    document.body.appendChild(rainContainer);

    for (let i = 0; i < 50; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = Math.random() * 100 + 'vw';
        drop.style.animationDuration = Math.random() * 1 + 0.5 + 's';
        drop.style.opacity = Math.random();
        rainContainer.appendChild(drop);
    }
}


function createLightningBolt() {
    
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "bolt animate-bolt");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "400");
    
    svg.style.left = Math.random() * 100 + "vw";
    
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const x = 50; 
    
    const d = `M${x} 0 L${x-20} 100 L${x+20} 200 L${x-10} 300 L${x+10} 400`;
    
    path.setAttribute("d", d);
    path.setAttribute("stroke", "white");
    path.setAttribute("stroke-width", "4");
    path.setAttribute("fill", "none");
    
    svg.appendChild(path);
    document.body.appendChild(svg);

    setTimeout(() => svg.remove(), 400);
}



function triggerLightning() {
    let flashDiv = document.getElementById('lightning-overlay');
    if (!flashDiv){
        flashDiv = document.createElement('div');
        flashDiv.id = 'lightning-overlay';
        flashDiv.className = 'lightning-flash';
        document.body.prepend(flashDiv);
    }

    window.currentLightning = setInterval(() => {
        
        flashDiv.classList.add('animate-flash');
        setTimeout(() => flashDiv.classList.remove('animate-flash'), 500);

    
        createLightningBolt();
        
        
        if (Math.random() > 0.7) {
            setTimeout(createLightningBolt, 100);
        }
        
    }, Math.random() * 4000 + 3000);
}


function setBackgroundTheme(isRainy, weatherCode) {
    appBody.classList.remove("rainy-theme", "sunny-theme", "stormy-theme");
    
    
    const oldRain = document.getElementById('rain-container');
    if (oldRain) oldRain.remove();
    if (window.currentLightning) clearInterval(window.currentLightning);

    
    if (weatherCode === 95 || isRainy) {
        appBody.classList.add("stormy-theme");
        createRain();      
        triggerLightning();  
    } 
    
    else if (isRainy) {
        appBody.classList.add("rainy-theme");
        createRain();
    } 
    else {
        appBody.classList.add("sunny-theme");
    }
}


function renderCurrentWeather(city, weatherData) {
    const current = weatherData.current;
    const daily = weatherData.daily;
    const weatherMeta = getWeatherMeta(current.weather_code);

    currentTemperatureC = current.temperature_2m;
    locationName.textContent = `${city} • ${weatherMeta.label}`;
    currentDate.textContent = new Date().toLocaleString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    weatherIcon.textContent = weatherMeta.icon;
    temperatureValue.textContent = formatTemp(currentTemperatureC);
    humidityValue.textContent = `${current.relative_humidity_2m}%`;
    windValue.textContent = `${current.wind_speed_10m} km/h`;

    setBackgroundTheme(weatherMeta.rainy, current.weather_code);

    if (currentTemperatureC > 40) {
        showMessage(customAlert, "Extreme temperature alert: It's above 40°C. Stay hydrated and avoid direct sun exposure.");
    } else {
        hideMessage(customAlert);
    }

    renderForecastCards(daily);
}

function renderForecastCards(dailyData) {
    forecastGrid.innerHTML = "";
    for (let i = 0; i < 5; i += 1) {
        const dayCode = dailyData.weather_code[i];
        const weatherMeta = getWeatherMeta(dayCode);
        const card = document.createElement("article");
        card.className = "forecast-card";
        card.style.animationDelay = `${i * 0.1}s`;

        const date = new Date(dailyData.time[i]);
        const formattedDate = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });

        card.innerHTML = `
            <p class="text-sm text-slate-300">${formattedDate}</p>
            <p class="mt-2 forecast-icon">${weatherMeta.icon}</p>
            <div class="mt-3 space-y-1 text-sm">
                <p>🌡️ ${dailyData.temperature_2m_max[i]}° / ${dailyData.temperature_2m_min[i]}°C</p>
                <p>💨 ${dailyData.wind_speed_10m_max[i]} km/h</p>
                <p>💧 ${dailyData.relative_humidity_2m_mean[i]}%</p>
            </div>
        `;
        forecastGrid.appendChild(card);
    }
}