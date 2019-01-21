/* global H, fetch, document, navigator, mapsjs, window APP_ID_JAPAN,APP_CODE_JAPAN,APP_ID_KOREA,APP_CODE_KOREA*/

/**
 * @file manages map display on a web canvas
 * @author devbab
 */

"use strict";
const cm = require("./common.js");

let _platform = null;
let _provider = null;
let _defaultLayers = null;
let _ui = null;
let _map = null;
let _behavior = null;
let group = null;
let _layers = []; // list all layers
let _key = {}; // keys  
let _bubbleMarker = null; // bubble de mamrker
let _scheme = "normal.day.grey";
let _locateMe = null; // id when locate is active
let _htmlItem = null; //the html item on which to put the map


function coordO2A(obj) {
    return [obj.lat, obj.lng];
}

function coordA2O(arr) {
    return {
        lat: arr[0],
        lng: arr[1]
    };
}


/**
 * create a map area within the specified item
  * @alias hm:map

 * @param htmlItem {string}  - identifier of html div item on which to insert map
 * @param opt {object}  - options
 * @param [opt.zoom=10] {number}  - zoom factor
 * @param [opt.center=[48.86, 2.3]] {Coord}  - Coord of the center
 * @param [opt.scheme=normal.day.grey] {string}  - any scheme defined by HERE, plus "japan", "korea", "black", "white", "transparent". For japan/korea, one needs special credentials as APP_ID_JAPAN APP_KOREA APP_CODE_JAPAN APP_CODE_KOREA
 * @param [opt.click=null] {function()}  - callback on mouse click: callback(coord,button,key)
 * @param [opt.dbClick=null] {function()}  - callback on mouse double click: callback(coord,button,key)
 * @param [opt.clickLeft=null] {function}  - callback on mouse click left: callback(coord,button,key)
 * @param [opt.clickRight=null] {function()}  - callback on mouse click right.: callback(coord,button,key)
 * @param [opt.keyDown=null] {function}  - callback on key down : callback(key)
 * @param [opt.viewChange=null] {function}  - callback if map is panned or zoomed : callback(zoom,coordCenter)
 * @param [opt.loadTile=null] {function}  - callback when a tile is loaded : callback(z,x,y,url)
 *
 * @example
 * ```js
 * const hm = window.heremap;
 * 
 * hm.config({
 *    app_id: "YOUR APP_ID",
 *    app_code: "YOUR APP_CODE",
 * });
 *
 * hm.map("map", {
 *    zoom:5,
 *    center: [48.8,2.3],
 *    click: function(coord,button,key) {console.log("clicked on",coord,"with button",button);}
 * });
*  ```
*/
function map(htmlItem, opt) {

    _htmlItem = htmlItem;

    let settings = {
        zoom: 10,
        center: [48.86, 2.3],
        clickLeft: null,
        clickRight: null,
        keyDown: null, // keyboard event
        click: null,
        dbClick: null,
        viewChange: null, // (zoom,coord)
        loadTile: null // quand une tile est affichée
    };

    let mps = 1;

    let app_id = cm.getAppId();
    let app_code = cm.getAppCode();

    if (!app_id || !app_code) {
        // console.log("app_id/app_code not initialised");
        document.getElementById(htmlItem).innerHTML = "app_id/app_code not initialised";
        return;
    }

    _platform = new H.service.Platform({
        app_id: app_id,
        app_code: app_code,
        useCIT: cm.getCIT(),
        useHTTPS: cm.useHTTPS()
    });

    Object.assign(settings, opt);
    if (settings.scheme) _scheme = settings.scheme; // store scheme if defined

    _defaultLayers = _platform.createDefaultLayers();

    // http://heremaps.github.io/examples/explorer.html#map-tiles__base-map-styles-and-modes
    _provider = new H.map.provider.ImageTileProvider({
        label: "Base Provider",
        descr: "",
        min: 0,
        max: 20,
        crossOrigin: "anonymous",
        getURL: function (col, row, level) {
            mps++;
            if (mps > 4) mps = 1;
            let url = [cm.getProtocol(), "//", mps, ".base.maps" + cm.getCIT() + ".api.here.com/maptile/", "2.1",
                "/", "maptile", "/", "newest", "/",
                _scheme, "/", level, "/", col, "/", row, "/", "256",
                "/", "png", "?lg=", "FRE",
                "&app_code=", app_code, "&app_id=",
                app_id
            ].join("");

            if (_scheme == "japan")
                url = [cm.getProtocol(), "//", "m.lbs" + cm.getCIT() + ".api.heremaps.jp/v1/map?app_id=",
                    APP_ID_JAPAN,
                    "&app_code=",
                    APP_CODE_JAPAN,
                    "&tilematrix=EPSG:900913:",
                    level,
                    "&tilecol=",
                    col,
                    "&tilerow=",
                    row
                ].join("");

            else if (_scheme == "korea")
                url = [cm.getProtocol(), "//", "3.base.maps" + cm.getCIT() + ".api.heremaps.kr/maptile/2.1/maptile/34439348c3/normal.day/",
                    "/", level, "/", col, "/", row, "/", "256",
                    "/", "png", "?lg=", "FRE",
                    "&app_code=", APP_CODE_KOREA, "&app_id=",
                    APP_ID_KOREA
                ].join("");

            else if (_scheme == "black")
                url = cm.getHome() + "png/black.png";
            else if (_scheme == "white")
                url = cm.getHome() + "png/white.png";
            else if (_scheme == "transparent")
                url = cm.getHome() + "png/transparent.png";


            if (settings.loadTile)
                settings.loadTile(level, col, row, url);

            return url;
        }


    });

    let __layer = new H.map.layer.TileLayer(_provider);

    //console.log("normal map");
    //Step 2: initialize a HEREMap 
    _map = new H.Map(document.getElementById(htmlItem),
        __layer, {
            center: coordA2O(settings.center),
            zoom: settings.zoom
        });

    _behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(_map));

    // Create the default UI components
    _ui = H.ui.UI.createDefault(_map, _defaultLayers);

    // create default layer
    layerCreate("default");

    // if callback on zoom Change
    if (settings.viewChange) {
        _map.addEventListener("mapviewchangeend", function () {
            let bound = _map.getViewBounds();
            let lat = (bound.ka + bound.ja) / 2;
            let lng = (bound.ga + bound.ha) / 2;

            //console.log("viewChange center " + lat + " " + lng);
            settings.viewChange(_map.getZoom(), [lat, lng]);
        });
    }

    /***********************           to handle keyboard while mouse in map        ***********************/
    let kup = function () {
        _key.ctrl = false;
        _key.shift = false;
        _key.alt = false;
        _key.key = "";
    };

    let kdown = function (e) {
        _key.ctrl = ((e.key == "Control") || (e.keyIdentifier == "Control") || (e.ctrlKey == true));
        _key.shift = ((e.key == "Shift") || (e.keyIdentifier == "Shift") || (e.shiftKey == true));
        _key.alt = ((e.key == "Alt") || (e.keyIdentifier == "Alt") || (e.shiftKey == true));
        _key.key = e.key;
        if (settings.keyDown) settings.keyDown(_key);
    };

    _map.addEventListener("mouseenter", function () {
        // console.log("map mouse enter");
        document.addEventListener("keydown", kdown);
        document.addEventListener("keyup", kup);
    });

    _map.addEventListener("pointerenter", function () {
        //console.log("map pointer enter");
        document.addEventListener("keydown", kdown);
        document.addEventListener("keyup", kup);
    });
    _map.addEventListener("mouseleave", function () {
        // console.log("map mouse leave");
        document.removeEventListener("keydown", kdown);
        document.removeEventListener("keyup", kup);
    });

    /***********************           to handle double click         ***********************/
    _map.addEventListener("dbltap", function (ev) {
        let target = ev.target;
        if (target instanceof H.map.Marker) return; // don't do anything if click on marker

        let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
        let button = ev.currentPointer.button;
        if (settings.dbClick != "") {
            switch (button) {
                case 0:
                    settings.dbClick(coordO2A(coord), "left", _key);
                    break;
                case 2:
                    settings.dbClick(coordO2A(coord), "right", _key);
                    break;
            }
        }
    });

    /***********************           to handle simple click         ***********************/
    _map.addEventListener("tap", function (ev) {
        let target = ev.target;

        if (target instanceof H.map.Marker) return;

        let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
        let button = ev.currentPointer.button;

        if ((button == 0) && (settings.clickLeft))
            settings.clickLeft(coordO2A(coord), "left", _key);
        if ((button == 2) && (settings.clickRight))
            settings.clickRight(coordO2A(coord), "right", _key);
        if (settings.click) {
            switch (button) {
                case 0:
                    settings.click(coordO2A(coord), "left", _key);
                    break;
                case 2:
                    settings.click(coordO2A(coord), "right", _key);
                    break;
            }
        }
    });

    /*********  disable the default draggability of the underlying map when starting to drag a marker object *****************/
    _map.addEventListener("dragstart", function (ev) {
        let target = ev.target;
        if (target instanceof H.map.Marker) {
            _behavior.disable();
        }
    }, false);

    /************   re - enable the default draggability of the underlying map when dragging has completed ***********************/
    _map.addEventListener("dragend", function (ev) {
        let target = ev.target;
        if (target instanceof mapsjs.map.Marker) {
            _behavior.enable();
            if (typeof target.dragged !== "undefined") {
                let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
                (target.dragged)(target, coordO2A(coord));
            }
        }
    }, false);

    /***********************  Listen to the drag event and move the position of the marker as necessary *******************/
    _map.addEventListener("drag", function (ev) {
        let target = ev.target,
            pointer = ev.currentPointer;
        if (target instanceof mapsjs.map.Marker) {
            target.setPosition(_map.screenToGeo(pointer.viewportX, pointer.viewportY));
        }
    }, false);


    /****************  detect map resize and adjust accoridngly ******************************/
    window.addEventListener("resize", function () {
        _map.getViewPort().resize();

    });

    return _map;
}

