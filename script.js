const form = document.querySelector("#form");
const cityInput = document.querySelector("#city-search");
const message = document.querySelector("#error-msg");

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


  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  fetch(url)
  .then((response)=>  {
    if(!response.ok){
      throw new Error("eror" + response.status)
    }
    return response.json()
  })
  .then((cordinates) => {
    
    
    const lat = cordinates.results[0].latitude
    const lon = cordinates.results[0].longitude
    
    return {lat , lon}
  })
  .then((data)=>{
    const url1 = `https://api.open-meteo.com/v1/forecast?latitude=${data.lat}&longitude=${data.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day&timezone=auto`
    fetch(url1)
    .then((reponse1)=>{
      if(!reponse1.ok){
        throw new Error("error" + reponse1.status)
      }
      return reponse1.json()
    })
    .then((data) =>{

      console.log(data);
      
      const time = data.current.time
      const temperature = data.current.temperature_2m
      const humidity = data.current.relative_humidity_2m
      const weather_code = data.current.weather_code
      const wind_speed = data.current.wind_speed
      return  {temperature,humidity,weather_code,wind_speed}

    })
    .then((data)=>{

    })
  })
  .catch ((error) => {
    message.textContent = "Could not find the city. Please try again.";
    message.classList.remove("hidden");
    console.error(error);
  }) 
  .finally(() => {
    loading.classList.add("hidden");
  })

});


function render(data){
  const li = document.createElement("li")
  li.className = "grid min-h-[14.4rem] grid-cols-1 items-center gap-6 rounded-[2rem] border border-slate-700 bg-gradient-to-r from-amber-950/70 via-slate-800 to-slate-800 px-6 py-5 shadow-xl sm:grid-cols-[1fr_auto_1fr] sm:px-8 sm:py-[1.8rem]"
  const divname = document.createElement("div")
  const h2 = document.createElement("h2")
  h2.className = "text-3xl font-bold sm:text-4xl"
  h2.textContent = city

  const date = document.createElement("p")
  date.className ="mt-2 text-slate-300"
  date.textContent = data.time 

  const wheatherstate = document.createElement("p")
  wheatherstate.className ="mt-1 text-slate-300"
  wheatherstate.textContent = WEATHER_CODES.data.wind_speed

  divname.append(h2,date,wheatherstate)
  

  


}





/*
<li class="grid min-h-[14.4rem] grid-cols-1 items-center gap-6 rounded-[2rem] border border-slate-700 bg-gradient-to-r from-amber-950/70 via-slate-800 to-slate-800 px-6 py-5 shadow-xl sm:grid-cols-[1fr_auto_1fr] sm:px-8 sm:py-[1.8rem]">
              <div>
                <h2 class="text-3xl font-bold sm:text-4xl">Nador, Morocco</h2>
                <p class="mt-2 text-slate-300">Tuesday, 10 November 2026</p>
                <p class="mt-1 text-slate-300">Sunny</p>
              </div>
              <div class="flex items-center justify-center gap-3">
                <p class="text-6xl" aria-label="Sunny weather">☀️</p>
                <p class="text-7xl font-semibold tracking-tight sm:text-8xl">24°</p>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="rounded-2xl bg-slate-950/50 p-4 sm:p-5">
                  <p class="text-sm text-slate-300">Humidity</p>
                  <p class="mt-2 text-2xl font-semibold sm:text-3xl">48%</p>
                </div>
                <div class="rounded-2xl bg-slate-950/50 p-4 sm:p-5">
                  <p class="text-sm text-slate-300">Wind speed</p>
                  <p class="mt-2 text-2xl font-semibold sm:text-3xl">14 km/h</p>
                </div>
              </div>
            </li>
*/










