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
    console.log(cordinates.results);
    
    const lat = cordinates.results[0].latitude
    const lon = cordinates.results[0].longitude
    
    return {lat , lon}
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
