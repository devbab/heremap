/* global H, fetch */
"use strict";
const m = require("map");

let map = null;

let clusterLayer = null;


/**
 * creates a cluster of points
 * @async
 * @alias hm:cluster
 * @param coords {Array}  array of \[lat,lng,payload\]
 * @param opt {object} options for cluster
 * @param [opt.minZoom] {number} min zoom for cluster to be visible
 * @param [opt.maxZoom] {number} max zoom for cluster to be visible
 * @param [opt.noise] {array} graphic to represent stand-alone point. format: [url,size]
 * @param [opt.clusterIcon] {string} url of svg file representing a cluster
 * @param [opt.style] {object} define for each minium aggregation level the color and size of the icon. See example
 * @param {function} cb callback to be called if click on item. Format cb(event, coord, payload, weigth). 
 * `coord` is coord of icon
 * `payload` is payload associated to point. 
 * `weight` is number of points aggregated, when clicking on a cluster icon, 1 if single point
 * 
 * @return {H.map.layer.ObjectLayer}  layer created
 * 
  * @example
  * ```js
  * let pois = [[48.8,2.3,"Hello world"],[48.5,2.4,"How are you"],[45.2,2.93,"Very well"]];
  * 
  * hm.cluster(pois);
  * 
  * // with more graphic options and callback defined
 *  hm.cluster(pois, {
 *           noise: ["mcdo.png", 24],
 *           clusterIcon: '../svg/cluster2.svg',    //  icon for cluster
 *           style: {
 *               200: { color: "#B50015", size: 64 }  // for 200 or more points aggrregated, drag red big icon
 *               75: { color: "#FF6900", size: 58 },  // for 75 or more points aggregated. orange middle size icon
 *               2: { color: "#7BD30A", size: 46 },   // for 2 or more points aggregated. green small icon
 *           }
 *       },
 *           (event, coordinate, data, weight) => {
 *               if (data)
 *                   console.log("click on point ", data);
 *               else
 *                   console.log("click on cluster with weight", weight);
 *           });
* ```
 */
async function cluster(coords, opt, cb = null) {

    let dataPoints = [];
    map = m.getMap();

    let settings = {
        minZoom: 1,     // min zoom
        maxZoom: 24,    // max zoom
        noise: ["http:svg/bluedot.svg", 16],  //  icon+size for noise, can be svg or image
        clusterIcon: "http:svg/cluster.svg",    //  icon for cluster
        style: {
            75: { color: "#FF6900", size: 36 },
            3: { color: "#7BD30A", size: 32 },
            200: { color: "#B50015", size: 48 }
        }
    };
    if (opt)
        Object.assign(settings, opt);


    coords.forEach(coord => {
        // use op_weight of 1 for each coord
        // provides all coord as data
        let dp = new H.clustering.DataPoint(coord[0], coord[1], 1, coord);
        dataPoints.push(dp);

    });


    // noise icon : if SVG, needs to fetch it
    let noiseIcon = settings.noise[0];
    let noiseSize = settings.noise[1];

    if (noiseIcon.substr(-3) == "svg") {
        noiseIcon = await fetch(noiseIcon)
            .then(res => {
                if (res.status != 200)
                    return null;
                return res.text();
            });

    }

    if (!noiseIcon) return; // if no result, let's quit

    // to speed up, create only once the icon for noise
    const iconNoise = new H.map.Icon(noiseIcon, { size: { w: noiseSize, h: noiseSize } });

    // let's now fetch cluster icon
    let svgCluster = await fetch(settings.clusterIcon)
        .then(res => {
            if (res.status != 200)
                return null;
            return res.text();
        });

    if (!svgCluster)
        return;


    // to speed display display, we will cache the various cluster icons
    // from the base svg, we will create different icons with different size/color/text
    let cacheIcon = {}; // cache of icons

    // order style by size descending
    let styleSize = Object.keys(settings.style).sort(function (a, b) { return b - a; });

    // this function  cretaes the icon for a cluster
    function getClusterPresentation(cluster) {

        // building data object which will be returned when clicking on the icon
        var data = {};
        data.isCluster = () => { return true; };  // so we know it is a cluster
        let weight = cluster.getWeight();
        data.getWeight = () => { return weight; }; // number of individual item clustered together

        // let's find the relevant color and size
        let entry = styleSize.find(elt => (weight >= elt));
        let color = settings.style[entry].color;
        let size = settings.style[entry].size;

        // let's create and cache the needed icons
        let key = color + "-" + weight + "-" + size;
        if (typeof cacheIcon[key] == "undefined") {
            let svg = svgCluster.replace("{text}", weight).replace(/{color}/g, color);
            cacheIcon[key] = new H.map.Icon(svg, { size: { w: size, h: size } });
        }

        // create a marker for the Cluster
        var clusterMarker = new H.map.Marker(cluster.getPosition(), {
            // Use min zoom from a noise point
            // to show it correctly at certain zoom levels:
            min: cluster.getMinZoom(),
            max: cluster.getMaxZoom(),
            icon: cacheIcon[key],

        });

        // Link data from the from the cluster to the marker,
        // to make it accessible on callback
        clusterMarker.setData(data);

        return clusterMarker;
    }

    // function to represent a single item
    function getNoisePresentation(noisePoint) {

        // data to be sent on callback
        const data = {
            getData: () => { return noisePoint.getData(); },
            isCluster: () => { return false; },
            getWeight: () => { return 1; }
        };

        // Create a marker for the noisePoint
        var noiseMarker = new H.map.Marker(noisePoint.getPosition(), {
            // Use min zoom from a noise point
            // to show it correctly at certain zoom levels:
            min: noisePoint.getMinZoom(),
            icon: iconNoise
        });


        // Link a data from the point to the marker
        // to make it accessible on callback
        noiseMarker.setData(data);

        return noiseMarker;
    }


    // create cluster provider
    let clusteredDataProvider = new H.clustering.Provider(dataPoints, {
        clusteringOptions: {
            // Maximum radius of the neighborhood
            eps: 64,
            // minimum weight of points required to form a cluster
            minWeight: styleSize[styleSize.length - 1] // minimum clustering is defined by minsize in Style
        },
        min: settings.minZoom, // min zoom
        max: settings.maxZoom, // max zoom
        theme: { getClusterPresentation: getClusterPresentation, getNoisePresentation: getNoisePresentation }
    });

    // Create a layer that includes the data provider and its data points:
    let layer = new H.map.layer.ObjectLayer(clusteredDataProvider);
    // Add the layer to the map:
    map.addLayer(layer);

    // if a callback is defined, add event listener
    if (cb) {
        clusteredDataProvider.addEventListener("tap", function (ev) {
            // Log data bound to the marker that has been tapped:
            let data = ev.target.getData();
            let coord = map.screenToGeo(ev.currentPointer.viewportX, ev.currentPointer.viewportY);
            let isCluster = data.isCluster();

            if (isCluster) {
                let weigth = data.getWeight();
                cb(ev, m.coordO2A(coord), null, weigth);
            }

            else {
                let userData = data.getData(); // lat,lng, payload
                cb(ev, m.coordO2A(coord), userData[2], 1);
            }
        });
    }

    return layer;
}

function hide() {
    clusterLayer.setMax(0);
    clusterLayer.setMin(0);
}

function show() {
    clusterLayer.setMax(24);
    clusterLayer.setMin(0);

}


module.exports = {
    cluster: cluster,
    clusterShow: show,
    clusterHide: hide
};

