//globally scoped variables
//openweather API Key 
var apiKey = "a95a25cb9893d091fa2f70cec168177d";
//current day 
var today = moment().format("LL");
//list of cities searched by user
var searchHistoryList = [];
//navbar burger for mobile devices
$(document).ready(function () {
  // check for click events on the navbar burger icon
  $(".navbar-burger").click(function () {
    // toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });
});
// function for current forecast
function currentForecast(city) {
  var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (weatherReport) {
    $("#weatherContent");
    $("#cityForecast").empty();

    var iconCode = weatherReport.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;
    // WHEN I view current weather conditions for that city THEN I am presented with the city name, the date, an icon representation of weather conditions, temperature, pthe humidity, wind speed
    var currentCityForecast = $(`
     <h2 id="currentCityForecast">
      ${weatherReport.name} ${today} <img src="${iconURL}" alt="${weatherReport.weather[0].description}" />
      </h2>
      <p>Temperature: ${weatherReport.main.temp} °F</p>
      <p>Humidity: ${weatherReport.main.humidity}\%</p>
      <p>Wind Speed: ${weatherReport.wind.speed} MPH</p>
      `);

    $("#cityForecast").append(currentCityForecast);
    //WHEN I view current weather conditions for that city THEN I am presented with the city UV index
    var lat = weatherReport.coord.lat;
    var lon = weatherReport.coord.lon;
    var uviQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
      url: uviQueryURL,
      method: "GET",
    }).then(function (UVIReport) {
      console.log(UVIReport);

      var uvIndex = UVIReport.value;
      var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p> `);
      $("#cityForecast").append(uvIndexP);

      futureForecast(lat, lon);
      // WHEN I view the UV index THEN I am presented with a color that indicates whether the conditions are favorable, moderate, or severe
      //legend: 0-2 green#16d83d, 3-5 yellow#fff200, 6-7 orange#ff9500, 8-10 red#fa2a00, 11+violet#c630a5
      if (uvIndex >= 0 && uvIndex <= 2) {
        $("#uvIndexColor")
          .css("background-color", "#16d83d")
          .css("color", "white");
      } else if (uvIndex >= 3 && uvIndex <= 5) {
        $("#uvIndexColor").css("background-color", "#fff200");
      } else if (uvIndex >= 6 && uvIndex <= 7) {
        $("#uvIndexColor").css("background-color", "#ff9500");
      } else if (uvIndex >= 8 && uvIndex <= 10) {
        $("#uvIndexColor").css("background-color", "#fa2a00").css("color", "white");
      } else {
        $("#uvIndexColor").css("background-color", "#c630a5").css("color", "white");
      }
    });
  });
}

// function for city forecast searched by user
function futureForecast(lat, lon) {
  // 5-day forecast
  var futureURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;
  $.ajax({
    url: futureURL,
    method: "GET",
  }).then(function (fiveDayReport) {
    $("#fiveDay").empty();

    for (let i = 1; i < 6; i++) {
      var cityInfo = {
        date: fiveDayReport.daily[i].dt,
        icon: fiveDayReport.daily[i].weather[0].icon,
        temp: fiveDayReport.daily[i].temp.day,
        humidity: fiveDayReport.daily[i].humidity,
      };

      var currentDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
      var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${fiveDayReport.daily[i].weather[0].main}" />`;

      // displays the date, an icon representation of weather conditions, the temperature, the humidity
      var futureCard = $(`
      <div class="card col-sm-6>
        <div class="card-body">
          <h5>${currentDate}</h5>
          <p>${iconURL}</p>
          <p>Temp: ${cityInfo.temp} °F</p>
          <p>Humidity: ${cityInfo.humidity}\%</p>
        </div>
      </div>
            `);

      $("#fiveDay").append(futureCard);
    }
  });
}
// add on click event listener
$("#searchBtn").on("click", function () {
  var city = $("#enterCity").val().trim();
  currentForecast(city);
  if (!searchHistoryList.includes(city)) {
    searchHistoryList.push(city);
    var searchedCity = $(`
      <li class="list-group-item">${city}</li>
      `);
    $("#searchHistory").append(searchedCity);
  }
  localStorage.setItem("city", JSON.stringify(searchHistoryList));
  console.log(searchHistoryList);
});

// WHEN I click on a city in the search history THEN I am again presented with current and future conditions for that city
$(document).on("click", ".list-group-item", function () {
  var listCity = $(this).text();
  currentForecast(listCity);
});

// WHEN I open the weather dashboard THEN I am presented with the last searched city forecast
$(document).ready(function () {
  var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

  if (searchHistoryArr !== null) {
    var lastSearchedIndex = searchHistoryArr.length - 1;
    var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
    currentForecast(lastSearchedCity);
    console.log(`Last searched city: ${lastSearchedCity}`);
  }
});
