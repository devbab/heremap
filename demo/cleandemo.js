const fs = require('fs');
const path = require('path');


const dir = "./demo";
let status = 0;

fs.readdirSync(dir).forEach(file => {

    if (file.slice(-5) !== ".html")
        return;
    const src = fs.readFileSync(path.join(dir, file));

    const notgood = [
        "xsrc",
        "../heremap.min.js",
        "heremap/heremap.min.js"
    ];

    notgood.forEach(str => {
        let pos = src.indexOf(str);
        if (pos > 0) {
            console.error("ERROR", path.join(dir, file), "contains", str);
            status = 1;
        }

    });

});

process.exit(status);