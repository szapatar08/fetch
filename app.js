const form = document.querySelector("#weather-form");
const cityInput = document.querySelector("#city");
const statusMessage = document.querySelector("#status");
const weatherCard = document.querySelector("#weather-card");
const weatherResult = document.querySelector("#weather-result");

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

function describeWeatherCode(code) {
  const descriptions = {
    0: "Cielo despejado",
    1: "Principalmente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna moderada",
    55: "Llovizna intensa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada intensa",
    61: "Lluvia ligera",
    63: "Lluvia moderada",
    65: "Lluvia intensa",
    66: "Lluvia helada ligera",
    67: "Lluvia helada intensa",
    71: "Nevada ligera",
    73: "Nevada moderada",
    75: "Nevada intensa",
    77: "Granos de nieve",
    80: "Lluvias ligeras",
    81: "Lluvias moderadas",
    82: "Lluvias intensas",
    85: "Nevadas ligeras",
    86: "Nevadas intensas",
    95: "Tormenta eléctrica",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo intenso"
  };

  return descriptions[code] ?? "Condición meteorológica desconocida";
}

function searchLocation(city) {
  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "es",
    format: "json",
    countryCode: "CO"
  });

  return 
}

function searchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    timezone: "auto"
  });

  return 
}

function renderWeather(location, weather) {
  const current = weather.current;
  const units = weather.current_units;

  weatherResult.replaceChildren();

  const title = document.createElement("h2");
  title.className = "text-2xl font-bold";
  title.textContent = `${location.name}, ${location.country_code}`;

  const timezone = document.createElement("p");
  timezone.className = "mt-1 text-sm text-slate-400";
  timezone.textContent = `Zona horaria: ${weather.timezone}`;

  const temperature = document.createElement("p");
  temperature.className = "mt-6 text-5xl font-bold text-sky-400";
  temperature.textContent = `${current.temperature_2m} ${units.temperature_2m}`;

  const description = document.createElement("p");
  description.className = "mt-2 text-lg text-slate-200";
  description.textContent = describeWeatherCode(current.weather_code);

  const details = document.createElement("div");
  details.className = "mt-6 grid gap-3 sm:grid-cols-2";

  const humidity = createDetail(
    "Humedad",
    `${current.relative_humidity_2m} ${units.relative_humidity_2m}`
  );
  const wind = createDetail(
    "Viento",
    `${current.wind_speed_10m} ${units.wind_speed_10m}`
  );

  details.append(humidity, wind);
  weatherResult.append(title, timezone, temperature, description, details);
  weatherCard.classList.remove("hidden");
}

function createDetail(label, value) {
  const detail = document.createElement("div");
  detail.className = "rounded-xl border border-slate-800 bg-slate-950 p-4";

  const detailLabel = document.createElement("p");
  detailLabel.className = "text-sm text-slate-400";
  detailLabel.textContent = label;

  const detailValue = document.createElement("p");
  detailValue.className = "mt-1 text-lg font-semibold";
  detailValue.textContent = value;

  detail.append(detailLabel, detailValue);
  return detail;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    weatherCard.classList.add("hidden");
    statusMessage.className = "mt-6 text-sm text-rose-400";
    statusMessage.textContent = "Escribe el nombre de una ciudad.";
    cityInput.focus();
    return;
  }

  weatherCard.classList.add("hidden");
  statusMessage.className = "mt-6 text-sm text-slate-400";
  statusMessage.textContent = "Consultando el clima...";

  searchLocation(city)
    .then((location) => {
      return searchWeather(location.latitude, location.longitude)
        .then((weather) => ({ location, weather }));
    })
    .then(({ location, weather }) => {
      renderWeather(location, weather);
      statusMessage.className = "mt-6 text-sm text-emerald-400";
      statusMessage.textContent = "Consulta completada.";
    })
    .catch((error) => {
      weatherCard.classList.add("hidden");
      statusMessage.className = "mt-6 text-sm text-rose-400";
      statusMessage.textContent = `No fue posible consultar el clima: ${error.message}`;
    });
});
