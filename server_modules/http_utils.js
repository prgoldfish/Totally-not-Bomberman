//server.js et http_utils.js sont basés sur les fichiers crées lors du TP7


const path = require("path");
const fs = require("fs");

const MIME_TYPES = { // Gestion des différentes extensions lors de l'envoi de fichiers
    ".htm" : "text/html",
    ".html" : "text/html",
    ".css" : "text/css",
    ".js" : "text/javascript",
    ".json" : "application/json",
    ".jpeg" : "image/jpeg",
    ".jpg" : "image/jpeg",
    ".png" : "image/png",
    ".ico" : "image/vnd.microsoft.icon",
    ".gif" : "image/gif"
};  

function http_error(req, resp, code, msg) // Renvoie une erreur HTTP
{
    resp.statusCode = code;
    resp.setHeader("Content-Type", "text/html");
    resp.write("<html><head><title>Error " + code + "</title></head>" + 
                "<body><h1>" + req.url + "</h1>" + 
                "<h1>Error " + code + " : " + msg + "</h1></body>" +
    "</html>");
    resp.end();
}


function error_404(req, resp) {
    http_error(req, resp, 404, "Not found");
}

function error_403(req, resp) {
    http_error(req, resp, 403, "Permission denied");
}

function error_418(req, resp) { // Indispensable
    http_error(req, resp, 418, "I'm a teapot");
}

function error_500(req, resp, msg) {
    http_error(req, resp, 500, msg);
}

function send_level(req, resp, lvlNumber) // Envoie un niveau au format JSON
{
    serve_static_file(req, resp, "./levels/", lvlNumber + ".json")
}

function serve_static_file(req, resp, base, file) { // Envoie un fichier
    let p = path.join(base, file);
    fs.readFile(p, (err, buffer) => { // On lit le fichier
        if(err)
        {
            switch (err.code) {
                case "ENOENT":
                    error_404(req, resp);                    
                    break;
                
                case "EACCESS":
                    error_403(req, resp);                    
                    break;
                
                default:
                    error_500(req, resp, err.toString());
                    break;
            }
        }
        else
        {
            let ext = path.extname(p); // Détermination du header en fonction de l'extension du fichier
            let cType = MIME_TYPES.hasOwnProperty(ext) ? MIME_TYPES[ext] : "application/octet-stream";
            resp.statusCode = 200;
            resp.setHeader("Content-Type", cType);
            resp.write(Buffer.from(buffer));
            resp.end();
        }
    });
}

module.exports.error_404 = error_404;
module.exports.error_403 = error_403;
module.exports.error_500 = error_500;
module.exports.send_level = send_level;
module.exports.serve_static_file = serve_static_file;