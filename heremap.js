"use strict";

/*
 * @module HEREMAP
 * @typicalname hm
 */

let modules = {};
Object.assign(modules, require("./common.js"));
Object.assign(modules, require("./routing.js"));
Object.assign(modules, require("./geocoding.js"));

if (process.browser) {
    Object.assign(modules, require("./map.js"));
    Object.assign(modules, require("./cluster.js"));
}
// export all the above
module.exports = modules;

//console.log("module.exports", module.exports);
//console.log("process.browser", process.browser);