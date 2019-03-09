const simplifyJs = require("simplify-js");

/**
 * Convert array of [lat,lng] to array of {x,y}
 * @alias hm:coords2XY
 * @param {array} coords array of [lat,lng]
 * @return {array}array of {x,y}
 */
function coords2XY(coords) {
    return coords.map(coord => {
        return {
            x: coord[1],
            y: coord[0]
        };
    });
}
/**
 * Convert array of {x,y} to array of [lat,lng]
 * @alias hm:xy2Coords
 * @param {array} coords array of {x,y} 
 * @return {array}array of [lat,lng]
 */
function xy2Coords(xys) {
    return xys.map(xy => [xy.y, xy.x]);
}



/**
 * Convert an object {lat,lng} to [lat,lng]
 * @alias hm:coordO2A
 * @param {object} obj {lat,lng}
 * @return {array} [lat,lng]
 */
function coordO2A(obj) {
    return [obj.lat, obj.lng];
}

/**
 * Convert an array [lat,lng] to {lat,lng}
 * @alias hm:coordA2O
 * @param {object} arr [lat,lng]
 * @return {array} {lat,lng}
 */
function coordA2O(arr) {
    return {
        lat: arr[0],
        lng: arr[1]
    };
}


/**
 * Convert [lat,lng] to {lat,lng}
 * @alias hm:coord2Point
 * @param {array} [lat,lng]
 * @return {array}{lat,lng}
 */
function coord2Point(coord) {
    return {
        lat: coord[0],
        lng: coord[1]
    };
}
/**
 * Convert {lat,lng} to [lat,lng]
 * @alias hm:point2Coord
 * @param {array} {lat,lng} 
 * @return {array}[lat,lng]
 */
function point2Coord(point) {
    return [point.lat, point.lng];
}




/**
 * Simplify a polyline by using the Ramer-Douglas-Peucker algorithm
 * @alias hm:simplify
 * @param {array} coords array of [lat,lng]
 * @param {number} tolerance 
 * @return {array} simplified polyline
 */
function simplify(coords, tolerance, highacc = false) {

    // convert to xy
    let xy = coords2XY(coords);
    let simplified = simplifyJs(xy, tolerance, highacc);

    if (simplified.length < 1) // not enough points
        return coords;

    // convert back to [lat,lng]
    return xy2Coords(simplified);
}



module.exports = {
    coordO2A: coordO2A,
    coordA2O: coordA2O,
    coords2XY: coords2XY,
    xy2Coords: xy2Coords,
    coord2Point: coord2Point,
    point2Coord: point2Coord,
    simplify: simplify
};