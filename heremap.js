const request = require("superagent");

// by default, unless specific from credentials
let APP_ID = process.env.APP_ID;
let APP_CODE = process.env.APP_CODE;
let cit = ""; // production by default

let protocol = "https://"; // by default

/**
 * To configure app_id, app_code and optinally use CIT and http
 * @param {string} obj - object with parameters.
 */
function init(obj) {
    if (obj.app_id) APP_ID = obj.app_id;
    if (obj.app_code) APP_CODE = obj.app_code;
    if (obj.useCIT) cit = ".cit";
    if (obj.useHTTP) protocol = "http://";
}

/**
 * same as init
 */
function config(obj) {
    init(obj);
}
/**
 * geocode an address
 * @param {string} address - address as string.
 * @returns {object} { body: body, coord: coord }
 */
async function geocode(address) {
    let tStart = new Date();

    return new Promise(
        (resolve, reject) => {
            const settings = {
                app_id: APP_ID,
                app_code: APP_CODE,
                searchText: address
            };

            request.get(protocol + "geocoder" + cit + ".api.here.com/6.2/geocode.json")
                .query(settings)
                .then(res => {
                    // res.body, res.headers, res.status
                    if (!res.body.Response) {
                        let e = new Error(res.body); // e.message
                        e.name = "Geocode Query error:";
                        return reject(e);
                    }
                    if (res.body.Response.View.length == 0) { // no results
                        let e = new Error(address); // e.message
                        e.name = "Geocode Adddress not found:";
                        return reject(e);
                    }
                    var location = res.body.Response.View[0].Result[0].Location;
                    var coord = [location.NavigationPosition[0].Latitude, location.NavigationPosition[0].Longitude];
                    resolve({ respTime: new Date() - tStart, coord: coord, body: res.body });
                })
                .catch(err => {
                    // err.message, err.response
                    return reject(err); //  error.name err.message

                });

        });
}

/**
 * reverse geocode a coordinate
 * @param {object} coord - coord as [lat,lng]
 * @returns {object} { location: string, address: string, body:object }
 */
async function reverseGeocode(coord) {
    let tStart = new Date();

    // eslint-disable-next-line   no-undef
    return new Promise(
        (resolve, reject) => {
            const settings = {
                app_id: APP_ID,
                app_code: APP_CODE,
                mode: "retrieveAddresses",
                prox: coord[0] + "," + coord[1]
            };

            request.get(protocol + "reverse.geocoder" + cit + ".api.here.com/6.2/reversegeocode.json")
                .query(settings)
                .then(res => {
                    // res.body, res.headers, res.status

                    if (!res.body.Response) {
                        let e = new Error(res.body); // e.message
                        e.name = "Reverse Geocode Query error:";
                        return reject(e);
                    }
                    if (res.body.Response.View.length == 0) { // no results

                        let e = new Error(coord); // e.message
                        e.name = "Reverse Geocode Query Location not found:";
                        return reject(e);
                    }
                    var location = res.body.Response.View[0].Result[0].Location;
                    resolve({ respTime: new Date() - tStart, location: location, address: location.Address, body: res.body });
                })
                .catch(err => {
                    // err.message, err.response
                    return reject(err); //  error.name err.message
                });
        });
}


/**
 * compute a route with optional waypooints
 * @param {object} source - source as [lat,lng]. Can be array of [lat,lng]
 * @param {object} dest - dest as [lat,lng]. Can be array of [lat,lng]
 * @param {object} opt - route option as described in HERE Map routing
 * @returns {object} { summary: string, route: string, body:object }
 */
async function route(source, dest, opt) {

    let tStart = new Date();

    // eslint-disable-next-line   no-undef
    return new Promise(
        (resolve, reject) => {

            const settings = {
                app_id: APP_ID,
                app_code: APP_CODE,
                mode: "fastest;car;traffic:disabled",
                representation: "linkPaging",
                routeattributes: "waypoints,summary,shape",
                maneuverattributes: "direction,action"
            };
            let params = Object.assign(settings, opt);

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

            request.post(protocol + "route" + cit + ".api.here.com/routing/7.2/calculateroute.json")
                .query(params)
                .then(res => {
                    // res.body, res.headers, res.status
                    if (!res.body.response) {
                        let e = new Error(res.body); // e.message
                        e.name = "Routing Query error:";
                        return reject(e);
                    }

                    if (res.body.response.type == "ApplicationError") {
                        let e = new Error(res.body.response.details); // e.message
                        e.name = "Routing  error:";
                        return reject(e);
                    }

                    const route = res.body.response.route[0];
                    const summary = route.summary;

                    resolve({ resptime: new Date() - tStart, summary: summary, route: route, body: res.body });

                })
                .catch(err => {
                    // err.message, err.response
                    return reject(err); //  error.name err.message

                });

        });
}


