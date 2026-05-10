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