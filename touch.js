/* global document,H */
"use strict";
const hm = require("./map.js");
const simplify = require("simplify-js");


let _touchOffset = null;
let _touchCoords = null;
let _touchPolyline = null;
let _touchLayer = null;
let _touchCallback = null;
let _map = null;
let _behavior = null;

let _behaviorEnable = true;
function behaviorEnable(onoff) {
    if (_behaviorEnable && !onoff) {
        _behavior.disable();
        //console.log("behavior disabled");
        _behaviorEnable = false;
    }
    if (!_behaviorEnable && onoff) {
        _behavior.enable();
        //console.log("behavior enabled");
        _behaviorEnable = true;
    }
}
/**
 * activate touch, allowing hand drawing, with embedded simplification of the line
 * @alias hm:touch
 * @param onoff {boolean}  activate or deactivate
 * @param options {object} options  to control the touch behaviour
 * @param [options.callback] {function} calling callback(coords) when touch ends
 * @param [options.layer] {string} layer where to put the drawing
 * @param [options.style] {object} drawing style for the line
 * @param [options.arrow] {object} arrow style for the line
 * @param [options.tolerance=4] {number} tolerance for simplification
 * @param [options.keep=false] {boolean} keep graphic or not when calling callback
 */
function touch(onoff, options) {

    _map = hm.getMap();
    _behavior = hm.getBehavior();
    let elmt = document.getElementById(hm.getMapHtmlItem());

    _touchOffset = { left: elmt.offsetLeft, top: elmt.offsetTop }; // offset of window to browser


    const settings = {
        callback: null,
        layer: "_touch",
        keep: false,
        style: { lineWidth: 5, strokeColor: "rgba(255, 0, 0, 0.7)" },
        arrows: { fillColor: "white", frequency: 5, width: 1, length: 2 },
        tolerance: 4, // level of simplification
    };

    Object.assign(settings, options);

    _touchLayer = hm.layerFind(settings.layer);
    if (!_touchLayer) {
        hm.layerEmpty(settings.layer);
        _touchLayer = hm.layerFind(settings.layer);
    }

    // callback des event Listener
    // defini seulement sur onoff, pour ne pas creer une autre fois la fonction
    if (onoff)
        _touchCallback = function (e) {

            let touchobj = e.changedTouches[0]; // reference first touch point (ie: first finger)

            // if ((e.touches.length >= 2 && e.targetTouches.length >= 2)) {
            if ((e.touches.length >= 2)) {
                //    console.log("touch.length", e.touches.length);
                behaviorEnable(true);
                return;
            }

            if (e.type == "touchmove")
                behaviorEnable(false);

            // e.preventDefault();
            //console.log("e.type", e.type);
            let simplified;

            switch (e.type) {
                case "touchstart":
                    _touchCoords = []; // coords
                    break;

                case "touchmove":
                    //  e.preventDefault();

                    _touchCoords.push({
                        x: touchobj.clientX - _touchOffset.left,
                        y: touchobj.clientY - _touchOffset.top
                    });

                    if (_touchCoords.length < 2)
                        return;

                    var lineString = new H.geo.LineString;

                    for (var i = 0; i < _touchCoords.length; i++) {
                        var coord = _map.screenToGeo(_touchCoords[i].x, _touchCoords[i].y);
                        lineString.pushLatLngAlt(coord.lat, coord.lng, 0);
                    }

                    // create lpolyline if not exists
                    if (!_touchPolyline) {
                        _touchPolyline = new H.map.Polyline(lineString, {
                            style: settings.style,
                            arrows: settings.arrows
                        });
                        _touchLayer.addObject(_touchPolyline);
                    } else  // modif geometry
                        _touchPolyline.setGeometry(lineString);
                    break;

                case "touchend": // c'est la fin, on simplifie et appelle le callback
                    if (_touchCoords.length < 2) // not enough points
                        return;

                    simplified = _touchCoords; //as {x,y}
                    if (settings.callback) {

                        // simplify the result
                        if (settings.tolerance > 0) {
                            let coordsxy = _touchCoords.map(coord => { return { x: coord[1], y: coord[0] }; });
                            simplified = simplify(coordsxy, settings.tolerance, false);
                        }

                        if (simplified.length < 1) // not enough points
                            return;

                        // convert back to [lat,lng]
                        let coords = simplified.map(coord => {
                            let latlng = _map.screenToGeo(coord.x, coord.y);
                            return [latlng.lat, latlng.lng];
                        });

                        //up to callback to redraw
                        if (_touchPolyline && !settings.keep)
                            _touchLayer.removeObject(_touchPolyline);
                        _touchPolyline = null;

                        behaviorEnable(true);
                        // run callback
                        settings.callback(coords);
                    }
                    break;
            }

        }; // of _touch



    if (onoff) {
        elmt.addEventListener("touchstart", _touchCallback);
        elmt.addEventListener("touchmove", _touchCallback);
        elmt.addEventListener("touchend", _touchCallback);
        //        behaviorEnable(false);

    } else {
        elmt.removeEventListener("touchstart", _touchCallback);
        elmt.removeEventListener("touchmove", _touchCallback);
        elmt.removeEventListener("touchend", _touchCallback);

        if (_touchPolyline)
            _touchLayer.removeObject(_touchPolyline);

        _touchLayer = null;
        _touchPolyline = null;
        _touchCoords = null;
        behaviorEnable(true);
    }


} // of touch


module.exports = {
    touch: touch

};