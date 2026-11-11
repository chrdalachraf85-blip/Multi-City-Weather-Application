import { WEATHER_CODES } from "./data.js";
const form = document.querySelector("#form");
const cityInput = document.querySelector("#city-search");
const message = document.querySelector("#error-msg");
const list = document.querySelector("#days-cards");
const loading = document.createElement("p");
loading.className = "hidden mt-5 text-center text-sm text-slate-300";
loading.textContent = "Loading...";
form.after(loading);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const city = cityInput.value.trim();

  if (!city) {
    message.textContent = "Please enter a city name.";
    message.classList.remove("hidden");
    return;
  }

  message.classList.add("hidden");
  loading.classList.remove("hidden");

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("eror" + response.status);
      }
      return response.json();
    })
    .then((cordinates) => {
      const place = cordinates.results[0];
      const lat = cordinates.results[0].latitude;
      const lon = cordinates.results[0].longitude;

      return { lat, lon, city: place.name, country: place.country };
    })
    //////////////////////////////////////
    .then((data) => {
      const url1 = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
      return fetch(url1)
        .then((response) => {
          if (!response.ok) {
            throw new Error("error" + response.status);
          }
          return response.json();
        })

        .then((forecast) => {
          const datas = {
            city: data.city,
            country: data.country,
            time: forecast.current.time,
            temperature: forecast.current.temperature_2m,
            humidity: forecast.current.relative_humidity_2m,
            weather_code: forecast.current.weather_code,
            wind_speed: forecast.current.wind_speed_10m,
          };
          return datas;
        })
        .then((data) => {
          render(data);
        });
    })
    //////////////////////////////////////
    .then((data) => {
      return fetch(urldaily)
        .then((response) => {
          if(!response.ok){
            throw new Error("The rest can't be loaded")
          }
          return response.json();
        })
        .then((data) => {
          let datasobject = [];

          for (let i = 1; i < 5; i++) {
            datasobject.push({
              time: data.daily.time[i],
              maxtemp: data.daily.temperature_2m_max[i],
              mintemp: data.daily.temperature_2m_min[i],
              weather_code: data.daily.weather_code[i],
            });
          }
          
          return datasobject;
        });
    })
    .then((card) => {
      render5days(card)
    })
    .catch((error) => {
      message.textContent = "Could not find the city. Please try again.";
      message.classList.remove("hidden");
      console.error(error);
    })
    .finally(() => {
      loading.classList.add("hidden");
    });
  const urldaily = `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&daily=weather_code,temperature_2m_max,temperature_2m_min`;
});

function render(data) {
  list.replaceChildren();
  const li = document.createElement("li");
  li.className =
    "grid min-h-[14.4rem] grid-cols-1 items-center gap-6 rounded-[2rem] border border-slate-700 bg-gradient-to-r from-amber-950/70 via-slate-800 to-slate-800 px-6 py-5 shadow-xl sm:grid-cols-[1fr_auto_1fr] sm:px-8 sm:py-[1.8rem]";
  const divname = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.className = "text-3xl font-bold sm:text-4xl";
  h2.textContent = `${data.city} , ${data.country}`;

  const date = document.createElement("p");
  date.className = "mt-2 text-slate-300";
  date.textContent = new Date(data.time).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  //
  const wheatherstate = document.createElement("p");
  wheatherstate.className = "mt-1 text-slate-300";
  const iconnumber = data.weather_code;
  wheatherstate.textContent = WEATHER_CODES[iconnumber].label;

  divname.append(h2, date, wheatherstate);

  const divweather = document.createElement("div");
  divweather.className = "flex items-center justify-center gap-3";

  const icon = WEATHER_CODES[iconnumber].icon;

  const logo = document.createElement("p");
  logo.className = "text-6xl";

  logo.textContent = icon;

  const temperature = document.createElement("p");
  temperature.className = "text-7xl font-semibold tracking-tight sm:text-8xl";
  temperature.textContent = `${Math.round(data.temperature)}°C`;
  divweather.append(logo, temperature);

  const divstats = document.createElement("div");
  divstats.className = "grid grid-cols-2 gap-3";

  const divhumidity = document.createElement("div");
  divhumidity.className = "rounded-2xl bg-slate-950/50 p-4 sm:p-5";
  const humiditytitle = document.createElement("p");
  humiditytitle.className = "text-sm text-slate-300";
  humiditytitle.textContent = "Humidity";
  const humidity = document.createElement("p");
  humidity.className = "mt-2 text-2xl font-semibold sm:text-3xl";
  humidity.textContent = `${data.humidity}%`;
  divhumidity.append(humiditytitle, humidity);

  const divwind = document.createElement("div");
  divwind.className = "rounded-2xl bg-slate-950/50 p-4 sm:p-5";
  const windtitle = document.createElement("p");
  windtitle.className = "text-sm text-slate-300";
  windtitle.textContent = "Wind speed";
  const wind = document.createElement("p");
  wind.className = "mt-2 text-2xl font-semibold sm:text-3xl";
  wind.textContent = `${data.wind_speed} km/h`;
  divwind.append(windtitle, wind);

  divstats.append(divhumidity, divwind);
  li.append(divname, divweather, divstats);
  list.prepend(li);
}








function render5days(data) {
  const card = document.createElement("li");
  card.className = "mx-auto w-full max-w-xs rounded-2xl border border-white/10 bg-slate-900 p-5 text-white shadow-lg";

  const date = new Date(`${data.date ?? data.time}T00:00:00`);
  const day = document.createElement("p");
  day.className = "text-sm font-medium text-slate-400";
  day.textContent = Number.isNaN(date.getTime())
    ? String(data.date ?? data.time ?? "")
    : date.toLocaleDateString("en-US", { weekday: "long" });

  const details = document.createElement("div");
  details.className = "mt-4 flex items-center justify-between";

  const weather = document.createElement("div");
  const icon = document.createElement("p");
  icon.className = "text-3xl font-semibold";
  const weatherCode = data.weather_code;
  const weatherInfo = WEATHER_CODES[weatherCode];
  icon.textContent = data.icon ?? weatherInfo?.icon ?? "🌤️";

  const description = document.createElement("p");
  description.className = "mt-2 text-sm text-slate-300";
  description.textContent = weatherInfo?.label ?? "Forecast";
  weather.append(icon, description);

  const temperatures = document.createElement("div");
  temperatures.className = "text-right";

  const high = document.createElement("p");
  high.className = "text-2xl font-semibold";
  high.textContent = `${data.maxtemp ?? data.maxTemp}°`;

  const low = document.createElement("p");
  low.className = "mt-1 text-sm text-slate-400";
  low.textContent = `Low ${data.mintemp ?? data.minTemp}°`;
  temperatures.append(high, low);

  details.append(weather, temperatures);
  card.append(day, details);
  list.append(card);
}
