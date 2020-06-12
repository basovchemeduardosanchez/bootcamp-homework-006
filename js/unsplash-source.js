var UnsplashSource = {
    getImageUrl: function( pSize, pKeywords ){
        // Generate a URL for Unsplash Source using the size
        lImageURL = 'https://source.unsplash.com/' + encodeURIComponent( pSize )  + '/?';
        // Traverse the keywords array and add them separated by comma to the URL
        for ( var i = 0; i < pKeywords.length; i++ ){
            // If this this is not the first keyword then add a comma
            if ( i > 0 ){
                lImageURL = lImageURL + ',';
            }

            // Add the keyword URL encoded for t not to cause problems if it has
            // special characters
            lImageURL = lImageURL + encodeURIComponent( pKeywords[ i ] );
        };

        // !! I found that when you use multiple images with
        // !! Unsplash Source you end up getting the same image
        // !! multiple times, I looked over the internet and found
        // !! the following link: 
        // !! https://github.com/unsplash/unsplash-source-js/issues/9
        // !! According to it the reason is that the browser caches
        // !! the request and it retrieves the files from the
        // !! browser cache. The comments in there recommends to add
        // !! a random number to the URL as `?sip=<RANDOM>` to get
        // !! rid of this error
        lImageURL = lImageURL + '&sip=' + encodeURIComponent( Math.random() );

        console.log( lImageURL );

        return lImageURL;
    },
    createImage: function( pSize, pKeywords ){
        // Create a jQuery image element
        return $( '<img>' )
            // Add the first keyword to the alt attribute for accessibility
            .attr( 'alt', pKeywords[ 0 ] )
            // Add the generated URL as the src
            .attr( 'src', this.getImageUrl( pSize, pKeywords ) );
    }
};