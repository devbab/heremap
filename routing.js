"use strict";
const cm = require("common");

/**
 * compute a route with optional waypooints. [see more info on optional parameters] (http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)
 *  @async
 * @alias hm:route
 * @param {object} source - source as \[lat,lng\]. Can be array of \[lat,lng\] to define waypoints
 * @param {object} dest - dest as \[lat,lng\]. Can be array of \[lat,lng\] to define waypoints
 * @param opt {object} route options 
 * @param [opt.mode=fastest;car;traffic:disabled] {string}  routing mode
 * @param [opt.routeattributes=waypoints,summary,shape] {string}  route attributes
 * @param [opt.maneuverattributes=direction,action] {string}  manoeuver attributes
 * @returns {object} returns { summary: object, coords:array,route: object, body:object}. coords is array of coord, to be used with hm.polyline. 
 *
 * @example
  * ```js
  * const res = await hm.route([48.8,2.3],[48.7,2.5]);
  * console.log (res.summary);
  * 
  * const res = await hm.route([[48.8,2.3],[48.9,2.7]], [49.3,2.5]);
  * console.log (res.route); 
  * 
  * const res = await hm.route([48.8,2.3], [[48.9,2.7], [49.3,2.5]]);
  * console.log (res.summary); 
  * ```
 */
async function route(source, dest, opt) {

    const settings = {
        mode: "fastest;car;traffic:disabled",
        representation: "linkPaging",
        routeattributes: "waypoints,summary,shape",
        maneuverattributes: "direction,action"
    };

    const params = cm.addCredentials(settings, opt);

    // 1 seul source ou array de source ?
    let id = 0;
    if (Array.isArray(source[0]))
        for (var i = 0; i < source.length; i++) {
            let coord = source[i];
            params["waypoint" + id++] = coord[0] + "," + coord[1];
        }
    else
        params["waypoint" + id++] = source[0] + "," + source[1];

    if (Array.isArray(dest[0]))

        for (let i = 0; i < dest.length; i++) {
            let coord = dest[i];
            params["waypoint" + id++] = coord[0] + "," + coord[1];
        }
    else
        params["waypoint" + id++] = dest[0] + "," + dest[1];

    const url = cm.buildUrl("route", "api.here.com/routing/7.2/calculateroute.json");
    return cm.hereRest(url, params, "post")
        .then(res => {

            const route = res.body.response.route[0];
            const summary = route.summary;
            const coords = route.shape.map((latlng => latlng.split(",")));

            return { summary: summary, coords: coords, route: route, body: res.body };

        });

}


/**
 * compute an isoline. [see more info on optional parameters] (http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)
 * @async
 * @alias hm:isoline
 * @param opt {object} option for isoline
 * @param [opt.start] {coord} coord for starting point of isoline
 * @param [opt.destination] {coord} coord for destination point of isoline
 * @param [opt.rangeType="time"] {string} time or distance
 * @param [opt.range] {number} range in seconds or in meters
 * @param [opt.mode="fastest;car;traffic:disabled"] {String} routing mode
 * @param [opt.linkattributes=sh] {String} attributes to be returned
 * 
 * @returns {object}  returns { poly:array, body:object }. Poly is array of coords, body is full answer
 */
async function isoline(opt) {

    const settings = {
        start: null,                            // for direct isoline
        destination: null,                      // for reverse isoline
        rangeType: "time",                      // time or distance
        range: null,                            // in seconds or meters
        linkattributes: "sh",                   // to get the shape
        mode: "fastest;car;traffic:disabled",   //shortest;car;traffic:disabled 
    };
    const params = cm.addCredentials(settings, opt);

    if (params.start)
        params.start = "geo!" + params.start[0] + "," + params.start[1];
    if (params.destination)
        params.destination = "geo!" + params.destination[0] + "," + params.destination[1];

    if (!params.start && !params.destination) {
        let e = new Error("Isoline routing : missing start or destination"); // e.message
        throw (e);
    }
    if (!params.range) {
        let e = new Error("Isoline routing : missing range"); // e.message
        throw (e);
    }

    const url = cm.buildUrl("isoline.route", "api.here.com/routing/7.2/calculateisoline.json");
    return cm.hereRest(url, params, "post")
        .then(res => {

            // array of lat,lng, to be transformed into array of [lat,lng]
            const shape = res.body.response.isoline[0].component[0].shape;
            const poly = shape.map(point => point.split(","));

            return { poly: poly, body: res.body };
        });

}


