"use strict";
const cm = require("common");


/**
 * Place AutoSuggest
 * @ async
 * @alias hm:placeAutoSuggest
 * @param opt {Object} options of autosuggest
 * @param opt.search {String} search string
 * @param opt.center {Coord} center search around this coord
 * @return  {Promise} Array of {res,title,value,coord}
 */
function placeAutoSuggest(opt) {

    const params = cm.addCredentials({
        at: opt.center[0] + "," + opt.center[1],
        q: opt.search
    });

    const url = cm.buildUrl("places", "api.here.com/places/v1/autosuggest");
    return cm.hereRest(url, params, "get", false)
        .then(res => {
            let places = res.body.results.filter(place => place.vicinity); // keep only if vicinity field is present

            return places.map(place => {
                return {
                    title: place.title,
                    //value: place.title + ', ' + place.vicinity.replace(/<br\/>/g, ", ") + ' (' + place.category + ')',
                    value: place.title + ", " + place.vicinity.replace(/<br\/>/g, ", "),
                    coord: place.position,
                    res: place,
                };
            });
        });
}


module.exports = {
    placeAutoSuggest: placeAutoSuggest
};
