
 

const userLocation = document.getElementById("userLocation");
const searchBtn = document.getElementById("searchBtn");

// searchBtn.addEventListener('click' ,()=> {
//     console.log(userLocation.value);
// })

const converter = document.getElementById("converter");
const weatherIcon = document.querySelector(".weatherIcon");
const temparature = document.querySelector(".temperature");
const feelsLike = document.querySelector(".feelsLike");
const description = document.querySelector(".description");
const date = document.querySelector(".date");
const city = document.getElementById("city-desc");

// values for humidity , wave , clouds , sunrise , pressure
const hvalue = document.getElementById("hvalue");
const wvalue = document.getElementById("wvalue");
const srvalue = document.getElementById("srvalue");
const ssvalue = document.getElementById("ssvalue");
const cvalue = document.getElementById("cvalue");
const uvalue = document.getElementById("uvalue");
const pvalue = document.getElementById("pvalue");

// this week
const forecast = document.querySelector(".forecast");

const weatherApiEndPoint = `https://api.openweathermap.org/data/2.5/weather?appid=2ccecca6373e1c53cda949a07953f6c7&q=`;

const weatherDataEndPoint = `https://api.openweathermap.org/data/2.5/weather?appid=2ccecca6373e1c53cda949a07953f6c7&exclude=minutely&units=metric&`;

const WEATHER_KEY = "2ccecca6373e1c53cda949a07953f6c7";
const OPENUV_KEY = "openuv-d0m6rmecvfq0c-io";

function findUserLocation() {
  // add this weather to display
  const card1 = document.getElementById("input");
  const card2 = document.getElementById("output");
  // Slide current card to left
  card1.classList.remove("active");
  card1.classList.add("exit-left");

  // Bring new card from right
  card2.classList.add("enter-right");
  card2.classList.add("active");

  forecast.innerHTML = "";
  fetch(weatherApiEndPoint + userLocation.value)
    .then((response) => response.json())
    .then((data) => {
      if (data.cod != "" && data.cod != 200) {
        alert(data.message);
        return;
      }
      console.log(data);
      city.innerHTML = data.name + " , " + data.sys.country;
      weatherIcon.style.background = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
      const lat = data.coord.lat;
      const lon = data.coord.lon;
      Promise.all([
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
        ).then((r) => r.json()),
        fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lon}`, {
          headers: { "x-access-token": OPENUV_KEY },
        }).then((r) => r.json()),
      ])
        .then(([weatherData, uvData]) => {
          // console.log("Temp:", weatherData.main.temp);
          // console.log("UV Index:", uvData.result.uv);
          temparature.innerHTML = tempConvert(weatherData.main.temp);
          feelsLike.innerHTML = "Feels like " + weatherData.main.feels_like;
          description.innerHTML =
            `<i class = "fa-brands fa-cloudversify"></i> &nbsp` +
            weatherData.weather[0].description;
          const option = {
            weekday: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            year: "numeric",
            month: "2-digit",
          };
          date.innerHTML = getTime(weatherData.dt, option);

          hvalue.innerHTML =
            Math.round(weatherData.main.humidity) + "<span>%</span>";
          wvalue.innerHTML =
            Math.round(weatherData.wind.speed) + "<span> ms</span>";

          srvalue.innerHTML = getLongFormateDateTime(weatherData.sys.sunrise);
          ssvalue.innerHTML = getLongFormateDateTime(weatherData.sys.sunset);

          cvalue.innerHTML = weatherData.clouds.all + "<span>%</span>"; 
          
          uvalue.innerHTML = uvData.result.uv;
          pvalue.innerHTML = weatherData.main.pressure + "<span>Pa</span>";
        })
        .catch((err) => console.error(err));

      // for this week
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${userLocation.value}&units=metric&appid=${WEATHER_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          // Group by date
          const days = {};
          data.list.forEach((item) => {
            const date = item.dt_txt.split(" ")[0];
            if (!days[date]) {
              days[date] = item; // first entry of that day
              let div = document.createElement("div");
              const options = {
                weekday: "long",
                month: "long",
                day: "numeric",
              };
              let daily = getTime(item.dt, options).split(" ");
              div.innerHTML = daily[0] + " , " + daily[1] + " " + daily[2];

              div.innerHTML += `<img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" />`;

              div.innerHTML += `<p class ="forecast-desc"> ${item.weather[0].description}</p>`;

              div.innerHTML += `<span><span>${tempConvert(
                item.main.temp_min
              )}</span>&nbsp;&nbsp;<span>${tempConvert(
                item.main.temp_max
              )}</span></span>`;
              forecast.append(div);
            }
          });

          console.log(days); // Now you have ~5 days
        });
    });
}

function getTime(dt, options) {
  const mydate = new Date(dt * 1000); // *1000 because JS uses milliseconds

  // Get formatted date:
  const formattedDate = mydate.toLocaleDateString("en-IN", options);

  return formattedDate;
}

function formatUnixTime(dtValue) {
  const date = new Date(dtValue * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getLongFormateDateTime(dtValue) {
  return formatUnixTime(dtValue);
}

function tempConvert(temp) {
  let tempValue = Math.round(temp);
  let msg = "";
  if (converter.value === "°C") {
    msg = tempValue + "<span>" + "\xB0C</span>";
  } else {
    let ctof = (tempValue * 9) / 5 + 32;
    msg = ctof + "<span>" + "\xB0F</span>";
  }
  // console.log(msg);
  return msg;
}

  // ✅ Enter key event
userLocation.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // stops form refresh
    findUserLocation();
  }
});