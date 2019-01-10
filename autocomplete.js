"use strict";
const cm = require("common");
const m = require("map");


/**
 *  Place autocomplete for use with JQuery
 * @alias hm:placeAC
 * @param [query.term] {object} query.term contains the search
 * @param {function} callback called as callback({title,value,coord,json})
 */
function placeACJQ(query, callback) {
    const center = m.getCenter();
    const params = cm.addCredentials({
        at: center[0] + "," + center[1],
        q: query.term
    });

    const url = cm.buildUrl("places", "api.here.com/places/v1/autosuggest");
    cm.hereRest(url, params, "get", false)
        .then(res => {
            var places = res.body.results.filter(place => place.vicinity);

            places = places.map(place => {
                return {
                    title: place.title,
                    //value: place.title + ', ' + place.vicinity.replace(/<br\/>/g, ", ") + ' (' + place.category + ')',
                    value: place.title + ', ' + place.vicinity.replace(/<br\/>/g, ", "),
                    coord: place.position,
                    res: JSON.stringify(place),

                };
            });
            callback(places);
        });
}

module.exports = {
    placeACJQ: placeACJQ
};
