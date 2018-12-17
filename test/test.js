const heremap = require("heremap-node");
const inspect = require("eyes").inspector({ styles: { all: "white" } });

async function testGeocodeNOK() {
    try {
        await heremap.geocode("ddfBvhgfhfhfin");
    } catch (e) {
        console.error(e.name, e.message);
    }
}

async function testGeocodeOK() {
    try {
        const res = await heremap.geocode("Avenue des champs elysees, Paris");
        inspect(res.coord, "geocode of Champs elysees");

        res = await heremap.geocode({ locationid: "250ezzx4-201f603073cc48358c9e34bf2ffb32c0" });
        inspect(res.coord, "geocode of Buc");
    } catch (e) {
        console.error(e.name, e.message);
    }
}

async function testRGeocodeOK() {
    try {
        const res = await heremap.reverseGeocode([48.8583701, 2.2944813]);
        inspect(res.location, "reverse geocode");
    } catch (e) {
        console.error(e.name, e.message);
    }
}

// test multiple geocoding in parallel and then routing
async function testRouting() {

    const waypoints = [
        "avenue des champs-elysees, Paris",
        "Versailles",
        "Bordeaux",
    ];

    try {
        const promises = waypoints.map(addr => heremap.geocode(addr));
        // eslint-disable-next-line   no-undef
        const result = await Promise.all(promises);
        const coords = result.map(resp => resp.coord);

        const start = coords.shift(); // get start points and remove form list of waypoints
        const route = await heremap.route(start, coords);
        inspect(route.summary, "route summary");
    }
    catch (e) {
        console.error(e.name, e.message);
    }
}


async function testMatrix() {

    const addresses = [
        "8 rue Benjamin Franklin Paris",
        "36 rue cortambert Paris",
        "Perpignan, france",
        "Vannes, france",
        "Lyon,France",
        "Marseille,France",
        "Versailles,France",
        "3 rue Debussy, Buc,France"
    ];

    try {
        const promises = addresses.map(addr => heremap.geocode(addr));
        // eslint-disable-next-line   no-undef
        const result = await Promise.all(promises);
        const coords = result.map(resp => resp.coord);

        const start = coords.shift();

        const matrix = await heremap.matrix(start, coords);
        inspect(matrix.entries, "matrix");
    }
    catch (e) {
        console.error(e.name, e.message);
    }
}

async function testIsoline() {

    // area to reach in 10mn drive with traffic
    let opt = {
        start: [48.3, 2.3],
        rangeType: "time",                  // time or distance
        range: 10 * 60,                     // in seconds 
        mode: "fastest;car;traffic:disabled"
    };
    try {
        let res = await heremap.isoline(opt);
        inspect(res, "direct isoline");  // return { poly, body, respTime}
    }
    catch (e) {
        console.error(e.name, e.message);
    }

    // area to reach in 2km walk
    opt = {
        start: [48.3, 2.3],
        rangeType: "distance",          // time or distance
        range: 2 * 1000,                // in meters
        mode: "fastest;pedestrian"
    };
    try {
        let res = await heremap.isoline(opt);
        inspect(res, "direct isoline");  // return { poly, body, respTime}
    }
    catch (e) {
        console.error(e.name, e.message);
    }

    // from which area can I reach  the point in 20min walk
    opt = {
        destination: [48.3, 2.3],       // destination to indicate reverse isoline
        rangeType: "time",              // to indicate time
        range: 20 * 60,                 // in seconds
        mode: "fastest;pedestrian"
    };
    try {
        let res = await heremap.isoline(opt);
        inspect(res, "reverse isoline");  // return { poly, body, respTime}
    }
    catch (e) {
        console.error(e.name, e.message);
    }
}

async function testDetour() {

    const addresses = [
        "Paris",
        "Lyon",
        "Auxerre",
        "Beaunes"
    ];

    try {
        const promises = addresses.map(addr => heremap.geocode(addr));
        // eslint-disable-next-line   no-undef
        const result = await Promise.all(promises);
        const coords = result.map(resp => resp.coord);

        const start = coords.shift();
        const stop = coords.shift();

        const res = await heremap.detour(start, stop, coords);
        inspect(res, "Detour");
    }
    catch (e) {
        console.error(e.name, e.message);
    }

}

//testRGeocodeOK();
//testGeocodeNOK();
testGeocodeOK();
//testRouting();
//testMatrix();
//testIsoline();
//testDetour();