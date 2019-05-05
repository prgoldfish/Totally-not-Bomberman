function loadImage(imgName) // Charge une image et renvoie une promesse contenant l'image
{
    return new Promise((success, fail) => {
        let img = new Image();
        img.addEventListener("load", () => {
            success(img);
        });
        img.addEventListener("error", (ev) => {
            fail(ev);

        });
        img.src = "images/" + imgName  + ".png";
    });
}

async function loadImageToCanvas(imgName) // Renvoie un canvas contenant l'image
{
    let img = await loadImage(imgName);
    let canvas = document.createElement("canvas");
    canvas.height = img.height;
    canvas.width = img.width;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas;
}

function splitFrames(canvas, frameW, frameH) // Divise un canvas en plusieurs canvas de frameW * frameH
{
    let canvasList = [];
    for (let j = 0; j < canvas.height; j += frameH) 
    {
        for (let i = 0; i < canvas.width; i += frameW) 
        {
            let cnv = document.createElement("canvas");
            cnv.width = frameW;
            cnv.height = frameH;
            let ctx = cnv.getContext("2d");
            ctx.drawImage(canvas, i, j, frameW, frameH, 0, 0, frameW, frameH); // Dessin de la partie de l'image correspondant dans un nouveau canvas
            canvasList.push(cnv);
        }
    }
    return canvasList;
}

async function loadCharacter() // Permet de charger les images correspondant au personnage et les retourne sous forme de Sprite
{
    let cnv = await loadImageToCanvas("character");
    let cnvList = splitFrames(cnv, 16, 16);
    let frames = {
        north : cnvList.slice(0, 4),
        south : cnvList.slice(4, 8),
        west : cnvList.slice(8, 12),
        east : cnvList.slice(12, 16)
    }
    return new Sprite(frames);
}

async function loadWalls() // Permet de charger les images correspondant aux murs et les retourne sous forme de Sprite
{
    let cnv = await loadImageToCanvas("walls");
    let cnvList = splitFrames(cnv, 16, 16);
    let frames = {
        topDown : [cnvList[0]],
        cornerLeft : [cnvList[1]],
        cornerRight :[cnvList[2]],
        right : [cnvList[3]],
        left : [cnvList[4]]
    }
    return new Sprite(frames);
}

async function loadBomb() // Permet de charger les images correspondant aux bombes et les retourne sous forme de Sprite
{
    let cnv = await loadImageToCanvas("bomb");
    let cnvList = splitFrames(cnv, 16, 16);
    let frames = {
        fuse : cnvList
    }
    return new Sprite(frames);
}

async function loadExplosions() // Permet de charger les images correspondant aux explosions et les retourne sous forme de Sprite
{
    let cnv = await loadImageToCanvas("explosions");
    let cnvList = splitFrames(cnv, 16, 16);
    let frames = {
        left : [cnvList[0]],
        horizontal : [cnvList[1]],
        center : [cnvList[2]],
        right : [cnvList[3]],
        up : [cnvList[4]],
        vertical : [cnvList[5]],
        down : [cnvList[6]]
    }
    return new Sprite(frames);
}

async function loadBox() // Permet de charger les images correspondant aux caisses et les retourne sous forme de Sprite
{
    let cnv = await loadImageToCanvas("box");
    let cnvList = splitFrames(cnv, 16, 16);
    let frames = {
        base : [cnvList[0]],
        exploding : [cnvList[1]]
    }
    return new Sprite(frames);
}