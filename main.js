window.addEventListener("load", async () => {
    let images = await loadImages();
    console.log(images);
    let canvas = document.getElementById("gameCanvas");
    let ctx = canvas.getContext("2d");

});



async function loadImages() {
    let images = {};
    let imageNames = ["wallTopDown", 
        "wallLeft",
        "wallRight",
        "wallCornerLeft",
        "wallCornerRight",
        "ground",
		"char",
        "box",
        "bomb",
		"bombFuse"
    ];
    for (const name of imageNames) { //Essayer de voir l'utilisation de promesses pour attendre le chargement de l'image
        images[name] = await loadImage(name);
    }
    //images = await loadCharImages(images);
    images = await loadExplImages(images);

    return images;
}

async function loadCharImages(images)
{
    let dir = ["up", "down", "right", "left"];
    for (const name of dir) {
        images["char" + name] = await loadImage("char/" + name);
        images["char" + name + "W"] = await loadImage("char/" + name + "W");
    }
    return images;
}

async function loadExplImages(images)
{
    let dir = ["up", "down", "right", "left", "horiz", "vert", "center"];
    for (const name of dir) {
        images["expl" + name] = await loadImage("explosion/" + name);
    }
    return images;
}

function loadImage(imgName)
{
    return new Promise((success, fail) => {
        let img = new Image();
        img.addEventListener("load", () => {
            success(img);
        });
        img.src = "images/" + imgName  + ".png";
    });
}