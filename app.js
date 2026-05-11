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


async function fetchWeatherByCoordinates(latitude, longitude) {
    const weatherUrl = new URL("https://api.open-meteo.com/v1/forecast");
    weatherUrl.searchParams.set("latitude", latitude);
    weatherUrl.searchParams.set("longitude", longitude);
    weatherUrl.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
    weatherUrl.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,relative_humidity_2m_mean");
    weatherUrl.searchParams.set("timezone", "auto");
    weatherUrl.searchParams.set("forecast_days", "5");

    const response = await fetch(weatherUrl);
    if (!response.ok) {
        throw new Error("Unable to fetch weather data right now.");
    }
    return response.json();
}

async function fetchCityCoordinates(city) {
    const matches = await fetchCityMatches(city, 1);
    if (!matches.length) {
        throw new Error("City not found. Please try another location.");
    }
    return matches[0];
}

async function fetchCityMatches(city, count = 6) {
    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", city);
    geoUrl.searchParams.set("count", String(count));
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const response = await fetch(geoUrl);
    if (!response.ok) {
        throw new Error("Failed to look up city coordinates.");
    }

    const data = await response.json();
    return Array.isArray(data.results) ? data.results : [];
}

function hideSuggestions() {
    citySuggestions.classList.add("hidden");
    citySuggestions.innerHTML = "";
    activeSuggestionIndex = -1;
}

function formatSuggestionLabel(item) {
    const parts = [item.name];
    if (item.admin1) parts.push(item.admin1);
    if (item.country) parts.push(item.country);
    return parts.join(", ");
}

function chooseSuggestion(searchName, displayLabel = searchName) {
    cityInput.value = displayLabel;
    hideSuggestions();
    loadWeatherByCity(searchName);
}

function setActiveSuggestion(index) {
    const items = citySuggestions.querySelectorAll(".city-suggestion-item");
    items.forEach((item, itemIndex) => {
        item.classList.toggle("active", itemIndex === index);
    });
    activeSuggestionIndex = index;
}

function renderSuggestions(suggestions) {
    citySuggestions.innerHTML = "";

    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }

    suggestions.forEach((item, index) => {
        const label = formatSuggestionLabel(item);
        const suggestionItem = document.createElement("li");
        suggestionItem.className = "city-suggestion-item";
        suggestionItem.setAttribute("role", "option");
        suggestionItem.textContent = label;
        suggestionItem.dataset.searchName = item.name;
        suggestionItem.dataset.displayLabel = label;

        suggestionItem.addEventListener("mousedown", (event) => {
            // mousedown ensures click wins before input blur.
            event.preventDefault();
            chooseSuggestion(item.name, label);
        });

        citySuggestions.appendChild(suggestionItem);

        if (index === 0) {
            setActiveSuggestion(0);
        }
    });

    citySuggestions.classList.remove("hidden");
}


async function updateCitySuggestions(query) {
    const trimmedQuery = sanitizeCityName(query);
    latestSuggestionQuery = trimmedQuery;

    if (trimmedQuery.length < 2) {
        hideSuggestions();
        return;
    }

    if (suggestionAbortController) {
        suggestionAbortController.abort();
    }
    suggestionAbortController = new AbortController();

    try {
        const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
        geoUrl.searchParams.set("name", trimmedQuery);
        geoUrl.searchParams.set("count", "6");
        geoUrl.searchParams.set("language", "en");
        geoUrl.searchParams.set("format", "json");

        const response = await fetch(geoUrl, { signal: suggestionAbortController.signal });
        if (!response.ok) {
            throw new Error("Unable to fetch suggestions right now.");
        }

        const data = await response.json();
        const suggestions = Array.isArray(data.results) ? data.results : [];

        if (latestSuggestionQuery !== trimmedQuery) return;
        renderSuggestions(suggestions);
    } catch (error) {
        if (error.name !== "AbortError") {
            hideSuggestions();
        }
    }
}

