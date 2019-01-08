/**
 * @file Geocoding functions : addresses <--> [lat,lng]
 * @author Devbab 
 */

"use strict";
const cm = require("./common.js");

/**
 * geocode an address
 * @async
 * @alias hm:geocode
 * @param {string} address - address as string
 * @returns {Object} returns  {coord,body}. coord is geocode as \[lat,lng\]. body is full json answer
 * 
 * @example
 * ```js
 * const res = await hm.geocode("avenue des chaps elysees, paris");
 * console.log (res.coord);
 * ```
 */
async function geocode(address) {

    const settings = cm.addCredentials({
        searchText: address
    });

    const url = cm.buildUrl("geocoder", "api.here.com/6.2/geocode.json");
    return cm.hereRest(url, settings)
        .then(res => {

            if (res.body.Response.View.length == 0) {
                let e = new Error("Geocode Address not found: " + address); // e.message
                throw (e);
            }

            var location = res.body.Response.View[0].Result[0].Location;
            var coord = [location.NavigationPosition[0].Latitude, location.NavigationPosition[0].Longitude];
            return { coord: coord, body: res.body };
        });
}


/**
 * reverse geocode a coordinate
 * @async
 * @alias hm:reverseGeocode
 * @param {Coord} coord - coord \[lat,lng\] to reverse geocode
 * @returns {object} returns { location:object, address:object, body:object}. 
 */
async function reverseGeocode(coord) {

    const settings = cm.addCredentials({
        mode: "retrieveAddresses",
        prox: coord[0] + "," + coord[1]
    });

    const url = cm.buildUrl("reverse.geocoder", "api.here.com/6.2/reversegeocode.json");

    return cm.hereRest(url, settings)
        .then(res => {
            // res.body, res.headers, res.status
            var location = res.body.Response.View[0].Result[0].Location;
            return ({ location: location, address: location.Address, body: res.body });
        });
}


module.exports = {
    geocode: geocode,
    reverseGeocode: reverseGeocode
};

