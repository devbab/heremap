const fs = require('fs');

fs.readdirSync("svg").forEach(file => {

    if (file.substr(-4) == ".svg") {
        //console.log("file", file, "svg", svg);
        iconExplain("svg/" + file);
    }


});



function iconExplain(svgfile) {
    let svg = String(fs.readFileSync(svgfile));


    let w, h, match, fields;

    let r = /width="(\d+)"/;
    match = svg.match(r);
    if (match) w = match[1];

    r = /height="(\d+)"/;
    match = svg.match(r);
    if (match) h = match[1];

    r = /\{([\d-_\w]+)\}/g;
    fields = new Set(svg.match(r));

    console.log(svgfile, "w:", w, "h:", h, "fields:", fields);

}
