// Declare requirement variables
const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");

// Set up new express app
const app = express();

// Set up EJS
app.set("view engine", "ejs");

// Set up static folder to access files, set up body parser
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


// Get route
app.get("/", function(req, res){
    res.sendFile(`${__dirname}/start.html`);
})

// Post route
app.post("/", function(req, res){
    const apiKey = 0; // REPLACE WITH API KEY
    const cityName = req.body.cityName;
    const countryCode = req.body.countryCode;
    const units = req.body.units;
    const url = (countryCode === undefined) ? `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${units}` : `https://api.openweathermap.org/data/2.5/weather?q=${cityName},${countryCode}&appid=${apiKey}&units=${units}`;
    
    // Get weather info from openweathermap
    https.get(url, function(response){
        response.on("data", function(d){
            const weatherData = JSON.parse(d);
            console.log(weatherData);
            
            if (weatherData.cod === 200) {
                const unit = (units === "metric") ? "C" : "F"
                const weatherCond = setBackground(weatherData.weather[0].icon);

                const viewObject = {city: weatherData.name, 
                temp: Math.round(weatherData.main.temp),
                feelsLike: Math.round(weatherData.main.feels_like),
                high: Math.round(weatherData.main.temp_max),
                low: Math.round(weatherData.main.temp_min), 
                unit: unit, 
                weatherCond: weatherCond,
                icon: weatherData.weather[0].icon,
                flagInit: weatherData.sys.country.substr(0,1).toLowerCase(),
                flagCode: weatherData.sys.country.toLowerCase()};

                res.render("current", viewObject);
            } else {
                res.render("failure", {});
            }
            
        })
    })

})

// Post route to get back home from results
app.post("/current", function(req, res){
    res.sendFile(`${__dirname}/start.html`);
})

// Post route to get back home from failure page
app.post("/failure", function(req, res){
    res.sendFile(`${__dirname}/start.html`);
})

// App listener
app.listen(process.env.PORT || 3000, function() {
    console.log("Listening on port 3000.");
})

// Result background selector based on openweathermap icon ID
function setBackground(weatherID) {
    const condCode = weatherID.substr(0, 2);    // Weather condition code
    const todCode = weatherID.substr(2, 1); // Time of day code
    let result;

    if (condCode === "01" || condCode === "02") {
        result = "clear-";
    } else if (condCode === "03" || condCode === "04") {
        result = "cloudy-";
    } else if (condCode === "10") {
        result = "drizzle-";
    } else if (condCode === "09" || condCode === "11") {
        result = "rainy-";
    } else if (condCode === "13") {
        result = "snowy-";
    } else if (condCode === "50") {
        result = "misty-"
    }

    result = todCode === "d" ? (result + "day") : (result + "night");
    return result;
}