async function fetchLocationNameByCoordinates(latitude, longitude) {
    const openMeteoReverseUrl = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
    openMeteoReverseUrl.searchParams.set("latitude", latitude);
    openMeteoReverseUrl.searchParams.set("longitude", longitude);
    openMeteoReverseUrl.searchParams.set("count", "1");
    openMeteoReverseUrl.searchParams.set("language", "en");
    openMeteoReverseUrl.searchParams.set("format", "json");

    try {
        const response = await fetch(openMeteoReverseUrl);
        if (response.ok) {
            const data = await response.json();
            const openMeteoName = data.results?.[0]?.name;
            if (openMeteoName) {
                return openMeteoName;
            }
        }
    } catch (error) {
        
    }

    
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
    nominatimUrl.searchParams.set("lat", latitude);
    nominatimUrl.searchParams.set("lon", longitude);
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("accept-language", "en");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("zoom", "12");

    try {
        const fallbackResponse = await fetch(nominatimUrl);
        if (!fallbackResponse.ok) {
            return "Current Location";
        }

        const fallbackData = await fallbackResponse.json();
        const address = fallbackData.address || {};
        return (
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.city_district ||
            address.suburb ||
            address.state_district ||
            fallbackData.name ||
            "Current Location"
        );
    } catch (error) {
        return "Current Location";
    }
}

function getCurrentPosition(options) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function getBestEffortPosition({
    totalDurationMs = 8000,
    desiredAccuracyM = 100
} = {}) {
    return new Promise((resolve, reject) => {
        const collected = [];
        let settled = false;
        let watchId = null;

        const finishWithBest = () => {
            if (settled) return;
            settled = true;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }

            if (collected.length === 0) {
                const error = new Error("Could not get your location.");
                error.code = 2;
                reject(error);
                return;
            }

            collected.sort((a, b) => a.coords.accuracy - b.coords.accuracy);
            resolve(collected[0]);
        };

        const timeoutId = setTimeout(() => {
            finishWithBest();
        }, totalDurationMs);

        const onSuccess = (position) => {
            collected.push(position);

            if (position.coords.accuracy <= desiredAccuracyM) {
                clearTimeout(timeoutId);
                finishWithBest();
            }
        };

        const onError = (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                clearTimeout(timeoutId);
                if (!settled) {
                    settled = true;
                    if (watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                    }
                    reject(error);
                }
            }
        };

        try {
            watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            });
        } catch (error) {
            clearTimeout(timeoutId);
            reject(error);
        }
    });
}


async function renderWeatherFromPosition(position, statusLabel = "Location updated.") {
    const { latitude, longitude, accuracy } = position.coords;
    const weather = await fetchWeatherByCoordinates(latitude, longitude);

    let placeName = "Current Location";
    if (accuracy <= 15000) {
        try {
            const resolvedName = await fetchLocationNameByCoordinates(latitude, longitude);
            if (resolvedName && resolvedName.trim()) {
                placeName = resolvedName;
            }
        } catch (error) {
            placeName = "Current Location";
        }
    } else {
        placeName = "Near your current area";
    }

    renderCurrentWeather(placeName, weather);
    addRecentCity(placeName);
    showMessage(statusMessage, `${statusLabel} (~${Math.round(accuracy)} m accuracy)`);
}

async function loadWeatherByCity(city) {
    hideMessage(customAlert);
    hideMessage(statusMessage);
    const cleanedCity = sanitizeCityName(city);

    if (!cleanedCity) {
        showMessage(statusMessage, "Please enter a city name before searching.");
        return;
    }

    try {
        showMessage(statusMessage, "Fetching weather data...");
        const cityData = await fetchCityCoordinates(cleanedCity);
        const weather = await fetchWeatherByCoordinates(cityData.latitude, cityData.longitude);
        renderCurrentWeather(cityData.name, weather);
        addRecentCity(cityData.name);
        hideMessage(statusMessage);
    } catch (error) {
        showMessage(statusMessage, error.message || "Something went wrong. Please try again.");
    }
}

