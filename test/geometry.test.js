const cm = require("../common.js");
const g = require("../geometry.js");



test('xys -> coords', () => {
    expect.assertions(4);
    const xys = [{ x: 1, y: 2 }, { x: 3, y: 4 }];
    const res = g.xy2Coords(xys);
    expect(res[0][0]).toEqual(2);
    expect(res[0][1]).toEqual(1);
    expect(res[1][0]).toEqual(4);
    expect(res[1][1]).toEqual(3);
});


test("coords -> xys", () => {
    expect.assertions(4);
    const coords = [[1, 2], [3, 4]];
    const xys = g.coords2XY(coords);
    expect(xys[0].x).toEqual(2);
    expect(xys[0].y).toEqual(1);
    expect(xys[1].x).toEqual(4);
    expect(xys[1].y).toEqual(3);
});


test('Simplify', () => {
    expect.assertions(1);
    const coords = [[1, 2], [1, 4], [1, 6], [1, 8], [1, 10], [1, 12], [1, 14], [1, 16], [1, 18], [100, 1000]];
    const simp = g.simplify(coords, 1);
    console.log(simp);
    expect(simp.length).toEqual(3);

});