/**
 * list of all available map styles normal.day, night.... 
 * @alias hm:getAvailableMapStyle
 * @return {json} list of map styles as json
 */
function getAvailableMapStyle() {
    // https://1.base.maps.api.here.com/maptile/2.1/info?xnlp=CL_JSMv3.0.17.0&app_id=nOSh21214JFMSEPQkqno&app_code=rX_l7YvALtNkqU2bx5FWEA&output=json

    const settings = cm.addCredentials({
        output: "json"
    });

    const url = cm.buildUrl("1.base.maps", "api.here.com/maptile/2.1/info");
    return cm.hereRest(url, settings)
        .then(res => {
            return res.body.response;
        });
}

/**
 * define the scheme. List of scheme can be obtained from hm.getAvailableMapStyle()
 * @alias hm:setScheme
 * @param {string} scheme scheme name
 */
function setScheme(scheme) {
    _scheme = scheme;
}

/**
 * create a layer
 * @alias hm:layerCreate
 * @param {string} name  - name of layer
 * @param {boolean} visible  - initial status
 * @example
 * ```js
 * hm.layerCreate("layer1");
 *  ```
 */
function layerCreate(name, visible) {
    group = new H.map.Group();
    group.name = name;
    _map.addObject(group);

    // push into list of layers
    _layers.push(group);

    // can be visible or hidden
    if (typeof visible != "undefined")
        group.setVisibility(visible);

    return group;
}

