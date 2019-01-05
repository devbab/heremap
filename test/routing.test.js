const r = require("../routing.js");
const cm = require("common");
const c = require("./credentials.js");        // Specifies the credentials APP_ID, APP_CODE

cm.config({
    app_id: c.APP_ID,
    app_code: c.APP_CODE,
});

test('Simple Routing', async () => {
    expect.assertions(2);
    const res = await r.route([48.8714, 2.30247], [44.8367, -0.58107]);
    expect(res.summary.distance).toBe(584610);
    expect(res.summary.baseTime).toBe(19305);
});

test('Routing with waypoints', async () => {
    expect.assertions(2);

    let res = await r.route([48.8714, 2.30247], [[45.75943, 4.82886], [44.8367, -0.58107]]);
    expect(res.summary.distance).toBe(1023704);

    res = await r.route([[48.8714, 2.30247], [45.75943, 4.82886]], [44.8367, -0.58107]);
    //console.log("res.summary.distance", res.summary.distance);
    expect(res.summary.distance).toBe(1023704);
});


test('Matrix', async () => {
    expect.assertions(4);

    const matrix = await r.matrix([48.85923, 2.28501],
        [
            [42.69819, 2.88748],
            [47.65834, -2.75985],
            [45.75943, 4.82886]
        ], {
            mode: "fastest;car;traffic:disabled"
        });
    // console.log(matrix.entries);
    expect(matrix.entries.length).toEqual(3);
    expect(matrix.entries[0].startIndex).toEqual(0);
    expect(matrix.entries[0].destinationIndex).toEqual(0);
    expect(matrix.entries[0].summary.distance).toEqual(848770);

});



test('Isoline', async () => {
    expect.assertions(3);

    // direct isoline time
    let opt = {
        start: [48.3, 2.3],
        rangeType: "time",                  // time or distance
        range: 600,                     // in seconds 
        mode: "fastest;car;traffic:disabled"
    };

    let isoline = await r.isoline(opt);
    expect(isoline.body.response.isoline[0].range).toEqual(600);

    // direct isoline distance
    opt = {
        start: [48.3, 2.3],
        rangeType: "distance",                  // time or distance
        range: 1000,                     // in meters 
        mode: "fastest;car;traffic:disabled"
    };

    isoline = await r.isoline(opt);
    expect(isoline.body.response.isoline[0].range).toEqual(1000);

    // reverse isoline
    opt = {
        destination: [48.3, 2.3],
        rangeType: "distance",                  // time or distance
        range: 1000,                     // in meters 
        mode: "fastest;car;traffic:disabled"
    };

    isoline = await r.isoline(opt);
    //console.log(isoline.body.response);
    expect(isoline.body.response.isoline[0].range).toEqual(1000);


});
