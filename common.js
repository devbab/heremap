"use strict";
/* global document */

/**
 * @file generic function of heremap
 * @author devbab
 */

const request = require("superagent");

// by default, unless specified fby calling config
// environment usable with node
let APP_ID = process.env.APP_ID;
let APP_CODE = process.env.APP_CODE;
let CIT = ""; // production by default
let PROTOCOL = "https:"; // by default
let _useHTTPS = true; // by default
let _home = ".";


// find out where we are and relative position for png/svg files
// pay attention if library is build in ./dist
if (process.browser) {
    let _script = document.getElementsByTagName("script");
    let _file = _script[_script.length - 1].src;
    let _path = _file.substring(0, _file.lastIndexOf("/"));
    let pos = _path.indexOf("heremap");
    _home = _path.substring(0, pos + "heremap".length) + "/";

}

/**
 * To configure app_id, app_code and optionally use CIT and http
 * @alias hm:config
 *
 * @param opt {Object}  - `opt` with parameters.
 * @param [opt.app_id] {string} - the app_id from developer.here.com
 * @param [opt.app_code] {string} - the app_code from developer.here.com
 * @param [opt.useCIT=false] {boolean} - true to use CIT environment. 
 * @param [opt.useHTTP=false] {string} - true to use HTTP. 
 * @param [opt.useHTTPS=true] {string} - true to use HTTPS. 
 *
 * @example
 * ```js
 *  hm.config({
 *      app_id: "YOUR APP_ID",
 *      app_code: "YOUR APP_CODE",
*   });
*  ```
 */
function config(opt) {
    if (opt.app_id) APP_ID = opt.app_id;
    if (opt.app_code) APP_CODE = opt.app_code;
    if (opt.useCIT) CIT = ".cit";
    if (opt.useHTTP) {
        PROTOCOL = "http:";
        _useHTTPS = false;
    }
    if (opt.useHTTPS) {
        PROTOCOL = "https:";
        _useHTTPS = true;
    }
}

/**
 * return URL of module home directory. 
 * svg icons are under getHome()+"/svg/"
 * images are under getHome()+"/img/"
 * @ignore
 *  @alias hm:getHome
 * @return {string} url of home directory including http or https. 
 */
function getHome() {
    return _home;
}

/**
 * returns app_id
 * @ignore
 *  @alias hm:getAppId
 * @return {string} app_id
*/
function getAppId() {
    return APP_ID;
}

/**
 * return app_code
 *  @ignore
 *  @alias hm:getHome
 *  @alias hm:getAppCode
  * @return {string} app_code
*/
function getAppCode() {
    return APP_CODE;
}

/**
 * return true if using CIT
 * @ignore
 * @alias hm:getCIT
 * @return {booolean} true if using CIT
*/
function getCIT() {
    return CIT;
}

/**
 * return protocol used, http:// or https://
 * @ignore
 * @alias hm:getProtocol
 * @return {string} - protocol
*/
function getProtocol() {
    return PROTOCOL;
}

/**
 * return true is https is used
 * @ignore
 *  @alias hm:useHTTPS
 * @return {boolean} - true if https is used
*/
function useHTTPS() {
    return _useHTTPS;
}

/**
 * add credentials to object provided
  * @ignore
 *  @alias hm:addCredentials
 * @param  {...objects} list of `objects` 
 * @return {object} object with all input objectconcatenated, and app_id/app_code inserted
 */
function addCredentials(...obj) {
    return Object.assign({
        app_id: APP_ID,
        app_code: APP_CODE
    }, ...obj);
}

/**
 * build HERE REST full url, taking in account protocol and cit. for instance  cm.buildUrl("geocoder", "api.here.com/6.2/geocode.json"
 * @ignore
 * @alias hm:buildUrl
 * @param {string} base - base name
 * @param {string} endpoint - end point
 * @return {string} full url
 */
function buildUrl(base, endpoint) {
    return PROTOCOL + "//" + base + CIT + "." + endpoint;
}

/**
 * does get/post request to HERE RESDT backend and manage main errors
 * @ignore
 * @alias hm:hereRest
 * @param {string} url  - url to call , for instance from buildUrl
 * @param {object} settings - settings to add in request
 * @param  {string} mode=get - mode "get" or "post"
 * @return {promise} - promise to resolve/reject
 */
async function hereRest(url, settings, mode = "get", needresp = "true") {

    let p = request.get(url);
    if (mode == "post")
        p = request.post(url);

    return p
        .query(settings)
        .then(res => {
            // res.body, res.headers, res.status
            if (res.status != "200") {
                let e = new Error("Error " + res.status + ":" + res.body); // e.message
                throw (e);
            }

            if (needresp && !res.body.Response && !res.body.response) { // one of the two should be in the answer
                console.error(res.body);
                let e = new Error("Query error:" + res.body); // e.message
                throw (e);
            }

            if (res.body.response && res.body.response.type == "ApplicationError") {
                console.error(res.body);
                let e = new Error("Error" + res.body.response.details); // e.message
                throw (e);
            }

            return res;
        });
}

module.exports = {
    config: config,
    buildUrl: buildUrl,
    getAppId: getAppId,
    getAppCode: getAppCode,
    getCIT: getCIT,
    getProtocol: getProtocol,
    getHome: getHome,
    useHTTPS: useHTTPS,
    addCredentials: addCredentials,
    hereRest: hereRest
};