/**
 * delete a layer
 * @alias hm:layerDelete
 * @param {String} name name of layer
 */
function layerDelete(name) {
    let layer = layerFind(name);
    if (!layer)
        return;

    // remove group from map
    _map.removeObject(layer);
    //remove form list of layers
    _layers = _layers.filter(item => {
        return item.name !== name;
    });
}

/**
 * Empty a layer, or create it if not existing
 * @alias hm:layerEmpty
 * @param {string} layer 
 */
function layerEmpty(name) {
    let layer = layerFind(name);
    if (!layer) {
        layerCreate(name);
        return;
    }
    layer.removeAll();
}

/**
 * create a layer
 * @alias hm:layerSetVisibility
 * @param {string} name  - name of layer
 * @param {boolean} visible  - visible or not
 * @example
 * ```js
 * hm.layerVisible("layer1",true);
 *  ```
 */
function layerSetVisibility(name, visible) {
    let layer = layerFind(name);
    if (!layer)
        return;

    layer.setVisibility(visible);

}

/**
 * find layer by its name or return null 
 * @alias hm:layerFind
 * @param {string} name 
 */
function layerFind(name) {
    let l = _layers.find(layer => {
        return layer.name == name;
    });
    if (typeof l == "undefined") return null;
    return l;
}


/**
 * set center of the map
 * @alias hm:setCenter
 * @param {Array} - coord as [lat,lng]
 * * @example
 * ```js
 * hm.setCenter([48.8,2.3]);
 *  ```
 */
function setCenter(coord) {
    _map.setCenter(coordA2O(coord));
}

/**
 * return coordinate of the center of the map
 * @alias hm:getCenter
 * @returns {coord} coord of the center as \[lat,lng\]
 */
function getCenter() {
    let bound = _map.getViewBounds();
    //_HM.log("viewbound",bound);

    let lng = (bound.ga + bound.ha) / 2;
    let lat = (bound.ka + bound.ja) / 2;
    return [lat, lng];

}

/**
 * return bounding box of visible part of map
 * @alias hm:getViewBB
 * @returns {Object} bouding box of visible part of the map, as \[latm,latM,longm,lngM\]
 */
function getViewBB() {
    let bb = _map.getViewBounds();

    let bb2 = {
        latm: bb.ja,
        latM: bb.ka,
        lngm: bb.ga,
        lngM: bb.ha
    };
    return bb2;
}

/**
 * sets bouding box to be displayed
 * @alias hm:setViewBB
 * @param opt {Object| string}  either an object specifying how to set bounding box, or  a String being the name of a layer
 * @param [opt.layer] {string} bouding box aroud all objects of the layer
 * @param [opt.pois] {array} bouding box aroud all coords defined as \[coord,coord...\]
 * @example
 * ```js
 * hm.setViewBB("layer1");
 *
 * hm.setViewBB({
 *    pois: coords
 * });
 *  ```
 */
