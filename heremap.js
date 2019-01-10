"use strict";

/*
 * @module HEREMAP
 * @typicalname hm
 */

let modules = {};
Object.assign(modules, require("./common.js"));
Object.assign(modules, require("./routing.js"));
Object.assign(modules, require("./geocoding.js"));
Object.assign(modules, require("./autocomplete.js"));

if (process.browser) {
    Object.assign(modules, require("./map.js"));
    Object.assign(modules, require("./cluster.js"));
    Object.assign(modules, require("./touch.js"));
}
// export all the above
module.exports = modules;
