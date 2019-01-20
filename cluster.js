/* global H, document, Image */
"use strict";
const cm = require("common");
const m = require("map");

// map on which to add the cluster layer
let map = null;

//the cluster layer
let clusterLayer = null;
let _visible = false;

let iconNoise = null;
let clusterStyle = []; // array of {weight,pos imagedata}

let clusteredDataProvider = null;


/**
 * creates a cluster of points
 * @alias hm:cluster
 * @param coords {Array}  array of \[lat,lng,payload\]
 * @param opt {object} options for cluster
 * @param [opt.minZoom] {number} min zoom for cluster to be visible
 * @param [opt.maxZoom] {number} max zoom for cluster to be visible
 * @param [opt.noise] {object} graphic to represent stand-alone point. {icon,size}
 * @param [opt.noise.icon] {string} png/jpg/scg file. @ as first character indicates a file from this package. Anchor will be bottom-center
 * @param [opt.noise.size] {number} optional size of icon
 * @param [opt.cluster] {object} { weight:{icon,size}, weight:{icon,size},... }
 * @param [opt.cluster.icon] {string} graphic for group of pois. @ as first character indicates a file from this package. Anchor will be middle of icon
 * @param [opt.cluster.size] {number} size of icon
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
 *   let opt = {
 *    noise: {
 *          icon: "mcdo.png",
 *          size: 12
 *      },
 *    cluster: {
 *       200: {
 *           icon: "@svg/cluster_red.svg",
 *           color: "#B50015",
 *           size: 64
 *       },
 *       75: {
 *           icon: "@svg/cluster_orange.svg",
 *           color: "#FF6900",
 *           size: 52
 *       },
 *       2: {
 *           icon: "@svg/cluster_green.svg",
 *           color: "#7BD30A",
 *           size: 40
 *        }
 *    }
 *   };
 *  hm.cluster(pois, opt,
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
    let _home = cm.getHome();

    let settings = {
        eps: 64,
        minZoom: 1, // min zoom
        maxZoom: 24, // max zoom
        noise: {
            icon: _home + "svg/bluedot.svg",
            size: 16
        },
        cluster: {
            200: {
                icon: _home + "svg/cluster_red.svg",
                color: "#B50015",
                size: 64
            },
            75: {
                icon: _home + "svg/cluster_orange.svg",
                color: "#FF6900",
                size: 48
            },
            2: {
                icon: _home + "svg/cluster_green.svg",
                color: "#7BD30A",
                size: 40

            }
        }
    };
    if (opt)
        Object.assign(settings, opt);

    let useTheme = true; // do we use our own theme ?
    if (!opt || (opt && !opt.noise && !opt.cluster))
        useTheme = false;

    coords.forEach(coord => {
        // use op_weight of 1 for each coord
        // provides all coord as data
        let dp = new H.clustering.DataPoint(coord[0], coord[1], 1, coord);
        dataPoints.push(dp);

    });

    let minWeight = 2; // minimum weight by default

    if (useTheme) {

        // creating icon for noise (individual point)
        let icon = settings.noise.icon;
        if (icon[0] == "@") // to indicate local
            icon = cm.getHome() + icon.substr(1);

        let iconOpt = null;
        if (settings.noise.size)
            iconOpt = {
                size: {
                    w: settings.noise.size,
                    h: settings.noise.size
                }
            };
        iconNoise = new H.map.Icon(icon, iconOpt);

        // get list of weight
        let weightOrder = Object.keys(settings.cluster).sort(function (a, b) {
            return b - a;
        });
        // minweight is the smallest weight
        minWeight = weightOrder[weightOrder.length - 1];

        let promises = [];
        clusterStyle = weightOrder.map((weight) => {
            let size = settings.cluster[weight].size;
            let icon = settings.cluster[weight].icon;
            if (icon[0] == "@") // to indicate local
                icon = cm.getHome() + icon.substr(1);

            let p = loadIconFile(icon, size, size);
            promises.push(p);
            let entry = {
                weight: parseInt(weight),
                icon: icon
            };
            return entry;
        });

        // wait for all promises to be resolved
        const result = await Promise.all(promises);
        // associated to each entry of clusterstyle
        result.forEach((imageData, i) => {
            clusterStyle[i].imageData = imageData;
        });

    }


    let optProvider = {
        clusteringOptions: {
            // Maximum radius of the neighborhood
            eps: settings.eps,
            // minimum weight of points required to form a cluster
            minWeight: minWeight
        },
        min: settings.minZoom, // min zoom
        max: settings.maxZoom // max zoom
    };

    // if we use our own theme
    if (useTheme)
        optProvider.theme = {
            getClusterPresentation: getClusterPresentation,
            getNoisePresentation: getNoisePresentation
        };

    // create cluster provider
    clusteredDataProvider = new H.clustering.Provider(dataPoints, optProvider);

    // Create a layer that includes the data provider and its data points:
    clusterLayer = new H.map.layer.ObjectLayer(clusteredDataProvider);
    // Add the layer to the map:
    map.addLayer(clusterLayer);

    // layer is visible by default
    _visible = true;

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
            } else {
                let userData = data.getData(); // lat,lng, payload
                cb(ev, m.coordO2A(coord), userData[2], 1);
            }
        });
    }

    return clusterLayer;
}



// this function  creates the icon for a cluster
function getClusterPresentation(cluster) {

    // building data object which will be returned when clicking on the icon
    let data = {};
    data.isCluster = () => {
        return true;
    }; // so we know it is a cluster
    let weight = cluster.getWeight();

    data.getWeight = () => {
        return weight;
    }; // number of individual item clustered together

    // let's find the relevant color and size
    let entry = clusterStyle.find(elt => (weight >= elt.weight));
    let imageData = entry.imageData;

    let icon = buildClusterIcon(imageData, "" + weight);
    // create a marker for the Cluster
    let min = cluster.getMinZoom();
    let max = cluster.getMaxZoom();
    let clusterMarker = new H.map.Marker(cluster.getPosition(), {
        // to show it correctly at certain zoom levels:
        min: min,
        max: max,
        icon: icon,
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
        getData: () => {
            return noisePoint.getData();
        },
        isCluster: () => {
            return false;
        },
        getWeight: () => {
            return 1;
        }
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



/**
 * load a file into a canvas
 * @ignore
 * @param {String} url of png,jpg,svg file 
 * @param {Number} width for svg, define width
 * @param {number} height for svg, define height
 */