function setViewBB(opt) {

    if (typeof opt == "string")
        opt = {
            layer: opt
        };

    let settings = {
        layer: null,
        pois: null // array of [lat,lng]
    };
    Object.assign(settings, opt);

    let bbox;

    //set BB based on layer
    if (settings.layer) {
        let layer = layerFind(settings.layer);
        if (!layer) return;

        // get view bound and add a bit around, like 1/5
        let bb = layer.getBounds();
        if (!bb) // as if nothing in layer
            return;
        bb.latm = bb.ja;
        bb.latM = bb.ka;
        bb.lngm = bb.ga;
        bb.lngM = bb.ha;
        let dx = bb.lngM - bb.lngm;
        let dy = bb.latM - bb.latm;
        dx = dx / 5;
        dy = dy / 5;
        bb.latM += dy;
        bb.lngm -= dx;
        bb.latm -= dy;
        bb.lngM += dx;
        bbox = new H.geo.Rect(bb.latM, bb.lngm, bb.latm, bb.lngM);
        _map.setViewBounds(bbox, true);

    } else if (settings.pois) {
        let bb = {
            latM: 0,
            lngm: 180,
            latm: 90,
            lngM: -180,
        };
        let arr = settings.pois;
        arr.forEach((poi) => {
            if (poi[0] > bb.latM) bb.latM = poi[0];
            if (poi[1] > bb.lngM) bb.lngM = poi[1];
            if (poi[0] < bb.latm) bb.latm = poi[0];
            if (poi[1] < bb.lngm) bb.lngm = poi[1];
        });
        bbox = new H.geo.Rect(bb.latM, bb.lngm, bb.latm, bb.lngM);
        _map.setViewBounds(bbox, true);
    }
}


/**
 * return zoom value
 * @alias hm:getZoom
 * @returns {number} zoom level
 */
function getZoom() {
    return _map.getZoom();
}

/**
 * set zoom level
 * @alias hm:setZoom
 * @param {number} zoom 
 */
function setZoom(zoom) {
    _map.setZoom(zoom);
}



/**
 * create an icon, to be used for a marker
 * @async
 * @alias hm:buildIcon
 * @param opt {object} options to specify the icon
 * @param [opt.img] {string}  use a png/jpg image. Specify the url 
 * @param [opt.svg] {string}  url a svg. This can be an inline svg, a url, or a svg from heremap
 * @param [opt.opt] {object}   style object
 * @param [opt.opt.size] {number|string}   size of icon, as 24 or 24x32
 * @param [opt.opt.ratio] {number}   for svg files, ratio of size. 0.5 = half
 * @param [opt.opt.anchor] {number|string}   anchor of icon, as 24 or "24x32" or "center". By default, bottom-center
 * @param [opt.opt.tag] {string}  for svg, any tag like {tag} within the svg file will be replaced by its associated value
 * @return {H.map.Icon} the created icon
 * @example 
 * ```js
 * hm.buildIcon({
 *    img: "http://whatever.com/image.png",
 *    opt: {size:24}
 * });
 * 
 * hm.buildIcon({
 *    svg: "http://whatever.com/image.svg",
 *    opt: {
 *       ratio:0.5,
 *       anchor:24x32
 *    }
 * });
 *  
 * hm.buildIcon({
 *    svg: "@svg/cluster.svg",
 *    opt: {
 *       size:24,
 *       color:"red"
 *    }
 * });
 * 
 * const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"> <ellipse stroke="null" ry="8" rx="7.618896" id="svg_1" cy="8" cx="7.837427" fill="{color}" fill-opacity="0.9"/></svg>`;
 * hm.buildIcon({
 *    svg: svg,
 *    opt: {
 *       size:24,
 *       color:"red"
 *    } 
 * });
 *  ```
 */
