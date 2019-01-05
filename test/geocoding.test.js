const cm = require("../common.js");
const g = require("../geocoding.js");
const c = require("./credentials.js");        // Specifies the credentials APP_ID, APP_CODE

cm.config({
    app_id: c.APP_ID,
    app_code: c.APP_CODE,
});

test('Correct address', async () => {
    expect.assertions(1);
    const res = await g.geocode("Avenue des champs elysees, Paris");
    expect(res.coord).toEqual([48.8714, 2.30247]);
});

test("Unknown address", async () => {
    expect.assertions(1);
    try {
        await g.geocode("gjgdfdlkjfs");
    } catch (e) {
        expect(e).toEqual(new Error("Geocode Address not found: gjgdfdlkjfs"));
    }
});

test('Reverse Geocode', async () => {
    expect.assertions(1);
    const res = await g.reverseGeocode([48.8583701, 2.2944813]);
    expect(res.location.Address.Label).toEqual("75007 Paris, France");
});