/**
 * compute an isoline
 * @param {object} opt - {start:[lat,lng], destination:[lat,lng], range:seconds or meters, mode:string}
 * @returns {object} { poly: [[lat,lng],...], body:object }
 */
async function isoline(opt) {
    let tStart = new Date();

    // eslint-disable-next-line   no-undef
    return new Promise(
        (resolve, reject) => {

            const settings = {
                app_id: APP_ID,
                app_code: APP_CODE,
                start: null,                            // for direct isoline
                destination: null,                      // for reverse isoline
                rangeType: "time",                      // time or distance
                range: null,                            // in seconds or meters
                requestId: null,                        // requestId to be transmitted in answer
                linkattributes: "sh",                   // to get the shape
                mode: "fastest;car;traffic:disabled",   //shortest;car;traffic:disabled 
            };
            let params = Object.assign(settings, opt);

            if (params.start)
                params.start = "geo!" + params.start[0] + "," + params.start[1];
            if (params.destination)
                params.destination = "geo!" + params.destination[0] + "," + params.destination[1];

            if (!params.start && !params.destination) return reject("Isoline routing : missing start or destination");
            if (!params.range) return reject("Isoline routing : missing range");


            request.post(protocol + "isoline.route" + cit + ".api.here.com/routing/7.2/calculateisoline.json")
                .query(params)
                .then(res => {
                    // res.body, res.headers, res.status
                    if (!res.body.response) {
                        let e = new Error(res.body); // e.message
                        e.name = "Isoline  error:";
                        return reject(e);
                    }

                    if (res.body.response.type == "ApplicationError") {
                        let e = new Error(res.body.response.details); // e.message
                        e.name = "Isoline  error:";
                        return reject(e);
                    }
                    // array of lat,lng, to be transformed into array of [lat,lng]
                    const shape = res.body.response.isoline[0].component[0].shape;
                    const poly = shape.map(point => point.split(","));

                    resolve({ resptime: new Date() - tStart, poly: poly, body: res.body });
                })
                .catch(err => {
                    // err.message, err.response
                    return reject(err); //  error.name err.message
                });
        });
}


/**
 * compute a matrix
 * @param {object} source - source as [lat,lng]. Can be array of [lat,lng]
 * @param {object} dest - dest as [lat,lng]. Can be array of [lat,lng]
 * @param {object} opt - additional optional parameters like  mode, summaryAttributes
 * @returns {object} { poly: [[lat,lng],...], body:object }
 */

async function matrix(source, dest, opt) {
    // eslint-disable-next-line   no-undef
    return new Promise(
        (resolve, reject) => {
            let tStart = new Date();

            var settings = {
                app_id: APP_ID,
                app_code: APP_CODE,
                mode: "fastest;car",
                summaryAttributes: "tt,di"
            };
            let params = Object.assign(settings, opt);

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

            request
                .post("http://matrix.route" + cit + ".api.here.com/routing/7.2/calculatematrix.json")
                .query(params)
                .then(res => {
                    // res.body, res.headers, res.status
                    if (!res.body.response) {
                        let e = new Error(res.body); // e.message
                        e.name = "Matrix error:";
                        return reject(e);
                    }
                    if (res.body.response.type == "ApplicationError") {
                        let e = new Error(res.body.response.details); // e.message
                        e.name = "Matrix  error:";
                        return reject(e);
                    }
                    resolve({ resptime: new Date() - tStart, entries: res.body.response.matrixEntry, body: res.body });
                })
                .catch(err => {
                    // err.message, err.response
                    return reject(err); //  error.name err.message
                });

        });
}


// start, stop of the trip, waypoints is array of coords
// retourne {reference,waypoints:[ {coord,distA,timeA,distB,timeB}]}
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
    init: init,
    geocode: geocode,
    reverseGeocode: reverseGeocode,
    matrix: matrix,
    route: route,
    isoline: isoline,
    detour: detour
};

