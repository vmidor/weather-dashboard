// LOCAL DATE
var currentDay = moment().format('MM-DD-YYYY');
// GLOBAL VAR
var apiKey = "78a4a011f56b476d2182228707f7be8c"
var citiesArray = [];

// GETTING WEATHER DEPENDINING ON LOCATION
function getLocalWeather(position) {

    //CODE TO GET DATA FROM API 
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    var queryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        //WEATHER ICON
        var icon = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`

        //UV INDEX FUNCTION
        getUVIndex(lat, lon);

        //UPDATE MAIN WEATHER CARD (populates text/data from API)
        $('#city-name').text(`${response.name}, ${response.sys.country}`);
        $('#current-date').text(`(${currentDay})`);
        $('#weather-icon').attr('src', icon);
        $('#temp').text(`${response.main.temp.toFixed(1)} \xB0F`);
        $('#humid').text(`${response.main.humidity}%`)
        $('#wind').text(`${response.wind.speed.toFixed(2)} mi/s`)
    });

    queryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // sets array to start at 12 noon on following day
        var arrayIndex = 4;

        // FOR LOOP RUNS 5 TIMES FOR 5 DAY WEATHER DATA 
        for (i = 1; i < 6; i++) {
            var day = moment().add(i, 'days').format('MM-DD-YYYY');
            var iconURL = `https://openweathermap.org/img/w/${response.list[arrayIndex].weather[0].icon}.png`

            $(`#forecast-date-${i}`).text(day);
            $(`#forecast-temp-${i}`).text(`${response.list[arrayIndex].main.temp.toFixed(1)} \xB0F`);
            $(`#forecast-humid-${i}`).text(response.list[arrayIndex].main.humidity + '%');
            $(`#forecast-image-${i}`).attr('src', iconURL);

            // moves array index up 24 hours
            arrayIndex += 8;
        }
    })
};

//GETTING WEATHER 
function getCurrentWeather(city) {
    // DATA FROM API (CODE)
    let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&APPID=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // LOCAL TIME
        var unixTime = response.dt + response.timezone;
        var today = moment.unix(unixTime).format("MM-DD-YYYY");

        // GET LAT & LOT FOR UV INDEX 
        var lat = response.coord.lat
        var lon = response.coord.lon

        //GET WEATHER ICON
        var iconURL = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`

        // call UV index function
        getUVIndex(lat, lon);
        $('#city-name').text(`${response.name}, ${response.sys.country}`);
        $('#current-date').text(`(${today})`);
        $('#weather-icon').attr('src', iconURL);
        $('#temp').text(`${response.main.temp.toFixed(1)} \xB0F`);
        $('#humid').text(`${response.main.humidity}%`)
        $('#wind').text(`${response.wind.speed.toFixed(2)} mi/s`)


        getFiveDay(city, unixTime);

        // stores input in local storage
        storeData(city);

    })
}

// FORECAST CARDS FOR 5 DAYS 
function getFiveDay(city, unixTime) {
    var queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        // sets array to start at 12 noon on following day
        var arrayIndex = 4;

        // FOR LOOP RUNS 5 TIMES FOR 5 DAY WEATHER DATA 
        for (i = 1; i < 6; i++) {
            var day = moment.unix(unixTime).add(i, 'days').format('MM-DD-YYYY');
            var iconURL = `https://openweathermap.org/img/w/${response.list[arrayIndex].weather[0].icon}.png`

            $(`#forecast-date-${i}`).text(day);
            $(`#forecast-temp-${i}`).text(`${response.list[arrayIndex].main.temp.toFixed(1)} \xB0F`);
            $(`#forecast-humid-${i}`).text(response.list[arrayIndex].main.humidity + '%');
            $(`#forecast-image-${i}`).attr('src', iconURL);

            // moves array index up 24 hours
            arrayIndex += 8;
        }
    })
}

// AJAX CALL TO GET THE UV INFO
function getUVIndex(lat, lon) {
    var queryURL = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var index = response.value

        //SETS UV TEXT 
        $('#uv').text(index);

        //  change background of UV index depending on severity
        if (index < 3) {
            $('#uv').attr('class', 'green');
        } else if (index < 6) {
            $('#uv').attr('class', 'yellow');
        } else if (index < 8) {
            $('#uv').attr('class', 'orange');
        } else {
            $('#uv').attr('class', 'red');
        }


    })
}

//LOADING DATA FOM STORAGE 
function loadData() {
    var storedCities = JSON.parse(localStorage.getItem('cities'));

    if (storedCities === null) {
        navigator.geolocation.getCurrentPosition(getLocalWeather);
    } else {
        // ADDS A LIST ITEM TO SEARCH DISPLAY
        for (var i = 0; i < storedCities.length; i++) {
            citiesArray.push(storedCities[i])
            var p = $('<p>').text(storedCities[i]);
            p.addClass('list-item');
            $('#search-display').prepend(p);
        };
    };

    getCurrentWeather(storedCities[storedCities.length - 1]);
}

// SAVING DATA TO LOCAL STORAGE
function storeData(city) {
    // pushes new city query into array and puts array into local storage
    if (!citiesArray.includes(city)) {
        citiesArray.push(city);
        localStorage.setItem('cities', JSON.stringify(citiesArray));

        // ADDS A LIST ITEM TO SEARCH DISPLAY
        var p = $('<p>').text(city);
        p.addClass('list-item');
        $('#search-display').prepend(p);
    }
}

// CLEARS DATA FORM STORAGE
function clearData() {
    citiesArray = [];
    localStorage.clear();
    $('#search-display').html('');
}

// EVENT FOR THE SUBMIN BTN
$('#searchBtn').on('click', function () {

    var cityInput = $('#search-bar').val();
    var city = cityInput.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // CURRENT WEATHER FOR 5 DAYS
    getCurrentWeather(city);
})

// event listener for previously searched list
$('#search-display').on('click', '.list-item', function () {
    // calls weather functions
    var city = $(this).text();
    getCurrentWeather(city)
})

// event listener for clear button
$('#clear-button').on('click', clearData);

// loads data
loadData();
