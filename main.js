window.addEventListener("load", async () => {
    let images = await loadImages();
    console.log(images);
	let canvas = document.getElementById("gameCanvas");
	canvas.width = 320;
	canvas.height = 240;
	let ctx = canvas.getContext("2d");
	console.log(canvas);
	drawBackground(ctx, images);
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

function drawBackground(ctx, images){
	ctx.fillStyle = ctx.createPattern(images["ground"], "repeat");
	ctx.fillRect(0, 0, 320, 240);
	ctx.fillStyle = ctx.createPattern(images["wallTopDown"], "repeat");
	ctx.fillRect(0, 0, 320, 16);
	ctx.fillStyle = ctx.createPattern(images["wallLeft"], "repeat");
	ctx.fillRect(0, 0, 16, 240);
	ctx.fillStyle = ctx.createPattern(images["wallRight"], "repeat");
	ctx.fillRect(304, 0, 16, 240);
	ctx.fillStyle = ctx.createPattern(images["wallTopDown"], "repeat");
	ctx.fillRect(0, 224, 320, 16);
	ctx.drawImage(images["wallCornerLeft"], 0, 0, 16, 16);
	ctx.drawImage(images["wallCornerRight"], 304, 0, 16, 16);
}