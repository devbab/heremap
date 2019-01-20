const simplifyJs = require("simplify-js");

/**
 * Convert array of [lat,lng] to array of {x,y}
 * @alias hm:coords2XY
 * @param {array} coords array of [lat,lng]
 * @return {array}array of {x,y}
 */
function coords2XY(coords) {
    return coords.map(coord => { return { x: coord[1], y: coord[0] }; });
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
    coords2XY: coords2XY,
    xy2Coords: xy2Coords,
    simplify: simplify
};