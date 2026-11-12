import { WEATHER_CODES } from "./data.js";
const form = document.querySelector("#form");
const cityInput = document.querySelector("#city-search");
const message = document.querySelector("#error-msg");
const list = document.querySelector("#days-cards");
const loading = document.createElement("p");
loading.className = "hidden mt-5 text-center text-sm text-slate-300";
loading.textContent = "Loading...";
form.after(loading);

// form.addEventListener("submit", async (event) => {
//   event.preventDefault();
function fetchdata(){
  const city = cityInput.value.trim();

  if (!city) {
    showerror("Please enter a city name.");
    message.classList.remove("hidden");
    return;
  }

  message.classList.add("hidden");
  loading.classList.remove("hidden");

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  let urldaily;
  fetch(url)
    .then((response) => {
      if (response.status === 429) {
        throw new Error(
          "Weather service quota reached. Please try again later.",
        );
      }

      if (!response.ok) {
        throw new Error("Geocoding service is unavailable. Please try again.");
      }
      return response.json();
    })
    .then((cordinates) => {
      const place = cordinates.results?.[0];
      if (!place) {
        throw new Error("City not found. Check the spelling and try again.");
      }
      const lat = place.latitude;
      const lon = place.longitude;

      return { lat, lon, city: place.name, country: place.country };
    })
    //////////////////////////////////////
    .then((data) => {
      urldaily = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min`;
      const url1 = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
      return fetch(url1)
        .then((response) => {
          if (response.status === 429) {
            throw new Error(
              "Weather service is temporarily unavailable. Please try again",
            );
          }
          if (!response.ok) {
            throw new Error(
              "Weather service is temporarily unavailable. Please try again ",
            );
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
          if (response.status === 429) {
            throw new Error(
              "Forecast request limit reached. Please try again later.",
            );
          }

          if (!response.ok) {
            throw new Error(
              "Forecast service is unavailable. Please try again.",
            );
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
          console.log(datasobject);
          return datasobject;
        });
    })
    .then((card) => {
      card.forEach(render5days);
    })
    .catch((error) => {
      showerror(error.message);
      
      message.classList.remove("hidden");
      console.error(error);
    })
    .finally(() => {
      loading.classList.add("hidden");
    });
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  fetchdata()

})







function render(data) {
  list.replaceChildren();
  const li = document.createElement("li");
  li.className =
    "grid min-h-[14.4rem] grid-cols-1 items-center gap-5 rounded-[2rem] border border-slate-700 bg-gradient-to-r from-amber-950/70 via-slate-800 to-slate-800 px-4 py-5 shadow-xl md:grid-cols-2 md:gap-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8 lg:py-7";
  const divname = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.className = "text-2xl font-bold md:text-3xl lg:text-4xl";
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
  divweather.className = "flex min-w-0 items-center justify-center gap-2 md:gap-3";

  const icon = WEATHER_CODES[iconnumber].icon;

  const logo = document.createElement("p");
  logo.className = "text-4xl md:text-5xl lg:text-6xl";

  logo.textContent = icon;

  const temperature = document.createElement("p");
  temperature.className = "text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl";
  temperature.textContent = `${Math.round(data.temperature)}°C`;
  divweather.append(logo, temperature);

  const divstats = document.createElement("div");
  divstats.className = "grid min-w-0 grid-cols-1 gap-3 md:col-span-2 md:grid-cols-2 lg:col-span-1";

  const divhumidity = document.createElement("div");
  divhumidity.className = "min-w-0 rounded-2xl bg-slate-950/50 p-4 md:p-5";
  const humiditytitle = document.createElement("p");
  humiditytitle.className = "text-sm text-slate-300";
  humiditytitle.textContent = "Humidity";
  const humidity = document.createElement("p");
  humidity.className = "mt-2 text-xl font-semibold md:text-2xl lg:text-3xl";
  humidity.textContent = `${data.humidity}%`;
  divhumidity.append(humiditytitle, humidity);

  const divwind = document.createElement("div");
  divwind.className = "min-w-0 rounded-2xl bg-slate-950/50 p-4 md:p-5";
  const windtitle = document.createElement("p");
  windtitle.className = "text-sm text-slate-300";
  windtitle.textContent = "Wind speed";
  const wind = document.createElement("p");
  wind.className = "mt-2 text-xl font-semibold md:text-2xl lg:text-3xl";
  wind.textContent = `${data.wind_speed} km/h`;
  divwind.append(windtitle, wind);

  divstats.append(divhumidity, divwind);
  li.append(divname, divweather, divstats);
  list.prepend(li);
}


function render5days(data) {
  const li = document.createElement("li");
  li.className =
    "mx-auto w-full min-w-0 rounded-2xl border border-white/10 bg-slate-900 p-4 text-white shadow-lg md:p-5";

  const date = document.createElement("p");
  date.className = "text-sm font-medium text-slate-400";
  date.textContent = new Date(data.time).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const details = document.createElement("div");
  details.className = "mt-4 flex min-w-0 items-center justify-between gap-3";

  const weather = document.createElement("div");
  const icon = document.createElement("p");
  icon.className = "text-3xl font-semibold";

  const iconnumber = data.weather_code;

  //////////////////////
  icon.textContent = WEATHER_CODES[iconnumber].icon;
  const description = document.createElement("p");
  description.className = "mt-2 text-sm text-slate-300";
  description.textContent = WEATHER_CODES[iconnumber].label;

  weather.append(icon, description);

  const temperatures = document.createElement("div");
  temperatures.className = "text-right";

  const high = document.createElement("p");
  high.className = "text-xl font-semibold md:text-2xl";
  high.textContent = `${data.maxtemp}°`;

  const low = document.createElement("p");
  low.className = "mt-1 text-sm text-slate-400";
  low.textContent = `Lowest ${data.mintemp}°`;

  temperatures.append(high, low);

  details.append(weather, temperatures);
  li.append(date, details);
  list.append(li);
}
function showerror(errorMessage) {
  list.textContent = ""
  const alert = document.createElement("div");
  alert.setAttribute("role", "alert");
  alert.className =
    "flex flex-col gap-4 rounded-2xl border border-rose-400/70 bg-rose-950/50 p-4 text-rose-100 shadow-lg md:flex-row md:items-center md:p-5";

  const content = document.createElement("div");
  content.className = "flex min-w-0 items-center gap-4";

  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.className =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-rose-400 text-2xl font-bold text-rose-400";
  icon.textContent = "!";

  const text = document.createElement("div");


  const description = document.createElement("p");
  description.className = "mt-1 text-sm text-rose-100/80";
  description.textContent = errorMessage;
  text.append(description);
  content.append(icon, text);

  const retryButton = document.createElement("button");
  retryButton.type = "button";
  retryButton.id = "retry"
  retryButton.className =
    "w-full rounded-xl border border-cyan-400 px-5 py-2.5 font-medium text-cyan-300 transition hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-rose-950 md:ml-auto md:w-auto";
  retryButton.textContent = "Try again";

  alert.append(content, retryButton);
  message.replaceChildren(alert);
  retryButton.addEventListener("click", fetchdata)
}