async function buildIcon(opt) {
    let settings = {
        img: null, //   png, jpg. if not http in the beginning, look locally
        svg: null, // svg file:  is a url or a string
        opt: null, // size, color, anchor, text...s
    };

    Object.assign(settings, opt);

    if (!settings.img && !settings.svg) {
        return null;
    }

    let icon, iconSrc;

    if (settings.img) {
        // console.log("settings.img", settings.img);

        if (settings.img[0] == "@") // to indicate local
            iconSrc = cm.getHome() + settings.img.substr(1);
        else
            iconSrc = settings.img; // local file

    } else if (settings.svg) {

        let url = null;
        iconSrc = settings.svg;
        if (settings.svg[0] == "@") // local 
            url = cm.getHome() + settings.svg.substr(1);
        else if (settings.svg.substr(0, 4) == "<svg") // url
            url = null;
        else
            url = settings.svg; // not embedded string, should be a url

        if (url) { // an url to download
            iconSrc = await fetch(url)
                .then(res => {
                    if (res.status != 200)
                        return null;
                    return res.text();
                });
        }

    }

    let iconOpt = {
        crossOrigin: true
    }; // to avoid issued with capture
    if (settings.opt && settings.opt.size) {
        let w, h;
        if (typeof settings.opt.size == "number")
            w = h = settings.opt.size;
        else
            [w, h] = settings.opt.size.split("x");

        iconOpt.size = {
            w: w,
            h: h
        };
    }

    function _getsizeSvg(iconSrc) {
        let w = null,
            h = null,
            match;
        let r = /width="(\d+)"/;
        match = iconSrc.match(r);
        if (match) w = match[1];

        r = /height="(\d+)"/;
        match = iconSrc.match(r);
        if (match) h = match[1];
        return [w, h];
    }

    if (settings.svg && settings.opt && settings.opt.ratio) {
        let w = null,
            h = null;
        [w, h] = _getsizeSvg(iconSrc);

        iconOpt.size = {
            w: Math.floor(w * settings.opt.ratio),
            h: Math.floor(h * settings.opt.ratio)
        };
    }

    if (settings.opt && settings.opt.anchor) {
        let x = null,
            y = null;
        if (typeof settings.opt.anchor == "number")
            x = y = settings.opt.anchor;
        else if (settings.opt.anchor == "center" && settings.svg) { // for svg file only center: get size of split in 2
            [x, y] = _getsizeSvg(iconSrc);
            x /= 2;
            y /= 2;
        } else
            [x, y] = settings.opt.anchor.split("x");

        if (!x || !y) {
            let e = new Error("BuildIcon: incorrect anchor"); // e.message
            throw (e);
        }
        iconOpt.anchor = {
            x: x,
            y: y
        };
    }

    // all other fields are treated as graphic enhanceent
    if (settings.opt) {
        for (let name in settings.opt) {
            if (name == "file" || name == "size" || name == "anchor") continue;
            let re = new RegExp("{" + name + "}", "g");
            iconSrc = iconSrc.replace(re, settings.opt[name]);
        }
    }

    // console.log("iconSrc", iconSrc);
    // console.log("iconOpt", iconOpt);
    icon = new H.map.Icon(iconSrc, iconOpt);

    return icon;

} //end of icon





/**
 * add a marker in a layer
 * svg files can be created with https://editor.method.ac/ 
 * @async
 * @alias hm:marker
 * @param opt {object} options to create the marker, can be a coord directly
 * @param [opt.layer] {string}   layer name
 * @param [opt.coord] {coord}   coord of the marker as \[lat,lng\]
 * @param [opt.icon] {string}   created from hm.buildIcon
 * @param [opt.svg] {string}   see hm.buildIcon
 * @param [opt.opt] {Object}   see hm.buildIcon
 * @param {function} opt.pointerenter  if enter, callback(target,coord,ev)
 * @param {function} opt.pointerClick  if click, callback(target,coord,ev)
 * @param {string} opt.data  optional data
 * @param {boolean} opt.bubble  if true, show buble on click with data
 * @param {boolean} opt.draggable  draggable marker
 * @param {function} opt.dragged  if dragged, callback(target,coord)
 * @example 
 * ```js
 * hm.marker([48.8,2.3]);
 *
 * hm.marker({
 *    coord: [48.8,2.3],
 * });
 * 
 * hm.marker({
 *   svg: "svg/marker.svg",
 *   color:"red",
 *   ratio:0.5
 * });
 * 
 * hm.marker({
 *    img: "http://whatever.com/image.png",
 *    coord: [48.8,2.3]
 * });
 * 
 * hm.marker({
 *    coord: [48.8,2.3],
 *    data:"Hello world",
 *    bubble: true
 * });
 * 
 * hm.marker({
 *    coord: [48.8,2.3],
 *    draggable:true,
 *    dragged: function(target,coord) {console.log("dragged to",coord);}
 * });
 *  ```
 */