function loadIconFile(file, width = null, height = null) {
    return new Promise(
        (resolve) => {
            var newImg = new Image;
            newImg.onload = function () {
                let width = newImg.width;
                let height = newImg.height;
                // copy icon into a canvas
                let src = document.createElement("canvas");
                src.width = width;
                src.height = height;
                let ctx = src.getContext("2d");

                // copy image into canvas cluster
                ctx.drawImage(newImg, 0, 0, width, height);
                let imageData = ctx.getImageData(0, 0, width, height);

                resolve(imageData);
            };

            newImg.crossOrigin = "Anonymous"; // useful.. ?
            if (width) newImg.width = width;
            if (height) newImg.height = height;

            newImg.src = file;

        }
    );
}

/**
 * Build an icon by copying imageData and adding text
 * @ignore
 * @param {ImageData} imgData  from canvas.getImageData
 * @param {String} text  text to write
 */
function buildClusterIcon(imgData, text) {
    const canvas = document.createElement("canvas");
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    let ctx = canvas.getContext("2d");
    const fontSize = 12;

    ctx.font = "bold " + fontSize + "px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.putImageData(imgData, 0, 0);
    ctx.fillText(text, canvas.width / 2, (canvas.height + fontSize) / 2 - 2);

    return new H.map.Icon(canvas, {
        anchor: {
            x: canvas.width / 2,
            y: canvas.height / 2
        }
    });
}



/**
 * Hide cluster layer
 *  @alias hm:clusterHide
 */
function clusterHide() {
    if (!_visible || !clusterLayer)
        return;

    map.removeLayer(clusterLayer);
    _visible = false;
}

/**
 * show Cluster layer
 * @alias hm:clusterShow
 */
function clusterShow() {
    if (_visible || !clusterLayer)
        return;

    map.addLayer(clusterLayer);
    _visible = true;

}



module.exports = {
    cluster: cluster,
    clusterShow: clusterShow,
    clusterHide: clusterHide
};