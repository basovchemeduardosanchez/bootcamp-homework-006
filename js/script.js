// !! --------------------------------------------------------------------------
// SECTION JQUERY BOILERPLATE [2020-05-05T03:48:33.827Z]
$( document ).ready( function(){
    /**
     * 
     * @param {string} cityName Search parameter to get the current weather 
     */
    function getCurrentWeather(cityName){
        var apiKey = "89ad2a4b4f77d2b3ea19b5ccd624b048";
        var language = "es";
        var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey + "&lang=" + language; 
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response){
            $("#temperature").text(response.main.temp - 273.15 + " °C" ); 
            $("#humidity").text(response.main.humidity + " %");
            $("#location-name").text(response.name + " ," + response.sys.country);
            $("#wind-speed").text(response.wind.speed + "  MPH");
            $("#temp_min").text(response.main.temp_min - 273.15  + " °C");
            $("#temp_max").text(response.main.temp_max - 273.15  + " °C");
            console.log(queryURL);     	  
        }); 
    }
    $("#search-button").on ('click',
        function( event ){  
            getCurrentWeather($("#city-name").val());   
        });
} );
// !SECTION JQUERY BOILERPLATE
// !! --------------------------------------------------------------------------