async function marker(opt) {
    let settings = {
        layer: "default", //  layer in which to add marker
        coord: null, //  coord of the marker
        img: null, //  image can be url, png, jpg..
        svg: null, // svg file
        icon: null, // icon previously created
        opt: {}, // opt for icon
        pointerEnter: null, //  callback(target,coord,ev)
        pointerClick: null, //  callback(target,coord,ev)
        data: null, //  user data
        bubble: false, //  show a bubble with user data
        draggable: false, //  icon is draggalbe
        dragged: null //  callback(target,coord)
    };

    // can pass directly only the coord
    if (Array.isArray(opt))
        opt.coord = opt;

    Object.assign(settings, opt);

    let layer = layerFind(settings.layer);
    if (!layer) {
        let e = new Error("layer not found:" + settings.layer); // e.message
        throw (e);
    }

    settings.coord = {
        lat: settings.coord[0],
        lng: settings.coord[1]
    };

    // these parameters can be in opt.opt or directly in opt
    if (settings.color) settings.opt.color = settings.color;
    if (settings.size) settings.opt.size = settings.size;
    if (settings.ratio) settings.opt.ratio = settings.ratio;
    if (settings.anchor) settings.opt.anchor = settings.anchor;

    let markerOpt = null;
    if (settings.img || settings.svg) {
        let icon = await buildIcon(settings);
        markerOpt = {
            icon: icon
        };
    } else if (settings.icon) {
        markerOpt = {
            icon: settings.icon
        };
    }

    //console.log("marker settings.coord", settings.coord);
    let marker = new H.map.Marker(settings.coord, markerOpt);

    marker.draggable = settings.draggable;

    if (settings.dragged) marker.dragged = settings.dragged;

    if (settings.data) {
        let data = settings.data;
        if (settings.data == "__OPT__") {
            data = settings;
            delete data.coord;
            for (let p in data)
                if (!data[p]) delete data[p];
            data = JSON.stringify(data, null, 2).replace(/\n/g, "<br/>");
        }
        marker.setData(data);
    }

    // get click from mouse
    if (settings.pointerEnter) {
        marker.addEventListener("pointerenter", function (ev) {

            let target = ev.target;
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerEnter(target, coordO2A(coord), ev);

        });
    }

    /************  callback when click on marker *****************************/
    if (settings.pointerClick) {
        marker.addEventListener("tap", function (ev) {
            let target = ev.target;
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerClick(target, coordO2A(coord), ev);

        });
    }

    /************  show a bubble when clicking on marker *****************************/
    if (settings.bubble) {
        marker.addEventListener("tap", function (ev) {

            let target = ev.target;
            let data = target.getData();
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);

            bubbleUnique(coordO2A(coord), data);
        });
    }

    layer.addObject(marker);
    return marker;

} //end of marker

/**
 * Display a unique bubble. Associated CSS style is .H_ib_body
 * @alias hm:bubbleUnique
 * @param {Array} coord of the bubble
 * @param {String} txt html text to display
 */
function bubbleUnique(coord, txt) {

    if (!_bubbleMarker) {
        _bubbleMarker = new H.ui.InfoBubble(
            coordA2O(coord), {
                content: txt
            });

        _ui.addBubble(_bubbleMarker);
        _bubbleMarker.addClass("bubbleUnique");

    } else {
        _bubbleMarker.setPosition(coordA2O(coord));
        _bubbleMarker.setContent(txt);
        _bubbleMarker.open();
    }

}


/**
 * hide a unique bubble
 * @alias hm:bubbleUniqueHide
 */
function bubbleUniqueHide() {
    if (!_bubbleMarker)
        return;
    _bubbleMarker.close();
}




/**
 * Draw a polyline. 
 * @alias hm:polyline
 * @param opt {object}   options to draw polyline
 * @param [opt.layer] {String} optional layer to use 
 * @param [opt.coords] {array} array of coords, as \[\[48.8,2.3\],\[48.85,2.4\],... \]
 * @param [opt.style] {object} optional graphic style
 * @param [opt.lineWidth=4] {number} line width
 * @param [opt.style.strokeColor=rgba(0, 128, 255, 0.7)] {string} line color
 * @param [opt.arrows] {object} optional arrow
 * @param [opt.data] {String} optional user data
 * @param [opt.pointerClick] {function} optional callback if click on line. format callback(target,coord,event)
 * @param [opt.pointerenter] {function} optional callback if mouse enters on line. format callback(target,coord,event)
 * @param [opt.pointerLeave] {function} optional callback if mouse leaves the line. format callback(target,coord,event)
 * @param [opt.z] {number} optional z level
 * ```js
 * hm.polyline({
 *    coords: [[48.8,2.3],[48.85,2.4],[48.9,2.6]],
 *    layer:"layer1"
 * });
 * 
 * hm.polyline({
 *    coords: coords,
 *    style: {
 *        lineWidth: 4,
 *        strokeColor: "red"
 *    },
 * });
 * 
 * hm.polyline({
 *    coords: coords,
 *    data:"Hello World",
 * });
 *  ```
 */