async function requestUserLocationWeather() {
    hideMessage(customAlert);
    hideMessage(statusMessage);

    if (!navigator.geolocation) {
        showMessage(statusMessage, "Geolocation is not supported in this browser.");
        return;
    }

    try {
        showMessage(statusMessage, "Getting your location quickly...");
        const quickPosition = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        await renderWeatherFromPosition(quickPosition, "Location found");

    
        if (quickPosition.coords.accuracy > 200) {
            showMessage(statusMessage, "Improving location accuracy...");
            try {
                const refinedPosition = await getBestEffortPosition({
                    totalDurationMs: 6000,
                    desiredAccuracyM: 80
                });

                const improvedEnough =
                    refinedPosition.coords.accuracy + 100 < quickPosition.coords.accuracy;

                if (improvedEnough) {
                    await renderWeatherFromPosition(refinedPosition, "Accuracy improved");
                }
            } catch (error) {
                
            }
        }

        setTimeout(() => hideMessage(statusMessage), 1800);
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED) {
            showMessage(statusMessage, "Location permission denied. Please allow access and try again.");
            return;
        }
        showMessage(statusMessage, "Could not get your location quickly. Please search by city instead.");
    }
}

function handleUnitSwitch(unit) {
    selectedUnit = unit;
    celsiusBtn.classList.toggle("active", unit === "C");
    fahrenheitBtn.classList.toggle("active", unit === "F");
    temperatureValue.textContent = formatTemp(currentTemperatureC);
}

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideSuggestions();
    loadWeatherByCity(cityInput.value);
});

cityInput.addEventListener("input", () => {
    const query = cityInput.value;
    if (suggestionDebounceId) {
        clearTimeout(suggestionDebounceId);
    }

    suggestionDebounceId = setTimeout(() => {
        updateCitySuggestions(query);
    }, 250);
});

cityInput.addEventListener("keydown", (event) => {
    const items = citySuggestions.querySelectorAll(".city-suggestion-item");
    if (!items.length || citySuggestions.classList.contains("hidden")) return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = activeSuggestionIndex >= items.length - 1 ? 0 : activeSuggestionIndex + 1;
        setActiveSuggestion(nextIndex);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        const prevIndex = activeSuggestionIndex <= 0 ? items.length - 1 : activeSuggestionIndex - 1;
        setActiveSuggestion(prevIndex);
        return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
        event.preventDefault();
        const selectedItem = items[activeSuggestionIndex];
        const selectedSearchName = selectedItem?.dataset.searchName;
        const selectedDisplayLabel = selectedItem?.dataset.displayLabel;
        if (selectedSearchName) {
            chooseSuggestion(selectedSearchName, selectedDisplayLabel || selectedSearchName);
        }
        return;
    }

    if (event.key === "Escape") {
        hideSuggestions();
    }
});

cityInput.addEventListener("blur", () => {
    setTimeout(() => hideSuggestions(), 120);
});

cityInput.addEventListener("focus", () => {
    if (sanitizeCityName(cityInput.value).length >= 2) {
        updateCitySuggestions(cityInput.value);
    }
});

document.addEventListener("click", (event) => {
    if (!citySuggestions.contains(event.target) && event.target !== cityInput) {
        hideSuggestions();
    }
});

currentLocationBtn.addEventListener("click", requestUserLocationWeather);

recentCitiesSelect.addEventListener("change", () => {
    const city = recentCitiesSelect.value;
    if (city) {
        loadWeatherByCity(city);
    }
});

celsiusBtn.addEventListener("click", () => handleUnitSwitch("C"));
fahrenheitBtn.addEventListener("click", () => handleUnitSwitch("F"));

updateRecentCitiesDropdown();
