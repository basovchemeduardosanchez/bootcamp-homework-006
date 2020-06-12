var OpenWeatherMap = {
    apiKey: undefined,
    language: "en",
    /**
     * Returns only Year Month and Day from the Date
     * @param {Date} date The date you want to get the date information from
     */
    getIsoDate: function( date ) {
        var year = date.getFullYear();
        // getMonth() is zero-based
        var month = String( date.getMonth() + 1 ).padStart( 2, '0' );
        var day = String( date.getDate() ).padStart( 2, '0' );
        
        return `${year}-${month}-${day}`
    },
    /**
     * Returns only Year Month and Day from the Date
     * @param {Date} date The date you want to get the date information from
     */
    getLocaleDayMonth: function( date ) {
        
    },
    /**
     * Convert from Kelvin to Celsius Degrees
     * @param {number} kelvin The temperature to convert in Kelvin
     * @return {number} The resulting Celsius
     */
    kelvinToCelsius: function( kelvin ){
        return kelvin - 273.15;
    },
    /**
     * Convert miles to Kilometers
     * @param {number} miles Miles to convert
     * @return {number} The resulting Kilometers
     */
    milesToKilometers: function( miles ){
        return miles * 1.60934;
    },
    /**
     * Obtains the UV index
     * @param {number} latitude The latitude to get the index from
     * @param {number} longitude The longitude to get the index from
     * @param {function} callback A function that will be passed the
     * returnedData for the location
     */
    getUvIndex: function( latitude, longitude, callback ){
        // * Get the UV Index
        // UV Index info https://en.wikipedia.org/wiki/Ultraviolet_index
        
        var self = this;
        var queryUrl = `http://api.openweathermap.org/data/2.5/uvi?appid=${ encodeURIComponent( this.apiKey ) }&lat=${ encodeURIComponent( latitude ) }&lon=${ encodeURIComponent( longitude ) }`

        $.ajax( {
            url: queryUrl,
            method: "GET"
        } )
            .then( function( response ){
                //console.log( response );

                if( typeof callback === 'function' ){
                    var uvIndexResponse = {
                        value: response.value.toFixed( 2 ),
                        color: undefined,
                        risk: undefined
                    };

                    if ( uvIndexResponse.value >= 0 && uvIndexResponse.value < 3  ){
                        uvIndexResponse.color = 'green';
                        uvIndexResponse.risk = 'Low';
                    } else if ( uvIndexResponse.value >= 3 && uvIndexResponse.value < 6 ) {
                        uvIndexResponse.color = 'yellow';
                        uvIndexResponse.risk = 'Moderate';
                    } else if ( uvIndexResponse.value >= 6 && uvIndexResponse.value < 8 ) {
                        uvIndexResponse.color = 'orange';
                        uvIndexResponse.risk = 'High';
                    } else if ( uvIndexResponse.value >= 8 && uvIndexResponse.value < 11 ) {
                        uvIndexResponse.color = 'red';
                        uvIndexResponse.risk = 'Very High';
                    } else if ( uvIndexResponse.value >= 11 ) {
                        uvIndexResponse.color = 'purple';
                        uvIndexResponse.risk = 'Extreme';
                    }

                    callback.call( null, uvIndexResponse );
                }
            } );
    },
    /**
     * Transform a response into a more intuitive one
     * @param {Object} response A response from OpenWeatherMap
     */
    transformWeatherResponse: function( response ){
        return {
            coords: response.coord,
            iconUrl: `http://openweathermap.org/img/w/${ response.weather[0].icon }.png`,
            description: response.weather[0].description,
            temperature: this.kelvinToCelsius( response.main.temp ).toFixed( 2 ) + " °C",
            humidity: response.main.humidity.toFixed( 2 ) + " %",
            country: response.sys.country,
            city: response.name,
            windSpeed: this.milesToKilometers( response.wind.speed ).toFixed( 2 ) + " Km/h",
            minimumTemperature: this.kelvinToCelsius( response.main.temp_min ).toFixed( 2 )  + " °C",
            maximumTemperature: this.kelvinToCelsius( response.main.temp_max ).toFixed( 2 )  + " °C"
        };
    },
    /**
     * Obtains the current forecast for a city
     * @param {string} cityName Search parameter to get the current weather
     * @param {function} callback The function that will be executed with the
     * data passed as a parameter when the request is successful
     */
    getCurrentWeather: function( cityName, callback ){
        var self = this;
        var queryUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + encodeURIComponent( cityName ) + "&appid=" + encodeURIComponent( this.apiKey ) + "&lang=" + encodeURIComponent( this.language );

        $.ajax( {
            url: queryUrl,
            method: "GET"
        } )
            .then( function( response ){
                if( typeof callback === 'function' ){
                    //console.log( response );

                    self.getUvIndex( response.coord.lat, response.coord.lon, function( uvIndexResponse ){
                        var transformedResponse = self.transformWeatherResponse( response );
                        transformedResponse.uvIndex = uvIndexResponse.value;
                        transformedResponse.uvColor = uvIndexResponse.color;
                        transformedResponse.uvRisk = uvIndexResponse.risk;

                        callback.call( null, transformedResponse );
                    } );
                }
            } ); 
    },
    /**
     * Obtains the 5 day forecast for the given city
     * @param {string} cityName The name of the city to obtain the forecast
     * @param {function} callback A function to execute when the call is
     * successful
     */
    getWeatherForecast: function( cityName, callback ){
        var self = this;
        var queryUrl = `http://api.openweathermap.org/data/2.5/forecast?appid=${ encodeURIComponent( this.apiKey ) }&q=${ encodeURIComponent( cityName ) }`

        $.ajax( {
            url: queryUrl,
            method: "GET"
        } )
            .then( function( response ){
                if( typeof callback === 'function' ){
                    var days = [];

                    for( var i = 0; i < response.list.length; i++ ){
                        var weatherItem = response.list[ i ],
                            fullDate = new Date( weatherItem.dt_txt ),
                            transformedWeatherItem,
                            itemDate;

                        // Only output 12 AM
                        if( fullDate.getHours() === 12 ){
                            transformedWeatherItem = self.transformWeatherResponse( weatherItem );
                            transformedWeatherItem.city = response.city.name;
                            transformedWeatherItem.country = response.city.country;
                            transformedWeatherItem.coords = response.city.coord;
                            transformedWeatherItem.date = self.getIsoDate( fullDate );
                            transformedWeatherItem.weekday = fullDate.toLocaleString( 'en-US', { weekday: 'short' } );

                            days.push( transformedWeatherItem );
                        }
                    }

                    callback.call( this, days );
                }
            } );
    }
};