function polyline(opt) {
    let settings = {
        layer: "default",
        coords: null, // coords is list of array of [lat,lng] or array of object with {lat:,lng:}
        style: {
            lineWidth: 4,
            strokeColor: "rgba(0, 128, 255, 0.7)"
        },
        arrows: null,
        data: null, // optional user data 
        z: null,
        pointerClick: null, // click
        pointerEnter: null, // call back
        pointerLeave: null // call back
    };

    if (Array.isArray(opt)) // directement les coord
        opt = {
            coords: opt
        };

    Object.assign(settings, opt);

    let layer = layerFind(settings.layer);
    if (!layer) {
        let e = new Error("layer not found:" + settings.layer); // e.message
        throw (e);
    }

    if (!settings.coords) {
        let e = new Error("Polyline: coords not found:"); // e.message
        throw (e);
    }

    let strip = new H.geo.Strip();

    settings.coords.forEach(function (point) {
        strip.pushLatLngAlt(point[0], point[1]);
    });

    let polyline = new H.map.Polyline(strip, {
        style: settings.style,
        data: settings.data,
        arrows: settings.arrows
    });

    // Z index
    if (settings.z) polyline.setZIndex(settings.z);
    // user data
    if (settings.data) polyline.setData(settings.data);

    if (settings.pointerEnter)
        polyline.addEventListener("pointerenter", function (ev) {
            let target = ev.target;
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerEnter(target, coordO2A(coord), ev);
        });
    if (settings.pointerLeave)
        polyline.addEventListener("pointerleave", function (ev) {
            let target = ev.target;
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerLeave(target, coordO2A(coord), ev);
        });
    if (settings.pointerClick)
        polyline.addEventListener("tap", function (ev) {
            let target = ev.target;
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerClick(target, coordO2A(coord), ev);
        });

    layer.addObject(polyline);

    return polyline;
}


/**
 * Draw a polygon
 * @alias hm:polygon
 * @param {Object} opt  options to draw a polygon. Same options as hm.polyline
 */
function polygon(opt) {
    let settings = {
        layer: "default",
        coords: "", // coords is array of [lat,lng] or array of {lat:,lng:}
        style: {
            lineWidth: 4,
            strokeColor: "rgba(0, 128, 255, 0.7)",
            fillColor: "rgba(0, 128, 255, 0.7)"
        },
        styleHover: null, // style si mouse over
        arrows: null,
        data: null, // additional data to carry
        z: null,
        pointerClick: null, // click
        pointerEnter: null, // call back
        pointerLeave: null // call back
    };
    if (Array.isArray(opt)) // directement les coord
        opt = {
            coords: opt
        };
    Object.assign(settings, opt);

    let layer = layerFind(settings.layer);
    if (!layer) {
        let e = new Error("layer not found:" + settings.layer); // e.message
        throw (e);
    }

    if (!settings.coords) {
        let e = new Error("Polyline: coords not found:"); // e.message
        throw (e);
    }

    let strip = new H.geo.Strip();
    settings.coords.forEach(function (point) {
        strip.pushLatLngAlt(point[0], point[1]);
    });

    let polygon = new H.map.Polygon(strip, {
        style: settings.style,
        data: settings.data,
        arrows: settings.arrows
    });

    if (settings.data) polygon.setData(settings.data);
    // Z index
    if (settings.z) polyline.setZIndex(settings.z);

    // si un style de hover
    if (settings.styleHover) {
        polygon.addEventListener("pointerenter", function (ev) {
            let target = ev.target;
            target.setStyle(settings.styleHover);
        });
        polygon.addEventListener("pointerleave", function (ev) {
            let target = ev.target;
            target.setStyle(settings.style);
        });
    }

    if (settings.pointerEnter)
        polygon.addEventListener("pointerenter", function (ev) {
            let target = ev.target;
            let data = target.getData();
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerEnter(target, coordO2A(coord), ev, data);
        });
    if (settings.pointerLeave)
        polygon.addEventListener("pointerleave", function (ev) {
            let target = ev.target;
            let data = target.getData();
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerLeave(target, coordO2A(coord), ev, data);
        });
    if (settings.pointerClick)
        polygon.addEventListener("tap", function (ev) {
            let target = ev.target;
            let data = target.getData();
            let coord = _map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            settings.pointerClick(target, coordO2A(coord), ev, data);
        });

    layer.addObject(polygon);

    return polygon;
} // end of polygon

/**
 * draw a circle
 * @alias hm:circle
 * @param opt {*}   option for circle
 * @param [opt.layer] {String} optional layer to use 
 * @param [opt.coord] {array} center of the circle, as \[48.8,2.3\]
 * @param [opt.radius] {number} radius in meter
 * @param [opt.style] {object} optional graphic style
 * @param [opt.style.strokeColor] {string} color of perimeter
 * @param [opt.style.lineWidth] {number} line width
 * @param [opt.style.fillColor] {string} fill color
 */
function circle(opt) {
    let settings = {
        layer: "default",
        coord: null,
        radius: 100, // meters
        style: {
            strokeColor: "rgba(55, 85, 170, 0.2)", // Color of the perimeter
            lineWidth: 2,
            fillColor: "rgba(0, 128, 0, 0.1)" // Color of the circle
        }

    };
    Object.assign(settings, opt);

    let layer = layerFind(settings.layer);
    if (!layer) {
        let e = new Error("layer not found:" + settings.layer); // e.message
        throw (e);
    }
    let circle = new H.map.Circle(
        // The central point of the circle
        coordA2O(settings.coord),
        // The radius of the circle in meters
        settings.radius, {
            style: settings.style
        }
    );

    layer.addObject(circle);
    return circle;
}




