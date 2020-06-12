$( document ).ready( function(){
    var savedSearchTemplate = Handlebars.compile(
`<div class="card border-0 shadow flex-md-row mb-4 box-shadow h-md-250" style="overflow: hidden;">
    <div class="card-body bg-white text-dark p-0">
        <div class="row">
            <div class="col">
                <h3 class="p-3 m-0 border-bottom">
                    <a class="search text-dark d-block text-truncate" href="#">{{city}}</a>
                </h3>
            </div>
        </div>
        <div class="row">
            <div class="col col-sm-6 col-lg-6 pr-0">
                <div class="p-3">
                    <div class="mb-1">T: {{temperature}}</div>
                    <div class="mb-1">H: {{humidity}}</div>
                    <div class="mb-1">WS: {{windSpeed}}</div>
                </div>
            </div>
            <div class="d-sm-block d-md-none d-lg-block col-sm-6 col-lg-6 ">
                <img class="w-100 h-100" style="max-height: 200px; object-fit: cover;" src="{{iconUrl}}">
            </div>
        </div>
    </div>
</div>`
    );

    OpenWeatherMap.apiKey = "89ad2a4b4f77d2b3ea19b5ccd624b048";

    function fillCurrentForecast( data ){
        $( "#uv-index" )
            .text( data.uvIndex );
        $( "#uv-color" )
            .css( 'background', data.uvColor );
        $( "#uv-risk" )
            .text( data.uvRisk );
        $( "#date" )
            .text( new Date().toLocaleString() );
        $( "#icon" )
            .attr( "src", data.iconUrl );
        $( "#description" )
            .text( data.description ); 
        $( "#temperature" )
            .text( data.temperature ); 
        $( "#humidity" )
            .text( data.humidity );
        $( "#location-name" )
            .text( data.city + ", " + data.country );
        $( "#wind-speed" )
            .text( data.windSpeed );
        $( "#temp_min" )
            .text( data.minimumTemperature );
        $( "#temp_max" )
            .text( data.maximumTemperature );
        $( "#location-image" )
            .attr( "src", UnsplashSource.getImageUrl( '350x350', [
                data.country,
                data.city//,
                //...( data.description.split( " " ) )
            ] ) );
    }
    function fillWeeklyForecast( data ){
        var days = [
                $( '#day-1' ),
                $( '#day-2' ),
                $( '#day-3' ),
                $( '#day-4' ),
                $( '#day-5' )
            ];

        for( var i = 0; i < days.length; i++ ){
            var day = days[ i ];

            if( data.length - 1 >= i ){
                // Searching for the .day class inside of #day-1
                var dataItem = data[ i ],
                    weekday = $( '.weekday', day )
                        .text( dataItem.weekday ),
                    temperature = $( '.temperature', day )
                        .text( dataItem.temperature ),
                    humidity = $( '.humidity', day )
                        .text( dataItem.humidity ),
                    icon = $( '.icon', day )
                        .attr( 'src', dataItem.iconUrl );

                day.show();
            } else {
                day.hide();
            }
        }
    }
    function fillForecasts( currentData ){
        OpenWeatherMap.getWeatherForecast( currentData.city, function( forecastData ){
            var forecasts = $( '#forecasts' ).css( {
                visibility: 'initial'
            } );
            fillCurrentForecast( currentData );
            fillWeeklyForecast( forecastData );
        } );
    }
    function renderForecasts( cityName ){
        OpenWeatherMap.getCurrentWeather( cityName, fillForecasts );
    }
    function renderLastSearchForecasts(){
        var lastSearch = localStorage.getItem( 'lastSearch' );
        if( lastSearch ){
            renderForecasts( lastSearch );
        }
    }
    function getSearches(){
        return JSON.parse( localStorage.getItem( 'searches' ) ) || [];
    }
    function saveSearch( search ){
        var localSearch = search.toLowerCase();
        var searches = getSearches();
        localStorage.setItem( 'lastSearch', localSearch );

        console.log( searches, !searches.includes( searches ) );

        // Prepend element to the array
        if( !searches.includes( localSearch ) ){
            searches.unshift( localSearch );
        }
        // Keep only the first 5 elements of the array (The last 5 searches)
        searches.slice( 0, 5 );
        localStorage.setItem( 'searches', JSON.stringify( searches ) );
    }
    function renderSearches(){
        var searches = getSearches();
        
        $( '#recent-cities' ).empty();
        for( var i = 0; i < searches.length; i++ ){
            OpenWeatherMap.getCurrentWeather( searches[ i ], function( currentData ){
                var savedSearch = $( savedSearchTemplate( 
                    currentData
                ) );
                var header = $( '.search', savedSearch )
                    .click( function( pEvent ){
                        renderForecasts( $( this ).text() );
                    } );
                
                $( '#recent-cities' ).append( savedSearch );
            } );
        }
    }
    function render(){
        renderLastSearchForecasts();
        renderSearches();
    }

    $( "#search-button" ).on( 'click', function( event ){
        var cityName = $( "#city-name" ).val();
        saveSearch( cityName );
        render();
    } );
    $( "#city-name" ).on( 'keydown', function( event ){
        if( event.keyCode === 13 ){
            event.preventDefault();
            $( "#search-button" ).trigger( 'click' );
        }
    } );

    render();
} );
