//server.js et http_utils.js sont basés sur les fichiers crées lors du TP7

const http = require("http");
const qs = require("querystring");
const fs = require("fs");
const http_utils = require("./server_modules/http_utils");


let server = http.createServer((req, res) => {
    let s = req.url.split("?");
    let url_path = s[0];
    let options = s.length > 1 ? qs.parse(s[1]) : {};
    if(url_path == "/level")
    {
        if(options["lvl"])
        {
            http_utils.send_level(req, res, options["lvl"]);
            return;
        }
        
    }
    else if(url_path == "/index.html" || url_path == "/")
    {
        fs.readFile("./index.html", (err, buffer) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.write(buffer);
            res.end();
            return;
        });
    }
    else
    {
        http_utils.serve_static_file(req, res, ".", url_path);
    }
}).listen(80); 