# HEREMAP

Set of NODE.js/browser interfaces to HERE Maps REST APIs

## Installation

 1/ For use in Node.js, install the package:
    
    npm install --save-dep heremap

then include in your js file

    const heremap = require("heremap");


2/ For use in browser, add this line in your html file

    <script src="http://www.unpkg.com/heremap"></script>

You can then access the object like this:

    const heremap = window.heremap;


## Config, Credentials

    // your own credentials, to be obtained from developer.here.com
    // by default, it uses production environment. You may specify useCIT:true to use CIT
    // by default, it uses https. You may specify useHTTP: true to use http

    heremap.config({
        app_id: "YOUR APP_ID", 
        app_code: "YOUR APP_CODE"
        useHTTP: true
    });


## Geocoding
### Convert a postal address into latitude,longitude

    const res = await heremap.geocode("avenue des champs elysees, Paris");
    console.log(res);  // return {coord, body, respTime}


## Parallel Geocoding
### Compute multiple geocoding in parallel

    const addresses = [
        "avenue des champs-elysees, Paris",
        "Versailles, France",
        "Bordeaux,France",
    ];

    // Array of promises from geocoder
    const promises = addresses.map(addr => heremap.geocode(addr));  
    
    // wait for all geocodes to be performed
    const result = await Promise.all(promises);                     
    
    // get array of coords
    const coords = result.map(resp => resp.coord); 



## Reverse Geocoding
### Get address from latitude,longitude

    const res = await heremap.reverseGeocode([48.3,2.3]);
    console.log(res);  // return {location, address, body, respTime}

## Routing
### Compute a route by walk, car, truck, public transit

    const waypoints = [
        "avenue des champs-elysees, Paris",
        "Versailles, France",
        "Bordeaux,France",
    ];
    const promises = waypoints.map(addr => heremap.geocode(addr));  // Array of promises from geocoder
    const result = await Promise.all(promises);                     // wait for all geocodes to be performed
    const coords = result.map(resp => resp.coord);                  // extrct coords
    const start = coords.shift();                                   // get start points and remove from list of waypoints
    const resp = await heremap.route(start, coords);                // compute the route
    console.log(result);                                            // return {summary, route, body, respTime

## Matrix Routing
### M*N routes in one request

    // Addresses are geocoding in parallel, and then first one is used as start point, all other as end points
    const addresses = [
        "8 rue Benjamin Franklin Paris",
        "Perpignan, france",
        "Vannes, france",
        "Lyon,France",
        "Marseille,France",
        "Versailles,France"
    ];

    const opt= {
        mode: "fastest;car;traffic:enabled"
    };
    const promises = addresses.map(addr => heremap.geocode(addr));  // array of promises
    const result = await Promise.all(promises);                     // awaits all promises (geocodes) to be performed
    const coords = result.map(resp => resp.coord);                  // get array of coords
    const start = coords.shift();                                   // extract start point
    const result = await heremap.matrix(start, coords, opt);        // does matrix routing
    console.log(result);                                            // return {entries, body, respTime}

## Isoline Routing
### Reachable area by car, walk from a certain point

    // area to reach in 10mn drive with traffic
    let opt = {
        start:[48.3,2.3],
        rangeType: "time",                     
        range: 10*60,                            
        mode: 'fastest;car;traffic:disabled'   
    }
    let res = await heremap.isoline(opt);
    console.log(res);  // return { poly, body, respTime}

    // area to reach in 2km walk
    opt = {
        start:[48.3,2.3],
        rangeType: "distance",                     
        range: 2,                            
        mode: 'fastest;pedestrian'   
    }
    res = await heremap.isoline(opt);
    console.log(res);  // return { poly, body, respTime}

    // from which area can I reach  the point in 30min truck
    opt = {
        destination:[48.3,2.3],
        rangeType: "time",                     
        range: 30*60,                            
        mode: 'balancd;truck'   
    }
    res = await heremap.isoline(opt);
    console.log(res);  // return { poly, body, respTime}

## Detour
### Compute detour in meters and seconds from main route for each waypoint
    /* returns {reference,waypoints}

    reference = {start,stop,distance, time}
        for the whole trip
    waypoint = [{coord,distA,distB},...]
        coord: of waypoint 
        distA : from start to waypoint
        distB : from waypoint to end}
    */
    
    const start = [48.3,2.3];
    const stop = [,];
    const waypoints = [
        [,],
        [,],
        [,]
    ]

    const res = await heremap.detour(start,stop,waypoints);
    console.log(res);       


# Useful Documentation from HERE Developer Portal

1. [HERE Developer web site](http://developer.here.com)
2. [HERE Developer's User guides in PDF](https://developer.here.com/documentation/versions)


