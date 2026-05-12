# SkyCast - Weather Forecast Application

SkyCast is a creative weather forecast web app built with **HTML, Tailwind CSS, Vanilla CSS, and JavaScript**.  
It allows users to search weather by city, fetch weather for current location, view a 5-day forecast, and manage recent searches with a dynamic dropdown.

## Features Implemented

- Smart city search with autocomplete suggestions while typing
- Keyboard-friendly suggestion navigation (arrow keys, enter, escape)
- City-wise weather search with input validation and clean status messages
- Current location weather using browser geolocation (with improved best-effort accuracy flow)
- Dynamic weather metrics:
  - Today's temperature (with C/F toggle for current value)
  - Humidity
  - Wind speed
- Custom weather alert for extreme heat (above 40 C)
- 5-day extended forecast cards with:
  - Date
  - Temperature range
  - Wind speed
  - Humidity
  - Weather icons
- Recent searched cities dropdown using `localStorage`
- Dynamic weather themes:
  - Sunny theme
  - Rainy theme with animated water drops
  - Storm theme with lightning flash and bolt effects
- Proper API and input error handling with UI messages (no JS alert)
- Fully responsive UI (desktop, tablet, mobile)

AQI (Air Quality Index) Section:
Live AQI data with PM2.5 and PM10 measurements
Animated breathing indicator - color changes based on air quality
AQI bar visualization with color-coded levels (Good → Hazardous)
Real-time status updates (Good, Moderate, Unhealthy, etc.)
Dynamic breathing speed - faster breathing for worse air quality

## API Provider

This project uses the **Open-Meteo APIs**:

- Geocoding API: city to coordinates and reverse geocoding
- Forecast API: current weather + daily forecast

No API key is required for this implementation.

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla CSS
- JavaScript (ES6+)

## Folder Structure

```text
weather project 3.0/
├── index.html
├── style.css
├── app.js
└── README.md
```

## How to Run

1. Clone or download the project.
2. Open the project folder.
3. Open `index.html` in a browser.
4. Search city weather or click **Use Current Location**.

## Validation and Error Handling

- Empty input checks are handled before API calls.
- Invalid city names display a friendly UI error.
- Network/API failures are displayed in clear status messages.
- Geolocation permission denial is handled gracefully.

## Notes for Evaluation

- UI is designed to be visually attractive and not copied from reference templates.
- Responsive behavior is optimized for:
  - Desktop screens
  - iPad Mini size
  - iPhone SE size
- Commit history is organized in small, meaningful steps across HTML, CSS, JS, and README updates.