/**
 * watch position on HTML5 position. This requires HTTPS. Creates layer "_gps"
 * @async
 * @alias hm:locateMe
 * @param callback {function}  callback when coord changes. Format: callback(coord,accuracy) 
 * @param opt {Object} optional graphic options
 * @param [opt.position] {object}  graphic options for center. See buildIcon
 * @param [opt.position.svg] {string}  svg file
 * @param [opt.position.color] {string}  color for  {color} tag
 * @param [opt.position.size] {number}  size of icon
 * @param [opt.position.anchor] {number}  anchor of icon
 * @param [opt.accuracy] {object}  graphic options for accuracy representation
 * @param [opt.accuracy.strokeColor] {String}  color of circle line representing accuracy area
 * @param [opt.accuracy.lineWidth] {number}  width of line of circle
 * @param [opt.accuracy.fillColor] {String}  fill color of circle representing accuracy area
 */
async function locateMe(callback, opt) {

    // if no callback, remove the watch
    if (navigator.geolocation) {
        if (!callback && _locateMe) {
            navigator.geolocation.clearWatch(_locateMe);
            _locateMe = null;
            layerDelete("_gps");
            return;
        }

        let settings = {
            position: {
                svg: "@svg/target.svg",
                color: "black",
                anchor: "center"
            },
            accuracy: {
                strokeColor: "rgba(0, 128, 0, 0.8)", // Color of the perimeter
                lineWidth: 2,
                fillColor: "rgba(0, 128, 0, 0.4)" // Color of the circle
            }
        };
        Object.assign(settings, opt);

        let iconCrossHair = await buildIcon({
            svg: settings.position.svg,
            img: settings.position.img,
            opt: settings.position
        });


        //navigator.geolocation.getCurrentPosition(function pos(position) {
        _locateMe = navigator.geolocation.watchPosition((position) => {
            let gps = [position.coords.latitude, position.coords.longitude];

            layerEmpty("_gps");

            /* circle showing the accuracy radius*/
            circle({
                layer: "_gps",
                coord: gps,
                radius: position.coords.accuracy,
                style: settings.accuracy
            });

            marker({
                layer: "_gps",
                coord: gps,
                icon: iconCrossHair
            });

            callback(gps, position.coords.accuracy);
        }, (error) => {
            let msg = "";
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg += "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg += "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    msg += "timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    msg += "An unknown error occurred.";
                    break;
            }
            let e = new Error("HTML5 location error:" + msg); // e.message
            throw (e);
        }, {
            enableHighAccuracy: true
        });
    } else {
        let e = new Error("no HTML5 geolocation capabilities"); // e.message
        throw (e);
    }
}


/**
 * perform a screenshot of the map and returns a promise with the data
 * @async
 * @alias hm:screenshot
 * @param opt {object} options for screenshot
 * @param [opt.name] {string} filename for download
 * @param [opt.ui] {boolean} true to ui (scale, etc..) in screenshot
 * @param opt {object} options for screenshot
 * 
 * @returns {data} binary data of image
 * 
 */
function screenshot(opt) {
    let para = null;
    if (opt && opt.ui)
        para = [_ui];
    return new Promise(
        (resolve, reject) => {
            _map.capture(function (canvas) {
                if (!canvas)
                    return reject("Map screenshot not supported");

                let dataURL = canvas.toDataURL();
                if (opt && opt.name) {
                    let a = document.createElement("a");
                    a.href = dataURL;
                    a.target = "_blank";
                    a.download = opt.name;
                    document.body.appendChild(a);
                    a.click();
                }
                resolve(dataURL);
            }, para);
        });
}


function getMapHtmlItem() {
    return _htmlItem;
}

function getMap() {
    return _map;
}

function getBehavior() {
    return _behavior;
}


function getUI() {
    return _ui;
}

module.exports = {
    coordO2A: coordO2A,
    coordA2O: coordA2O,
    getMap: getMap,
    getUI: getUI,
    getBehavior: getBehavior,
    getMapHtmlItem: getMapHtmlItem,
    map: map,
    getAvailableMapStyle: getAvailableMapStyle,
    setScheme: setScheme,
    layerCreate: layerCreate,
    layerFind: layerFind,
    layerDelete: layerDelete,
    layerSetVisibility: layerSetVisibility,
    layerEmpty: layerEmpty,
    buildIcon: buildIcon,
    bubbleUnique: bubbleUnique,
    bubbleUniqueHide: bubbleUniqueHide,
    marker: marker,
    circle: circle,
    polyline: polyline,
    polygon: polygon,
    getCenter: getCenter,
    setCenter: setCenter,
    getZoom: getZoom,
    setZoom: setZoom,
    getViewBB: getViewBB,
    setViewBB: setViewBB,
    locateMe: locateMe,
    screenshot: screenshot

};