/**
 * compute a matrix. [see more info on optional parameters] (http://documentation.developer.here.com/pdf/routing_hlp/7.2.100/Routing%20API%20v7.2.100%20Developer's%20Guide.pdf)
 * 
 * Matrix size is limited to 1x100,100X1 or 15*N
 *  @async
 * @alias hm:matrix
 * @param source {object} source as \[lat,lng\]. Can be array of \[lat,lng\]
 * @param dest {object} dest as \[lat,lng\]. Can be array of \[lat,lng\]
 * @param opt {object} additional optional parameters like  mode, summaryAttributes
 * @param [opt.mode="fastest;car;traffic:enabled"] {string} routing mode to compute matrix
 * @param [opt.summaryAttributes="tt,di"] {string} attributes in the answer
 * 
 * @returns {object} { entries: object, body:object }. entries is the array of {start,stop} information. body is full json answer
 * @example
 * ```js
 * const res = await hm.matrix({
 *      source:[48.8,2.3]
 *      dest:[[48.7,2.5],[48.1,2.0],[44.2,2.3]]
 * });
 * console.log (res.entries); 
 * ```
 */

async function matrix(source, dest, opt) {

    var settings = {
        mode: "fastest;car;traffic:enabled",
        summaryAttributes: "tt,di"
    };
    const params = cm.addCredentials(settings, opt);

    if (!Array.isArray(source[0])) // if only one coord
        source = [source];
    source.forEach((coord, i) => {
        params["start" + i] = coord[0] + "," + coord[1];
    });

    if (!Array.isArray(dest[0])) // if only one coord
        dest = [dest];
    dest.forEach((coord, i) => {
        params["destination" + i] = coord[0] + "," + coord[1];
    });

    const url = cm.buildUrl("matrix.route", "api.here.com/routing/7.2/calculatematrix.json");
    return cm.hereRest(url, params, "post")
        .then(res => {
            return { entries: res.body.response.matrixEntry, body: res.body };
        });


}



/**
 * Compute the detour for each waypoint provided, compared to normal route from A to B
 * 
 * @async
 * @alias hm:detour
 * @param start {coord}  starting point for route
 * @param stop {coord}   destination point of route
 * @param waypoints {array}  list of watypoints to test 
 * @returns {object} returns {reference,waypoints:[ {coord,distA,timeA,distB,timeB}]}
 */
async function detour(start, stop, waypoints) {
    // eslint-disable-next-line   no-undef
    return new Promise(
        async (resolve, reject) => {
            //let tStart = new Date();

            if (!start) return reject("missing start point");
            if (!stop) return reject("missing stop point");
            if (!waypoints) return reject("missing waypoints");
            if (!Array.isArray) return reject("waypoints should be an array");


            // initialise le resultat 
            let res = {
                reference: {},
                waypoints: []
            };

            // calcul les coords nonPostGres, creer l'array de coord des waypoints.
            let dest = [stop]; // so we have a distance/time reference, not same as from routing 1:1
            waypoints.forEach(waypoint => {
                dest.push(waypoint);
                res.waypoints.push(
                    { coord: waypoint }
                );
            });
            // inspect(dest, "dest from detour")

            // compute start to all waypoint, 1st waypoint is stop to get a reference
            let p1 = matrix(start, dest, { mode: "fastest;car;traffic:disabled" });

            // compute from all waypoint to stop, 1st waypoint is start to get another reference
            dest[0] = start;
            let p2 = matrix(dest, stop, { mode: "fastest;car;traffic:disabled" });
            // wait for both matrix to complete

            // eslint-disable-next-line   no-undef
            const result = await Promise.all([p1, p2]);

            // process first part: start => N waypoints
            let entries = result[0].entries;
            // first entry is start stop
            let dist = entries[0].summary.distance;
            let time = entries[0].summary.travelTime;
            res.reference.start = start;
            res.reference.stop = stop;
            res.reference.distance = dist;
            res.reference.time = time; // the reference sans waypoint

            entries.forEach((entry, i) => {
                if (i == 0) return; // skip the first which is start stop

                if (entry.status == "failed") {
                    //console.log(entry, "error on matrixA" + i);
                    //console.log(start, "associated start");
                    //console.log(dest[i], "associated dest" + i);
                    return;
                }

                let id = entry.destinationIndex;
                let dist = entry.summary.distance;
                let time = entry.summary.travelTime;
                res.waypoints[id - 1].distA = dist;
                res.waypoints[id - 1].timeA = time;
            });


            // process second part: N waypoints => stop
            entries = result[1].entries;
            //inspect(entries[0], "matrixB0");

            res.reference.distance2 = entries[0].summary.distance;
            res.reference.time2 = entries[0].summary.travelTime;

            entries.forEach((entry, i) => {
                if (i == 0) return; // skip the first which is start stop

                if (entry.status == "failed") {
                    //console.log(entry, "error on matrixB" + i);
                    //console.log(entry, "associated start" + i);
                    //console.log(stop, "associated stop");
                    return;
                }
                let id = entry.startIndex;
                let dist = entry.summary.distance;
                let time = entry.summary.travelTime;
                res.waypoints[id - 1].distB = dist;
                res.waypoints[id - 1].timeB = time;
            });
            return resolve(res);
        });

}


module.exports = {
    matrix: matrix,
    route: route,
    isoline: isoline,
    detour: detour
};

