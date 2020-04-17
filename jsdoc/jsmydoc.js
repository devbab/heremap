//         "docs": "jsdoc2md   --template README.hbs --param-list-format list  --files heremap.js common.js map.js geocoding.js routing.js cluster.js    > README.md",
"use strict";

const fs = require("fs");
const jsdoc2md = require("jsdoc-to-markdown");

const output = "README.md";
const template = "jsdoc/README.hbs";

let files = [];
process.argv.forEach(function (val, i) {
    if (i < 2) return;
    files.push(val);
});


(async () => {

    jsdoc2md.clear();
    let data = await jsdoc2md.getTemplateData({
        files: files
    });

    function compare(a, b) {
        if (a.id < b.id)
            return -1;
        if (a.id > b.id)
            return 1;
        return 0;
    }
    data.sort(compare);
    for (let i = 0; i < data.length; i++)
        data[i].order = i + 1;

    let pck = JSON.parse(fs.readFileSync("package.json"));
    let version = pck.version;
    //    console.log("package version", version);

    let templateData = String(fs.readFileSync(template)).replace(/\{version\}/g, version);

    let md = await jsdoc2md.render({
        data: data,
        "param-list-format": "list",
        template: templateData,
        separator: true
    });

    fs.writeFileSync(output, md);
})();